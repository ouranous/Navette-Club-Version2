import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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
} from "@shared/schema";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
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

  app.post("/api/providers", async (req, res) => {
    try {
      const validatedData = insertProviderSchema.parse(req.body);
      const provider = await storage.createProvider(validatedData);
      res.status(201).json(provider);
    } catch (error) {
      res.status(400).json({ error: "Invalid provider data", details: error });
    }
  });

  app.patch("/api/providers/:id", async (req, res) => {
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

  app.delete("/api/providers/:id", async (req, res) => {
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
      const { available, providerId } = req.query;
      
      let vehicles;
      if (available === "true") {
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

  app.post("/api/vehicles", async (req, res) => {
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

  app.patch("/api/vehicles/:id", async (req, res) => {
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

  app.delete("/api/vehicles/:id", async (req, res) => {
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

  app.post("/api/vehicles/:vehicleId/seasonal-prices", async (req, res) => {
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

  app.patch("/api/vehicles/seasonal-prices/:id", async (req, res) => {
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

  app.delete("/api/vehicles/seasonal-prices/:id", async (req, res) => {
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

  app.post("/api/vehicles/:vehicleId/hourly-prices", async (req, res) => {
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

  app.patch("/api/vehicles/hourly-prices/:id", async (req, res) => {
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

  app.delete("/api/vehicles/hourly-prices/:id", async (req, res) => {
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

  app.post("/api/tours", async (req, res) => {
    try {
      const validatedData = insertCityTourSchema.parse(req.body);
      const tour = await storage.createTour(validatedData);
      res.status(201).json(tour);
    } catch (error) {
      res.status(400).json({ error: "Invalid tour data", details: error });
    }
  });

  app.patch("/api/tours/:id", async (req, res) => {
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

  app.delete("/api/tours/:id", async (req, res) => {
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

  app.post("/api/tours/:tourId/stops", async (req, res) => {
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
      const validatedData = insertTransferBookingSchema.parse(req.body);
      const booking = await storage.createTransferBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      res.status(400).json({ error: "Invalid booking data", details: error });
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
  // SECURITY NOTE: These routes are currently unprotected, consistent with the rest of the API.
  // TODO: Add authentication middleware when implementing user authentication system.
  
  // Endpoint to get upload URL for images
  app.post("/api/objects/upload", async (req, res) => {
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
  app.get("/api/transfer-bookings", isAuthenticated, async (req, res) => {
    try {
      const bookings = await storage.getAllTransferBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transfer bookings" });
    }
  });

  app.get("/api/transfer-bookings/:id", isAuthenticated, async (req, res) => {
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

  app.patch("/api/transfer-bookings/:id", isAuthenticated, async (req, res) => {
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
  app.get("/api/disposal-bookings", isAuthenticated, async (req, res) => {
    try {
      const bookings = await storage.getAllDisposalBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch disposal bookings" });
    }
  });

  app.get("/api/disposal-bookings/:id", isAuthenticated, async (req, res) => {
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

  app.patch("/api/disposal-bookings/:id", isAuthenticated, async (req, res) => {
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
  app.get("/api/tour-bookings", isAuthenticated, async (req, res) => {
    try {
      const bookings = await storage.getAllTourBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tour bookings" });
    }
  });

  app.get("/api/tour-bookings/:id", isAuthenticated, async (req, res) => {
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
      const booking = await storage.createTourBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      res.status(400).json({ error: "Invalid booking data", details: error });
    }
  });

  app.patch("/api/tour-bookings/:id", isAuthenticated, async (req, res) => {
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
  app.get("/api/payment-intents", isAuthenticated, async (req, res) => {
    try {
      const intents = await storage.getAllPaymentIntents();
      res.json(intents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment intents" });
    }
  });

  app.get("/api/payment-intents/:id", isAuthenticated, async (req, res) => {
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

  app.patch("/api/payment-intents/:id", isAuthenticated, async (req, res) => {
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

  app.post("/api/homepage-content", async (req, res) => {
    try {
      const validatedData = insertHomePageContentSchema.parse(req.body);
      const content = await storage.createHomePageContent(validatedData);
      res.status(201).json(content);
    } catch (error) {
      res.status(400).json({ error: "Invalid content data", details: error });
    }
  });

  app.patch("/api/homepage-content/:id", async (req, res) => {
    try {
      const validatedData = insertHomePageContentSchema.partial().parse(req.body);
      const content = await storage.updateHomePageContent(req.params.id, validatedData);
      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }
      res.json(content);
    } catch (error) {
      res.status(400).json({ error: "Invalid content data", details: error });
    }
  });

  app.delete("/api/homepage-content/:id", async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
