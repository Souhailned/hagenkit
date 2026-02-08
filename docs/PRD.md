# Horecagrond - Product Requirements Document

> **Project:** Transformatie naar horecavastgoed platform
> **Methode:** Ralphy autonomous AI loop + Claude Skills
> **Engine:** Claude Code

---

## FASE 0: Voorbereiding

- [x] Lees de bestaande documentatie in docs/HORECAGROND-MASTERPLAN.md en docs/DATABASE-DESIGN.md voor volledige context over stakeholders, user journeys, en database design
- [x] Maak een backup branch van de huidige staat: git checkout -b backup/pre-horecagrond

---

## FASE 1: Database Schema Uitbreiding

> **Skills:** /prisma-orm-v7-skills

### 1.1 Enums Toevoegen
- [x] /prisma-orm-v7-skills Voeg nieuwe enums toe aan prisma/schema.prisma: PropertyType (RESTAURANT, CAFE, BAR, HOTEL, DARK_KITCHEN, NIGHTCLUB, FOOD_COURT, CATERING, BAKERY, OTHER), PropertyStatus (DRAFT, PENDING_REVIEW, ACTIVE, UNDER_OFFER, RENTED, SOLD, ARCHIVED, REJECTED), PriceType (RENT, SALE, RENT_OR_SALE), FeatureCategory (LICENSE, FACILITY, UTILITY, ACCESSIBILITY), InquiryStatus (NEW, VIEWED, CONTACTED, VIEWING_SCHEDULED, NEGOTIATING, CLOSED_WON, CLOSED_LOST, SPAM), InquirySource (WEBSITE, PHONE, EMAIL, REFERRAL, WALK_IN), AgencyRole (OWNER, ADMIN, AGENT, VIEWER), AgencyPlan (FREE, PRO, ENTERPRISE), AlertFrequency (INSTANT, DAILY, WEEKLY), PropertyImageType (EXTERIOR, INTERIOR, KITCHEN, TERRACE, BATHROOM, STORAGE, FLOORPLAN, LOCATION, RENDER, OTHER)

### 1.2 UserRole Uitbreiden
- [x] /prisma-orm-v7-skills Pas UserRole enum aan in prisma/schema.prisma: verander van {user, admin} naar {seeker, agent, admin}. Update ook de default waarde naar 'seeker'. Voeg commentaar toe dat seeker = horeca ondernemer die zoekt, agent = makelaar

### 1.3 Agency Model (Multi-tenant voor makelaars)
- [x] /prisma-orm-v7-skills Voeg Agency model toe aan prisma/schema.prisma met velden: id (cuid), name, slug (unique), description (Text), logo, email, phone, website, address, city, postalCode, province, country (default "NL"), kvkNumber, vatNumber, verified (default false), verifiedAt, verificationNotes, plan (AgencyPlan default FREE), planExpiresAt, stripeCustomerId, stripeSubscriptionId, maxListings (default 3), maxAgents (default 1), totalListings (default 0), activeListings (default 0), totalDeals (default 0), createdAt, updatedAt. Voeg relaties toe naar AgencyMember[], AgencyInvitation[], Property[], AgentProfile[]. Map naar "agency"

### 1.4 AgencyMember Model
- [x] /prisma-orm-v7-skills Voeg AgencyMember model toe met velden: id (cuid), role (AgencyRole default AGENT), joinedAt (default now), userId, agencyId. Voeg relaties toe naar User en Agency met onDelete Cascade. Voeg unique constraint toe op [userId, agencyId] en indexes op agencyId en userId. Map naar "agency_member"

### 1.5 AgencyInvitation Model
- [x] /prisma-orm-v7-skills Voeg AgencyInvitation model toe met velden: id (cuid), email, role (AgencyRole default AGENT), token (unique, default cuid), message (optioneel persoonlijk bericht), expiresAt, acceptedAt, createdAt (default now), agencyId, invitedById. Voeg relaties toe naar Agency (onDelete Cascade) en User (invitedBy). Voeg indexes toe op email en agencyId. Map naar "agency_invitation"

### 1.6 SeekerProfile Model
- [x] /prisma-orm-v7-skills Voeg SeekerProfile model toe met velden: id (cuid), userId (unique), businessType, conceptDescription (Text), experienceYears (Int), hasBusinessPlan (default false), budgetMin (Int in centen), budgetMax (Int in centen), preferredCities (String[]), preferredProvinces (String[]), preferredTypes (PropertyType[]), minSurface (Int), maxSurface (Int), mustHaveFeatures (String[]), niceToHaveFeatures (String[]), emailAlerts (default true), pushAlerts (default false), alertFrequency (AlertFrequency default DAILY), createdAt, updatedAt. Voeg 1:1 relatie toe naar User met onDelete Cascade. Map naar "seeker_profile"

### 1.7 AgentProfile Model
- [x] /prisma-orm-v7-skills Voeg AgentProfile model toe met velden: id (cuid), userId (unique), agencyId, title, phone, phonePublic (default false), bio (Text), avatar, specializations (PropertyType[]), regions (String[]), languages (String[]), verified (default false), verifiedAt, verificationNotes, listingsCount (default 0), activeListings (default 0), dealsClosedCount (default 0), avgResponseMinutes (Int), rating (Float), createdAt, updatedAt. Voeg relaties toe naar User (1:1, onDelete Cascade) en Agency (onDelete Cascade). Index op agencyId. Map naar "agent_profile"

