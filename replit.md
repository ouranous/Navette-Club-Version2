# Overview
NavetteClub is a premium transportation platform offering high-end transfer services and city tour experiences. It features a sophisticated booking interface for transfers and guided city tours. The platform includes a geographic zone-based vehicle filtering system, a redesigned 2-column UI for vehicle selection, automatic transfer pricing and booking flow, and comprehensive, admin-editable website pages. The business vision is to provide a reliable and premium service in the transportation sector.

# User Preferences
Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend
The frontend is a React 18 single-page application built with TypeScript and Vite. It uses Wouter for routing, Radix UI & shadcn/ui for components, React Query for server state management, and Tailwind CSS for responsive styling. Form handling is managed with React Hook Form and Zod for validation. Replit Auth provides user authentication.

## Backend
The backend is an Express.js application with TypeScript, using an API-first approach. It integrates Drizzle ORM for PostgreSQL and Replit Auth for OpenID Connect authentication and session management. Replit Object Storage (via Google Cloud Storage) handles photo uploads. RESTful APIs manage providers, vehicles, city tours, bookings, and homepage content, with Zod for validation.

## Core Features & Design Decisions
-   **Admin Interface**: Provides comprehensive management for providers (including geographic service zones), vehicles (8 types, seasonal/hourly pricing, homepage visibility control), city tours (3-step creation, live preview, visual selectors, duration management), and dynamic content for professional website pages (About, Contact, FAQ, Help, Terms, Privacy, Cancellation).
-   **Geographic Zone-Based Vehicle Filtering**: Maps Tunisian cities/regions to 7 zones. Automatically detects zones, filters vehicles by provider service zones, and scores/ranks providers by relevance (serving both origin/destination zones), then by price.
-   **Vehicle Type Selection Flow**: Users can select a vehicle type from the homepage, which pre-fills the booking form and filters available vehicles throughout the booking process. Internal vehicle types use standardized slugs (economy, comfort, business, premium, vip, suv, van, minibus) with localized labels for display.
-   **UI/UX**: Features an industry-standard 2-column layout for vehicle selection with a sticky booking recap and horizontal vehicle cards. Includes a professional design system with a blue-based color palette and Inter/Poppins fonts, ensuring responsive design across devices. Google Places autocomplete is integrated for origin and destination fields in transfer booking.
-   **Automatic Transfer Pricing**: Integrates Google Maps Distance Matrix API for automatic distance/duration calculation. Pricing is calculated as (`basePrice + pricePerKm × distance`). Vehicles are filtered by capacity and sorted by price, with a fallback mechanism for Google Maps.
-   **Booking Flow**: A 3-step process: search form (with optional vehicle type pre-selection), vehicle selection (filtered by type if selected), and customer details/payment.
-   **City Tours Page**: A dedicated page with interactive category and difficulty filters, an embedded Google Map showing tour locations, and professional tour cards.
-   **Dynamic Content Management**: Website pages like Contact, About, FAQ, etc., and the site's footer content (contact info, social media links) are dynamically managed via the admin panel, with changes reflecting in real-time.
-   **Database Schema**: PostgreSQL schema includes tables for Users, Sessions, Providers, Vehicles (with Seasonal/Hourly Prices), City Tours, Home Page Content, Transfer Bookings, Disposal Bookings, Tour Bookings, Payment Intents, and Customers. Drizzle-zod ensures type-safe schema definitions.

# External Dependencies

## Core Framework & Data
-   `@neondatabase/serverless`
-   `drizzle-orm`
-   `@tanstack/react-query`

## File Upload
-   `@google-cloud/storage`
-   `@uppy/core`, `@uppy/react`, `@uppy/aws-s3`, `@uppy/dashboard`

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