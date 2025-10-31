# Overview
NavetteClub is a premium transportation platform offering high-end transfer services and city tour experiences. It features a sophisticated booking interface for transfers and guided city tours. The platform includes a geographic zone-based vehicle filtering system, a redesigned 2-column UI for vehicle selection, automatic transfer pricing and booking flow, comprehensive admin-editable website pages, Konnect payment integration (Tunisia's payment gateway), and SendGrid email automation. The platform is deployable on both Replit and external hosting (Plesk/VPS). The business vision is to provide a reliable and premium service in the transportation sector.

# Recent Changes (Oct 31, 2025)
- **CRITICAL FIX - Admin Auth on Plesk**: `requireAdminPassword` middleware now properly recognizes admin users logged in via email/password (not just old password-only system). Admin can now use `/login` with admin@navetteclub.tn OR `/admin-login` with ADMIN_PASSWORD
- **Error Messages Improvement**: Homepage banner update errors now display specific backend messages (auth errors, validation errors) instead of generic "Impossible de mettre à jour la bannière"
- **Mobile UI Optimization**: Login/Register buttons always visible on mobile (compact text < 640px), reorganized hamburger menu, optimized header spacing
- **Vehicle Image Management**: Added `imageUrl` text input field to provider vehicle form, allowing transporters to enter external image URLs (Cloudinary, ImageKit, etc.) since Object Storage is not available on Plesk
- **TypeScript Fixes**: Resolved 6 LSP errors in ToursManagement.tsx related to null value handling in form fields

# User Preferences
Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend
The frontend is a React 18 single-page application built with TypeScript and Vite. It uses Wouter for routing, Radix UI & shadcn/ui for components, React Query for server state management, and Tailwind CSS for responsive styling. Form handling is managed with React Hook Form and Zod for validation. Replit Auth provides user authentication.

## Backend
The backend is an Express.js application with TypeScript, using an API-first approach. It integrates Drizzle ORM for PostgreSQL with dual authentication systems: Replit Auth (OpenID Connect) on Replit, and password-based admin authentication for external hosting (Plesk/VPS). Photo uploads use Replit Object Storage on Replit (disabled on external hosting - use external image URLs instead). RESTful APIs manage providers, vehicles, city tours, bookings, homepage content, and payments, with Zod for validation.

## Core Features & Design Decisions
-   **Admin Interface**: Provides comprehensive management for providers (including geographic service zones), vehicles (8 types, seasonal/hourly pricing, homepage visibility control), city tours (3-step creation, live preview, visual selectors, duration management), transfer bookings (with provider reassignment capability), and dynamic content for professional website pages (About, Contact, FAQ, Help, Terms, Privacy, Cancellation).
-   **Client Interface**: Authenticated clients can view their complete booking history (transfers, city tours, disposals) through a dedicated dashboard with detailed booking cards showing status, dates, pricing, and special requests.
-   **Provider Interface**: Transporteurs have a complete workflow including:
  * Self-registration page with company details and geographic service zones
  * Dashboard with overview cards for requests, vehicles, drivers, messages, profile, and password management
  * Vehicle management page to add/edit/delete vehicles with photos and pricing
  * Request tracking page showing all assigned transfer and disposal bookings with status filters
-   **Authentication & Authorization**: 
  * **On Replit**: Dual authentication system supporting both Replit Auth (OpenID Connect with Google) AND email/password authentication simultaneously
    - Universal middleware (`requireAuth`, `requireAdminPassword`) supports both authentication methods
    - User ID extraction works from either `req.session.userId` (email/password) or `req.user.claims.sub` (Replit Auth)
  * **On Plesk/External Hosting**: Email/password authentication for all users (registration at `/register`, login at `/login`), password-based admin authentication (ADMIN_PASSWORD env var), Replit Auth disabled
  * **Unified Registration System:**
    - Single registration page at `/register` with user type selection (Client or Transporteur)
    - Client registration: simple form (email, password, firstName, lastName) → creates user with role="user"
    - Provider registration: complete form (account info + company details + service zones) → creates user with role="provider" + provider profile
    - User registration with email/password (minimum 8 characters)
    - Passwords hashed with bcrypt (cost=10)
    - Session-based authentication stored in PostgreSQL
    - Zod validation for email format and password strength
    - Welcome email sent upon successful registration
    - Role-based access (user, provider, admin)
  * All admin routes (POST/PATCH/DELETE for providers, vehicles, tours, content) are protected by authentication
  * Provider routes (`/api/my-provider`, `/api/my-vehicles`, `/api/my-requests`) use universal authentication
  * Public routes (GET) remain accessible for booking and browsing
-   **Payment Integration**: Konnect payment gateway for Tunisia with webhook verification, success/failure pages, and automatic booking status updates. Amounts in millimes (×1000).
-   **Geographic Zone-Based Vehicle Filtering**: Maps Tunisian cities/regions to 7 zones. Automatically detects zones, filters vehicles by provider service zones, and scores/ranks providers by relevance (serving both origin/destination zones), then by price.
-   **Vehicle Type Selection Flow**: Users can select a vehicle type from the homepage, which pre-fills the booking form and filters available vehicles throughout the booking process. Internal vehicle types use standardized slugs (economy, comfort, business, premium, vip, suv, van, minibus) with localized labels for display.
-   **UI/UX**: Features an industry-standard 2-column layout for vehicle selection with a sticky booking recap and horizontal vehicle cards. Includes a professional design system with a blue-based color palette and Inter/Poppins fonts, ensuring responsive design across devices. Google Places autocomplete is integrated for origin and destination fields in transfer booking.
-   **Automatic Transfer Pricing**: Integrates Google Maps Distance Matrix API for automatic distance/duration calculation. Pricing is calculated as (`basePrice + pricePerKm × distance`). Vehicles are filtered by capacity and sorted by price, with a fallback mechanism for Google Maps.
-   **Booking Flow**: A 3-step process: search form (with optional vehicle type pre-selection), vehicle selection (filtered by type if selected), and customer details/payment.
-   **City Tours Page**: A dedicated page with interactive category and difficulty filters, an embedded Google Map showing tour locations, and professional tour cards.
-   **Dynamic Content Management**: Website pages like Contact, About, FAQ, etc., and the site's footer content (contact info, social media links) are dynamically managed via the admin panel, with changes reflecting in real-time.
-   **Email Automation**: SendGrid integration with automated emails:
  * Welcome email on new user registration
  * Client voucher after successful payment (with booking details)
  * Provider mission order when assigned to transfer/disposal booking
-   **Database Schema**: PostgreSQL schema includes tables for Users (with roles), Sessions, Providers (linked to Users via userId), Vehicles (with Seasonal/Hourly Prices), City Tours, Home Page Content, Transfer Bookings (with providerId for admin assignment), Disposal Bookings, Tour Bookings, Payment Intents, and Customers (linked to Users via userId). Drizzle-zod ensures type-safe schema definitions.
-   **Deployment Compatibility**:
  * **Replit**: Full feature support including Replit Auth and Object Storage
  * **Plesk/External Hosting**: Password-based admin auth, object storage disabled (use external image URLs), requires app.cjs wrapper for Phusion Passenger
  * Environment detection via REPL_ID presence
  * Domain detection via REPLIT_DOMAINS (Replit) or APP_DOMAIN (external hosting)

# External Dependencies

## Core Framework & Data
-   `@neondatabase/serverless`
-   `drizzle-orm`
-   `@tanstack/react-query`

## File Upload (Replit Only)
-   `@google-cloud/storage` (requires Replit sidecar)
-   Note: Upload functionality disabled on external hosting - use external image URLs

## Payment & Communication
-   Konnect API (Tunisia payment gateway)
-   `@sendgrid/mail` (email automation)

## UI & Styling
-   `@radix-ui/*`
-   `tailwindcss`
-   `class-variance-authority`
-   `lucide-react`

## Development Tools
-   `vite`
-   `typescript`
-   `@replit/*`

## Communication
-   `@sendgrid/mail`

## Form & Validation
-   `react-hook-form`
-   `@hookform/resolvers`
-   `zod`