### 1.8 Property Model (Hoofdmodel)
- [x] /prisma-orm-v7-skills Voeg Property model toe met ALLE velden uit docs/DATABASE-DESIGN.md sectie 3.4: ownership (agencyId met relatie, createdById met relatie), basic info (title, slug unique, description Text, shortDescription max 200), location (address, addressLine2, city, postalCode, province, country default NL, latitude Float, longitude Float, neighborhood), pricing in CENTEN (priceType, rentPrice Int, rentPriceMin, salePrice Int, salePriceMin, priceNegotiable default true, servicesCosts, depositMonths), dimensions (surfaceTotal Int required, surfaceCommercial, surfaceKitchen, surfaceStorage, surfaceTerrace, surfaceBasement, floors default 1, ceilingHeight Float), classification (propertyType, status default DRAFT), horeca specifics (seatingCapacityInside, seatingCapacityOutside, standingCapacity, kitchenType string, hasBasement, hasStorage, hasTerrace, hasParking, parkingSpaces), previous use (previousUse, wasHoreca, previousHorecaType, yearsHoreca), building (buildYear, lastRenovation, monumentStatus, energyLabel), scores (horecaScore string A+ tot F, horecaScoreDetails Json, locationScore Int, footfallEstimate), SEO (metaTitle, metaDescription, featured default false, featuredUntil, boostUntil), availability (availableFrom, availableUntil, minimumLeaseTerm), publishing (publishedAt, expiresAt, viewCount default 0, inquiryCount default 0, savedCount default 0), admin (adminNotes Text, rejectionReason), timestamps. Voeg ALLE indexes toe: agencyId, createdById, city, province, status, propertyType, priceType, publishedAt, [status,propertyType], [status,city], rentPrice, salePrice, surfaceTotal. Map naar "property"

### 1.9 PropertyImage Model
- [x] /prisma-orm-v7-skills Voeg PropertyImage model toe met velden: id (cuid), propertyId met relatie (onDelete Cascade), originalUrl, thumbnailUrl, mediumUrl, largeUrl, enhancedUrl (voor AI verbetering), type (PropertyImageType default INTERIOR), caption, altText, order (Int default 0), isPrimary (default false), aiProcessed (default false), aiPrompt, aiStyle, filename, mimeType, fileSize (Int bytes), width (Int), height (Int), createdAt, updatedAt. Indexes op propertyId en [propertyId, order]. Map naar "property_image"

### 1.10 PropertyFeature Model
- [x] /prisma-orm-v7-skills Voeg PropertyFeature model toe met velden: id (cuid), propertyId met relatie (onDelete Cascade), category (FeatureCategory), key (String bijv "alcohol_license"), value (String bijv "24_hours"), numericValue (Int voor getallen), booleanValue (Boolean voor ja/nee), verified (default false), verifiedAt, verifiedBy (String user ID), documentUrl (bewijs document), displayOrder (Int default 0), highlighted (default false voor uitgelicht in listing). Unique constraint op [propertyId, key]. Indexes op propertyId en [propertyId, category]. Map naar "property_feature"

### 1.11 PropertyInquiry Model (Leads)
- [x] /prisma-orm-v7-skills Voeg PropertyInquiry model toe met velden: id (cuid), propertyId met relatie (onDelete Cascade), seekerId (nullable) met relatie naar User (onDelete SetNull), name, email, phone, company, message (Text), intendedUse, conceptDescription (Text), budget (Int centen), timeline, financing, source (InquirySource default WEBSITE), utmSource, utmMedium, utmCampaign, referrer, status (InquiryStatus default NEW), assignedToId (nullable) met relatie naar User (onDelete SetNull), agentNotes (Text), qualityScore (Int 1-5), priority (String hot/warm/cold), viewingDate, viewingNotes, lastContactAt, nextFollowUpAt, followUpCount (default 0), closedAt, closedReason, dealValue (Int centen), createdAt, updatedAt. Indexes op propertyId, seekerId, assignedToId, status, createdAt. Map naar "property_inquiry"

### 1.12 SavedProperty Model
- [x] /prisma-orm-v7-skills Voeg SavedProperty model toe met velden: id (cuid), userId met relatie (onDelete Cascade), propertyId met relatie (onDelete Cascade), notes (Text), folder (String voor organisatie), savedAt (default now). Unique constraint op [userId, propertyId]. Indexes op userId en propertyId. Map naar "saved_property"

### 1.13 PropertyView Model (Analytics)
- [x] /prisma-orm-v7-skills Voeg PropertyView model toe met velden: id (cuid), propertyId met relatie (onDelete Cascade), userId (nullable) met relatie (onDelete SetNull), sessionId, ipHash, viewedAt (default now), duration (Int seconden), source (String search/direct/email/social), deviceType (String mobile/desktop/tablet), viewedImages (default false), viewedMap (default false), viewedContact (default false), clickedPhone (default false), clickedEmail (default false), savedProperty (default false), madeInquiry (default false). Indexes op propertyId, userId, viewedAt, [propertyId, viewedAt]. Map naar "property_view"

### 1.14 SearchAlert Model
- [x] /prisma-orm-v7-skills Voeg SearchAlert model toe met velden: id (cuid), userId met relatie (onDelete Cascade), name, active (default true), criteria (Json voor alle filter criteria), cities (String[]), provinces (String[]), propertyTypes (PropertyType[]), priceMin (Int), priceMax (Int), surfaceMin (Int), surfaceMax (Int), priceType (PriceType nullable), mustHaveFeatures (String[]), frequency (AlertFrequency default DAILY), emailEnabled (default true), pushEnabled (default false), lastSentAt, matchCount (default 0), lastMatchCount (default 0), createdAt, updatedAt. Indexes op userId en active. Map naar "search_alert"

