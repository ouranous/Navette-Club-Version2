import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users/Admin
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("admin"),
});

// Providers - Fournisseurs (sociétés de location, agences de voyage)
export const providers = pgTable("providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // "car_rental", "travel_agency", "transport_company"
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  country: text("country").default("France"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Vehicles - Configuration des véhicules
export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").references(() => providers.id),
  name: text("name").notNull(), // "Berline Premium", "Van 8 Places"
  type: text("type").notNull(), // "economy", "comfort", "business", "premium", "vip", "suv", "van", "minibus"
  capacity: integer("capacity").notNull(), // nombre de passagers
  luggage: integer("luggage").notNull(), // nombre de bagages
  description: text("description"),
  features: text("features").array(), // ["Wi-Fi", "Climatisation", "Sièges cuir"]
  imageUrl: text("image_url"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  pricePerKm: decimal("price_per_km", { precision: 10, scale: 2 }),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// City Tours - Configuration complète des tours
export const cityTours = pgTable("city_tours", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").references(() => providers.id),
  name: text("name").notNull(), // "Paris Classique"
  slug: text("slug").notNull().unique(), // "paris-classique"
  description: text("description").notNull(),
  fullDescription: text("full_description"),
  category: text("category").notNull(), // "cultural", "gastronomic", "adventure"
  duration: integer("duration").notNull(), // en heures
  difficulty: text("difficulty").notNull(), // "easy", "medium", "hard"
  maxCapacity: integer("max_capacity").notNull(),
  minParticipants: integer("min_participants").default(2),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  priceChild: decimal("price_child", { precision: 10, scale: 2 }),
  included: text("included").array(), // ["Guide francophone", "Entrées monuments"]
  excluded: text("excluded").array(), // ["Repas", "Pourboires"]
  meetingPoint: text("meeting_point").notNull(),
  meetingTime: text("meeting_time"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  imageUrl: text("image_url"),
  images: text("images").array(),
  isActive: boolean("is_active").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tour Stops - Itinéraires détaillés des tours
export const tourStops = pgTable("tour_stops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tourId: varchar("tour_id").notNull().references(() => cityTours.id, { onDelete: "cascade" }),
  order: integer("order").notNull(), // ordre de visite
  name: text("name").notNull(), // "Tour Eiffel"
  description: text("description"),
  duration: integer("duration"), // durée en minutes
  activity: text("activity"), // "visite guidée", "photo stop", "dégustation"
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  imageUrl: text("image_url"),
});

// Customers - Informations clients
export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  country: text("country"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Transfer Bookings - Réservations de transferts
export const transferBookings = pgTable("transfer_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  transferType: text("transfer_type").notNull(), // "one-way", "round-trip"
  pickupLocation: text("pickup_location").notNull(),
  dropoffLocation: text("drop_off_location").notNull(),
  pickupDate: timestamp("pickup_date").notNull(),
  pickupTime: text("pickup_time").notNull(),
  returnDate: timestamp("return_date"),
  returnTime: text("return_time"),
  passengers: integer("passengers").notNull(),
  luggage: integer("luggage").notNull(),
  flightNumber: text("flight_number"),
  specialRequests: text("special_requests"),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // "pending", "confirmed", "completed", "cancelled"
  paymentStatus: text("payment_status").notNull().default("pending"), // "pending", "paid", "refunded"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tour Bookings - Réservations de city tours
export const tourBookings = pgTable("tour_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  tourId: varchar("tour_id").notNull().references(() => cityTours.id),
  tourDate: timestamp("tour_date").notNull(),
  adults: integer("adults").notNull(),
  children: integer("children").default(0),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  specialRequests: text("special_requests"),
  status: text("status").notNull().default("pending"), // "pending", "confirmed", "completed", "cancelled"
  paymentStatus: text("payment_status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations
export const providersRelations = relations(providers, ({ many }) => ({
  vehicles: many(vehicles),
  cityTours: many(cityTours),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  provider: one(providers, {
    fields: [vehicles.providerId],
    references: [providers.id],
  }),
  bookings: many(transferBookings),
}));

export const cityToursRelations = relations(cityTours, ({ one, many }) => ({
  provider: one(providers, {
    fields: [cityTours.providerId],
    references: [providers.id],
  }),
  stops: many(tourStops),
  bookings: many(tourBookings),
}));

export const tourStopsRelations = relations(tourStops, ({ one }) => ({
  tour: one(cityTours, {
    fields: [tourStops.tourId],
    references: [cityTours.id],
  }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  transferBookings: many(transferBookings),
  tourBookings: many(tourBookings),
}));

export const transferBookingsRelations = relations(transferBookings, ({ one }) => ({
  customer: one(customers, {
    fields: [transferBookings.customerId],
    references: [customers.id],
  }),
  vehicle: one(vehicles, {
    fields: [transferBookings.vehicleId],
    references: [vehicles.id],
  }),
}));

export const tourBookingsRelations = relations(tourBookings, ({ one }) => ({
  customer: one(customers, {
    fields: [tourBookings.customerId],
    references: [customers.id],
  }),
  tour: one(cityTours, {
    fields: [tourBookings.tourId],
    references: [cityTours.id],
  }),
}));

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProviderSchema = createInsertSchema(providers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCityTourSchema = createInsertSchema(cityTours).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTourStopSchema = createInsertSchema(tourStops).omit({
  id: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export const insertTransferBookingSchema = createInsertSchema(transferBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTourBookingSchema = createInsertSchema(tourBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Provider = typeof providers.$inferSelect;
export type InsertProvider = z.infer<typeof insertProviderSchema>;

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;

export type CityTour = typeof cityTours.$inferSelect;
export type InsertCityTour = z.infer<typeof insertCityTourSchema>;

export type TourStop = typeof tourStops.$inferSelect;
export type InsertTourStop = z.infer<typeof insertTourStopSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type TransferBooking = typeof transferBookings.$inferSelect;
export type InsertTransferBooking = z.infer<typeof insertTransferBookingSchema>;

export type TourBooking = typeof tourBookings.$inferSelect;
export type InsertTourBooking = z.infer<typeof insertTourBookingSchema>;
