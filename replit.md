# Overview
NavetteClub is a premium transportation platform offering high-end transfer services and city tour experiences. It features a sophisticated booking interface for transfers and guided city tours, aiming to provide a reliable and premium service. The platform includes a geographic zone-based vehicle filtering system for transfers, a redesigned 2-column UI for vehicle selection, and an initial automatic transfer pricing and booking flow.

# User Preferences
Preferred communication style: Simple, everyday language.

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