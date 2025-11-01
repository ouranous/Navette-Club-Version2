import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { db } from "./db";
import bcrypt from "bcryptjs";
import {
  insertProviderSchema,
  insertVehicleSchema,
  insertVehicleSeasonalPriceSchema,
  insertVehicleHourlyPriceSchema,
  insertCityTourSchema,
  insertTourStopSchema,
  insertCustomerSchema,
  insertTransferBookingSchema,
  insertDisposalBookingSchema,
  insertTourBookingSchema,
  insertPaymentIntentSchema,
  insertHomePageContentSchema,
  insertContactInfoSchema,
  insertSocialMediaLinkSchema,
} from "@shared/schema";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { setupAuth, isAuthenticated, requireAuth } from "./replitAuth";
import { setupAdminAuth, requireAdminPassword, registerAdminAuthRoutes } from "./adminAuth";
import { calculateTransferCost, calculateDisposalCost } from "./pricing";
import { calculateDistance, calculateTransferPrice } from "./googleMaps";
import { getGeographicZone, filterAndSortVehiclesByZones } from "./geographicZones";
import { initKonnectPayment, getKonnectPaymentDetails } from "./konnect";
import { sendWelcomeEmail, sendVoucherEmail, sendMissionOrderEmail } from "./email";
import { generateReferenceNumber } from "./utils/referenceNumber";

