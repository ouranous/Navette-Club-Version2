# Overview

NavetteClub is a premium transportation platform offering high-end transfer services and city tour experiences. It features a sophisticated booking interface for transfers and guided city tours, aiming to provide a reliable and premium service.

# Recent Changes

## October 29, 2025 - Geographic Zone-Based Vehicle Filtering System

### Completed Features
- **Geographic Zones Service** (`server/geographicZones.ts`)
  - Comprehensive mapping of Tunisian cities/regions to 7 geographic zones:
    - Tunis et Nord (Tunis, Carthage, Bizerte, Nabeul, Hammamet)
    - Sousse et Sahel (Sousse, Port El Kantaoui, Enfidha)
    - Monastir et Mahdia
    - Sfax
    - Kairouan
    - Djerba et Sud (Djerba, Zarzis, Gabès, Médenine, Tataouine)
    - Tozeur et Désert (Tozeur, Nefta, Douz, Kebili, Gafsa)
  - Smart zone detection from Google Places addresses
  - Provider relevance scoring: 2 points if serves both origin/destination, 1 point if serves one

- **Database Schema Updates**
  - `providers.serviceZones`: Array of geographic zones each provider serves
  - `transferBookings.flightNumber`: Optional flight number for airport transfers
  - `transferBookings.nameOnPlacard`: Optional name to display on driver's placard

- **Admin Interface Enhancement** (`client/src/components/admin/ProvidersManagement.tsx`)
  - Multi-select dropdown for configuring provider service zones
  - Visual display of selected zones with badges
  - Intuitive zone management in provider creation/editing

- **Booking Form Enhancement** (`client/src/pages/TransferConfirmPage.tsx`)
  - "Numéro de Vol" (Flight Number) field - optional
  - "Nom sur la Pancarte" (Name on Placard) field - optional
  - Helpful placeholders for airport transfer scenarios

- **Smart Vehicle Filtering API** (`GET /api/pricing/auto-transfer`)
  - Automatically detects geographic zones from origin/destination addresses
  - Filters vehicles based on provider service zones
  - Scores and ranks providers: best match (serves both zones) first
  - Then sorts by price within relevance groups
  - Example: Djerba Airport → Tozeur shows Djerba/Desert zone providers first
  - Providers without zone restrictions serve all routes (default behavior)
  - Returns zone information in response for transparency

### Technical Implementation
- **Files Created**:
  - `server/geographicZones.ts`: Zone mapping, detection, filtering logic

- **Files Modified**:
  - `shared/schema.ts`: Added serviceZones to providers, flightNumber/nameOnPlacard to transferBookings
  - `server/routes.ts`: Enhanced `/api/pricing/auto-transfer` with zone filtering
  - `client/src/components/admin/ProvidersManagement.tsx`: Zone management UI
  - `client/src/pages/TransferConfirmPage.tsx`: Added flight/placard fields

### Business Logic
- **Provider Relevance Scoring**:
  - Score 2: Provider serves both origin AND destination zones (ideal match)
  - Score 1: Provider serves either origin OR destination zone (acceptable)
  - Score 0: Provider serves neither zone (excluded from results)
  - Providers without configured zones default to Score 1 (serve all)

- **Vehicle Sorting Priority**:
  1. Relevance score (descending) - best geographic match first
  2. Price (ascending) - cheapest within each relevance tier

- **Example Scenarios**:
  - Tunis Airport → Hammamet: Shows "Tunis et Nord" providers
  - Djerba → Tozeur: Shows "Djerba et Sud" + "Tozeur et Désert" providers, prioritizing those serving both
  - Enfidha → Sousse: Shows "Sousse et Sahel" providers
  - Monastir → Kairouan: Shows "Monastir et Mahdia" + "Kairouan" providers

### Architectural Decisions
- **Normalized Address Matching**: Accent-insensitive, case-insensitive zone detection
- **Keyword-Based Fallback**: Multi-layered detection strategy (city names → keywords → airport patterns)
- **Graceful Degradation**: Unknown zones don't break functionality; provider shows if no zone restrictions
- **Server-Side Only**: Zone logic stays on backend for consistency and easy updates

---

## October 29, 2025 - UI Redesign: Industry-Standard 2-Column Layout