### 1.15 User Model Relaties Updaten
- [x] /prisma-orm-v7-skills Update User model in prisma/schema.prisma: voeg relaties toe naar SeekerProfile (1:1 optional), AgentProfile (1:1 optional), agencyMemberships AgencyMember[], agencyInvitations AgencyInvitation[] met relation name "InvitedBy", propertiesCreated Property[] met relation name "PropertyCreator", savedProperties SavedProperty[], inquiriesMade PropertyInquiry[] met relation name "InquirySeeker", inquiriesAssigned PropertyInquiry[] met relation name "InquiryAssignee", propertyViews PropertyView[], searchAlerts SearchAlert[]

### 1.16 ImageProject Link naar Property
- [x] /prisma-orm-v7-skills Update ImageProject model in prisma/schema.prisma: voeg optionele propertyId veld toe (String nullable) met relatie naar Property (onDelete SetNull). Dit koppelt AI foto verbetering aan specifieke panden. Voeg index toe op propertyId

### 1.17 Database Synchronisatie
- [x] Run bun run prisma:generate om Prisma client te genereren met nieuwe models
- [x] Run bun run prisma:push om schema naar database te pushen (development)

---

## FASE 2: Validatie Schemas

> **Skills:** /nextjs-saas-structure

### 2.1 Agency Validatie
- [x] /nextjs-saas-structure Maak lib/validations/agency.ts met Zod schemas: createAgencySchema (name min 2 max 100, slug regex lowercase alphanumeric hyphens, description optional max 1000, kvkNumber optional 8 digits, phone optional, email optional valid email, website optional valid URL, address, city, postalCode), updateAgencySchema (alle velden optional), inviteAgentSchema (agencyId, email valid, role AgencyRole), updateAgentRoleSchema (memberId, role), removeAgentSchema (memberId), acceptAgencyInvitationSchema (token)

### 2.2 Property Validatie
- [x] /nextjs-saas-structure Maak lib/validations/property.ts met Zod schemas en alle property enums geexporteerd. createPropertySchema (title min 5 max 200, description optional, propertyType enum, priceType enum, rentPrice optional positive int, salePrice optional positive int, address, city, postalCode, surfaceTotal positive int, alle andere velden optional met juiste types). updatePropertySchema (alle optional). propertyFilterSchema (cities string array, propertyTypes array, priceType, priceMin, priceMax, surfaceMin, surfaceMax, features string array, hasTermace boolean, hasKitchen boolean). listPropertiesSchema (page default 1, limit default 20 max 100, sortBy enum, sortOrder asc/desc, filters propertyFilterSchema, search optional string)

### 2.3 Inquiry Validatie
- [x] /nextjs-saas-structure Maak lib/validations/inquiry.ts met Zod schemas: createInquirySchema (propertyId, name min 2 max 100, email valid, phone optional, message min 10 max 2000, intendedUse optional, budget optional positive int, timeline optional), updateInquiryStatusSchema (inquiryId, status InquiryStatus enum), assignInquirySchema (inquiryId, assignedToId), addAgentNotesSchema (inquiryId, notes max 5000, qualityScore optional 1-5, priority optional)

### 2.4 Seeker Profile Validatie
- [x] /nextjs-saas-structure Maak lib/validations/seeker-profile.ts met Zod schemas: updateSeekerProfileSchema (businessType optional, conceptDescription optional max 2000, experienceYears optional 0-50, budgetMin optional, budgetMax optional, preferredCities string array, preferredTypes PropertyType array, minSurface, maxSurface, mustHaveFeatures string array, emailAlerts boolean, alertFrequency enum). createSearchAlertSchema (name min 2 max 100, cities, propertyTypes, priceMin, priceMax, surfaceMin, surfaceMax, mustHaveFeatures, frequency). updateSearchAlertSchema (alle optional plus active boolean)

---

## FASE 3: Server Actions - Agency

> **Skills:** /nextjs-saas-structure /better-auth-best-practices

### 3.1 Agency CRUD Actions
- [x] /nextjs-saas-structure /better-auth-best-practices Maak app/actions/agency.ts met "use server" directive. Importeer prisma, validatie schemas, getCurrentUser helper. Implementeer: createAgency (validate input, check user is agent role, create agency, create AgencyMember als OWNER, return agency), getAgency (by id of slug, include members count en properties count), getCurrentUserAgency (get agency waar user OWNER of ADMIN is), updateAgency (check OWNER/ADMIN role, validate, update), deleteAgency (alleen OWNER, soft delete of cascade). Gebruik ActionResult<T> pattern voor alle returns

### 3.2 Agency Member Actions
- [x] /nextjs-saas-structure /better-auth-best-practices Maak app/actions/agency-members.ts: getAgencyMembers (agencyId, include user data en AgentProfile), inviteAgent (check OWNER/ADMIN, create AgencyInvitation met 7 dagen expiry, stuur email), getPendingAgencyInvitations, cancelAgencyInvitation, acceptAgencyInvitation (validate token, check not expired, check email match, create AgencyMember, create AgentProfile, mark invitation accepted), updateAgentRole (check OWNER, cannot demote last OWNER), removeAgentFromAgency (check permissions, cannot remove last OWNER)

### 3.3 Agent Profile Actions
- [x] /nextjs-saas-structure Maak app/actions/agent-profile.ts: getAgentProfile (by userId, include agency), updateAgentProfile (validate ownership, update allowed fields: title, phone, phonePublic, bio, avatar, specializations, regions, languages), getPublicAgentProfile (by id, alleen public velden voor marketing pagina)

---

## FASE 4: Server Actions - Property

