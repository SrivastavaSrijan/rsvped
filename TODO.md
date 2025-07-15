# RSVPed - Project TODO List

## ✅ Completed (MVP Foundation)

- [x] Next.js 15 + React 19 setup with App Router
- [x] TypeScript configuration with import aliases (@/)
- [x] Biome setup for linting and formatting
- [x] Prisma 5 + PostgreSQL schema design
- [x] tRPC 11 + Zod setup with client/server integration
- [x] NextAuth v6 basic setup
- [x] Route groups: (public) and (admin)
- [x] Basic event listing page with tRPC queries
- [x] Event detail page with server-side rendering
- [x] RSVP functionality with server actions
- [x] RSVP confirmation page
- [x] Core data models: Organization, User, Event, RSVP, TicketTier

## 🎯 Next Sprint 1: Core Features & Authentication

### Authentication & User Management

- [ ] Complete NextAuth v6 configuration with providers (Google, GitHub)
- [ ] User profile pages and account management
- [ ] Protected routes and middleware setup
- [ ] User dashboard for viewing RSVPs

### Event Management

- [ ] Event creation form for organizers
- [ ] Event editing capabilities
- [ ] Event status management (draft, published, cancelled)
- [ ] Image upload for event featured images
- [ ] Rich text editor for event descriptions

### Database & Infrastructure

- [ ] Set up PostgreSQL database (local + production)
- [ ] Run initial Prisma migrations
- [ ] Database seeding script with sample data
- [ ] Environment variable configuration

## 🎯 Sprint 2: ShadCN UI & Design System

### Component Library Setup

- [ ] Install and configure ShadCN UI components
- [ ] Create basic design tokens (colors, typography, spacing)
- [ ] Component preview page (/app/dev/components-preview.tsx)
- [ ] Button variants (primary, secondary, ghost)
- [ ] Form components (input, textarea, select)
- [ ] Card components and layouts
- [ ] Modal/dialog components

### Lu.ma-inspired Design

- [ ] Extract design tokens from Lu.ma (or approximate)
- [ ] Update Tailwind config with Lu.ma-inspired theme
- [ ] Implement Inter font system
- [ ] Responsive design for mobile/tablet
- [ ] Dark mode support (optional)

## 🎯 Sprint 3: Advanced Features

### RSVP & Ticketing

- [ ] Ticket tier management (free/paid)
- [ ] Capacity limits and waitlist functionality
- [ ] QR code generation for tickets
- [ ] Check-in system (manual + QR scan)
- [ ] Payment integration (Stripe) for paid events

### Event Discovery & Search

- [ ] Event filtering and search
- [ ] Category/tag system
- [ ] Event recommendations
- [ ] Event location with maps integration
- [ ] Calendar integration (.ics generation)

### Organizer Dashboard

- [ ] Analytics dashboard with charts
- [ ] Attendee list management
- [ ] CSV export functionality
- [ ] Event analytics (views, RSVPs, revenue)
- [ ] Bulk actions for attendees

## 🎯 Sprint 4: Notifications & Integrations

### Email System

- [ ] Email templates for confirmations
- [ ] Reminder emails (1 day before event)
- [ ] Organizer notifications
- [ ] Email service integration (Resend/SendGrid)

### Calendar & Sharing

- [ ] .ics calendar file generation
- [ ] Social sharing buttons
- [ ] Event embedding widget
- [ ] Public event APIs for external integrations

### Advanced Features

- [ ] Event cloning functionality
- [ ] Discount codes and pricing tiers
- [ ] Recurring events
- [ ] Event photos and post-event content

## 🎯 Sprint 5: Polish & Performance

### Performance Optimization

- [ ] Image optimization and CDN setup
- [ ] Database query optimization
- [ ] Caching strategy (Redis)
- [ ] SEO optimization and meta tags

### Quality & Testing

- [ ] Unit tests for critical functions
- [ ] Integration tests for API routes
- [ ] E2E tests with Playwright
- [ ] Error boundary implementation
- [ ] Loading states and skeleton screens

### Deployment & DevOps

- [ ] Vercel deployment configuration
- [ ] Database migration strategy
- [ ] Environment management
- [ ] Monitoring and error tracking
- [ ] Performance monitoring

## 🔧 Technical Debt & Improvements

- [ ] Add proper error handling throughout app
- [ ] Implement proper logging system
- [ ] Add input validation and sanitization
- [ ] Rate limiting for API routes
- [ ] Accessibility improvements (a11y)
- [ ] TypeScript strict mode configuration
- [ ] Security audit and fixes

## 📚 Documentation

- [ ] API documentation
- [ ] Component documentation (Storybook)
- [ ] Deployment guide
- [ ] Contributing guidelines
- [ ] User guide for organizers

---

## 🚀 Current Status

**MVP Foundation Complete** - Ready to start Sprint 1!

The core architecture is in place with:

- ✅ tRPC API with event and RSVP operations
- ✅ Server actions for form handling
- ✅ Route groups for public/admin separation
- ✅ Prisma schema with all core models
- ✅ Basic styling and responsive layout
- ✅ Type-safe end-to-end development

**Next Priority**: Set up authentication and database, then focus on the organizer experience for creating and managing events.
