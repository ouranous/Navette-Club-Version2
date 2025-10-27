# Overview

NavetteClub is a premium transportation platform offering high-end transfer services and city tour experiences. It features a sophisticated booking interface for transfers and guided city tours, aiming to provide a reliable and premium service.

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
- **Providers**: Transport providers.
- **Vehicles**: Fleet management with capacity, features, and availability, supporting 8 types. Includes `Vehicle Seasonal Prices` and `Vehicle Hourly Prices` tables for flexible pricing.
- **City Tours**: Detailed tour programs with descriptions, itineraries, pricing, categories, difficulty levels, and a `Highlights` field for key selling points.
- **Home Page Content**: Manages hero banner images and service badges.
- **Transfer Bookings**: Point-to-point transfers with customer, vehicle, locations, pricing, and payment intent linkage.
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