> **Skills:** /nextjs-saas-structure /prisma-orm-v7-skills

### 4.1 Property CRUD Actions
- [x] /nextjs-saas-structure /prisma-orm-v7-skills Maak app/actions/property.ts: createProperty (validate user is agent, check agency membership, check plan limits maxListings, generate unique slug from title, create property met status DRAFT, update agency totalListings count, return property), getProperty (by id, include images ordered, features, agency, creator), getPropertyBySlug (public, alleen ACTIVE status, increment viewCount), updateProperty (check ownership via agency, validate, selective update alleen provided fields), deleteProperty (check ownership, set status ARCHIVED niet hard delete), publishProperty (check all required fields filled, set status ACTIVE, set publishedAt, update agency activeListings), unpublishProperty (set status DRAFT, clear publishedAt, update counts)

### 4.2 Property Image Actions
- [x] /nextjs-saas-structure Maak app/actions/property-images.ts: createPropertyImageUploadUrls (propertyId, files array met name en type, check ownership, check max 20 images, generate signed Supabase URLs, return array met signedUrl, path, imageId), savePropertyImages (propertyId, images array met path en metadata, create PropertyImage records, set first as isPrimary if none exists), updatePropertyImage (imageId, caption, altText, type), reorderPropertyImages (propertyId, imageIds array in new order, update order field), setPropertyImagePrimary (imageId, unset other isPrimary, set this one), deletePropertyImage (imageId, delete from Supabase, delete record, reorder remaining)

### 4.3 Property Feature Actions
- [x] /nextjs-saas-structure Maak app/actions/property-features.ts: addPropertyFeature (propertyId, category, key, value/numericValue/booleanValue, check ownership), updatePropertyFeature (featureId, new values), removePropertyFeature (featureId), bulkSetFeatures (propertyId, features array, upsert all in transaction - handig voor wizard), getFeatureDefinitions (return object met alle mogelijke feature keys per category met labels en value types - voor UI)

### 4.4 Property Search Actions
- [x] /nextjs-saas-structure Maak app/actions/property-search.ts: searchProperties (filters, pagination, sorting, alleen ACTIVE status, include primary image en key stats, return items + total + hasMore), getFeaturedProperties (limit, waar featured=true en featuredUntil > now), getRecentProperties (limit, sorted by publishedAt desc), getSimilarProperties (propertyId, based on type, city, price range, exclude self, limit 4), getPropertiesByAgency (agencyId, include all statuses for owner, only ACTIVE for public)

---

## FASE 5: Server Actions - Inquiries & Interactions

> **Skills:** /nextjs-saas-structure /resend-integration-skills

### 5.1 Inquiry Actions
- [x] /nextjs-saas-structure /resend-integration-skills Maak app/actions/inquiries.ts: createInquiry (propertyId, form data, seekerId optional als ingelogd, create inquiry, increment property inquiryCount, send email notification to property agent, return inquiry), getInquiry (by id, check ownership via property agency), listInquiries (voor agent: alle inquiries voor hun agency properties, filters op status/property/date, pagination), listSeekerInquiries (voor seeker: hun eigen inquiries), updateInquiryStatus (check agent ownership, update status, set timestamps based on status), assignInquiry (check agency admin, assign to agent in same agency), addAgentNotes (check ownership, append to agentNotes, update qualityScore/priority if provided), closeInquiry (set status CLOSED_WON of CLOSED_LOST, set closedAt, closedReason, dealValue if won)

### 5.2 Saved Properties Actions
- [x] /nextjs-saas-structure Maak app/actions/saved-properties.ts: saveProperty (userId, propertyId, optional notes en folder, check not already saved, create SavedProperty, increment property savedCount), unsaveProperty (userId, propertyId, delete record, decrement savedCount), listSavedProperties (userId, optional folder filter, include property with primary image), updateSavedPropertyNotes (savedId, notes, folder), isPropertySaved (userId, propertyId, return boolean - voor UI hart icon)

### 5.3 Property Analytics Actions
- [x] /nextjs-saas-structure Maak app/actions/property-analytics.ts: recordPropertyView (propertyId, userId optional, sessionId, deviceType, source, create PropertyView record - rate limit per session/IP), getPropertyStats (propertyId, check ownership, return: viewsTotal, viewsThisWeek, viewsThisMonth, inquiriesTotal, inquiriesThisMonth, savesTotal, conversionRate, viewsByDay array for chart), getAgencyStats (agencyId, check membership, return: totalListings, activeListings, totalViews, totalInquiries, avgViewsPerListing, topPerformingProperties)

### 5.4 Search Alert Actions
- [x] /nextjs-saas-structure Maak app/actions/search-alerts.ts: createSearchAlert (userId, name, criteria, frequency, create SearchAlert), updateSearchAlert (alertId, check ownership, update fields), deleteSearchAlert (alertId, check ownership), listSearchAlerts (userId, return all with matchCount), toggleSearchAlert (alertId, toggle active boolean), checkAlertMatches (alertId, run search with criteria, return matching count - voor preview)

---

## FASE 6: Seeker Profile Actions

> **Skills:** /nextjs-saas-structure

### 6.1 Seeker Profile CRUD
- [x] /nextjs-saas-structure Maak app/actions/seeker-profile.ts: getSeekerProfile (userId, create if not exists), updateSeekerProfile (userId, validate ownership, update fields), completeSeekerOnboarding (userId, profile data, mark user onboardingCompleted), getSeekerRecommendations (userId, get profile preferences, search matching properties, return personalized list)

---

## FASE 7: Onboarding Flow Aanpassen

> **Skills:** /shadcn-ui /frontend-design /react-best-practices

