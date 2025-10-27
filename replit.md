# Overview

NavetteClub is a premium transportation platform offering high-end transfer services and city tour experiences. The application is built as a modern React single-page application with a Node.js Express backend, featuring a sophisticated booking interface for transfers and guided city tours. The platform emphasizes trust, reliability, and premium service delivery with a design inspired by successful transportation apps like Uber and Bolt.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application uses a modern React 18 setup with TypeScript and Vite for development and building. The frontend architecture follows a component-based approach with:

- **React Router**: Uses Wouter for client-side routing with a simple switch-based navigation system
- **UI Component Library**: Built on Radix UI primitives with shadcn/ui components for consistent design
- **State Management**: React Query (TanStack Query) for server state management with custom query client configuration
- **Styling**: Tailwind CSS with a comprehensive design system implementing light/dark theme support
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

## Backend Architecture
The backend is built with Express.js following a minimalist API-first approach:

- **Server Framework**: Express.js with TypeScript for type safety
- **Database Integration**: Drizzle ORM configured for PostgreSQL with full production database support
- **Storage Layer**: Abstracted storage interface with PostgreSQL implementation for production use
- **Object Storage**: Replit Object Storage integration for photo uploads via Google Cloud Storage
  - ObjectStorageService for managing file uploads and downloads
  - ObjectAcl for access control policies (public/private visibility)
  - Direct-to-storage uploads using presigned URLs
- **API Routes**: Complete RESTful API endpoints for providers, vehicles, city tours, bookings, homepage content, and file uploads
  - GET /api/providers, POST /api/providers, PATCH /api/providers/:id, DELETE /api/providers/:id
  - GET /api/vehicles, POST /api/vehicles, PATCH /api/vehicles/:id, DELETE /api/vehicles/:id
    - Supports `?available=true` query parameter to filter available vehicles
  - Vehicle Seasonal Prices: GET/POST /api/vehicles/:vehicleId/seasonal-prices, PATCH/DELETE /api/vehicles/seasonal-prices/:id
  - Vehicle Hourly Prices: GET/POST /api/vehicles/:vehicleId/hourly-prices, PATCH/DELETE /api/vehicles/hourly-prices/:id
  - GET /api/tours, GET /api/tours/:id, POST /api/tours, PATCH /api/tours/:id, DELETE /api/tours/:id
    - Supports `?active=true`, `?featured=true`, `?featured=false` query parameters
    - Can combine filters: `?active=true&featured=true` for featured active tours
  - GET /api/bookings, POST /api/bookings
  - GET /api/homepage-content, GET /api/homepage-content/:id, POST /api/homepage-content, PATCH /api/homepage-content/:id, DELETE /api/homepage-content/:id
  - POST /api/objects/upload (get presigned URL for file upload)
  - GET /objects/:objectPath (serve uploaded files)
  - GET /public-objects/:filePath (serve public assets)
- **Validation**: All request bodies validated using Zod schemas before database operations
- **Development Setup**: Vite middleware integration for seamless development experience

All API routes include proper error handling with try/catch blocks and return appropriate HTTP status codes (200/201 for success, 500 for errors).

## Component Structure
The application is organized into well-defined functional components:

- **Layout Components**: Header with navigation, Hero section with dynamic banner from database, Footer with company information
- **Feature Components**: Transfer booking form, City tours showcase, Vehicle types display
- **Admin Components**: Complete admin interface with tabs for managing providers, vehicles, city tours, and homepage content
  - ProvidersManagement: Manage transport providers
  - VehiclesManagement: Manage vehicle fleet with photo upload (supports 8 vehicle types: economy, comfort, business, premium, vip, suv, van, minibus)
  - ToursManagement: Manage city tours with full itinerary support and photo upload
  - HomePageManagement: Manage homepage hero banner image and service badges (fully persisted to database)
- **Page Components**: Home page, Admin page, Tour detail page with booking forms
- **UI Components**: Comprehensive shadcn/ui component library with custom theming
- **Utility Components**: Theme toggle, notification center, mobile responsiveness hooks, ObjectUploader for file uploads

All public-facing components are connected to real backend APIs via React Query, with proper loading states and empty state handling:
- **Hero**: Loads banner image from database (`homepage_content` table with `type='hero_image'`)
- **TransferBooking**: Loads available vehicles from `/api/vehicles?available=true` with photos and specifications
- **VehicleTypes**: Displays all vehicle types from database with dynamic data
- **CityTours**: Loads non-featured tours from `/api/tours?active=true&featured=false` (City Tours Exclusifs)
- **TunisiaHighlights**: Loads featured tours from `/api/tours?featured=true&active=true` (Circuits Incontournables de Tunisie)

No hardcoded data is used in public-facing components - all content is dynamically loaded from the database.

## Design System
The application implements a sophisticated design system with:

- **Color Palette**: Professional blue-based color scheme with teal accents for trust and reliability
- **Typography**: Inter and Poppins fonts with defined hierarchy for readability
- **Component Variants**: Consistent button, card, and form element styling across light/dark themes
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

## Database Schema
The application implements a comprehensive PostgreSQL schema with the following tables:

