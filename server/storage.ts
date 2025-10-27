// Reference: blueprint:javascript_database
import { 
  users, 
  providers,
  vehicles,
  vehicleSeasonalPrices,
  vehicleHourlyPrices,
  cityTours, 
  tourStops,
  customers,
  transferBookings,
  disposalBookings,
  tourBookings,
  paymentIntents,
  homePageContent,
  type User,
  type InsertUser,
  type UpsertUser,
  type Provider,
  type InsertProvider,
  type Vehicle,
  type InsertVehicle,
  type VehicleSeasonalPrice,
  type InsertVehicleSeasonalPrice,
  type VehicleHourlyPrice,
  type InsertVehicleHourlyPrice,
  type CityTour,
  type InsertCityTour,
  type TourStop,
  type InsertTourStop,
  type Customer,
  type InsertCustomer,
  type TransferBooking,
  type InsertTransferBooking,
  type DisposalBooking,
  type InsertDisposalBooking,
  type TourBooking,
  type InsertTourBooking,
  type PaymentIntent,
  type InsertPaymentIntent,
  type HomePageContent,
  type InsertHomePageContent,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Users (Replit Auth integration)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Providers
  getAllProviders(): Promise<Provider[]>;
  getProvider(id: string): Promise<Provider | undefined>;
  createProvider(provider: InsertProvider): Promise<Provider>;
  updateProvider(id: string, provider: Partial<InsertProvider>): Promise<Provider | undefined>;
  deleteProvider(id: string): Promise<boolean>;
  
  // Vehicles
  getAllVehicles(): Promise<Vehicle[]>;
  getAvailableVehicles(): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  getVehiclesByProvider(providerId: string): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: string): Promise<boolean>;
  
  // Vehicle Seasonal Prices
  getVehicleSeasonalPrices(vehicleId: string): Promise<VehicleSeasonalPrice[]>;
  createVehicleSeasonalPrice(price: InsertVehicleSeasonalPrice): Promise<VehicleSeasonalPrice>;
  updateVehicleSeasonalPrice(id: string, price: Partial<InsertVehicleSeasonalPrice>): Promise<VehicleSeasonalPrice | undefined>;
  deleteVehicleSeasonalPrice(id: string): Promise<boolean>;
  
  // Vehicle Hourly Prices
  getVehicleHourlyPrices(vehicleId: string): Promise<VehicleHourlyPrice[]>;
  createVehicleHourlyPrice(price: InsertVehicleHourlyPrice): Promise<VehicleHourlyPrice>;
  updateVehicleHourlyPrice(id: string, price: Partial<InsertVehicleHourlyPrice>): Promise<VehicleHourlyPrice | undefined>;
  deleteVehicleHourlyPrice(id: string): Promise<boolean>;
  
  // City Tours
  getAllTours(): Promise<CityTour[]>;
  getActiveTours(): Promise<CityTour[]>;
  getFeaturedTours(): Promise<CityTour[]>;
  getNonFeaturedTours(): Promise<CityTour[]>;
  getFeaturedActiveTours(): Promise<CityTour[]>;
  getNonFeaturedActiveTours(): Promise<CityTour[]>;
  getTour(id: string): Promise<CityTour | undefined>;
  getTourBySlug(slug: string): Promise<CityTour | undefined>;
  getToursByProvider(providerId: string): Promise<CityTour[]>;
  createTour(tour: InsertCityTour): Promise<CityTour>;
  updateTour(id: string, tour: Partial<InsertCityTour>): Promise<CityTour | undefined>;
  deleteTour(id: string): Promise<boolean>;
  
  // Tour Stops
  getTourStops(tourId: string): Promise<TourStop[]>;
  createTourStop(stop: InsertTourStop): Promise<TourStop>;
  updateTourStop(id: string, stop: Partial<InsertTourStop>): Promise<TourStop | undefined>;
  deleteTourStop(id: string): Promise<boolean>;
  
  // Customers
  getAllCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  
  // Transfer Bookings
  getAllTransferBookings(): Promise<TransferBooking[]>;
  getTransferBooking(id: string): Promise<TransferBooking | undefined>;
  getTransferBookingsByCustomer(customerId: string): Promise<TransferBooking[]>;
  createTransferBooking(booking: InsertTransferBooking): Promise<TransferBooking>;
  updateTransferBooking(id: string, booking: Partial<InsertTransferBooking>): Promise<TransferBooking | undefined>;
  
  // Disposal Bookings (Mise à disposition)
  getAllDisposalBookings(): Promise<DisposalBooking[]>;
  getDisposalBooking(id: string): Promise<DisposalBooking | undefined>;
  getDisposalBookingsByCustomer(customerId: string): Promise<DisposalBooking[]>;
  createDisposalBooking(booking: InsertDisposalBooking): Promise<DisposalBooking>;
  updateDisposalBooking(id: string, booking: Partial<InsertDisposalBooking>): Promise<DisposalBooking | undefined>;
  
  // Tour Bookings
  getAllTourBookings(): Promise<TourBooking[]>;
  getTourBooking(id: string): Promise<TourBooking | undefined>;
  getTourBookingsByCustomer(customerId: string): Promise<TourBooking[]>;
  getTourBookingsByTour(tourId: string): Promise<TourBooking[]>;
  createTourBooking(booking: InsertTourBooking): Promise<TourBooking>;
  updateTourBooking(id: string, booking: Partial<InsertTourBooking>): Promise<TourBooking | undefined>;

  // Payment Intents (KONNECT)
  getAllPaymentIntents(): Promise<PaymentIntent[]>;
  getPaymentIntent(id: string): Promise<PaymentIntent | undefined>;
  getPaymentIntentByReference(paymentRef: string): Promise<PaymentIntent | undefined>;
  createPaymentIntent(intent: InsertPaymentIntent): Promise<PaymentIntent>;
  updatePaymentIntent(id: string, intent: Partial<InsertPaymentIntent>): Promise<PaymentIntent | undefined>;

  // Home Page Content
  getAllHomePageContent(): Promise<HomePageContent[]>;
  getHomePageContent(id: string): Promise<HomePageContent | undefined>;
  createHomePageContent(content: InsertHomePageContent): Promise<HomePageContent>;
  updateHomePageContent(id: string, content: Partial<InsertHomePageContent>): Promise<HomePageContent | undefined>;
  deleteHomePageContent(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Users (Replit Auth integration)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Providers
  async getAllProviders(): Promise<Provider[]> {
    return await db.select().from(providers).orderBy(desc(providers.createdAt));
  }

  async getProvider(id: string): Promise<Provider | undefined> {
    const [provider] = await db.select().from(providers).where(eq(providers.id, id));
    return provider || undefined;
  }

  async createProvider(provider: InsertProvider): Promise<Provider> {
    const [created] = await db.insert(providers).values(provider).returning();
    return created;
  }

  async updateProvider(id: string, provider: Partial<InsertProvider>): Promise<Provider | undefined> {
    const [updated] = await db
      .update(providers)
      .set({ ...provider, updatedAt: new Date() })
      .where(eq(providers.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteProvider(id: string): Promise<boolean> {
    const result = await db.delete(providers).where(eq(providers.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Vehicles
  async getAllVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles).orderBy(desc(vehicles.createdAt));
  }

  async getAvailableVehicles(): Promise<Vehicle[]> {
    return await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.isAvailable, true))
      .orderBy(vehicles.basePrice);
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || undefined;
  }

  async getVehiclesByProvider(providerId: string): Promise<Vehicle[]> {
    return await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.providerId, providerId));
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const [created] = await db.insert(vehicles).values(vehicle).returning();
    return created;
  }

  async updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const [updated] = await db
      .update(vehicles)
      .set({ ...vehicle, updatedAt: new Date() })
      .where(eq(vehicles.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteVehicle(id: string): Promise<boolean> {
    const result = await db.delete(vehicles).where(eq(vehicles.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Vehicle Seasonal Prices
  async getVehicleSeasonalPrices(vehicleId: string): Promise<VehicleSeasonalPrice[]> {
    return await db
      .select()
      .from(vehicleSeasonalPrices)
      .where(eq(vehicleSeasonalPrices.vehicleId, vehicleId))
      .orderBy(vehicleSeasonalPrices.startDate);
  }

  async createVehicleSeasonalPrice(price: InsertVehicleSeasonalPrice): Promise<VehicleSeasonalPrice> {
    const [created] = await db.insert(vehicleSeasonalPrices).values(price).returning();
    return created;
  }

  async updateVehicleSeasonalPrice(id: string, price: Partial<InsertVehicleSeasonalPrice>): Promise<VehicleSeasonalPrice | undefined> {
    const [updated] = await db
      .update(vehicleSeasonalPrices)
      .set(price)
      .where(eq(vehicleSeasonalPrices.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteVehicleSeasonalPrice(id: string): Promise<boolean> {
    const result = await db.delete(vehicleSeasonalPrices).where(eq(vehicleSeasonalPrices.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Vehicle Hourly Prices
  async getVehicleHourlyPrices(vehicleId: string): Promise<VehicleHourlyPrice[]> {
    return await db
      .select()
      .from(vehicleHourlyPrices)
      .where(eq(vehicleHourlyPrices.vehicleId, vehicleId))
      .orderBy(vehicleHourlyPrices.startDate);
  }

  async createVehicleHourlyPrice(price: InsertVehicleHourlyPrice): Promise<VehicleHourlyPrice> {
    const [created] = await db.insert(vehicleHourlyPrices).values(price).returning();
    return created;
  }

  async updateVehicleHourlyPrice(id: string, price: Partial<InsertVehicleHourlyPrice>): Promise<VehicleHourlyPrice | undefined> {
    const [updated] = await db
      .update(vehicleHourlyPrices)
      .set(price)
      .where(eq(vehicleHourlyPrices.id, id))
      .returning();
    return updated;
  }

  async deleteVehicleHourlyPrice(id: string): Promise<boolean> {
    const result = await db.delete(vehicleHourlyPrices).where(eq(vehicleHourlyPrices.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // City Tours
  async getAllTours(): Promise<CityTour[]> {
    return await db.select().from(cityTours).orderBy(desc(cityTours.createdAt));
  }

  async getActiveTours(): Promise<CityTour[]> {
    return await db
      .select()
      .from(cityTours)
      .where(eq(cityTours.isActive, true))
      .orderBy(cityTours.featured, cityTours.name);
  }

  async getFeaturedTours(): Promise<CityTour[]> {
    return await db
      .select()
      .from(cityTours)
      .where(eq(cityTours.featured, true))
      .orderBy(desc(cityTours.createdAt));
  }

  async getNonFeaturedTours(): Promise<CityTour[]> {
    return await db
      .select()
      .from(cityTours)
      .where(eq(cityTours.featured, false))
      .orderBy(desc(cityTours.createdAt));
  }

  async getFeaturedActiveTours(): Promise<CityTour[]> {
    return await db
      .select()
      .from(cityTours)
      .where(and(eq(cityTours.isActive, true), eq(cityTours.featured, true)))
      .orderBy(desc(cityTours.createdAt));
  }

  async getNonFeaturedActiveTours(): Promise<CityTour[]> {
    return await db
      .select()
      .from(cityTours)
      .where(and(eq(cityTours.isActive, true), eq(cityTours.featured, false)))
      .orderBy(desc(cityTours.createdAt));
  }

  async getTour(id: string): Promise<CityTour | undefined> {
    const [tour] = await db.select().from(cityTours).where(eq(cityTours.id, id));
    return tour || undefined;
  }

  async getTourBySlug(slug: string): Promise<CityTour | undefined> {
    const [tour] = await db.select().from(cityTours).where(eq(cityTours.slug, slug));
    return tour || undefined;
  }

  async getToursByProvider(providerId: string): Promise<CityTour[]> {
    return await db
      .select()
      .from(cityTours)
      .where(eq(cityTours.providerId, providerId));
  }

  async createTour(tour: InsertCityTour): Promise<CityTour> {
    const [created] = await db.insert(cityTours).values(tour).returning();
    return created;
  }

  async updateTour(id: string, tour: Partial<InsertCityTour>): Promise<CityTour | undefined> {
    const [updated] = await db
      .update(cityTours)
      .set({ ...tour, updatedAt: new Date() })
      .where(eq(cityTours.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteTour(id: string): Promise<boolean> {
    const result = await db.delete(cityTours).where(eq(cityTours.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Tour Stops
  async getTourStops(tourId: string): Promise<TourStop[]> {
    return await db
      .select()
      .from(tourStops)
      .where(eq(tourStops.tourId, tourId))
      .orderBy(tourStops.order);
  }

  async createTourStop(stop: InsertTourStop): Promise<TourStop> {
    const [created] = await db.insert(tourStops).values(stop).returning();
    return created;
  }

  async updateTourStop(id: string, stop: Partial<InsertTourStop>): Promise<TourStop | undefined> {
    const [updated] = await db
      .update(tourStops)
      .set(stop)
      .where(eq(tourStops.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteTourStop(id: string): Promise<boolean> {
    const result = await db.delete(tourStops).where(eq(tourStops.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Customers
  async getAllCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.email, email));
    return customer || undefined;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [created] = await db.insert(customers).values(customer).returning();
    return created;
  }

  // Transfer Bookings
  async getAllTransferBookings(): Promise<TransferBooking[]> {
    return await db.select().from(transferBookings).orderBy(desc(transferBookings.createdAt));
  }

  async getTransferBooking(id: string): Promise<TransferBooking | undefined> {
    const [booking] = await db.select().from(transferBookings).where(eq(transferBookings.id, id));
    return booking || undefined;
  }

  async getTransferBookingsByCustomer(customerId: string): Promise<TransferBooking[]> {
    return await db
      .select()
      .from(transferBookings)
      .where(eq(transferBookings.customerId, customerId))
      .orderBy(desc(transferBookings.createdAt));
  }

  async createTransferBooking(booking: InsertTransferBooking): Promise<TransferBooking> {
    const [created] = await db.insert(transferBookings).values(booking).returning();
    return created;
  }

  async updateTransferBooking(id: string, booking: Partial<InsertTransferBooking>): Promise<TransferBooking | undefined> {
    const [updated] = await db
      .update(transferBookings)
      .set({ ...booking, updatedAt: new Date() })
      .where(eq(transferBookings.id, id))
      .returning();
    return updated || undefined;
  }

  // Tour Bookings
  async getAllTourBookings(): Promise<TourBooking[]> {
    return await db.select().from(tourBookings).orderBy(desc(tourBookings.createdAt));
  }

  async getTourBooking(id: string): Promise<TourBooking | undefined> {
    const [booking] = await db.select().from(tourBookings).where(eq(tourBookings.id, id));
    return booking || undefined;
  }

  async getTourBookingsByCustomer(customerId: string): Promise<TourBooking[]> {
    return await db
      .select()
      .from(tourBookings)
      .where(eq(tourBookings.customerId, customerId))
      .orderBy(desc(tourBookings.createdAt));
  }

  async getTourBookingsByTour(tourId: string): Promise<TourBooking[]> {
    return await db
      .select()
      .from(tourBookings)
      .where(eq(tourBookings.tourId, tourId))
      .orderBy(desc(tourBookings.createdAt));
  }

  async createTourBooking(booking: InsertTourBooking): Promise<TourBooking> {
    const [created] = await db.insert(tourBookings).values(booking).returning();
    return created;
  }

  async updateTourBooking(id: string, booking: Partial<InsertTourBooking>): Promise<TourBooking | undefined> {
    const [updated] = await db
      .update(tourBookings)
      .set({ ...booking, updatedAt: new Date() })
      .where(eq(tourBookings.id, id))
      .returning();
    return updated || undefined;
  }

  // Disposal Bookings (Mise à disposition)
  async getAllDisposalBookings(): Promise<DisposalBooking[]> {
    return await db.select().from(disposalBookings).orderBy(desc(disposalBookings.createdAt));
  }

  async getDisposalBooking(id: string): Promise<DisposalBooking | undefined> {
    const [booking] = await db.select().from(disposalBookings).where(eq(disposalBookings.id, id));
    return booking || undefined;
  }

  async getDisposalBookingsByCustomer(customerId: string): Promise<DisposalBooking[]> {
    return await db
      .select()
      .from(disposalBookings)
      .where(eq(disposalBookings.customerId, customerId))
      .orderBy(desc(disposalBookings.createdAt));
  }

  async createDisposalBooking(booking: InsertDisposalBooking): Promise<DisposalBooking> {
    const [created] = await db.insert(disposalBookings).values(booking).returning();
    return created;
  }

  async updateDisposalBooking(id: string, booking: Partial<InsertDisposalBooking>): Promise<DisposalBooking | undefined> {
    const [updated] = await db
      .update(disposalBookings)
      .set({ ...booking, updatedAt: new Date() })
      .where(eq(disposalBookings.id, id))
      .returning();
    return updated || undefined;
  }

  // Payment Intents (KONNECT)
  async getAllPaymentIntents(): Promise<PaymentIntent[]> {
    return await db.select().from(paymentIntents).orderBy(desc(paymentIntents.createdAt));
  }

  async getPaymentIntent(id: string): Promise<PaymentIntent | undefined> {
    const [intent] = await db.select().from(paymentIntents).where(eq(paymentIntents.id, id));
    return intent || undefined;
  }

  async getPaymentIntentByReference(paymentRef: string): Promise<PaymentIntent | undefined> {
    const [intent] = await db.select().from(paymentIntents).where(eq(paymentIntents.paymentRef, paymentRef));
    return intent || undefined;
  }

  async createPaymentIntent(intent: InsertPaymentIntent): Promise<PaymentIntent> {
    const [created] = await db.insert(paymentIntents).values(intent).returning();
    return created;
  }

  async updatePaymentIntent(id: string, intent: Partial<InsertPaymentIntent>): Promise<PaymentIntent | undefined> {
    const [updated] = await db
      .update(paymentIntents)
      .set({ ...intent, updatedAt: new Date() })
      .where(eq(paymentIntents.id, id))
      .returning();
    return updated || undefined;
  }

  // Home Page Content
  async getAllHomePageContent(): Promise<HomePageContent[]> {
    return await db.select().from(homePageContent).orderBy(homePageContent.order, homePageContent.createdAt);
  }

  async getHomePageContent(id: string): Promise<HomePageContent | undefined> {
    const [content] = await db.select().from(homePageContent).where(eq(homePageContent.id, id));
    return content || undefined;
  }

  async createHomePageContent(content: InsertHomePageContent): Promise<HomePageContent> {
    const [created] = await db.insert(homePageContent).values(content).returning();
    return created;
  }

  async updateHomePageContent(id: string, content: Partial<InsertHomePageContent>): Promise<HomePageContent | undefined> {
    const [updated] = await db
      .update(homePageContent)
      .set({ ...content, updatedAt: new Date() })
      .where(eq(homePageContent.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteHomePageContent(id: string): Promise<boolean> {
    const result = await db.delete(homePageContent).where(eq(homePageContent.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
