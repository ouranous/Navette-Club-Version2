import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users - Supports both Replit Auth and email/password authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  passwordHash: varchar("password_hash"), // For email/password auth (bcrypt hash)
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: text("role").notNull().default("user"), // "user", "admin", "provider"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Providers - Fournisseurs (sociétés de location, agences de voyage)
export const providers = pgTable("providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Lien avec le compte utilisateur du transporteur
  name: text("name").notNull(),
  type: text("type").notNull(), // "car_rental", "travel_agency", "transport_company"
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  country: text("country").default("France"),
  serviceZones: text("service_zones").array(), // ["Djerba et Sud", "Sousse", "Tunis et Nord"] - Zones géographiques desservies
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Vehicles - Configuration des véhicules
export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").references(() => providers.id),
  name: text("name"), // Auto-generated from brand + model (for compatibility)
  brand: text("brand").notNull(), // "Mercedes", "BMW", "Toyota"
  model: text("model").notNull(), // "Classe E", "Série 5", "Camry"
  licensePlate: text("license_plate"), // Matricule du véhicule
  driver: text("driver"), // Nom du chauffeur assigné
  type: text("type").notNull(), // "economy", "comfort", "business", "premium", "vip", "suv", "van", "minibus"
  capacity: integer("capacity").notNull(), // nombre de passagers
  luggage: integer("luggage").notNull(), // nombre de bagages
  description: text("description"),
  features: text("features").array(), // ["Wi-Fi", "Climatisation", "Sièges cuir"]
  imageUrl: text("image_url"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(), // Prix de base par défaut
  pricePerKm: decimal("price_per_km", { precision: 10, scale: 2 }), // Prix par km par défaut
  isAvailable: boolean("is_available").notNull().default(true),
  showOnHomepage: boolean("show_on_homepage").notNull().default(false), // Afficher sur la page d'accueil
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Vehicle Seasonal Prices - Prix saisonniers des véhicules (tarification au kilomètre)
export const vehicleSeasonalPrices = pgTable("vehicle_seasonal_prices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
  seasonName: text("season_name").notNull(), // "Basse saison", "Haute saison", "Période de fête"
  startDate: text("start_date").notNull(), // Format: "MM-DD" (ex: "06-01" pour 1er juin)
  endDate: text("end_date").notNull(), // Format: "MM-DD" (ex: "08-31" pour 31 août)
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  pricePerKm: decimal("price_per_km", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Vehicle Hourly Prices - Prix saisonniers des véhicules (tarification horaire pour mise à disposition)
export const vehicleHourlyPrices = pgTable("vehicle_hourly_prices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
  seasonName: text("season_name").notNull(), // "Basse saison", "Haute saison", "Période de fête"
  startDate: text("start_date").notNull(), // Format: "MM-DD" (ex: "06-01" pour 1er juin)
  endDate: text("end_date").notNull(), // Format: "MM-DD" (ex: "08-31" pour 31 août)
  pricePerHour: decimal("price_per_hour", { precision: 10, scale: 2 }).notNull(), // Prix horaire
  minimumHours: integer("minimum_hours").default(4), // Durée minimale de location (4h par défaut)
  createdAt: timestamp("created_at").notNull().defaultNow(),
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
  highlights: text("highlights").array(), // Points forts du tour
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

// Home Page Content - Gestion du contenu de la page d'accueil
export const homePageContent = pgTable("home_page_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // "hero_image", "service_badge", "feature"
  title: text("title"),
  description: text("description"),
  icon: text("icon"), // nom de l'icône lucide-react
  imageUrl: text("image_url"),
  order: integer("order").notNull().default(0), // ordre d'affichage
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Customers - Informations clients
export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Lien optionnel avec le compte utilisateur
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
  referenceNumber: text("reference_number").unique(), // Numéro de référence unique (ex: TR-20251101-001)
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  providerId: varchar("provider_id").references(() => providers.id), // Transporteur assigné (modifiable par admin)
  providerNote: text("provider_note"), // Note personnalisée pour remplacer "Non assigné" (modifiable par admin)
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
  nameOnPlacard: text("name_on_placard"), // Nom à afficher sur la pancarte d'accueil
  specialRequests: text("special_requests"),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // "pending", "confirmed", "completed", "cancelled"
  paymentStatus: text("payment_status").notNull().default("pending"), // "pending", "paid", "refunded"
  paymentIntentId: varchar("payment_intent_id").references(() => paymentIntents.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tour Bookings - Réservations de city tours
export const tourBookings = pgTable("tour_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referenceNumber: text("reference_number").unique(), // Numéro de référence unique (ex: CT-20251101-001)
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  tourId: varchar("tour_id").notNull().references(() => cityTours.id),
  tourDate: timestamp("tour_date").notNull(),
  adults: integer("adults").notNull(),
  children: integer("children").default(0),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  specialRequests: text("special_requests"),
  status: text("status").notNull().default("pending"), // "pending", "confirmed", "completed", "cancelled"
  paymentStatus: text("payment_status").notNull().default("pending"),
  paymentIntentId: varchar("payment_intent_id").references(() => paymentIntents.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Disposal Bookings - Réservations de mise à disposition (location horaire)
export const disposalBookings = pgTable("disposal_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  pickupLocation: text("pickup_location").notNull(),
  pickupDate: timestamp("pickup_date").notNull(),
  pickupTime: text("pickup_time").notNull(),
  duration: integer("duration").notNull(), // durée en heures
  passengers: integer("passengers").notNull(),
  specialRequests: text("special_requests"),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // "pending", "confirmed", "completed", "cancelled"
  paymentStatus: text("payment_status").notNull().default("pending"), // "pending", "paid", "refunded"
  paymentIntentId: varchar("payment_intent_id").references(() => paymentIntents.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Payment Intents - Suivi des transactions de paiement KONNECT
export const paymentIntents = pgTable("payment_intents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingType: text("booking_type").notNull(), // "transfer", "disposal", "tour"
  bookingId: varchar("booking_id").notNull(), // ID de la réservation associée
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("TND"),
  status: text("status").notNull().default("pending"), // "pending", "completed", "failed", "expired"
  konnectPaymentRef: text("konnect_payment_ref"), // référence KONNECT
  konnectPayUrl: text("konnect_pay_url"), // URL de paiement KONNECT
  metadata: jsonb("metadata"), // données supplémentaires
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Contact Information - Informations de contact modifiables
export const contactInfo = pgTable("contact_info", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: text("company_name").notNull().default("NavetteClub"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  phone1: text("phone1").notNull(),
  phone2: text("phone2"),
  email: text("email").notNull(),
  description: text("description"), // Description courte pour la page contact
  aboutText: text("about_text"), // Texte pour la page à propos
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Social Media Links - Liens des réseaux sociaux modifiables
export const socialMediaLinks = pgTable("social_media_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platform: text("platform").notNull(), // "facebook", "twitter", "instagram", "linkedin"
  url: text("url").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  order: integer("order").notNull().default(0), // ordre d'affichage
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  provider: one(providers, {
    fields: [users.id],
    references: [providers.userId],
  }),
  customer: one(customers, {
    fields: [users.id],
    references: [customers.userId],
  }),
}));

export const providersRelations = relations(providers, ({ one, many }) => ({
  user: one(users, {
    fields: [providers.userId],
    references: [users.id],
  }),
  vehicles: many(vehicles),
  cityTours: many(cityTours),
  transferBookings: many(transferBookings),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  provider: one(providers, {
    fields: [vehicles.providerId],
    references: [providers.id],
  }),
  transferBookings: many(transferBookings),
  disposalBookings: many(disposalBookings),
  seasonalPrices: many(vehicleSeasonalPrices),
  hourlyPrices: many(vehicleHourlyPrices),
}));

export const vehicleSeasonalPricesRelations = relations(vehicleSeasonalPrices, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [vehicleSeasonalPrices.vehicleId],
    references: [vehicles.id],
  }),
}));

export const vehicleHourlyPricesRelations = relations(vehicleHourlyPrices, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [vehicleHourlyPrices.vehicleId],
    references: [vehicles.id],
  }),
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

export const customersRelations = relations(customers, ({ one, many }) => ({
  user: one(users, {
    fields: [customers.userId],
    references: [users.id],
  }),
  transferBookings: many(transferBookings),
  tourBookings: many(tourBookings),
  disposalBookings: many(disposalBookings),
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
  provider: one(providers, {
    fields: [transferBookings.providerId],
    references: [providers.id],
  }),
  paymentIntent: one(paymentIntents, {
    fields: [transferBookings.paymentIntentId],
    references: [paymentIntents.id],
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
  paymentIntent: one(paymentIntents, {
    fields: [tourBookings.paymentIntentId],
    references: [paymentIntents.id],
  }),
}));

export const disposalBookingsRelations = relations(disposalBookings, ({ one }) => ({
  customer: one(customers, {
    fields: [disposalBookings.customerId],
    references: [customers.id],
  }),
  vehicle: one(vehicles, {
    fields: [disposalBookings.vehicleId],
    references: [vehicles.id],
  }),
  paymentIntent: one(paymentIntents, {
    fields: [disposalBookings.paymentIntentId],
    references: [paymentIntents.id],
  }),
}));

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const upsertUserSchema = insertUserSchema.pick({
  id: true,
  email: true,
  passwordHash: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true,
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
}).extend({
  type: z.enum(["economy", "comfort", "business", "premium", "vip", "suv", "van", "minibus"]),
  basePrice: z.union([z.string(), z.number()]).transform((val) => String(val)),
  pricePerKm: z.union([z.string(), z.number()]).transform((val) => String(val)).optional().nullable(),
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
}).extend({
  referenceNumber: z.string().optional().nullable(),
  pickupDate: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val),
  returnDate: z.union([z.string(), z.date(), z.null()]).transform(val => val === null ? null : (typeof val === 'string' ? new Date(val) : val)).nullable().optional(),
  totalPrice: z.union([z.string(), z.number()]).transform(val => String(val)),
  specialRequests: z.string().optional().nullable(),
  flightNumber: z.string().optional().nullable(),
  nameOnPlacard: z.string().optional().nullable(),
  returnTime: z.string().optional().nullable(),
  providerId: z.string().optional().nullable(),
  providerNote: z.string().optional().nullable(),
  paymentIntentId: z.string().optional().nullable(),
  status: z.string().optional().default("pending"),
  paymentStatus: z.string().optional().default("pending"),
});

export const insertTourBookingSchema = createInsertSchema(tourBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  referenceNumber: z.string().optional().nullable(),
  tourDate: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val),
  totalPrice: z.union([z.string(), z.number()]).transform(val => String(val)),
  specialRequests: z.string().optional().nullable(),
  children: z.number().optional().nullable().default(0),
  paymentIntentId: z.string().optional().nullable(),
  status: z.string().optional().default("pending"),
  paymentStatus: z.string().optional().default("pending"),
});

export const insertHomePageContentSchema = createInsertSchema(homePageContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVehicleSeasonalPriceSchema = createInsertSchema(vehicleSeasonalPrices).omit({
  id: true,
  createdAt: true,
});

export const insertVehicleHourlyPriceSchema = createInsertSchema(vehicleHourlyPrices).omit({
  id: true,
  createdAt: true,
});

export const insertDisposalBookingSchema = createInsertSchema(disposalBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  pickupDate: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val),
  totalPrice: z.union([z.string(), z.number()]).transform(val => String(val)),
  specialRequests: z.string().optional().nullable(),
  paymentIntentId: z.string().optional().nullable(),
  status: z.string().optional().default("pending"),
  paymentStatus: z.string().optional().default("pending"),
});

export const insertPaymentIntentSchema = createInsertSchema(paymentIntents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  bookingType: z.enum(["transfer", "disposal", "tour"]),
  status: z.enum(["pending", "completed", "failed", "expired"]).default("pending"),
});

export const insertContactInfoSchema = createInsertSchema(contactInfo).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSocialMediaLinkSchema = createInsertSchema(socialMediaLinks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  platform: z.enum(["facebook", "twitter", "instagram", "linkedin"]),
});

// Admin Views - Track when admin last viewed each section (for notification badges)
export const adminViews = pgTable("admin_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  section: text("section").notNull(), // "providers", "vehicles", "transfers", "tours"
  lastViewedAt: timestamp("last_viewed_at").notNull().defaultNow(),
});

export const insertAdminViewSchema = createInsertSchema(adminViews).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;

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

export type HomePageContent = typeof homePageContent.$inferSelect;
export type InsertHomePageContent = z.infer<typeof insertHomePageContentSchema>;

export type VehicleSeasonalPrice = typeof vehicleSeasonalPrices.$inferSelect;
export type InsertVehicleSeasonalPrice = z.infer<typeof insertVehicleSeasonalPriceSchema>;

export type VehicleHourlyPrice = typeof vehicleHourlyPrices.$inferSelect;
export type InsertVehicleHourlyPrice = z.infer<typeof insertVehicleHourlyPriceSchema>;

export type DisposalBooking = typeof disposalBookings.$inferSelect;
export type InsertDisposalBooking = z.infer<typeof insertDisposalBookingSchema>;

export type PaymentIntent = typeof paymentIntents.$inferSelect;
export type InsertPaymentIntent = z.infer<typeof insertPaymentIntentSchema>;

export type ContactInfo = typeof contactInfo.$inferSelect;
export type InsertContactInfo = z.infer<typeof insertContactInfoSchema>;

export type SocialMediaLink = typeof socialMediaLinks.$inferSelect;
export type InsertSocialMediaLink = z.infer<typeof insertSocialMediaLinkSchema>;

export type AdminView = typeof adminViews.$inferSelect;
export type InsertAdminView = z.infer<typeof insertAdminViewSchema>;
