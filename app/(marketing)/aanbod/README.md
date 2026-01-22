# Aanbod (Property Listings)

This directory contains the property listing pages for Horecagrond.

## Structure

- `/aanbod` - Property listing overview page (to be implemented)
- `/aanbod/[slug]` - Individual property detail page

## Property Detail Page Features

The property detail page (`/aanbod/[slug]`) includes:

### SEO & Metadata
- Dynamic metadata generation based on property data
- Structured data (JSON-LD) for RealEstateListing schema
- Breadcrumb structured data
- OpenGraph and Twitter card support

### Hero Section
- Image gallery carousel with lightbox
- Keyboard navigation support
- Thumbnail strip for quick navigation

### Key Stats Bar
- Price (rent/sale)
- Surface area
- Property type
- Status badge

### Main Content (Two Column Layout)

**Left Column:**
- Title and location with badges
- Property description
- Details grid (surfaces, building info, capacity, horeca specifics)
- Features grouped by category (License, Facility, Utility, Accessibility)
- Location section with static map
- Agency/agent information card

**Right Column (Sticky):**
- Contact inquiry form with validation
- Availability information
- Property statistics (views, inquiries, saved)

### Similar Properties
- Related properties based on type and location

### Analytics
- Automatic view tracking on page load
- Device type detection
- Session tracking

## Components

- `PropertyImageGallery` - Carousel with lightbox
- `PropertyInquiryForm` - Contact form with React Hook Form + Zod
- `PropertyViewTracker` - View analytics tracker
- `PropertyCard` - Card for property listings

## Server Actions

Located in `/app/actions/property.ts`:
- `getPropertyBySlug` - Fetch property with relations
- `getSimilarProperties` - Find related properties
- `recordPropertyView` - Track property views
- `createPropertyInquiry` - Submit inquiry form