### 7.1 Rol Selectie Component
- [x] /shadcn-ui /frontend-design Maak components/onboarding/role-selection.tsx: twee grote klikbare cards naast elkaar. Links: icon Building, titel "Ik zoek horeca ruimte", beschrijving "Vind de perfecte locatie voor jouw horecaconcept", value "seeker". Rechts: icon Briefcase, titel "Ik ben makelaar", beschrijving "Plaats en beheer horecavastgoed aanbod", value "agent". Gebruik Card component van shadcn, hover states, selected state met primary border. Props: selectedRole, onSelect callback

### 7.2 Seeker Onboarding Steps
- [x] /shadcn-ui /frontend-design /react-best-practices Maak components/onboarding/seeker-steps/ directory met: StepBusinessType.tsx (radio group: restaurant, cafe, bar, hotel, dark kitchen, other, met optioneel tekstveld voor beschrijving concept), StepBudget.tsx (twee number inputs voor min/max budget met euro formatting, slider optional), StepPreferences.tsx (multi-select voor steden met populaire opties, checkboxes voor must-have features zoals terras, keuken, alcohol vergunning), StepComplete.tsx (success message, confetti, ga naar dashboard button). Elk component krijgt data en onUpdate props

### 7.3 Agent Onboarding Steps
- [x] /shadcn-ui /frontend-design /react-best-practices Maak components/onboarding/agent-steps/ directory met: StepAgencyInfo.tsx (form met: kantoor naam, KvK nummer met validatie hint, telefoon, email, website, adres velden), StepAgentProfile.tsx (form met: jouw naam, functie titel, telefoon, bio textarea, specialisaties multi-select PropertyType, regio's multi-select), StepFirstProperty.tsx (keuze: "Voeg nu je eerste pand toe" button of "Ik doe dit later" skip link), StepComplete.tsx (success, kantoor aangemaakt bevestiging, ga naar dashboard). Elk component krijgt data en onUpdate props

### 7.4 Update Onboarding Flow Component
- [x] /react-best-practices Update components/onboarding/onboarding-flow.tsx: voeg role state toe (null initially), toon RoleSelection als step 0 wanneer role null. Na role selectie: als seeker toon seeker steps (BusinessType, Budget, Preferences, Complete), als agent toon agent steps (AgencyInfo, AgentProfile, FirstProperty, Complete). Update step counting en progress indicator. Pass juiste data naar completeOnboarding

### 7.5 Update Onboarding Action
- [x] /nextjs-saas-structure Update app/actions/onboarding.ts completeOnboarding functie: accepteer role parameter ("seeker" of "agent"). Als seeker: update user role naar seeker, create SeekerProfile met preferences. Als agent: update user role naar agent, create Agency met provided info, create AgencyMember als OWNER, create AgentProfile. Set onboardingCompleted true. Return success met redirect URL (/dashboard)

---

## FASE 8: Sidebar Navigatie per Rol

> **Skills:** /react-best-practices /nextjs-saas-structure

### 8.1 Sidebar Data Structuur
- [x] /react-best-practices Update lib/data/sidebar.ts: maak seekerNavItems array met items: { id: "search", label: "Zoeken", icon: "MagnifyingGlass", href: "/aanbod" }, { id: "favorites", label: "Favorieten", icon: "Heart", href: "/dashboard/favorieten" }, { id: "inquiries", label: "Mijn Aanvragen", icon: "EnvelopeSimple", href: "/dashboard/aanvragen" }, { id: "alerts", label: "Alerts", icon: "Bell", href: "/dashboard/alerts" }, { id: "visualize", label: "Visualisaties", icon: "MagicWand", href: "/dashboard/images" }. Maak agentNavItems array met: { id: "dashboard", label: "Dashboard", icon: "House" }, { id: "properties", label: "Mijn Panden", icon: "Buildings" }, { id: "new-property", label: "Nieuw Pand", icon: "Plus" }, { id: "leads", label: "Leads", icon: "EnvelopeSimple", badge: true }, { id: "analytics", label: "Analytics", icon: "ChartBar" }, { id: "images", label: "AI Foto's", icon: "Image" }, { id: "team", label: "Team", icon: "Users" }. Export types en arrays

### 8.2 Update AppSidebar Component
- [x] /react-best-practices Update components/app-sidebar.tsx: importeer seekerNavItems en agentNavItems. Detecteer user.role uit props. In SidebarContent: als role === "seeker" map over seekerNavItems, als role === "agent" map over agentNavItems. Update getHrefForNavItem en isItemActive functies voor nieuwe routes. Admin sectie blijft ongewijzigd onderaan voor admin role. Update icons mapping voor nieuwe icons

---

## FASE 9: Agent Dashboard Pagina's

> **Skills:** /frontend-design /shadcn-ui /nextjs-saas-structure /react-best-practices

### 9.1 Agent Dashboard Components
- [x] /frontend-design /shadcn-ui Maak components/dashboard/agent-dashboard.tsx: server component die agent stats toont. Bovenaan 4 stat cards in grid: Actieve Panden (getal + trend), Nieuwe Leads Vandaag (getal + badge als > 0), Views Deze Week (getal + vergelijk vorige week), Gemiddelde Response (tijd). Daaronder twee kolommen: links "Recente Leads" lijst (max 5, met property naam, contact naam, tijd geleden, status badge), rechts "Top Panden" lijst (max 5, met naam, views, inquiries). Gebruik Card, Badge components. Fetch data via getAgencyStats en listInquiries actions

### 9.2 Seeker Dashboard Component
- [x] /frontend-design /shadcn-ui Maak components/dashboard/seeker-dashboard.tsx: server component voor zoeker homepage. "Aanbevolen voor jou" sectie met property cards grid (based on preferences), "Recent bekeken" sectie, "Nieuwe matches" sectie (properties matching alerts). Lege state als geen preferences ingesteld met link naar profiel. Gebruik getSeekerRecommendations action

### 9.3 Dashboard Home Page Update
- [x] /nextjs-saas-structure Update app/dashboard/page.tsx: async server component, get current user met role. Als role === "agent" render AgentDashboard, als role === "seeker" render SeekerDashboard, als role === "admin" render admin overview. Wrap in ContentCard pattern

### 9.4 Mijn Panden Pagina
- [x] /frontend-design /shadcn-ui /nextjs-saas-structure Maak app/dashboard/panden/page.tsx: async server component. ContentCard met header "Mijn Panden" en "Nieuw Pand" button. Filter tabs voor status (Alle, Actief, Concept, Gearchiveerd). Zoekbalk. Property cards grid met: thumbnail, titel, adres, prijs, status badge, stats (views, inquiries). Klikbaar naar detail. Empty state als geen panden met CTA. Gebruik getPropertiesByAgency action

### 9.5 Pand Detail/Edit Pagina
- [x] /frontend-design /shadcn-ui Maak app/dashboard/panden/[id]/page.tsx: async server component, fetch property by id. Tabs navigatie: Algemeen, Foto's, Kenmerken, Statistieken. Algemeen tab: edit form voor alle basis property velden in sections (Basis Info, Locatie, Prijzen, Afmetingen, Horeca Details). Foto's tab: image gallery met upload, reorder, delete, AI enhance button. Kenmerken tab: feature editor per category met add/remove. Statistieken tab: charts voor views/inquiries over tijd. Header met status badge, Publiceren/Depubliceren button, Verwijderen button. Gebruik getProperty, updateProperty actions

### 9.6 Property Wizard Component
- [x] /frontend-design /shadcn-ui /react-best-practices Maak components/property-wizard/PropertyWizard.tsx: modal-based multi-step wizard gebaseerd op bestaande ProjectWizard pattern. Steps: 1) BasicInfo (title, type, description), 2) Location (address met autocomplete suggestie, city, postalCode, manual lat/lng optional), 3) Pricing (priceType radio, conditional price fields, servicesCosts, deposit), 4) Dimensions (surfaceTotal required, andere optional, floors, ceilingHeight), 5) Features (grouped checkboxes per category: Vergunningen, Faciliteiten, Voorzieningen), 6) Photos (drag-drop upload zone, preview grid, set primary, AI enhance checkbox), 7) Review (summary van alle data, edit links per section, Publiceer of Bewaar als Concept buttons). Stepper component links. Mobile responsive. Props: onClose, onCreate callback