- **Providers Table**: Transport providers (rental companies, travel agencies) with contact information and location data
- **Vehicles Table**: Vehicle fleet with capacity, luggage space, pricing (base price and per-km), features, and availability status
  - **Vehicle Types**: Supports 8 standardized types with Zod validation: economy, comfort, business, premium, vip, suv, van, minibus
  - Default type is "economy" for new vehicles
  - French labels displayed in UI: Économie, Confort, Business, Premium, VIP, SUV, Van, Minibus
  - **Vehicle Fields**: Separated `brand` and `model` fields (both NOT NULL), plus `licensePlate` and `driver` fields for management
  - **Name Auto-generation**: The `name` field is auto-generated in backend as `${brand} ${model}` for backward compatibility
- **Vehicle Seasonal Prices Table**: Seasonal pricing periods for vehicles with date ranges and adjusted rates (per-kilometer pricing for transfers)
  - **Structure**: vehicleId (foreign key with CASCADE delete), seasonName, startDate (MM-DD format), endDate (MM-DD format), basePrice, pricePerKm
  - **CRUD Operations**: Full create/read/update/delete support via API endpoints
  - **UI Integration**: Seasonal prices managed in VehiclesManagement admin interface with add/edit/delete functionality
  - **Delete Persistence**: Frontend tracks original price IDs and issues DELETE requests for removed prices to ensure database integrity
  - **API Routes**: GET/POST /api/vehicles/:vehicleId/seasonal-prices, PATCH/DELETE /api/vehicles/seasonal-prices/:id
- **Vehicle Hourly Prices Table**: Seasonal hourly pricing for vehicle rentals (mise à disposition)
  - **Structure**: vehicleId (foreign key with CASCADE delete), seasonName, startDate (MM-DD format), endDate (MM-DD format), pricePerHour (decimal), minimumHours (integer, default 4)
  - **Purpose**: Dedicated pricing system for hourly vehicle rentals (mise à disposition) separate from per-kilometer transfers
  - **CRUD Operations**: Full create/read/update/delete support via API endpoints
  - **UI Integration**: Hourly prices managed in separate section of VehiclesManagement admin interface
  - **Data Validation**: Robust conversion of numeric fields (parseFloat/parseInt with fallback defaults) to prevent validation errors
  - **Delete Persistence**: Frontend tracks original price IDs and issues DELETE requests for removed prices
  - **API Routes**: GET/POST /api/vehicles/:vehicleId/hourly-prices, PATCH/DELETE /api/vehicles/hourly-prices/:id
- **City Tours Table**: City tour programs with detailed descriptions, itineraries, pricing, duration, capacity, and booking constraints
  - **Category Labels**: French labels for tour categories (Culturel, Gastronomique, Aventure, Historique, Nature)
  - **Difficulty Badges**: Color-coded difficulty levels (Facile/green, Modéré/yellow, Difficile/red)
  - **Highlights Field**: Text array (`text[]`) storing key selling points of each tour, managed via textarea in admin interface (one per line)
  - **Featured Field**: Boolean flag to distinguish between "City Tours Exclusifs" (`featured=false`) and "Circuits Incontournables de Tunisie" (`featured=true`)
- **Tour Stops Table**: Individual stops for each tour with order, description, and duration
- **Home Page Content Table**: Homepage content management (type, title, description, icon, imageUrl, order, isActive)
  - Supports two content types: hero_image (for hero banner) and service_badge (for homepage service badges)
  - Hero banner image is dynamically loaded from database in Hero component
  - Service badges can be managed through admin interface with full CRUD operations
- **Bookings Table**: Customer bookings with contact details, service type (transfer/tour), pricing, and status tracking
- **Schema Generation**: Drizzle-zod integration for type-safe schema definitions with automatic insert/select type generation
- **Migration System**: Drizzle Kit for database schema migrations and management

All numeric form fields in the admin interface properly convert string inputs to numbers before database insertion to ensure type safety.

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database driver for Neon integration
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect support
- **@tanstack/react-query**: Server state management for data fetching and caching

## File Upload and Storage
- **@google-cloud/storage**: Google Cloud Storage client for object storage operations
- **@uppy/core**: Core upload functionality with file validation and progress tracking
- **@uppy/react**: React components for Uppy integration (DashboardModal)
- **@uppy/aws-s3**: S3-compatible upload plugin for direct-to-storage uploads via presigned URLs
- **@uppy/dashboard**: Interactive upload modal with file preview and management

## UI and Styling
- **@radix-ui/**: Complete suite of accessible React primitives for UI components
- **tailwindcss**: Utility-first CSS framework with custom configuration
- **class-variance-authority**: Component variant management for consistent styling
- **lucide-react**: Modern icon library for consistent iconography

## Development Tools
- **vite**: Fast build tool with hot module replacement for development
- **typescript**: Type safety across the entire application
- **@replit/**: Replit-specific plugins for development environment integration

## Communication Services
- **@sendgrid/mail**: Email service integration for transactional communications

## Form and Validation
- **react-hook-form**: Performance-focused form library
- **@hookform/resolvers**: Resolver integration for schema validation
- **zod**: Runtime type validation for forms and API responses

The architecture prioritizes developer experience with TypeScript throughout, maintains separation of concerns with clear abstraction layers, implements a scalable component structure that can accommodate future feature expansion, and uses Replit Object Storage for secure and efficient file uploads.

# Security Considerations

**Authentication Status**: The application currently does not implement user authentication. All API routes, including admin operations (create/modify/delete providers, vehicles, tours) and file upload endpoints, are currently unprotected. This is acceptable for development but must be addressed before production deployment.

**Future Security Requirements**:
- Implement user authentication system using the existing `users` table schema
- Add authentication middleware to protect admin routes
- Implement session management
- Add role-based access control for admin operations
- Secure file upload endpoints with authentication checks