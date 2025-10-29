# Overview
NavetteClub is a premium transportation platform offering high-end transfer services and city tour experiences. It features a sophisticated booking interface for transfers and guided city tours, aiming to provide a reliable and premium service. The platform includes a geographic zone-based vehicle filtering system for transfers, a redesigned 2-column UI for vehicle selection, and an initial automatic transfer pricing and booking flow.

# Recent Changes

## October 29, 2025 - City Tours Dedicated Page + UI Improvements

### New City Tours Page
- **Objective**: Create a dedicated, professional page for exploring City Tours (similar to Transfer booking page)
- **Route**: `/city-tours` accessible from Header navigation
- **Design Features**:
  - Hero section with platform statistics (4.9/5 rating, 2000+ travelers, tours count)
  - Interactive category filters (Tous, Culturel, Gastronomique, Aventure, Historique, Nature)
  - Difficulty filters (Tous, Facile, Modéré, Difficile) with AND logic
  - Interactive Google Map showing tour locations with clickable markers
  - Responsive 3-column grid layout (1 col mobile, 2 tablet, 3 desktop)
  - Professional tour cards with images, badges, pricing, and details
  - CTA section for custom tour requests
- **Features**:
  - Real-time filtering by category and difficulty
  - Formatted duration display using `formatDuration()` helper
  - Clean highlights display using `parseHighlight()` helper
  - Click-through to individual tour detail pages
  - Unified Header and Footer for consistent navigation
- **Files Created**:
  - `client/src/pages/CityToursPage.tsx`: Main page component
- **Files Modified**:
  - `client/src/App.tsx`: Added route for /city-tours
  - `client/src/components/Header.tsx`: Updated navigation links to point to /city-tours

### Header & Footer Standardization
- **Objective**: Provide consistent navigation and branding across all pages
- **Logo Made Clickable**: Logo in header now redirects to homepage (/)
- **Pages Updated**:
  - `TransferSearchPage`: Added Header and Footer
  - `TransferVehiclesPage`: Added Header and Footer
  - `TransferConfirmPage`: Added Header and Footer
  - Adjusted page padding to account for fixed header (pt-24)
- **Files Modified**:
  - `client/src/components/Header.tsx`: Logo wrapped in Link component
  - `client/src/pages/TransferSearchPage.tsx`
  - `client/src/pages/TransferVehiclesPage.tsx`
  - `client/src/pages/TransferConfirmPage.tsx`

### City Tours Improvements

#### Duration Field Enhancement
- **Admin Interface**: Replaced free-text input with dropdown select for tour duration
  - Predefined options: Demi journée, 1-7 jours
  - Duration stored in hours (4h for half-day, 24h for 1 day, etc.)
  
- **Smart Duration Formatting**: Added `formatDuration()` helper function
  - Displays "Demi journée" for 4h
  - Displays "X jour(s)" for multiples of 24h
  - Displays "Xh" for other durations
  - Applied across: Admin preview, Homepage featured tours, City tours listing

#### Highlights Display Fix
- **Problem**: Highlights were displaying "sparkles:" prefix instead of clean text
- **Solution**: Added `parseHighlight()` function to extract clean text from "icon::text" format
- **Files Modified**:
  - `client/src/components/admin/ToursManagement.tsx`: Duration dropdown
  - `client/src/components/admin/TourVisualSelectors.tsx`: formatDuration() for preview
  - `client/src/components/TunisiaHighlights.tsx`: formatDuration() and parseHighlight()
  - `client/src/components/CityTours.tsx`: formatDuration() and parseHighlight()

# User Preferences
Preferred communication style: Simple, everyday language.

# Recent Fixes
- Fixed vehicle type data inconsistency: Vehicle "Berline Confort uOdo" had wrong type (economy instead of comfort)

# System Architecture

## Frontend
The frontend is a React 18 single-page application built with TypeScript and Vite. It utilizes Wouter for routing, Radix UI & shadcn/ui for components, React Query for server state management, and Tailwind CSS for styling with responsive design and theme support. Form handling is managed with React Hook Form and Zod for validation. Replit Auth provides user authentication.

## Backend
The backend is an Express.js application with TypeScript, featuring an API-first approach. It uses Drizzle ORM for PostgreSQL integration and Replit Auth for OpenID Connect authentication, session management, and protected routes. Replit Object Storage (via Google Cloud Storage) handles photo uploads. The system includes RESTful APIs for managing providers, vehicles, city tours, bookings, and homepage content, with Zod for request body validation.

## Core Features & Design Decisions
- **Admin Interface**: Comprehensive management for providers (including geographic service zones), vehicles (8 types, seasonal/hourly pricing), city tours (3-step creation, live preview, visual selectors), and homepage content.
- **Geographic Zone-Based Vehicle Filtering**: Maps Tunisian cities/regions to 7 zones. Automatically detects zones from addresses, filters vehicles based on provider service zones, and scores/ranks providers by relevance (serving both origin/destination zones). Sorting prioritizes relevance then price.
- **UI/UX**: Industry-standard 2-column layout for vehicle selection, with a sticky booking recap and horizontal vehicle cards. Simplified pricing display and responsive design. Professional design system with a blue-based color palette and Inter/Poppins fonts.
- **Automatic Transfer Pricing**: Integrates Google Maps Distance Matrix API for automatic distance/duration calculation. An API calculates prices (`basePrice + pricePerKm × distance`) and filters vehicles by capacity, sorting by price. Includes a fallback mechanism if Google Maps is unavailable.
- **Booking Flow**: A 3-step process: search form, vehicle selection, and customer details/payment.
- **Database Schema**: PostgreSQL schema includes tables for Users (Replit Auth), Sessions, Providers (with `serviceZones`), Vehicles (with `Seasonal Prices` and `Hourly Prices` tables), City Tours, Home Page Content, Transfer Bookings (with `flightNumber` and `nameOnPlacard`), Disposal Bookings, Tour Bookings, Payment Intents, and Customers. Drizzle-zod is used for type-safe schema definitions.

# External Dependencies

## Core Framework & Data
- `@neondatabase/serverless`
- `drizzle-orm`
- `@tanstack/react-query`

## File Upload
- `@google-cloud/storage`
- `@uppy/core`, `@uppy/react`, `@uppy/aws-s3`, `@uppy/dashboard`

## UI & Styling
- `@radix-ui/*`
- `tailwindcss`
- `class-variance-authority`
- `lucide-react`

## Development Tools
- `vite`
- `typescript`
- `@replit/*`

## Communication
- `@sendgrid/mail`

## Form & Validation
- `react-hook-form`
- `@hookform/resolvers`
- `zod`