### 9.7 Nieuw Pand Pagina
- [x] /nextjs-saas-structure Maak app/dashboard/panden/nieuw/page.tsx: client component met state voor wizard open. ContentCard met intro tekst en "Start Wizard" button. Of direct PropertyWizard tonen. Handle onCreate: call createProperty action, navigate naar detail pagina on success

### 9.8 Leads Pagina
- [x] /frontend-design /shadcn-ui Maak app/dashboard/leads/page.tsx: async server component. ContentCard met header "Leads". Filter dropdown voor status (Alle, Nieuw, In Behandeling, Bezichtiging, Afgerond). Filter dropdown voor property. Zoeken op naam/email. Leads tabel of cards met: contact naam, email, property naam, ontvangen datum, status badge, laatste contact. Klikbaar naar detail. Badge counter voor nieuwe leads. Empty state. Gebruik listInquiries action

### 9.9 Lead Detail Pagina
- [x] /frontend-design /shadcn-ui Maak app/dashboard/leads/[id]/page.tsx: async server component. ContentCard layout. Header met contact naam, status dropdown om direct te wijzigen. Twee kolommen layout. Links: Contact Info card (naam, email, phone met click-to-call/mail, bedrijf), Bericht card (volledige message, concept beschrijving, budget, timeline), Property Link card (thumbnail, naam, link naar property). Rechts: Status & Notities card (status history timeline, notities textarea met save, kwaliteit score stars, prioriteit dropdown), Acties card (Plan Bezichtiging date picker, Markeer als Gewonnen/Verloren buttons met reason modal). Gebruik getInquiry, updateInquiryStatus, addAgentNotes actions

### 9.10 Agent Analytics Pagina
- [x] /frontend-design /shadcn-ui Update app/dashboard/analytics/page.tsx: voor agents toon property performance. Header stats cards. Line chart: Views over tijd (laatste 30 dagen). Bar chart: Inquiries per property. Table: Alle properties met views, inquiries, conversion rate, trend. Filters voor date range. Gebruik getAgencyStats, getPropertyStats actions

### 9.11 Team Pagina voor Agents
- [x] /shadcn-ui Update app/dashboard/team/page.tsx: detecteer user role. Voor agents: toon agency team members. Header met agency naam en "Uitnodigen" button. Members grid met: avatar, naam, email, role badge, listings count, joined date. Role dropdown om te wijzigen (alleen voor OWNER). Remove button. Pending invitations section met cancel optie. Invite dialog met email en role selector. Hergebruik patterns van bestaande members components. Gebruik agency-members actions

---

## FASE 10: Publieke Pagina's

> **Skills:** /frontend-design /shadcn-ui /nextjs-saas-structure /react-best-practices