// Helper function to get userId from either Replit Auth or email/password session
function getUserId(req: any): string | null {
  // Option 1: Email/password session
  if (req.session?.userId && req.session?.isAuthenticated) {
    return req.session.userId;
  }
  
  // Option 2: Replit Auth
  if (req.user?.claims?.sub) {
    return req.user.claims.sub;
  }
  
  return null;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication (Replit Auth or Admin Password)
  setupAdminAuth(app);
  await setupAuth(app);
  registerAdminAuthRoutes(app);

  // Auth routes - Email/Password authentication
  const registerSchema = z.object({
    email: z.string().email("Email invalide"),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    firstName: z.string().min(1, "Le prénom est requis"),
    lastName: z.string().min(1, "Le nom est requis"),
  });

  app.post('/api/auth/register', async (req: any, res) => {
    try {
      // Validate request body
      const validationResult = registerSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: validationResult.error.errors[0].message 
        });
      }
      
      const { email, password, firstName, lastName } = validationResult.data;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Un compte existe déjà avec cet email" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.upsertUser({
        email,
        passwordHash,
        firstName,
        lastName,
        role: "user",
      });

      // Send welcome email
      try {
        await sendWelcomeEmail({ email, firstName, lastName });
      } catch (error) {
        console.error("Failed to send welcome email:", error);
      }

      res.json({ success: true, userId: user.id });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Erreur lors de la création du compte" });
    }
  });

  const loginSchema = z.object({
    email: z.string().email("Email invalide"),
    password: z.string().min(1, "Le mot de passe est requis"),
  });

  app.post('/api/auth/login', async (req: any, res) => {
    try {
      // Validate request body
      const validationResult = loginSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: validationResult.error.errors[0].message 
        });
      }
      
      const { email, password } = validationResult.data;

      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.passwordHash);
      
      if (!isValid) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }

      // Create session
      req.session.userId = user.id;
      req.session.isAuthenticated = true;

      res.json({ 
        success: true, 
        userId: user.id,
        role: user.role,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Erreur lors de la connexion" });
    }
  });

  app.post('/api/auth/logout', async (req: any, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Email/password auth (session-based)
      if (req.session?.userId) {
        const user = await storage.getUser(req.session.userId);
        return res.json(user);
      }

      // Replit Auth (if available)
      if (process.env.REPL_ID && req.isAuthenticated && req.isAuthenticated()) {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        return res.json(user);
      }
      
      return res.json(null);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });


  // ========== PROVIDERS ==========
  app.get("/api/providers", async (req, res) => {
    try {
      const providers = await storage.getAllProviders();
      res.json(providers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch providers" });
    }
  });

  app.get("/api/providers/:id", async (req, res) => {
    try {
      const provider = await storage.getProvider(req.params.id);
      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }
      res.json(provider);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch provider" });
    }
  });

  app.post("/api/providers", requireAdminPassword, async (req, res) => {
    try {
      const validatedData = insertProviderSchema.parse(req.body);
      const provider = await storage.createProvider(validatedData);
      res.status(201).json(provider);
    } catch (error) {
      res.status(400).json({ error: "Invalid provider data", details: error });
    }
  });

  app.patch("/api/providers/:id", requireAdminPassword, async (req, res) => {
    try {
      const validatedData = insertProviderSchema.partial().parse(req.body);
      const provider = await storage.updateProvider(req.params.id, validatedData);
      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }
      res.json(provider);
    } catch (error) {
      res.status(400).json({ error: "Invalid provider data", details: error });
    }
  });

  app.delete("/api/providers/:id", requireAdminPassword, async (req, res) => {
    try {
      const success = await storage.deleteProvider(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Provider not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete provider" });
    }
  });

  // ========== VEHICLES ==========
  app.get("/api/vehicles", async (req, res) => {
    try {
      const { available, providerId, homepage } = req.query;
      
      let vehicles;
      if (homepage === "true") {
        vehicles = await storage.getHomepageVehicles();
      } else if (available === "true") {
        vehicles = await storage.getAvailableVehicles();
      } else if (providerId) {
        vehicles = await storage.getVehiclesByProvider(providerId as string);
      } else {
        vehicles = await storage.getAllVehicles();
      }
      
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });

  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicle = await storage.getVehicle(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicle" });
    }
  });

  app.post("/api/vehicles", requireAdminPassword, async (req, res) => {
    try {
      const validatedData = insertVehicleSchema.parse(req.body);
      // Generate name from brand and model if not provided
      const vehicleData = {
        ...validatedData,
        name: validatedData.name || `${validatedData.brand} ${validatedData.model}`,
      };
      const vehicle = await storage.createVehicle(vehicleData);
      res.status(201).json(vehicle);
    } catch (error) {
      res.status(400).json({ error: "Invalid vehicle data", details: error });
    }
  });

  app.patch("/api/vehicles/:id", requireAdminPassword, async (req, res) => {
    try {
      const validatedData = insertVehicleSchema.partial().parse(req.body);
      // Generate name from brand and model if both are provided
      const vehicleData = { ...validatedData };
      if (validatedData.brand || validatedData.model) {
        const existingVehicle = await storage.getVehicle(req.params.id);
        if (existingVehicle) {
          const brand = validatedData.brand || existingVehicle.brand;
          const model = validatedData.model || existingVehicle.model;
          vehicleData.name = `${brand} ${model}`;
        }
      }
      const vehicle = await storage.updateVehicle(req.params.id, vehicleData);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(400).json({ error: "Invalid vehicle data", details: error });
    }
  });

  app.delete("/api/vehicles/:id", requireAdminPassword, async (req, res) => {
    try {
      const success = await storage.deleteVehicle(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete vehicle" });
    }
  });

  // ========== VEHICLE SEASONAL PRICES ==========
  app.get("/api/vehicles/:vehicleId/seasonal-prices", async (req, res) => {
    try {
      const prices = await storage.getVehicleSeasonalPrices(req.params.vehicleId);
      res.json(prices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch seasonal prices" });
    }
  });

  app.post("/api/vehicles/:vehicleId/seasonal-prices", requireAdminPassword, async (req, res) => {
    try {
      const validatedData = insertVehicleSeasonalPriceSchema.parse({
        ...req.body,
        vehicleId: req.params.vehicleId,
      });
      const price = await storage.createVehicleSeasonalPrice(validatedData);
      res.status(201).json(price);
    } catch (error) {
      res.status(400).json({ error: "Invalid seasonal price data", details: error });
    }
  });

  app.patch("/api/vehicles/seasonal-prices/:id", requireAdminPassword, async (req, res) => {
    try {
      const validatedData = insertVehicleSeasonalPriceSchema.partial().parse(req.body);
      const price = await storage.updateVehicleSeasonalPrice(req.params.id, validatedData);
      if (!price) {
        return res.status(404).json({ error: "Seasonal price not found" });
      }
      res.json(price);
    } catch (error) {
      res.status(400).json({ error: "Invalid seasonal price data", details: error });
    }
  });

  app.delete("/api/vehicles/seasonal-prices/:id", requireAdminPassword, async (req, res) => {
    try {
      const success = await storage.deleteVehicleSeasonalPrice(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Seasonal price not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete seasonal price" });
    }
  });

  // ========== VEHICLE HOURLY PRICES ==========
  app.get("/api/vehicles/:vehicleId/hourly-prices", async (req, res) => {
    try {
      const prices = await storage.getVehicleHourlyPrices(req.params.vehicleId);
      res.json(prices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch hourly prices" });
    }
  });

  app.post("/api/vehicles/:vehicleId/hourly-prices", requireAdminPassword, async (req, res) => {
    try {
      const validatedData = insertVehicleHourlyPriceSchema.parse({
        ...req.body,
        vehicleId: req.params.vehicleId,
      });
      const price = await storage.createVehicleHourlyPrice(validatedData);
      res.status(201).json(price);
    } catch (error) {
      res.status(400).json({ error: "Invalid hourly price data", details: error });
    }
  });

  app.patch("/api/vehicles/hourly-prices/:id", requireAdminPassword, async (req, res) => {
    try {
      const validatedData = insertVehicleHourlyPriceSchema.partial().parse(req.body);
      const price = await storage.updateVehicleHourlyPrice(req.params.id, validatedData);
      if (!price) {
        return res.status(404).json({ error: "Hourly price not found" });
      }
      res.json(price);
    } catch (error) {
      res.status(400).json({ error: "Invalid hourly price data", details: error });
    }
  });

  app.delete("/api/vehicles/hourly-prices/:id", requireAdminPassword, async (req, res) => {
    try {
      const success = await storage.deleteVehicleHourlyPrice(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Hourly price not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete hourly price" });
    }
  });

  // ========== CITY TOURS ==========
  app.get("/api/tours", async (req, res) => {
    try {
      const { active, providerId, featured } = req.query;
      
      let tours;
      if (active === "true" && featured === "true") {
        tours = await storage.getFeaturedActiveTours();
      } else if (active === "true" && featured === "false") {
        tours = await storage.getNonFeaturedActiveTours();
      } else if (active === "true") {
        tours = await storage.getActiveTours();
      } else if (featured === "true") {
        tours = await storage.getFeaturedTours();
      } else if (featured === "false") {
        tours = await storage.getNonFeaturedTours();
      } else if (providerId) {
        tours = await storage.getToursByProvider(providerId as string);
      } else {
        tours = await storage.getAllTours();
      }
      
      res.json(tours);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tours" });
    }
  });

  app.get("/api/tours/:id", async (req, res) => {
    try {
      const tour = await storage.getTour(req.params.id);
      if (!tour) {
        return res.status(404).json({ error: "Tour not found" });
      }
      res.json(tour);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tour" });
    }
  });

  app.get("/api/tours/slug/:slug", async (req, res) => {
    try {
      const tour = await storage.getTourBySlug(req.params.slug);
      if (!tour) {
        return res.status(404).json({ error: "Tour not found" });
      }
      res.json(tour);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tour" });
    }
  });

  app.post("/api/tours", requireAdminPassword, async (req, res) => {
    try {
      const validatedData = insertCityTourSchema.parse(req.body);
      const tour = await storage.createTour(validatedData);
      res.status(201).json(tour);
    } catch (error) {
      res.status(400).json({ error: "Invalid tour data", details: error });
    }
  });

  app.patch("/api/tours/:id", requireAdminPassword, async (req, res) => {
    try {
      const validatedData = insertCityTourSchema.partial().parse(req.body);
      const tour = await storage.updateTour(req.params.id, validatedData);
      if (!tour) {
        return res.status(404).json({ error: "Tour not found" });
      }
      res.json(tour);
    } catch (error) {
      res.status(400).json({ error: "Invalid tour data", details: error });
    }
  });

  app.delete("/api/tours/:id", requireAdminPassword, async (req, res) => {
    try {
      const success = await storage.deleteTour(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Tour not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete tour" });
    }
  });

  // ========== TOUR STOPS ==========
  app.get("/api/tours/:tourId/stops", async (req, res) => {
    try {
      const stops = await storage.getTourStops(req.params.tourId);
      res.json(stops);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tour stops" });
    }
  });

  app.post("/api/tours/:tourId/stops", requireAdminPassword, async (req, res) => {
    try {
      const validatedData = insertTourStopSchema.parse({
        ...req.body,
        tourId: req.params.tourId,
      });
      const stop = await storage.createTourStop(validatedData);
      res.status(201).json(stop);
    } catch (error) {
      res.status(400).json({ error: "Invalid tour stop data", details: error });
    }
  });

  app.patch("/api/tour-stops/:id", async (req, res) => {
    try {
      const validatedData = insertTourStopSchema.partial().parse(req.body);
      const stop = await storage.updateTourStop(req.params.id, validatedData);
      if (!stop) {
        return res.status(404).json({ error: "Tour stop not found" });
      }
      res.json(stop);
    } catch (error) {
      res.status(400).json({ error: "Invalid tour stop data", details: error });
    }
  });

  app.delete("/api/tour-stops/:id", async (req, res) => {
    try {
      const success = await storage.deleteTourStop(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Tour stop not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete tour stop" });
    }
  });

  // ========== CUSTOMERS ==========
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      
      // Check if customer already exists
      const existing = await storage.getCustomerByEmail(validatedData.email);
      if (existing) {
        return res.json(existing);
      }
      
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ error: "Invalid customer data", details: error });
    }
  });

  // ========== TRANSFER BOOKINGS ==========
  app.get("/api/transfer-bookings", async (req, res) => {
    try {
      const { customerId } = req.query;
      
      let bookings;
      if (customerId) {
        bookings = await storage.getTransferBookingsByCustomer(customerId as string);
      } else {
        bookings = await storage.getAllTransferBookings();
      }
      
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transfer bookings" });
    }
  });

  app.get("/api/transfer-bookings/:id", async (req, res) => {
    try {
      const booking = await storage.getTransferBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch booking" });
    }
  });

  app.post("/api/transfer-bookings", async (req, res) => {
    try {
      console.log("Creating transfer booking with data:", req.body);
      const validatedData = insertTransferBookingSchema.parse(req.body);
      
      // Génération automatique du numéro de référence si non fourni
      if (!validatedData.referenceNumber) {
        validatedData.referenceNumber = generateReferenceNumber('TR');
      }
      
      console.log("Validated data with reference number:", validatedData);
      const booking = await storage.createTransferBooking(validatedData);
      console.log("Booking created:", booking.id, "Reference:", booking.referenceNumber);
      res.status(201).json(booking);
    } catch (error: any) {
      console.error("Transfer booking creation error:", error);
      console.error("Error details:", error.issues || error.message);
      res.status(400).json({ 
        error: "Invalid booking data", 
        details: error.issues || error.message 
      });
    }
  });

  app.patch("/api/transfer-bookings/:id", async (req, res) => {
    try {
      const validatedData = insertTransferBookingSchema.partial().parse(req.body);
      const booking = await storage.updateTransferBooking(req.params.id, validatedData);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(400).json({ error: "Invalid booking data", details: error });
    }
  });

  // ========== TOUR BOOKINGS ==========
  app.get("/api/tour-bookings", async (req, res) => {
    try {
      const { customerId, tourId } = req.query;
      
      let bookings;
      if (customerId) {
        bookings = await storage.getTourBookingsByCustomer(customerId as string);
      } else if (tourId) {
        bookings = await storage.getTourBookingsByTour(tourId as string);
      } else {
        bookings = await storage.getAllTourBookings();
      }
      
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tour bookings" });
    }
  });

  app.get("/api/tour-bookings/:id", async (req, res) => {
    try {
      const booking = await storage.getTourBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch booking" });
    }
  });

  app.post("/api/tour-bookings", async (req, res) => {
    try {
      const validatedData = insertTourBookingSchema.parse(req.body);
      
      // Génération automatique du numéro de référence si non fourni
      if (!validatedData.referenceNumber) {
        validatedData.referenceNumber = generateReferenceNumber('CT');
      }
      
      const booking = await storage.createTourBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      res.status(400).json({ error: "Invalid booking data", details: error });
    }
  });

  app.patch("/api/tour-bookings/:id", async (req, res) => {
    try {
      const validatedData = insertTourBookingSchema.partial().parse(req.body);
      const booking = await storage.updateTourBooking(req.params.id, validatedData);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(400).json({ error: "Invalid booking data", details: error });
    }
  });

  // ========== OBJECT STORAGE (Photo Upload) ==========
  // Reference: blueprint:javascript_object_storage
  // NOTE: Object storage only works on Replit (requires Replit sidecar)
  
  // Endpoint to get upload URL for images
  app.post("/api/objects/upload", requireAdminPassword, async (req, res) => {
    // Object storage only works on Replit
    if (!process.env.REPL_ID) {
      return res.status(501).json({ 
        error: "Upload désactivé sur cet environnement",
        message: "L'upload de fichiers nécessite Replit. Utilisez des URLs externes d'images hébergées ailleurs."
      });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Endpoint to normalize object path after upload
  app.post("/api/objects/normalize-path", async (req, res) => {
    try {
      const { uploadURL } = req.body;
      if (!uploadURL) {
        return res.status(400).json({ error: "uploadURL is required" });
      }
      const objectStorageService = new ObjectStorageService();
      const normalizedPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
      res.json({ path: normalizedPath });
    } catch (error) {
      console.error("Error normalizing path:", error);
      res.status(500).json({ error: "Failed to normalize path" });
    }
  });

  // Endpoint to serve uploaded images (public access)
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Endpoint to serve public assets
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // ========== CUSTOMERS ==========
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ error: "Invalid customer data", details: error });
    }
  });

  // ========== TRANSFER BOOKINGS ==========
  app.get("/api/transfer-bookings", requireAdminPassword, async (req, res) => {
    try {
      const bookings = await storage.getAllTransferBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transfer bookings" });
    }
  });

  app.get("/api/transfer-bookings/:id", requireAdminPassword, async (req, res) => {
    try {
      const booking = await storage.getTransferBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch booking" });
    }
  });

  app.post("/api/transfer-bookings", async (req, res) => {
    try {
      const validatedData = insertTransferBookingSchema.parse(req.body);
      const booking = await storage.createTransferBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      res.status(400).json({ error: "Invalid booking data", details: error });
    }
  });

  app.patch("/api/transfer-bookings/:id", requireAdminPassword, async (req, res) => {
    try {
      const validatedData = insertTransferBookingSchema.partial().parse(req.body);
      const booking = await storage.updateTransferBooking(req.params.id, validatedData);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(400).json({ error: "Invalid booking data", details: error });
    }
  });

  // ========== DISPOSAL BOOKINGS ==========
  app.get("/api/disposal-bookings", requireAdminPassword, async (req, res) => {
    try {
      const bookings = await storage.getAllDisposalBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch disposal bookings" });
    }
  });

  app.get("/api/disposal-bookings/:id", requireAdminPassword, async (req, res) => {
    try {
      const booking = await storage.getDisposalBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch booking" });
    }
  });

  app.post("/api/disposal-bookings", async (req, res) => {
    try {
      const validatedData = insertDisposalBookingSchema.parse(req.body);
      const booking = await storage.createDisposalBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      res.status(400).json({ error: "Invalid booking data", details: error });
    }
  });

  app.patch("/api/disposal-bookings/:id", requireAdminPassword, async (req, res) => {
    try {
      const validatedData = insertDisposalBookingSchema.partial().parse(req.body);
      const booking = await storage.updateDisposalBooking(req.params.id, validatedData);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(400).json({ error: "Invalid booking data", details: error });
    }
  });

  // ========== TOUR BOOKINGS ==========
  app.get("/api/tour-bookings", requireAdminPassword, async (req, res) => {
    try {
      const bookings = await storage.getAllTourBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tour bookings" });
    }
  });

  app.get("/api/tour-bookings/:id", requireAdminPassword, async (req, res) => {
    try {
      const booking = await storage.getTourBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch booking" });
    }
  });

  app.post("/api/tour-bookings", async (req, res) => {
    try {
      const validatedData = insertTourBookingSchema.parse(req.body);
      
      // Génération automatique du numéro de référence si non fourni
      if (!validatedData.referenceNumber) {
        validatedData.referenceNumber = generateReferenceNumber('CT');
      }
      
      const booking = await storage.createTourBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      res.status(400).json({ error: "Invalid booking data", details: error });
    }
  });

  app.patch("/api/tour-bookings/:id", requireAdminPassword, async (req, res) => {
    try {
      const validatedData = insertTourBookingSchema.partial().parse(req.body);
      const booking = await storage.updateTourBooking(req.params.id, validatedData);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(400).json({ error: "Invalid booking data", details: error });
    }
  });

  // ========== PAYMENT INTENTS ==========
  app.get("/api/payment-intents", requireAdminPassword, async (req, res) => {
    try {
      const intents = await storage.getAllPaymentIntents();
      res.json(intents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment intents" });
    }
  });

  app.get("/api/payment-intents/:id", requireAdminPassword, async (req, res) => {
    try {
      const intent = await storage.getPaymentIntent(req.params.id);
      if (!intent) {
        return res.status(404).json({ error: "Payment intent not found" });
      }
      res.json(intent);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment intent" });
    }
  });

  app.post("/api/payment-intents", async (req, res) => {
    try {
      const validatedData = insertPaymentIntentSchema.parse(req.body);
      const intent = await storage.createPaymentIntent(validatedData);
      res.status(201).json(intent);
    } catch (error) {
      res.status(400).json({ error: "Invalid payment intent data", details: error });
    }
  });

  app.patch("/api/payment-intents/:id", requireAdminPassword, async (req, res) => {
    try {
      const validatedData = insertPaymentIntentSchema.partial().parse(req.body);
      const intent = await storage.updatePaymentIntent(req.params.id, validatedData);
      if (!intent) {
        return res.status(404).json({ error: "Payment intent not found" });
      }
      res.json(intent);
    } catch (error) {
      res.status(400).json({ error: "Invalid payment intent data", details: error });
    }
  });

  // ========== HOMEPAGE CONTENT ==========
  app.get("/api/homepage-content", async (req, res) => {
    try {
      const content = await storage.getAllHomePageContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch homepage content" });
    }
  });

  app.get("/api/homepage-content/:id", async (req, res) => {
    try {
      const content = await storage.getHomePageContent(req.params.id);
      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  app.post("/api/homepage-content", requireAdminPassword, async (req, res) => {
    try {
      const validatedData = insertHomePageContentSchema.parse(req.body);
      const content = await storage.createHomePageContent(validatedData);
      res.status(201).json(content);
    } catch (error) {
      console.error("Homepage content creation error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message, details: error });
      } else {
        res.status(400).json({ error: "Invalid content data", details: error });
      }
    }
  });

  app.patch("/api/homepage-content/:id", requireAdminPassword, async (req, res) => {
    try {
      const validatedData = insertHomePageContentSchema.partial().parse(req.body);
      const content = await storage.updateHomePageContent(req.params.id, validatedData);
      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }
      res.json(content);
    } catch (error) {
      console.error("Homepage content update error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message, details: error });
      } else {
        res.status(400).json({ error: "Invalid content data", details: error });
      }
    }
  });

  app.delete("/api/homepage-content/:id", requireAdminPassword, async (req, res) => {
    try {
      const success = await storage.deleteHomePageContent(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Content not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete content" });
    }
  });

  // ========== CONTACT INFO ==========
  
  app.get("/api/contact-info", async (req, res) => {
    try {
      const info = await storage.getContactInfo();
      res.json(info || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contact info" });
    }
  });

  app.post("/api/contact-info", requireAdminPassword, async (req, res) => {
    try {
      const validated = insertContactInfoSchema.parse(req.body);
      const info = await storage.createContactInfo(validated);
      res.json(info);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid contact info data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create contact info" });
    }
  });

  app.patch("/api/contact-info/:id", requireAdminPassword, async (req, res) => {
    try {
      const info = await storage.updateContactInfo(req.params.id, req.body);
      if (!info) {
        return res.status(404).json({ error: "Contact info not found" });
      }
      res.json(info);
    } catch (error) {
      res.status(500).json({ error: "Failed to update contact info" });
    }
  });

  // ========== SOCIAL MEDIA LINKS ==========
  
  app.get("/api/social-media-links", async (req, res) => {
    try {
      const links = await storage.getAllSocialMediaLinks();
      res.json(links);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch social media links" });
    }
  });

  app.get("/api/social-media-links/active", async (req, res) => {
    try {
      const links = await storage.getActiveSocialMediaLinks();
      res.json(links);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active social media links" });
    }
  });

  app.post("/api/social-media-links", requireAdminPassword, async (req, res) => {
    try {
      const validated = insertSocialMediaLinkSchema.parse(req.body);
      const link = await storage.createSocialMediaLink(validated);
      res.json(link);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid social media link data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create social media link" });
    }
  });

  app.patch("/api/social-media-links/:id", requireAdminPassword, async (req, res) => {
    try {
      const link = await storage.updateSocialMediaLink(req.params.id, req.body);
      if (!link) {
        return res.status(404).json({ error: "Social media link not found" });
      }
      res.json(link);
    } catch (error) {
      res.status(500).json({ error: "Failed to update social media link" });
    }
  });

  app.delete("/api/social-media-links/:id", requireAdminPassword, async (req, res) => {
    try {
      const success = await storage.deleteSocialMediaLink(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Social media link not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete social media link" });
    }
  });

  // ========== PRICING CALCULATOR ==========
  
  // Nouvelle route: Calcul automatique de distance et prix pour tous les véhicules
  app.get("/api/pricing/auto-transfer", async (req, res) => {
    try {
      const { origin, destination, passengers } = req.query;
      
      if (!origin || !destination) {
        return res.status(400).json({ 
          error: "Missing required parameters: origin and destination are required" 
        });
      }

      // Calculer la distance via Google Maps
      const distanceData = await calculateDistance(
        origin as string,
        destination as string
      );

      // Fallback si Google Maps échoue (pour démo/test)
      const distance = distanceData ? {
        distanceKm: distanceData.distanceKm,
        durationMinutes: distanceData.durationMinutes,
        distanceText: distanceData.distanceText,
        durationText: distanceData.durationText,
      } : {
        distanceKm: 50,
        durationMinutes: 45,
        distanceText: "50 km (estimé)",
        durationText: "45 min (estimé)",
      };

      if (!distanceData) {
        console.warn("Google Maps API unavailable, using fallback distance");
      }

      // Déterminer les zones géographiques
      const originZone = getGeographicZone(origin as string);
      const destinationZone = getGeographicZone(destination as string);

      console.log("Geographic zones:", {
        origin: origin as string,
        originZone,
        destination: destination as string,
        destinationZone,
      });

      // Récupérer tous les transporteurs pour le filtrage par zones
      const allProviders = await storage.getAllProviders();
      const providersMap = new Map(
        allProviders.map(p => [p.id, { serviceZones: p.serviceZones }])
      );

      // Récupérer tous les véhicules disponibles
      const allVehicles = await storage.getAllVehicles();
      const availableVehicles = allVehicles.filter(v => v.isAvailable);

      // Filtrer par capacité si spécifié
      const passengerCount = passengers ? parseInt(passengers as string, 10) : 0;
      const suitableVehicles = passengerCount > 0
        ? availableVehicles.filter(v => v.capacity >= passengerCount)
        : availableVehicles;

      // Calculer le prix pour chaque véhicule
      const vehiclesWithPrices = suitableVehicles.map(vehicle => {
        const basePrice = parseFloat(vehicle.basePrice.toString());
        const pricePerKm = vehicle.pricePerKm 
          ? parseFloat(vehicle.pricePerKm.toString()) 
          : 0;

        const totalPrice = calculateTransferPrice(
          basePrice,
          pricePerKm,
          distance.distanceKm
        );

        return {
          ...vehicle,
          calculatedPrice: totalPrice,
          priceBreakdown: {
            basePrice,
            pricePerKm,
            distance: distance.distanceKm,
            total: totalPrice,
          },
        };
      });

      // Filtrer et trier par zones géographiques et prix
      const filteredVehicles = filterAndSortVehiclesByZones(
        vehiclesWithPrices.map(v => ({
          ...v,
          providerId: v.providerId || "",
          price: v.calculatedPrice,
        })),
        providersMap,
        originZone,
        destinationZone
      );

      res.json({
        distance: distance,
        vehicles: filteredVehicles,
        zones: {
          origin: originZone,
          destination: destinationZone,
        },
        searchCriteria: {
          origin: origin as string,
          destination: destination as string,
          passengers: passengerCount,
        },
      });
    } catch (error) {
      console.error("Error calculating auto-transfer prices:", error);
      res.status(500).json({ error: "Failed to calculate transfer prices" });
    }
  });

  app.get("/api/pricing/transfer", async (req, res) => {
    try {
      const { vehicleId, distance, date } = req.query;
      
      if (!vehicleId || !distance || !date) {
        return res.status(400).json({ 
          error: "Missing required parameters: vehicleId, distance, and date are required" 
        });
      }

      const distanceNum = parseFloat(distance as string);
      if (isNaN(distanceNum) || distanceNum <= 0) {
        return res.status(400).json({ error: "Invalid distance value" });
      }

      const result = await calculateTransferCost(
        vehicleId as string,
        distanceNum,
        new Date(date as string)
      );

      if (!result) {
        return res.status(404).json({ 
          error: "No pricing information found for this vehicle and date" 
        });
      }

      res.json(result);
    } catch (error) {
      console.error("Error calculating transfer price:", error);
      res.status(500).json({ error: "Failed to calculate price" });
    }
  });

  app.get("/api/pricing/disposal", async (req, res) => {
    try {
      const { vehicleId, hours, date } = req.query;
      
      if (!vehicleId || !hours || !date) {
        return res.status(400).json({ 
          error: "Missing required parameters: vehicleId, hours, and date are required" 
        });
      }

      const hoursNum = parseInt(hours as string, 10);
      if (isNaN(hoursNum) || hoursNum <= 0) {
        return res.status(400).json({ error: "Invalid hours value" });
      }

      const result = await calculateDisposalCost(
        vehicleId as string,
        hoursNum,
        new Date(date as string)
      );

      if (!result) {
        return res.status(404).json({ 
          error: "No pricing information found for this vehicle and date" 
        });
      }

      res.json(result);
    } catch (error) {
      console.error("Error calculating disposal price:", error);
      res.status(500).json({ error: "Failed to calculate price" });
    }
  });

  // ========== CLIENT ROUTES ==========
  // Get all bookings for the logged-in client
  app.get("/api/my-bookings", requireAuth, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "User ID not found" });
      }
      
      // Get customer linked to this user
      const customer = await storage.getCustomerByUserId(userId);
      if (!customer) {
        return res.json({ transfers: [], tours: [], disposals: [] });
      }

      const transfers = await storage.getTransferBookingsByCustomer(customer.id);
      const tours = await storage.getTourBookingsByCustomer(customer.id);
      const disposals = await storage.getDisposalBookingsByCustomer(customer.id);

      res.json({ transfers, tours, disposals });
    } catch (error) {
      console.error("Error fetching client bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // ========== PROVIDER ROUTES ==========
  // Register as a provider with email/password
  const providerRegisterSchema = z.object({
    email: z.string().email("Email invalide"),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    firstName: z.string().min(1, "Le prénom est requis"),
    lastName: z.string().min(1, "Le nom est requis"),
    // Provider fields
    name: z.string().min(1, "Le nom de la société est requis"),
    type: z.string(),
    contactName: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    serviceZones: z.array(z.string()).min(1, "Au moins une zone de service est requise"),
    notes: z.string().optional(),
  });

  app.post("/api/provider-register", async (req: any, res) => {
    try {
      // Validate request body
      const validationResult = providerRegisterSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: validationResult.error.errors[0].message 
        });
      }

      const { email, password, firstName, lastName, ...providerData } = validationResult.data;

      // Check if email already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Un compte existe déjà avec cet email" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user account with provider role
      const user = await storage.upsertUser({
        email,
        passwordHash,
        firstName,
        lastName,
        role: "provider",
      });

      // Create provider profile
      const provider = await storage.createProvider({
        ...providerData,
        userId: user.id,
        isActive: true,
      });

      // Create session for auto-login
      req.session.userId = user.id;
      req.session.isAuthenticated = true;

      // Send welcome email
      try {
        await sendWelcomeEmail({ email, firstName, lastName });
      } catch (error) {
        console.error("Failed to send welcome email:", error);
      }

      res.status(201).json({ 
        success: true, 
        userId: user.id,
        providerId: provider.id,
        message: "Inscription réussie" 
      });
    } catch (error: any) {
      console.error("Error registering provider:", error);
      res.status(500).json({ message: "Erreur lors de l'inscription" });
    }
  });

  // Get provider info for logged-in user
  app.get("/api/my-provider", requireAuth, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "User ID not found" });
      }

      const provider = await storage.getProviderByUserId(userId);
      
      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }

      res.json(provider);
    } catch (error) {
      console.error("Error fetching provider:", error);
      res.status(500).json({ error: "Failed to fetch provider" });
    }
  });

  // Update provider info
  app.patch("/api/my-provider", requireAuth, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "User ID not found" });
      }

      const provider = await storage.getProviderByUserId(userId);
      
      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }

      const validatedData = insertProviderSchema.partial().parse(req.body);
      const updated = await storage.updateProvider(provider.id, validatedData);
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating provider:", error);
      res.status(400).json({ error: "Invalid provider data", details: error });
    }
  });

  // Get vehicles for logged-in provider
  app.get("/api/my-vehicles", requireAuth, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "User ID not found" });
      }

      const provider = await storage.getProviderByUserId(userId);
      
      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }

      const vehicles = await storage.getVehiclesByProvider(provider.id);
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });

  // Create vehicle for logged-in provider
  app.post("/api/my-vehicles", requireAuth, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "User ID not found" });
      }

      const provider = await storage.getProviderByUserId(userId);
      
      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }

      const validatedData = insertVehicleSchema.parse({
        ...req.body,
        providerId: provider.id,
      });

      // Generate name from brand and model if not provided
      const vehicleData = {
        ...validatedData,
        name: validatedData.name || `${validatedData.brand} ${validatedData.model}`,
      };

      const vehicle = await storage.createVehicle(vehicleData);
      res.status(201).json(vehicle);
    } catch (error) {
      console.error("Error creating vehicle:", error);
      res.status(400).json({ error: "Invalid vehicle data", details: error });
    }
  });

  // Get requests (bookings) for logged-in provider
  app.get("/api/my-requests", requireAuth, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "User ID not found" });
      }

      const provider = await storage.getProviderByUserId(userId);
      
      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }

      const transfers = await storage.getTransferBookingsByProvider(provider.id);
      const disposals = await storage.getDisposalBookingsByProvider(provider.id);

      res.json({ transfers, disposals });
    } catch (error) {
      console.error("Error fetching provider requests:", error);
      res.status(500).json({ error: "Failed to fetch requests" });
    }
  });

  // ========== KONNECT PAYMENT INTEGRATION ==========
  
  // Initialize payment
  app.post("/api/payments/init", async (req, res) => {
    try {
      console.log("Payment init request body:", req.body);
      const { bookingType, bookingId, amount, customerEmail, customerFirstName, customerLastName, customerPhone, description } = req.body;

      console.log("Extracted fields:", { bookingType, bookingId, amount, customerEmail, customerFirstName, customerLastName, customerPhone, description });

      if (!bookingType || !bookingId || amount === undefined || amount === null || !customerEmail) {
        console.error("Missing required fields. Current values:", { bookingType, bookingId, amount, customerEmail });
        return res.status(400).json({ 
          error: "Missing required fields",
          received: { bookingType, bookingId, amount, customerEmail }
        });
      }

      // Create payment intent in database
      const paymentIntent = await storage.createPaymentIntent({
        bookingType,
        bookingId,
        amount: amount.toString(),
        currency: "TND",
        status: "pending",
      });

      // Initialize Konnect payment
      const konnectResponse = await initKonnectPayment({
        amount: parseFloat(amount),
        orderId: paymentIntent.id,
        bookingType,
        customerEmail,
        customerFirstName,
        customerLastName,
        customerPhone,
        description,
      });

      // Update payment intent with Konnect reference and URL
      await storage.updatePaymentIntent(paymentIntent.id, {
        konnectPaymentRef: konnectResponse.paymentRef,
        konnectPayUrl: konnectResponse.payUrl,
      });

      res.json({
        paymentIntentId: paymentIntent.id,
        payUrl: konnectResponse.payUrl,
        paymentRef: konnectResponse.paymentRef,
      });
    } catch (error: any) {
      console.error("Error initializing payment:", error);
      res.status(500).json({ error: "Failed to initialize payment", details: error.message });
    }
  });

  // Konnect webhook - called by Konnect when payment status changes
  app.get("/api/konnect/webhook", async (req, res) => {
    try {
      const { payment_ref } = req.query;

      if (!payment_ref || typeof payment_ref !== 'string') {
        return res.status(400).json({ error: "Missing payment_ref" });
      }

      // Get payment details from Konnect
      const paymentDetails = await getKonnectPaymentDetails(payment_ref);

      // Find the payment intent
      const paymentIntent = await storage.getPaymentIntentByReference(payment_ref);
      
      if (!paymentIntent) {
        console.error(`Payment intent not found for ref: ${payment_ref}`);
        return res.status(404).json({ error: "Payment intent not found" });
      }

      // Update payment intent status
      await storage.updatePaymentIntent(paymentIntent.id, {
        status: paymentDetails.status,
      });

      // If payment is completed, update booking and send emails
      if (paymentDetails.status === 'completed') {
        const { bookingType, bookingId } = paymentIntent;

        // Update booking payment status
        if (bookingType === 'transfer') {
          const booking = await storage.getTransferBooking(bookingId);
          if (booking) {
            await storage.updateTransferBooking(bookingId, {
              paymentStatus: 'paid',
              status: 'confirmed',
            });

            // Get customer and vehicle info for emails
            const customer = await storage.getCustomer(booking.customerId);
            const vehicle = booking.vehicleId ? await storage.getVehicle(booking.vehicleId) : null;

            if (customer) {
              // Send voucher to customer
              await sendVoucherEmail({
                email: customer.email,
                firstName: customer.firstName,
                lastName: customer.lastName,
                bookingId: booking.id,
                bookingType: 'transfer',
                bookingDetails: {
                  date: new Date(booking.pickupDate).toLocaleDateString('fr-FR'),
                  time: booking.pickupTime,
                  origin: booking.pickupLocation,
                  destination: booking.dropoffLocation,
                  vehicleName: vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Véhicule',
                  passengers: booking.passengers,
                  totalPrice: parseFloat(booking.totalPrice),
                },
              });

              // Send mission order to provider if vehicle is assigned
              if (vehicle && vehicle.providerId) {
                const provider = await storage.getProvider(vehicle.providerId);
                if (provider) {
                  await sendMissionOrderEmail({
                    providerEmail: provider.email || '',
                    providerName: provider.name,
                    bookingId: booking.id,
                    bookingType: 'transfer',
                    customerName: `${customer.firstName} ${customer.lastName}`,
                    bookingDetails: {
                      date: new Date(booking.pickupDate).toLocaleDateString('fr-FR'),
                      time: booking.pickupTime,
                      origin: booking.pickupLocation,
                      destination: booking.dropoffLocation,
                      passengers: booking.passengers,
                      luggage: booking.luggage,
                      vehicleName: `${vehicle.brand} ${vehicle.model}`,
                      specialRequests: booking.specialRequests || undefined,
                      flightNumber: booking.flightNumber || undefined,
                      nameOnPlacard: booking.nameOnPlacard || undefined,
                    },
                  });
                }
              }
            }
          }
        } else if (bookingType === 'disposal') {
          const booking = await storage.getDisposalBooking(bookingId);
          if (booking) {
            await storage.updateDisposalBooking(bookingId, {
              paymentStatus: 'paid',
              status: 'confirmed',
            });

            // Get customer and vehicle info
            const customer = await storage.getCustomer(booking.customerId);
            const vehicle = await storage.getVehicle(booking.vehicleId);

            if (customer && vehicle) {
              // Send voucher to customer
              await sendVoucherEmail({
                email: customer.email,
                firstName: customer.firstName,
                lastName: customer.lastName,
                bookingId: booking.id,
                bookingType: 'disposal',
                bookingDetails: {
                  date: new Date(booking.pickupDate).toLocaleDateString('fr-FR'),
                  time: booking.pickupTime,
                  origin: booking.pickupLocation,
                  vehicleName: `${vehicle.brand} ${vehicle.model}`,
                  passengers: booking.passengers,
                  totalPrice: parseFloat(booking.totalPrice),
                },
              });

              // Send mission order to provider
              if (vehicle.providerId) {
                const provider = await storage.getProvider(vehicle.providerId);
                if (provider) {
                  await sendMissionOrderEmail({
                    providerEmail: provider.email || '',
                    providerName: provider.name,
                    bookingId: booking.id,
                    bookingType: 'disposal',
                    customerName: `${customer.firstName} ${customer.lastName}`,
                    bookingDetails: {
                      date: new Date(booking.pickupDate).toLocaleDateString('fr-FR'),
                      time: booking.pickupTime,
                      origin: booking.pickupLocation,
                      passengers: booking.passengers,
                      vehicleName: `${vehicle.brand} ${vehicle.model}`,
                      specialRequests: booking.specialRequests || undefined,
                    },
                  });
                }
              }
            }
          }
        } else if (bookingType === 'tour') {
          const booking = await storage.getTourBooking(bookingId);
          if (booking) {
            await storage.updateTourBooking(bookingId, {
              paymentStatus: 'paid',
              status: 'confirmed',
            });

            // Get customer and tour info
            const customer = await storage.getCustomer(booking.customerId);
            const tour = await storage.getTour(booking.tourId);

            if (customer && tour) {
              // Send voucher to customer
              await sendVoucherEmail({
                email: customer.email,
                firstName: customer.firstName,
                lastName: customer.lastName,
                bookingId: booking.id,
                bookingType: 'tour',
                bookingDetails: {
                  date: new Date(booking.tourDate).toLocaleDateString('fr-FR'),
                  tourName: tour.name,
                  passengers: booking.adults + (booking.children || 0),
                  totalPrice: parseFloat(booking.totalPrice),
                },
              });
            }
          }
        }
      }

      res.json({ status: 'success' });
    } catch (error: any) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });

  // Get payment status
  app.get("/api/payments/:paymentRef/status", async (req, res) => {
    try {
      const { paymentRef } = req.params;

      const paymentDetails = await getKonnectPaymentDetails(paymentRef);
      const paymentIntent = await storage.getPaymentIntentByReference(paymentRef);

      res.json({
        status: paymentDetails.status,
        amount: paymentDetails.amount,
        paymentIntent,
      });
    } catch (error: any) {
      console.error("Error fetching payment status:", error);
      res.status(500).json({ error: "Failed to fetch payment status" });
    }
  });

  // Admin Views - Track when admin last viewed each section
  app.get("/api/admin/views", requireAdminPassword, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Non autorisé" });
      }

      const views = await storage.getAdminViews(userId);
      res.json(views);
    } catch (error: any) {
      console.error("Error fetching admin views:", error);
      res.status(500).json({ error: "Failed to fetch admin views" });
    }
  });

  app.post("/api/admin/views", requireAdminPassword, async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Non autorisé" });
      }

      const { section } = req.body;
      if (!section) {
        return res.status(400).json({ error: "Section is required" });
      }

      const view = await storage.upsertAdminView(userId, section);
      res.json(view);
    } catch (error: any) {
      console.error("Error updating admin view:", error);
      res.status(500).json({ error: "Failed to update admin view" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
