# NavetteClub Design Guidelines

## Design Approach
**Reference-Based Approach** - Drawing inspiration from modern transportation platforms like Uber, Bolt, and Airbnb for their clean, trust-building interfaces that balance functionality with visual appeal.

## Core Design Elements

### A. Color Palette
**Primary Colors:**
- Light Mode: 220 85% 25% (Deep Blue - trust and reliability)
- Dark Mode: 220 45% 85% (Light Blue - maintains brand consistency)

**Secondary Colors:**
- Light Mode: 200 100% 95% (Very Light Blue - backgrounds)
- Dark Mode: 220 25% 15% (Dark Blue Grey - backgrounds)

**Accent Color:**
- Both modes: 145 65% 50% (Modern Teal - call-to-action buttons, success states)

**Neutral Grays:**
- Light Mode: 220 15% 25% (text), 220 10% 95% (subtle backgrounds)
- Dark Mode: 220 15% 85% (text), 220 10% 20% (subtle backgrounds)

### B. Typography
**Primary Font:** Inter (Google Fonts) - Clean, modern, excellent readability
**Secondary Font:** Poppins (Google Fonts) - For headings and emphasis

**Hierarchy:**
- Hero Headlines: Poppins 48px/56px Bold
- Section Headers: Poppins 32px/40px SemiBold
- Body Text: Inter 16px/24px Regular
- Small Text: Inter 14px/20px Regular

### C. Layout System
**Spacing Units:** Consistent use of 4, 8, 16, 24, 32, 48px (Tailwind: p-1, p-2, p-4, p-6, p-8, p-12)
**Grid:** 12-column responsive grid with 24px gutters
**Containers:** Max-width 1200px with responsive padding

### D. Component Library

**Navigation:**
- Fixed header with transparent background over hero
- Mobile-first hamburger menu
- Prominent CTA buttons in header

**City Tour Section:**
- Card-based layout for tour packages
- Image overlays with gradient masks
- Duration, price, and difficulty badges
- Interactive map integration placeholder

**Booking Interface:**
- Multi-step wizard design
- Progress indicators
- Floating action buttons for mobile
- Vehicle selection with visual cards

**Notifications:**
- Toast notifications (top-right positioning)
- Badge indicators on navigation items
- In-app notification center
- Push notification permission prompts

### E. Visual Enhancements

**Cards & Containers:**
- Subtle drop shadows (0 4px 16px rgba(0,0,0,0.1))
- 8px border radius for consistency
- Hover states with gentle scale (1.02) and shadow increase

**Buttons:**
- Primary: Accent color with white text
- Secondary: Outline with primary color
- On images: Blurred background (backdrop-blur-sm)

**Interactive Elements:**
- Smooth transitions (300ms ease-in-out)
- Focus states with accent color outline
- Loading states with skeleton components

## Images
**Hero Image:** Large, high-quality image of a luxury transfer vehicle in an urban setting (airport/city backdrop) - spans full viewport height on desktop
**City Tour Images:** Medium-sized images for each tour package showing iconic local landmarks
**Vehicle Images:** Clean product shots against neutral backgrounds for each vehicle category
**Trust Badges:** Small icons representing security, guarantees, and certifications

## Modern UI Principles
- **Minimalist Design:** Clean layouts with purposeful whitespace
- **Mobile-First:** Touch-friendly interactions, optimized thumb zones
- **Progressive Disclosure:** Essential information first, details on demand
- **Consistent Iconography:** Heroicons for interface elements
- **Accessibility:** High contrast ratios, keyboard navigation support

This design system creates a trustworthy, professional platform that communicates reliability while maintaining modern visual appeal across all device types.