### Completed Features
- **Industry-Standard Vehicle Selection UI** (`/book/transfer/vehicles`)
  - **2-column layout** matching Carthage Transfer and AirportTransfer.com standards:
    - **Left column** (sticky): Booking recap with origin, destination, date, passengers, distance, duration
    - **Right column**: Clean vehicle list with horizontal cards
  - **Simplified pricing display**: Only total price shown (no detailed breakdown)
  - **Professional vehicle cards**: Image, brand/model, capacity, luggage, and total price in TND
  - **Round-trip pricing**: Automatically doubles price for aller-retour bookings
  - **Responsive design**: Collapses to single column on mobile devices

- **Unified Homepage Booking Form** (`client/src/components/TransferBooking.tsx`)
  - Direct navigation to `/book/transfer/vehicles` from homepage
  - Full form validation before navigation
  - Consistent UX between homepage and dedicated booking page
  - Passes all search criteria via URL query parameters

### Technical Implementation
- **Files Modified**:
  - `client/src/pages/TransferVehiclesPage.tsx`: Complete UI redesign with 2-column grid layout
  - `client/src/components/TransferBooking.tsx`: Made functional with navigation and validation
  
### UI Design Decisions
- **Sticky recap card** (z-index: 50): Always visible while scrolling vehicle list
- **Simple pricing**: "À partir de XXX.XX TND" format (no "base + per km" breakdown shown)
- **Clean vehicle cards**: Horizontal layout with image left, info center, price/button right
- **Professional spacing**: Proper padding and gaps throughout for premium feel

### Testing
- **End-to-End Playwright Test**: Full booking flow validated
  - Homepage form → Vehicle selection → Confirmation
  - 2-column layout verified on desktop
  - Simple pricing display confirmed
  - All navigation flows working correctly

---

## October 29, 2025 - Automatic Transfer Pricing & Booking Flow (Initial Implementation)

### Completed Features
- **Google Maps Distance Matrix API Integration** (`server/googleMaps.ts`)
  - Automatic distance and duration calculation between two addresses
  - Fallback mode (50km/45min) when API unavailable for seamless testing
  - Full error handling and logging

- **Auto-Transfer Pricing API** (`GET /api/pricing/auto-transfer`)
  - Calculates distance via Google Maps
  - Returns all suitable vehicles with computed prices
  - Filters vehicles by passenger capacity
  - Formula: `Price = basePrice + (pricePerKm × distance)`
  - Sorts results by price (lowest first)
  - Graceful fallback when Google Maps unavailable

- **3-Step Transfer Booking Flow**
  - **Step 1**: Homepage or `/book/transfer` search form
  - **Step 2** (`/book/transfer/vehicles`): Vehicle selection with 2-column layout
  - **Step 3** (`/book/transfer/confirm`): Customer details and payment

### Technical Implementation
- **Files Created**:
  - `server/googleMaps.ts`: Google Maps API service
  - `client/src/pages/TransferSearchPage.tsx`: Search form (Step 1)
  - `client/src/pages/TransferVehiclesPage.tsx`: Vehicle selection (Step 2)
  - `client/src/pages/TransferConfirmPage.tsx`: Confirmation (Step 3)

- **Files Modified**:
  - `server/routes.ts`: Added `/api/pricing/auto-transfer` route with fallback
  - `client/src/App.tsx`: Registered 3 new routes
  - `client/src/components/Header.tsx`: Added "Réserver un Transfer" link

### Architectural Decisions
- **Custom queryFn**: TransferVehiclesPage uses explicit queryFn to pass URL params
- **Fallback Strategy**: System continues working even if Google Maps API fails (uses 50km default)
- **Price Calculation**: Server-side only for security and consistency
- **State Management**: URL query params pass data between booking steps
- **Vehicle Type Enums**: Consistent lowercase backend with French UI labels

### Testing
- **End-to-End Test**: Full 3-step booking flow validated with Playwright
  - Search form → Vehicle selection → Customer details
  - Tested with Google Maps fallback mode
  - Confirmed graceful error handling
  - All interactive elements verified with data-testid attributes

### Next Steps
- Implement KONNECT payment integration (replace placeholder)
- Create actual reservation in database
- SendGrid email confirmation
- Admin interface for basePrice/pricePerKm configuration

## October 27, 2025 - Phase 3 Public UI Progress

