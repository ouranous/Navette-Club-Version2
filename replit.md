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
- **Database Integration**: Drizzle ORM configured for PostgreSQL with migrations support
- **Storage Layer**: Abstracted storage interface with in-memory implementation for development
- **Development Setup**: Vite middleware integration for seamless development experience

## Component Structure
The application is organized into well-defined functional components:

- **Layout Components**: Header with navigation, Hero section, Footer with company information
- **Feature Components**: Transfer booking form, City tours showcase, Vehicle types display
- **UI Components**: Comprehensive shadcn/ui component library with custom theming
- **Utility Components**: Theme toggle, notification center, mobile responsiveness hooks

## Design System
The application implements a sophisticated design system with:

- **Color Palette**: Professional blue-based color scheme with teal accents for trust and reliability
- **Typography**: Inter and Poppins fonts with defined hierarchy for readability
- **Component Variants**: Consistent button, card, and form element styling across light/dark themes
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

## Database Schema
Currently implements a basic user management schema with:

- **Users Table**: Basic user authentication structure with username/password fields
- **Schema Generation**: Drizzle-zod integration for type-safe schema definitions
- **Migration System**: Drizzle Kit for database schema migrations and management

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database driver for Neon integration
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect support
- **@tanstack/react-query**: Server state management for data fetching and caching

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

The architecture prioritizes developer experience with TypeScript throughout, maintains separation of concerns with clear abstraction layers, and implements a scalable component structure that can accommodate future feature expansion.