### 10.1 Nieuwe Landing Page
- [x] /frontend-design Update app/(marketing)/page.tsx: nieuwe hero sectie met headline "Vind de perfecte horecalocatie", subtext, twee CTAs "Bekijk Aanbod" en "Ik ben Makelaar". Featured listings sectie (3-4 properties uit getFeaturedProperties). How it works sectie met 3 stappen voor zoekers. Stats sectie (X panden, Y makelaars, Z steden). CTA banner voor makelaars onderaan. Responsive design

### 10.2 Zoekpagina
- [x] /frontend-design /shadcn-ui Maak app/(marketing)/aanbod/page.tsx: twee kolommen layout op desktop. Links: sticky filter sidebar met sections: Locatie (city multi-select of search), Type (PropertyType checkboxes), Prijs (min/max inputs of slider), Oppervlakte (min/max), Kenmerken (popular features checkboxes). Active filters chips boven results. Rechts: results header met count en sort dropdown (Nieuwste, Prijs laag-hoog, Prijs hoog-laag, Oppervlakte). Property cards grid. Pagination of infinite scroll. Mobile: filters in sheet/drawer. Loading skeletons. Empty state met suggesties. URL search params voor filters (shareable). Gebruik searchProperties action met SSR

### 10.3 Property Detail Pagina
- [x] /frontend-design /shadcn-ui Maak app/(marketing)/aanbod/[slug]/page.tsx: async server component met generateMetadata voor SEO. Hero: image gallery/carousel met lightbox. Key stats bar: prijs, oppervlakte, type, status. Twee kolommen. Links: beschrijving sectie, kenmerken grid grouped by category met icons, locatie sectie met embedded map (of static map image), "Over de makelaar" card met agent info en agency. Rechts: sticky contact card met inquiry form (naam, email, telefoon, bericht, concept, budget, submit). Breadcrumbs. Similar properties sectie onderaan. Call recordPropertyView bij page load. Structured data voor SEO. Gebruik getPropertyBySlug action

### 10.4 Inquiry Form Component
- [x] /shadcn-ui /react-best-practices Maak components/property/inquiry-form.tsx: client component form. Velden: naam (required), email (required, validation), telefoon (optional), bericht (required, textarea), wat wil je openen (optional select), budget indicatie (optional select ranges). Submit button met loading state. Success state met bevestiging. Error handling met toast. Als user ingelogd: prefill naam en email. Props: propertyId, propertyTitle, onSuccess. Gebruik createInquiry action

### 10.5 Makelaars Overzicht Pagina
- [x] /frontend-design Maak app/(marketing)/makelaars/page.tsx: intro sectie over makelaars op platform. Grid van agency cards: logo, naam, stad, aantal actieve panden, "Bekijk profiel" link. Filter/search op stad. Alleen verified agencies tonen. Query agencies met count

### 10.6 Makelaar Profiel Pagina
- [x] /frontend-design /shadcn-ui Maak app/(marketing)/makelaars/[slug]/page.tsx: async server component. Header met agency logo, naam, description, contact info, verified badge. Team sectie met agent cards (foto, naam, specialisaties). Listings sectie met active properties grid (hergebruik property cards). Contact sectie. Structured data voor SEO. Gebruik getAgency, getPropertiesByAgency actions

---

## FASE 11: Seeker Dashboard Pagina's

> **Skills:** /frontend-design /shadcn-ui

### 11.1 Favorieten Pagina
- [x] /frontend-design /shadcn-ui Maak app/dashboard/favorieten/page.tsx: ContentCard met header "Mijn Favorieten". Folder tabs (Alle, eigen folders). Property cards grid met saved properties. Elk card heeft: thumbnail, titel, prijs, locatie, saved date, notities preview, heart icon om te unsaven, edit notities button. Empty state met link naar zoeken. Folder management (create, rename, delete). Bulk actions (remove selected). Gebruik listSavedProperties action

### 11.2 Mijn Aanvragen Pagina
- [x] /frontend-design /shadcn-ui Maak app/dashboard/aanvragen/page.tsx: ContentCard met header "Mijn Aanvragen". Timeline/list view van inquiries. Elk item: property thumbnail en naam (link), aanvraag datum, status badge met uitleg, laatste update. Expand voor volledige message en eventuele response. Filter op status. Empty state. Gebruik listSeekerInquiries action

### 11.3 Search Alerts Pagina
- [x] /frontend-design /shadcn-ui Maak app/dashboard/alerts/page.tsx: ContentCard met header "Zoek Alerts" en "Nieuwe Alert" button. Alert cards met: naam, criteria samenvatting (bijv "Café in Amsterdam, €2000-4000"), frequency badge, active toggle switch, matches count, last sent date. Edit en delete buttons. Create/edit modal met form: naam, all filter criteria (reuse filter components van zoekpagina), frequency select. Preview button die matches count toont. Gebruik search-alerts actions

### 11.4 AI Visualisaties voor Seekers
- [x] /frontend-design Update app/dashboard/images/page.tsx: detecteer user role. Voor seekers: andere framing "Visualiseer je Concept". Uitleg dat ze een pand foto kunnen uploaden en hun concept beschrijven. Create project flow met: upload foto, selecteer style template, beschrijf je concept (wordt prompt), generate. Gallery van hun creaties. Link naar tutorial/voorbeelden. Hergebruik bestaande image processing flow

---

## FASE 12: Admin Uitbreiding

> **Skills:** /shadcn-ui /nextjs-saas-structure

### 12.1 Agencies Admin Pagina
- [x] /shadcn-ui Maak app/dashboard/admin/agencies/page.tsx: ContentCard met header "Agencies". Table met: naam, slug, owner email, plan, verified status, listings count, created date. Actions: verify/unverify toggle, change plan dropdown, view details, impersonate owner. Filters: verified status, plan. Search op naam. Pagination. Click row voor detail modal met full info en recent activity