### Completed Features
- **Vehicle Catalog Page** (`/vehicles`): Full catalog with type filtering
- **Vehicle Detail Page** (`/vehicles/:id`): Comprehensive information with pricing calculators

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend
The frontend is a React 18 single-page application built with TypeScript and Vite. It uses:
- **Wouter**: For client-side routing.
- **Radix UI & shadcn/ui**: For a consistent UI component library.
- **React Query**: For server state management.
- **Tailwind CSS**: For styling with a comprehensive design system supporting light/dark themes.
- **React Hook Form with Zod**: For type-safe form handling and validation.
- **Replit Auth**: User authentication with Google, GitHub, X, Apple, and email/password via `useAuth` hook.

## Backend
The backend is an Express.js application with TypeScript, designed with an API-first approach. It features:
- **Express.js**: As the server framework.
- **Drizzle ORM**: For PostgreSQL database integration.
- **Replit Auth**: OpenID Connect authentication with session management, user upsert, and protected routes via `isAuthenticated` middleware.
- **Replit Object Storage (via Google Cloud Storage)**: For photo uploads, including presigned URLs and path normalization.
- **RESTful API**: Endpoints for managing providers, vehicles, city tours, bookings, and homepage content.
- **Zod**: For request body validation.

## Component Structure
The application is organized into layout, feature, admin, page, and UI components. Key administrative features include:
- **Admin Interface**: Tabs for managing providers, vehicles (with 8 types and seasonal/hourly pricing), city tours (modern 3-step creation with live preview, visual selectors, highlight composer), and homepage content.
- **ObjectUploader**: Uppy-based file upload with visual feedback, supporting specific image formats and dimensions.
- All public-facing components dynamically load data from the backend using React Query.

## Design System
A professional design system is implemented with:
- **Color Palette**: Blue-based scheme with teal accents.
- **Typography**: Inter and Poppins fonts.
- **Responsive Design**: Mobile-first approach with Tailwind CSS.

## Database Schema
A PostgreSQL schema includes tables for:
- **Users**: Replit Auth integration with id, email, firstName, lastName, profileImageUrl, role (user/admin). OAuth login via OpenID Connect.
- **Sessions**: Passport session storage for authenticated users.
- **Providers**: Transport providers with `serviceZones` array field for geographic zone filtering.
- **Vehicles**: Fleet management with capacity, features, and availability, supporting 8 types. Includes `Vehicle Seasonal Prices` and `Vehicle Hourly Prices` tables for flexible pricing.
- **City Tours**: Detailed tour programs with descriptions, itineraries, pricing, categories, difficulty levels, and a `Highlights` field for key selling points.
- **Home Page Content**: Manages hero banner images and service badges.
- **Transfer Bookings**: Point-to-point transfers with customer, vehicle, locations, pricing, payment intent linkage, `flightNumber`, and `nameOnPlacard` fields.
- **Disposal Bookings**: Hourly vehicle rentals (mise à disposition) with duration-based pricing.
- **Tour Bookings**: City tour reservations with participants and payment tracking.
- **Payment Intents**: KONNECT payment tracking with booking linkage, status, and metadata.
- **Customers**: Customer information for bookings.
- **Drizzle-zod**: For type-safe schema definitions and migrations via Drizzle Kit.

# External Dependencies

## Core Framework
- **@neondatabase/serverless**: PostgreSQL driver for Neon.
- **drizzle-orm**: Type-safe ORM.
- **@tanstack/react-query**: Server state management.

## File Upload
- **@google-cloud/storage**: Google Cloud Storage client.
- **@uppy/core**, **@uppy/react**, **@uppy/aws-s3**, **@uppy/dashboard**: Uppy for file uploads.

## UI & Styling
- **@radix-ui/**: Accessible React primitives.
- **tailwindcss**: Utility-first CSS framework.
- **class-variance-authority**: Component variant management.
- **lucide-react**: Icon library.

## Development Tools
- **vite**: Build tool.
- **typescript**: Type safety.
- **@replit/**: Replit-specific plugins.

## Communication
- **@sendgrid/mail**: Email service.

## Form & Validation
- **react-hook-form**: Form library.
- **@hookform/resolvers**: Schema validation resolver.
- **zod**: Runtime type validation.