### 12.2 Properties Admin Pagina
- [x] /shadcn-ui Maak app/dashboard/admin/properties/page.tsx: ContentCard met header "Properties". Tabs: Pending Review, Active, All. Table met: titel, agency naam, city, type, status, created date, views. Actions: approve (set ACTIVE), reject (met reason modal, set REJECTED), feature toggle, view detail. Bulk approve voor pending. Click voor detail modal met preview

### 12.3 Update Admin Sidebar
- [x] Update admin navigatie in components/app-sidebar.tsx adminNavItems array: voeg toe { id: "agencies", label: "Agencies", href: "/dashboard/admin/agencies", icon: Buildings }, { id: "properties", label: "Properties", href: "/dashboard/admin/properties", icon: House } tussen bestaande items

---

## FASE 13: Email Templates

> **Skills:** /resend-integration-skills

### 13.1 Inquiry Notification Email
- [x] /resend-integration-skills Maak emails/templates/inquiry-notification.tsx: React Email template voor agent wanneer nieuwe inquiry binnenkomt. Subject: "Nieuwe aanvraag voor [property title]". Content: greeting met agent naam, property naam met thumbnail, contact gegevens (naam, email, telefoon), bericht preview (first 200 chars), "Bekijk in Dashboard" button link, footer met tips voor snelle response. Gebruik bestaande email-layout component

### 13.2 Search Alert Email
- [x] /resend-integration-skills Maak emails/templates/search-alert.tsx: React Email template voor seeker digest. Subject: "X nieuwe panden matchen je criteria". Content: greeting, alert naam, matching properties list (max 5) met: thumbnail, titel, prijs, locatie, "Bekijk" button. "Bekijk alle matches" button naar gefilterde zoekpagina. "Beheer alerts" link. Unsubscribe link

### 13.3 Agency Invitation Email
- [x] /resend-integration-skills Maak emails/templates/agency-invitation.tsx: React Email template voor agent invite. Subject: "[Inviter naam] nodigt je uit voor [agency naam]". Content: greeting, inviter info, agency naam en description, assigned role, "Accepteer Uitnodiging" button met token link, expiry notice (7 dagen), wat is Horecagrond uitleg. Gebaseerd op bestaande workspace invitation template

### 13.4 Update Email Service
- [x] Update lib/notifications/email-service.ts en emails/index.ts: exporteer nieuwe templates, voeg template IDs toe (INQUIRY_NOTIFICATION, SEARCH_ALERT_DIGEST, AGENCY_INVITATION), update sendTemplateEmail om nieuwe templates te ondersteunen

---

## FASE 14: Helpers & Integraties

> **Skills:** /nextjs-saas-structure

### 14.1 Horeca Score Berekening
- [x] Maak lib/horeca-score.ts: export calculateHorecaScore(property, features) functie. Score factoren: locatie (footfall estimate, neighborhood rating), vergunningen (welke licenses aanwezig), faciliteiten (keuken type, extraction), conditie (bouwjaar, renovatie), prijs/kwaliteit verhouding. Return object met: overallScore (A+ tot F), breakdown per factor met score en weight, suggestions voor verbetering. Export getScoreColor helper voor UI

### 14.2 Geocoding Service
- [x] Maak lib/geocoding.ts: export getCoordinates(address, city, postalCode, country) async functie. Gebruik gratis geocoding API (Nominatim/OpenStreetMap of pdok.nl voor NL). Return { latitude, longitude } of null bij geen match. Rate limiting respecteren. Cache results. Fallback naar null als service unavailable

### 14.3 Property AI Enhancement Integration
- [x] Update trigger/process-image.ts: na successful processing, check of ImageProject.propertyId is set. Zo ja: find PropertyImage by originalUrl match of create nieuwe, set enhancedUrl naar result, set aiProcessed true, set aiPrompt en aiStyle. Update ImageProject progress. Dit koppelt AI verwerking direct aan property listings

### 14.4 Slug Generator Utility
- [x] Maak lib/slug.ts: export generateSlug(title) functie die URL-safe slug maakt. Lowercase, replace spaces met hyphens, remove special chars, trim hyphens. Export generateUniqueSlug(title, checkExists) async functie die suffix toevoegt als slug al bestaat (bijv "cafe-amsterdam-2")

---

## FASE 15: Testing & Polish

### 15.1 Type Checking
- [x] Run bun run build en fix alle TypeScript errors. Focus op: nieuwe Prisma types correct geimporteerd, action return types correct, component props types correct

### 15.2 Lint Fixes
- [x] Run bun run lint en fix alle ESLint warnings en errors

### 15.3 Database Seed Script
- [x] Maak prisma/seed.ts: script dat test data aanmaakt. Create 2 agencies met elk 2 agents. Create 10 properties verdeeld over agencies met verschillende types, statussen, features. Create 3 seeker users met profiles en saved properties. Create inquiries. Run via: bunx prisma db seed. Voeg seed script toe aan package.json

### 15.4 Config Update
- [x] Update lib/config.ts siteConfig: verander name naar "Horecagrond", description naar horecavastgoed platform beschrijving, update links indien nodig

### 15.5 README Update
- [x] Update README.md met: nieuwe project beschrijving (horecavastgoed platform), feature lijst (makelaars, zoekers, AI fotos), tech stack, setup instructies met database setup, environment variables lijst inclusief nieuwe indien nodig

---

## DONE
<!-- Completed tasks will be moved here by Ralphy -->
