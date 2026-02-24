-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('seeker', 'agent', 'admin');

-- CreateEnum
CREATE TYPE "AgencyRole" AS ENUM ('OWNER', 'ADMIN', 'AGENT', 'VIEWER');

-- CreateEnum
CREATE TYPE "AgencyPlan" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('RESTAURANT', 'CAFE', 'BAR', 'HOTEL', 'DARK_KITCHEN', 'NIGHTCLUB', 'FOOD_COURT', 'FOOD_TRUCK_SPOT', 'CATERING', 'BAKERY', 'EETCAFE', 'GRAND_CAFE', 'COCKTAILBAR', 'HOTEL_RESTAURANT', 'BED_AND_BREAKFAST', 'LUNCHROOM', 'KOFFIEBAR', 'BRASSERIE', 'PIZZERIA', 'SNACKBAR', 'IJSSALON', 'WOK_RESTAURANT', 'SUSHI', 'BEZORG_AFHAAL', 'PARTYCENTRUM', 'STRANDPAVILJOEN', 'PANNENKOEKHUIS', 'TEAROOM', 'WIJNBAR', 'BROUWERIJ_CAFE', 'LEISURE', 'OTHER');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'UNDER_OFFER', 'RENTED', 'SOLD', 'ARCHIVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PriceType" AS ENUM ('RENT', 'SALE', 'RENT_OR_SALE');

-- CreateEnum
CREATE TYPE "FeatureCategory" AS ENUM ('LICENSE', 'FACILITY', 'UTILITY', 'ACCESSIBILITY');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'VIEWED', 'CONTACTED', 'VIEWING_SCHEDULED', 'NEGOTIATING', 'CLOSED_WON', 'CLOSED_LOST', 'SPAM');

-- CreateEnum
CREATE TYPE "InquirySource" AS ENUM ('WEBSITE', 'PHONE', 'EMAIL', 'REFERRAL', 'WALK_IN', 'DREAM_SLIDER');

-- CreateEnum
CREATE TYPE "AlertFrequency" AS ENUM ('INSTANT', 'DAILY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "PropertyImageType" AS ENUM ('EXTERIOR', 'INTERIOR', 'KITCHEN', 'TERRACE', 'BATHROOM', 'STORAGE', 'FLOORPLAN', 'LOCATION', 'RENDER', 'OTHER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('BROCHURE', 'FLOORPLAN', 'HUURCONTRACT', 'KOOPCONTRACT', 'ENERGIELABEL', 'BODEMRAPPORT', 'ASBESTRAPPORT', 'BRANDVEILIGHEID', 'EXPLOITATIEPLAN', 'JAARCIJFERS', 'TAXATIERAPPORT', 'FOTO_RAPPORT', 'BESTEMMINGSPLAN', 'KADASTER', 'VERGUNNING', 'NDA', 'OVERIG');

-- CreateEnum
CREATE TYPE "OvernameType" AS ENUM ('ACTIVA_PASSIVA', 'AANDELEN', 'BEIDE');

-- CreateEnum
CREATE TYPE "OmzetTrend" AS ENUM ('STIJGEND', 'STABIEL', 'DALEND');

-- CreateEnum
CREATE TYPE "SalePriceType" AS ENUM ('KOSTEN_KOPER', 'VRIJ_OP_NAAM');

-- CreateEnum
CREATE TYPE "PropertyStaat" AS ENUM ('UITSTEKEND', 'GOED', 'REDELIJK', 'MATIG', 'SLECHT');

-- CreateEnum
CREATE TYPE "StaffTransfer" AS ENUM ('VERPLICHT', 'OPTIONEEL', 'GEEN');

-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('DRANK_HORECA_A', 'DRANK_HORECA_B', 'DRANK_HORECA_C', 'EXPLOITATIE', 'TERRAS', 'NACHT', 'GEBRUIKSMELDING', 'OMGEVINGS', 'MUZIEK', 'SPEELAUTOMATEN', 'EVENEMENTEN');

-- CreateEnum
CREATE TYPE "LicenseStatus" AS ENUM ('AANWEZIG', 'NIET_AANWEZIG', 'AANGEVRAAGD', 'VERLOPEN');

-- CreateEnum
CREATE TYPE "HorecaCategorie" AS ENUM ('HORECA_1', 'HORECA_2', 'HORECA_3', 'HORECA_4');

-- CreateEnum
CREATE TYPE "InstallationCategory" AS ENUM ('KEUKEN', 'DRANK', 'KLIMAAT', 'SANITAIR', 'VEILIGHEID', 'OVERIG');

-- CreateEnum
CREATE TYPE "InstallationCondition" AS ENUM ('NIEUW', 'GOED', 'REDELIJK', 'VERVANGEN');

-- CreateEnum
CREATE TYPE "InstallationOwnership" AS ENUM ('EIGENDOM', 'HUUR', 'LEASE', 'BRUIKLEEN');

-- CreateEnum
CREATE TYPE "ObligationType" AS ENUM ('BROUWERIJ', 'LEVERANCIER', 'LEASE', 'MUZIEK', 'AFVAL', 'ENERGIE', 'OVERIG');

-- CreateEnum
CREATE TYPE "LocationClassification" AS ENUM ('A1', 'A2', 'B', 'C');

-- CreateEnum
CREATE TYPE "PMProjectStatus" AS ENUM ('ACTIVE', 'PLANNED', 'BACKLOG', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PMPriority" AS ENUM ('URGENT', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "PMDeadlineType" AS ENUM ('NONE', 'TARGET', 'FIXED');

-- CreateEnum
CREATE TYPE "PMProjectIntent" AS ENUM ('DELIVERY', 'EXPERIMENT', 'INTERNAL');

-- CreateEnum
CREATE TYPE "PMSuccessType" AS ENUM ('DELIVERABLE', 'METRIC', 'UNDEFINED');

-- CreateEnum
CREATE TYPE "PMWorkStructure" AS ENUM ('LINEAR', 'MILESTONES', 'MULTISTREAM');

-- CreateEnum
CREATE TYPE "PMProjectRole" AS ENUM ('OWNER', 'PIC', 'CONTRIBUTOR', 'STAKEHOLDER', 'SUPPORT');

-- CreateEnum
CREATE TYPE "PMAccessLevel" AS ENUM ('FULL_ACCESS', 'CAN_EDIT', 'CAN_VIEW');

-- CreateEnum
CREATE TYPE "PMTaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "PMScopeType" AS ENUM ('IN_SCOPE', 'OUT_OF_SCOPE', 'EXPECTED_OUTCOME');

-- CreateEnum
CREATE TYPE "PMFeaturePriority" AS ENUM ('P0', 'P1', 'P2');

-- CreateEnum
CREATE TYPE "PMFileType" AS ENUM ('PDF', 'ZIP', 'FIGMA', 'DOC', 'IMAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "PMNoteType" AS ENUM ('GENERAL', 'MEETING', 'AUDIO');

-- CreateEnum
CREATE TYPE "PMNoteStatus" AS ENUM ('COMPLETED', 'PROCESSING');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ImageStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'seeker',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "phone" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "onboardingData" JSONB,
    "banned" BOOLEAN,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),
    "defaultWorkspaceId" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "activeWorkspaceId" TEXT,
    "impersonatedBy" TEXT,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_member" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,

    CONSTRAINT "workspace_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_invitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,

    CONSTRAINT "workspace_invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "whatsappNumber" TEXT,
    "website" TEXT,
    "address" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "province" TEXT,
    "country" TEXT NOT NULL DEFAULT 'NL',
    "kvkNumber" TEXT,
    "vatNumber" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verificationNotes" TEXT,
    "plan" "AgencyPlan" NOT NULL DEFAULT 'FREE',
    "planExpiresAt" TIMESTAMP(3),
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "dreamSliderEnabled" BOOLEAN NOT NULL DEFAULT false,
    "maxListings" INTEGER NOT NULL DEFAULT 3,
    "maxAgents" INTEGER NOT NULL DEFAULT 1,
    "totalListings" INTEGER NOT NULL DEFAULT 0,
    "activeListings" INTEGER NOT NULL DEFAULT 0,
    "totalDeals" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agency_member" (
    "id" TEXT NOT NULL,
    "role" "AgencyRole" NOT NULL DEFAULT 'AGENT',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,

    CONSTRAINT "agency_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agency_invitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "AgencyRole" NOT NULL DEFAULT 'AGENT',
    "token" TEXT NOT NULL,
    "message" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agencyId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,

    CONSTRAINT "agency_invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seeker_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessType" TEXT,
    "conceptDescription" TEXT,
    "experienceYears" INTEGER,
    "hasBusinessPlan" BOOLEAN NOT NULL DEFAULT false,
    "budgetMin" INTEGER,
    "budgetMax" INTEGER,
    "preferredCities" TEXT[],
    "preferredProvinces" TEXT[],
    "preferredTypes" "PropertyType"[],
    "minSurface" INTEGER,
    "maxSurface" INTEGER,
    "mustHaveFeatures" TEXT[],
    "niceToHaveFeatures" TEXT[],
    "emailAlerts" BOOLEAN NOT NULL DEFAULT true,
    "pushAlerts" BOOLEAN NOT NULL DEFAULT false,
    "alertFrequency" "AlertFrequency" NOT NULL DEFAULT 'DAILY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seeker_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "title" TEXT,
    "phone" TEXT,
    "phonePublic" BOOLEAN NOT NULL DEFAULT false,
    "bio" TEXT,
    "avatar" TEXT,
    "specializations" "PropertyType"[],
    "regions" TEXT[],
    "languages" TEXT[],
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verificationNotes" TEXT,
    "listingsCount" INTEGER NOT NULL DEFAULT 0,
    "activeListings" INTEGER NOT NULL DEFAULT 0,
    "dealsClosedCount" INTEGER NOT NULL DEFAULT 0,
    "avgResponseMinutes" INTEGER,
    "rating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "assignedAgentId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "shortDescription" TEXT,
    "address" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "province" TEXT,
    "country" TEXT NOT NULL DEFAULT 'NL',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "neighborhood" TEXT,
    "locationClassification" "LocationClassification",
    "horecaConcentratie" BOOLEAN,
    "passantenTelling" INTEGER,
    "bereikbaarheidAuto" TEXT,
    "bereikbaarheidOV" TEXT,
    "bereikbaarheidFiets" TEXT,
    "parkeerType" TEXT,
    "eigenParkeerterrein" BOOLEAN NOT NULL DEFAULT false,
    "toeristischGebied" BOOLEAN NOT NULL DEFAULT false,
    "kadastralGemeente" TEXT,
    "kadastralSectie" TEXT,
    "kadastralNummer" TEXT,
    "perceelOppervlakte" INTEGER,
    "priceType" "PriceType" NOT NULL,
    "rentPrice" INTEGER,
    "rentPriceMin" INTEGER,
    "salePrice" INTEGER,
    "salePriceMin" INTEGER,
    "priceNegotiable" BOOLEAN NOT NULL DEFAULT true,
    "servicesCosts" INTEGER,
    "depositMonths" INTEGER,
    "surfaceTotal" INTEGER NOT NULL,
    "surfaceCommercial" INTEGER,
    "surfaceKitchen" INTEGER,
    "surfaceStorage" INTEGER,
    "surfaceTerrace" INTEGER,
    "surfaceBasement" INTEGER,
    "surfaceOffice" INTEGER,
    "surfaceWoning" INTEGER,
    "floors" INTEGER NOT NULL DEFAULT 1,
    "ceilingHeight" DOUBLE PRECISION,
    "propertyType" "PropertyType" NOT NULL,
    "status" "PropertyStatus" NOT NULL DEFAULT 'DRAFT',
    "seatingCapacityInside" INTEGER,
    "seatingCapacityOutside" INTEGER,
    "standingCapacity" INTEGER,
    "kitchenType" TEXT,
    "hasBasement" BOOLEAN NOT NULL DEFAULT false,
    "hasStorage" BOOLEAN NOT NULL DEFAULT false,
    "hasTerrace" BOOLEAN NOT NULL DEFAULT false,
    "hasParking" BOOLEAN NOT NULL DEFAULT false,
    "parkingSpaces" INTEGER,
    "totalCapacity" INTEGER,
    "operationalDays" TEXT,
    "operationalHours" TEXT,
    "currentlyOperating" BOOLEAN NOT NULL DEFAULT false,
    "previousUse" TEXT,
    "wasHoreca" BOOLEAN NOT NULL DEFAULT false,
    "previousHorecaType" "PropertyType",
    "yearsHoreca" INTEGER,
    "buildYear" INTEGER,
    "lastRenovation" INTEGER,
    "monumentStatus" BOOLEAN NOT NULL DEFAULT false,
    "energyLabel" TEXT,
    "brandpreventieGoedgekeurd" BOOLEAN NOT NULL DEFAULT false,
    "warenwetGoedgekeurd" BOOLEAN NOT NULL DEFAULT false,
    "scopeKeuring" TEXT,
    "haccpCertificering" BOOLEAN NOT NULL DEFAULT false,
    "beslagenInventaris" BOOLEAN NOT NULL DEFAULT false,
    "boetesOvertredingen" TEXT,
    "horecaScore" TEXT,
    "horecaScoreDetails" JSONB,
    "locationScore" INTEGER,
    "footfallEstimate" INTEGER,
    "videoUrl" TEXT,
    "virtualTourUrl" TEXT,
    "floorplanUrl" TEXT,
    "brancheBeperkingen" TEXT[],
    "concurrentiebeding" BOOLEAN NOT NULL DEFAULT false,
    "concurrentiebedingDetails" TEXT,
    "concurrentiebedingTot" TIMESTAMP(3),
    "vacantSince" TIMESTAMP(3),
    "tags" TEXT[],
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "featuredUntil" TIMESTAMP(3),
    "boostUntil" TIMESTAMP(3),
    "availableFrom" TIMESTAMP(3),
    "availableUntil" TIMESTAMP(3),
    "minimumLeaseTerm" INTEGER,
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "inquiryCount" INTEGER NOT NULL DEFAULT 0,
    "savedCount" INTEGER NOT NULL DEFAULT 0,
    "adminNotes" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_image" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "mediumUrl" TEXT,
    "largeUrl" TEXT,
    "enhancedUrl" TEXT,
    "type" "PropertyImageType" NOT NULL DEFAULT 'INTERIOR',
    "caption" TEXT,
    "altText" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "aiProcessed" BOOLEAN NOT NULL DEFAULT false,
    "aiPrompt" TEXT,
    "aiStyle" TEXT,
    "filename" TEXT,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_feature" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "category" "FeatureCategory" NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "numericValue" INTEGER,
    "booleanValue" BOOLEAN,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "documentUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "highlighted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "property_feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_inquiry" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "seekerId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "message" TEXT NOT NULL,
    "intendedUse" TEXT,
    "conceptDescription" TEXT,
    "budget" INTEGER,
    "timeline" TEXT,
    "financing" TEXT,
    "source" "InquirySource" NOT NULL DEFAULT 'WEBSITE',
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "referrer" TEXT,
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "assignedToId" TEXT,
    "agentNotes" TEXT,
    "qualityScore" INTEGER,
    "priority" TEXT,
    "viewingDate" TIMESTAMP(3),
    "viewingNotes" TEXT,
    "lastContactAt" TIMESTAMP(3),
    "nextFollowUpAt" TIMESTAMP(3),
    "followUpCount" INTEGER NOT NULL DEFAULT 0,
    "closedAt" TIMESTAMP(3),
    "closedReason" TEXT,
    "dealValue" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_property" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "notes" TEXT,
    "folder" TEXT,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_view" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "ipHash" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,
    "source" TEXT,
    "deviceType" TEXT,
    "viewedImages" BOOLEAN NOT NULL DEFAULT false,
    "viewedMap" BOOLEAN NOT NULL DEFAULT false,
    "viewedContact" BOOLEAN NOT NULL DEFAULT false,
    "clickedPhone" BOOLEAN NOT NULL DEFAULT false,
    "clickedEmail" BOOLEAN NOT NULL DEFAULT false,
    "savedProperty" BOOLEAN NOT NULL DEFAULT false,
    "madeInquiry" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "property_view_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_alert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "criteria" JSONB NOT NULL,
    "cities" TEXT[],
    "provinces" TEXT[],
    "propertyTypes" "PropertyType"[],
    "priceMin" INTEGER,
    "priceMax" INTEGER,
    "surfaceMin" INTEGER,
    "surfaceMax" INTEGER,
    "priceType" "PriceType",
    "mustHaveFeatures" TEXT[],
    "frequency" "AlertFrequency" NOT NULL DEFAULT 'DAILY',
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastSentAt" TIMESTAMP(3),
    "matchCount" INTEGER NOT NULL DEFAULT 0,
    "lastMatchCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_financials" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "goodwill" INTEGER,
    "inventarisWaarde" INTEGER,
    "overnameSom" INTEGER,
    "overnameType" "OvernameType",
    "huurcontractType" TEXT,
    "huurcontractIngangsdatum" TIMESTAMP(3),
    "huurcontractEinddatum" TIMESTAMP(3),
    "huurprijsIndexatie" TEXT,
    "opzegtermijnMaanden" INTEGER,
    "borgMaanden" INTEGER,
    "jaaromzet" INTEGER,
    "omzetJaar" INTEGER,
    "omzetTrend" "OmzetTrend",
    "winst" INTEGER,
    "wozWaarde" INTEGER,
    "wozJaar" INTEGER,
    "optieTotkoop" BOOLEAN NOT NULL DEFAULT false,
    "koopoptieDetails" TEXT,
    "huurPerM2" INTEGER,
    "discreteVerkoop" BOOLEAN NOT NULL DEFAULT false,
    "priceOnRequest" BOOLEAN NOT NULL DEFAULT false,
    "rentPriceExBtw" BOOLEAN NOT NULL DEFAULT false,
    "btwBelast" BOOLEAN NOT NULL DEFAULT false,
    "salePriceType" "SalePriceType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_financials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_building" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "buildYear" INTEGER,
    "lastRenovation" INTEGER,
    "renovationDetails" TEXT,
    "monumentStatus" BOOLEAN NOT NULL DEFAULT false,
    "monumentType" TEXT,
    "energyLabel" TEXT,
    "energyLabelExpiry" TIMESTAMP(3),
    "staat" "PropertyStaat",
    "gasAansluiting" BOOLEAN NOT NULL DEFAULT false,
    "gasCapaciteit" TEXT,
    "elektraAansluiting" BOOLEAN NOT NULL DEFAULT false,
    "elektraCapaciteit" TEXT,
    "elektra3Fase" BOOLEAN NOT NULL DEFAULT false,
    "waterAansluiting" BOOLEAN NOT NULL DEFAULT false,
    "waterCapaciteit" TEXT,
    "vetafscheider" BOOLEAN NOT NULL DEFAULT false,
    "vetafscheiderCapaciteit" TEXT,
    "afzuiginstallatie" BOOLEAN NOT NULL DEFAULT false,
    "afzuigCapaciteit" TEXT,
    "rioolAansluiting" BOOLEAN NOT NULL DEFAULT true,
    "airco" BOOLEAN NOT NULL DEFAULT false,
    "vloerverwarming" BOOLEAN NOT NULL DEFAULT false,
    "dubbeleGlazing" BOOLEAN NOT NULL DEFAULT false,
    "bedrijfswoning" BOOLEAN NOT NULL DEFAULT false,
    "bedrijfswoningDetails" TEXT,
    "bedrijfswoningKamers" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_building_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_staffing" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "hasStaff" BOOLEAN NOT NULL DEFAULT false,
    "staffCount" INTEGER,
    "staffFulltime" INTEGER,
    "staffParttime" INTEGER,
    "staffFlex" INTEGER,
    "staffTransfer" "StaffTransfer",
    "staffDetails" TEXT,
    "caoApplicable" BOOLEAN NOT NULL DEFAULT false,
    "personnelCostsMonthly" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_staffing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_license" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "type" "LicenseType" NOT NULL,
    "status" "LicenseStatus" NOT NULL DEFAULT 'NIET_AANWEZIG',
    "issuedDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "issuedBy" TEXT,
    "licenseNumber" TEXT,
    "documentUrl" TEXT,
    "details" TEXT,
    "bestemmingsplan" TEXT,
    "horecaCategorie" "HorecaCategorie",
    "precario" BOOLEAN NOT NULL DEFAULT false,
    "precarioBedrag" INTEGER,
    "openingstijden" TEXT,
    "maxOpeningstijd" TEXT,
    "geluidsnormenDb" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_license_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_installation" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "category" "InstallationCategory" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "brand" TEXT,
    "condition" "InstallationCondition",
    "yearInstalled" INTEGER,
    "ownership" "InstallationOwnership" NOT NULL DEFAULT 'EIGENDOM',
    "leaseCompany" TEXT,
    "included" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_installation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_obligation" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "type" "ObligationType" NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "monthlyCost" INTEGER,
    "transferable" BOOLEAN NOT NULL DEFAULT false,
    "mandatory" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_obligation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_history" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "previousType" "PropertyType",
    "previousName" TEXT,
    "yearsActive" INTEGER,
    "reasonClosed" TEXT,
    "wasSuccessful" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_document" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "isConfidential" BOOLEAN NOT NULL DEFAULT false,
    "ndaRequired" BOOLEAN NOT NULL DEFAULT false,
    "aiSummary" TEXT,
    "aiAnalysis" JSONB,
    "aiAnalyzedAt" TIMESTAMP(3),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_ai_content" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "aiDescription" TEXT,
    "aiShortDescription" TEXT,
    "aiHighlights" JSONB,
    "aiListingRestaurant" TEXT,
    "aiListingInvestor" TEXT,
    "aiListingStarter" TEXT,
    "aiTargetAudiences" JSONB,
    "aiSwotAnalysis" JSONB,
    "aiSocialPosts" JSONB,
    "aiValuation" INTEGER,
    "aiValuationDetails" JSONB,
    "aiValuationConfidence" DOUBLE PRECISION,
    "aiValuationDate" TIMESTAMP(3),
    "aiComparables" JSONB,
    "aiMatchingProfile" JSONB,
    "aiMatchingKeywords" TEXT[],
    "aiDocumentsSummary" JSONB,
    "aiRiskFlags" JSONB,
    "aiFinancialHealth" JSONB,
    "aiLocationInsights" JSONB,
    "aiFootTrafficData" JSONB,
    "aiCompetitorAnalysis" JSONB,
    "aiAreaTrends" JSONB,
    "embeddingId" TEXT,
    "embeddingModel" TEXT,
    "embeddingUpdatedAt" TIMESTAMP(3),
    "aiChatbotContext" JSONB,
    "aiFrequentQuestions" JSONB,
    "lastGeneratedAt" TIMESTAMP(3),
    "generationVersion" INTEGER NOT NULL DEFAULT 0,
    "generationCostCents" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_ai_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "PMProjectStatus" NOT NULL DEFAULT 'BACKLOG',
    "priority" "PMPriority" NOT NULL DEFAULT 'MEDIUM',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "estimate" TEXT,
    "deadlineType" "PMDeadlineType" NOT NULL DEFAULT 'NONE',
    "intent" "PMProjectIntent",
    "successType" "PMSuccessType" NOT NULL DEFAULT 'UNDEFINED',
    "structure" "PMWorkStructure",
    "typeLabel" TEXT,
    "groupLabel" TEXT,
    "label" TEXT,
    "clientName" TEXT,
    "location" TEXT,
    "sprints" TEXT,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_activity" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityName" TEXT,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_member" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "PMProjectRole" NOT NULL DEFAULT 'CONTRIBUTOR',
    "access" "PMAccessLevel" NOT NULL DEFAULT 'CAN_EDIT',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_task" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "workstreamId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "PMTaskStatus" NOT NULL DEFAULT 'TODO',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_deliverable" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_deliverable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_metric" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "target" TEXT,
    "current" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_metric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_scope_item" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "PMScopeType" NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_scope_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_feature" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "priority" "PMFeaturePriority" NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_file" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "type" "PMFileType" NOT NULL DEFAULT 'OTHER',
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_file_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_tag" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_tag_assignment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_tag_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_workstream" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_workstream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_note" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "noteType" "PMNoteType" NOT NULL DEFAULT 'GENERAL',
    "status" "PMNoteStatus" NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_property" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image_project" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT,
    "name" TEXT NOT NULL,
    "styleTemplateId" TEXT NOT NULL DEFAULT 'modern',
    "roomType" TEXT,
    "thumbnailUrl" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PENDING',
    "imageCount" INTEGER NOT NULL DEFAULT 0,
    "completedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "image_project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "originalImageUrl" TEXT NOT NULL,
    "resultImageUrl" TEXT,
    "prompt" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentId" TEXT,
    "status" "ImageStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_project" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "clipCount" INTEGER NOT NULL DEFAULT 0,
    "estimatedCost" INTEGER NOT NULL DEFAULT 0,
    "actualCost" INTEGER NOT NULL DEFAULT 0,
    "generateNativeAudio" BOOLEAN NOT NULL DEFAULT false,
    "musicVolume" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "videoVolume" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "aspectRatio" TEXT NOT NULL DEFAULT '16:9',
    "duration" DOUBLE PRECISION,
    "thumbnailUrl" TEXT,
    "finalVideoUrl" TEXT,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "propertyId" TEXT,

    CONSTRAINT "video_project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_clip" (
    "id" TEXT NOT NULL,
    "videoProjectId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "sourceImageUrl" TEXT NOT NULL,
    "endImageUrl" TEXT,
    "roomLabel" TEXT,
    "roomType" TEXT,
    "motionPrompt" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "clipUrl" TEXT,
    "transitionType" TEXT,
    "transitionClipUrl" TEXT,
    "duration" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "sequenceOrder" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,

    CONSTRAINT "video_clip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_demo_concept" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "property_demo_concept_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_usage_log" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
    "userId" TEXT,
    "agencyId" TEXT,
    "service" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "costCents" INTEGER NOT NULL DEFAULT 0,
    "tokens" INTEGER,
    "durationMs" INTEGER,
    "status" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_slug_key" ON "workspace"("slug");

-- CreateIndex
CREATE INDEX "workspace_member_workspaceId_idx" ON "workspace_member"("workspaceId");

-- CreateIndex
CREATE INDEX "workspace_member_userId_idx" ON "workspace_member"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_member_userId_workspaceId_key" ON "workspace_member"("userId", "workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_invitation_token_key" ON "workspace_invitation"("token");

-- CreateIndex
CREATE INDEX "workspace_invitation_email_idx" ON "workspace_invitation"("email");

-- CreateIndex
CREATE INDEX "workspace_invitation_workspaceId_idx" ON "workspace_invitation"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "agency_slug_key" ON "agency"("slug");

-- CreateIndex
CREATE INDEX "agency_member_agencyId_idx" ON "agency_member"("agencyId");

-- CreateIndex
CREATE INDEX "agency_member_userId_idx" ON "agency_member"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "agency_member_userId_agencyId_key" ON "agency_member"("userId", "agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "agency_invitation_token_key" ON "agency_invitation"("token");

-- CreateIndex
CREATE INDEX "agency_invitation_email_idx" ON "agency_invitation"("email");

-- CreateIndex
CREATE INDEX "agency_invitation_agencyId_idx" ON "agency_invitation"("agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "seeker_profile_userId_key" ON "seeker_profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "agent_profile_userId_key" ON "agent_profile"("userId");

-- CreateIndex
CREATE INDEX "agent_profile_agencyId_idx" ON "agent_profile"("agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "property_slug_key" ON "property"("slug");

-- CreateIndex
CREATE INDEX "property_agencyId_idx" ON "property"("agencyId");

-- CreateIndex
CREATE INDEX "property_createdById_idx" ON "property"("createdById");

-- CreateIndex
CREATE INDEX "property_city_idx" ON "property"("city");

-- CreateIndex
CREATE INDEX "property_province_idx" ON "property"("province");

-- CreateIndex
CREATE INDEX "property_status_idx" ON "property"("status");

-- CreateIndex
CREATE INDEX "property_propertyType_idx" ON "property"("propertyType");

-- CreateIndex
CREATE INDEX "property_priceType_idx" ON "property"("priceType");

-- CreateIndex
CREATE INDEX "property_publishedAt_idx" ON "property"("publishedAt");

-- CreateIndex
CREATE INDEX "property_status_propertyType_idx" ON "property"("status", "propertyType");

-- CreateIndex
CREATE INDEX "property_status_city_idx" ON "property"("status", "city");

-- CreateIndex
CREATE INDEX "property_rentPrice_idx" ON "property"("rentPrice");

-- CreateIndex
CREATE INDEX "property_salePrice_idx" ON "property"("salePrice");

-- CreateIndex
CREATE INDEX "property_surfaceTotal_idx" ON "property"("surfaceTotal");

-- CreateIndex
CREATE INDEX "property_locationClassification_idx" ON "property"("locationClassification");

-- CreateIndex
CREATE INDEX "property_currentlyOperating_idx" ON "property"("currentlyOperating");

-- CreateIndex
CREATE INDEX "property_assignedAgentId_idx" ON "property"("assignedAgentId");

-- CreateIndex
CREATE INDEX "property_vacantSince_idx" ON "property"("vacantSince");

-- CreateIndex
CREATE INDEX "property_image_propertyId_idx" ON "property_image"("propertyId");

-- CreateIndex
CREATE INDEX "property_image_propertyId_order_idx" ON "property_image"("propertyId", "order");

-- CreateIndex
CREATE INDEX "property_feature_propertyId_idx" ON "property_feature"("propertyId");

-- CreateIndex
CREATE INDEX "property_feature_propertyId_category_idx" ON "property_feature"("propertyId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "property_feature_propertyId_key_key" ON "property_feature"("propertyId", "key");

-- CreateIndex
CREATE INDEX "property_inquiry_propertyId_idx" ON "property_inquiry"("propertyId");

-- CreateIndex
CREATE INDEX "property_inquiry_seekerId_idx" ON "property_inquiry"("seekerId");

-- CreateIndex
CREATE INDEX "property_inquiry_assignedToId_idx" ON "property_inquiry"("assignedToId");

-- CreateIndex
CREATE INDEX "property_inquiry_status_idx" ON "property_inquiry"("status");

-- CreateIndex
CREATE INDEX "property_inquiry_createdAt_idx" ON "property_inquiry"("createdAt");

-- CreateIndex
CREATE INDEX "saved_property_userId_idx" ON "saved_property"("userId");

-- CreateIndex
CREATE INDEX "saved_property_propertyId_idx" ON "saved_property"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_property_userId_propertyId_key" ON "saved_property"("userId", "propertyId");

-- CreateIndex
CREATE INDEX "property_view_propertyId_idx" ON "property_view"("propertyId");

-- CreateIndex
CREATE INDEX "property_view_userId_idx" ON "property_view"("userId");

-- CreateIndex
CREATE INDEX "property_view_viewedAt_idx" ON "property_view"("viewedAt");

-- CreateIndex
CREATE INDEX "property_view_propertyId_viewedAt_idx" ON "property_view"("propertyId", "viewedAt");

-- CreateIndex
CREATE INDEX "search_alert_userId_idx" ON "search_alert"("userId");

-- CreateIndex
CREATE INDEX "search_alert_active_idx" ON "search_alert"("active");

-- CreateIndex
CREATE UNIQUE INDEX "property_financials_propertyId_key" ON "property_financials"("propertyId");

-- CreateIndex
CREATE INDEX "property_financials_propertyId_idx" ON "property_financials"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "property_building_propertyId_key" ON "property_building"("propertyId");

-- CreateIndex
CREATE INDEX "property_building_propertyId_idx" ON "property_building"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "property_staffing_propertyId_key" ON "property_staffing"("propertyId");

-- CreateIndex
CREATE INDEX "property_staffing_propertyId_idx" ON "property_staffing"("propertyId");

-- CreateIndex
CREATE INDEX "property_license_propertyId_idx" ON "property_license"("propertyId");

-- CreateIndex
CREATE INDEX "property_license_propertyId_type_idx" ON "property_license"("propertyId", "type");

-- CreateIndex
CREATE INDEX "property_license_type_idx" ON "property_license"("type");

-- CreateIndex
CREATE INDEX "property_license_status_idx" ON "property_license"("status");

-- CreateIndex
CREATE INDEX "property_installation_propertyId_idx" ON "property_installation"("propertyId");

-- CreateIndex
CREATE INDEX "property_installation_propertyId_category_idx" ON "property_installation"("propertyId", "category");

-- CreateIndex
CREATE INDEX "property_installation_category_idx" ON "property_installation"("category");

-- CreateIndex
CREATE INDEX "property_obligation_propertyId_idx" ON "property_obligation"("propertyId");

-- CreateIndex
CREATE INDEX "property_obligation_propertyId_type_idx" ON "property_obligation"("propertyId", "type");

-- CreateIndex
CREATE INDEX "property_obligation_type_idx" ON "property_obligation"("type");

-- CreateIndex
CREATE INDEX "property_history_propertyId_idx" ON "property_history"("propertyId");

-- CreateIndex
CREATE INDEX "property_history_previousType_idx" ON "property_history"("previousType");

-- CreateIndex
CREATE INDEX "property_document_propertyId_idx" ON "property_document"("propertyId");

-- CreateIndex
CREATE INDEX "property_document_propertyId_type_idx" ON "property_document"("propertyId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "property_ai_content_propertyId_key" ON "property_ai_content"("propertyId");

-- CreateIndex
CREATE INDEX "property_ai_content_propertyId_idx" ON "property_ai_content"("propertyId");

-- CreateIndex
CREATE INDEX "property_ai_content_embeddingId_idx" ON "property_ai_content"("embeddingId");

-- CreateIndex
CREATE INDEX "project_workspaceId_idx" ON "project"("workspaceId");

-- CreateIndex
CREATE INDEX "project_createdById_idx" ON "project"("createdById");

-- CreateIndex
CREATE INDEX "project_status_idx" ON "project"("status");

-- CreateIndex
CREATE INDEX "project_priority_idx" ON "project"("priority");

-- CreateIndex
CREATE INDEX "project_workspaceId_status_idx" ON "project"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "project_activity_projectId_createdAt_idx" ON "project_activity"("projectId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "project_member_projectId_idx" ON "project_member"("projectId");

-- CreateIndex
CREATE INDEX "project_member_userId_idx" ON "project_member"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "project_member_projectId_userId_key" ON "project_member"("projectId", "userId");

-- CreateIndex
CREATE INDEX "project_task_projectId_idx" ON "project_task"("projectId");

-- CreateIndex
CREATE INDEX "project_task_assigneeId_idx" ON "project_task"("assigneeId");

-- CreateIndex
CREATE INDEX "project_task_workstreamId_idx" ON "project_task"("workstreamId");

-- CreateIndex
CREATE INDEX "project_task_projectId_status_idx" ON "project_task"("projectId", "status");

-- CreateIndex
CREATE INDEX "project_deliverable_projectId_idx" ON "project_deliverable"("projectId");

-- CreateIndex
CREATE INDEX "project_metric_projectId_idx" ON "project_metric"("projectId");

-- CreateIndex
CREATE INDEX "project_scope_item_projectId_idx" ON "project_scope_item"("projectId");

-- CreateIndex
CREATE INDEX "project_scope_item_projectId_type_idx" ON "project_scope_item"("projectId", "type");

-- CreateIndex
CREATE INDEX "project_feature_projectId_idx" ON "project_feature"("projectId");

-- CreateIndex
CREATE INDEX "project_feature_projectId_priority_idx" ON "project_feature"("projectId", "priority");

-- CreateIndex
CREATE INDEX "project_file_projectId_idx" ON "project_file"("projectId");

-- CreateIndex
CREATE INDEX "project_tag_workspaceId_idx" ON "project_tag"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "project_tag_workspaceId_name_key" ON "project_tag"("workspaceId", "name");

-- CreateIndex
CREATE INDEX "project_tag_assignment_projectId_idx" ON "project_tag_assignment"("projectId");

-- CreateIndex
CREATE INDEX "project_tag_assignment_tagId_idx" ON "project_tag_assignment"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "project_tag_assignment_projectId_tagId_key" ON "project_tag_assignment"("projectId", "tagId");

-- CreateIndex
CREATE INDEX "project_workstream_projectId_idx" ON "project_workstream"("projectId");

-- CreateIndex
CREATE INDEX "project_note_projectId_idx" ON "project_note"("projectId");

-- CreateIndex
CREATE INDEX "project_note_createdById_idx" ON "project_note"("createdById");

-- CreateIndex
CREATE INDEX "favorite_property_userId_idx" ON "favorite_property"("userId");

-- CreateIndex
CREATE INDEX "favorite_property_propertyId_idx" ON "favorite_property"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_property_userId_propertyId_key" ON "favorite_property"("userId", "propertyId");

-- CreateIndex
CREATE INDEX "image_project_workspaceId_idx" ON "image_project"("workspaceId");

-- CreateIndex
CREATE INDEX "image_project_userId_idx" ON "image_project"("userId");

-- CreateIndex
CREATE INDEX "image_project_propertyId_idx" ON "image_project"("propertyId");

-- CreateIndex
CREATE INDEX "image_workspaceId_idx" ON "image"("workspaceId");

-- CreateIndex
CREATE INDEX "image_projectId_idx" ON "image"("projectId");

-- CreateIndex
CREATE INDEX "image_parentId_idx" ON "image"("parentId");

-- CreateIndex
CREATE INDEX "image_userId_idx" ON "image"("userId");

-- CreateIndex
CREATE INDEX "video_project_workspaceId_idx" ON "video_project"("workspaceId");

-- CreateIndex
CREATE INDEX "video_project_propertyId_idx" ON "video_project"("propertyId");

-- CreateIndex
CREATE INDEX "video_clip_videoProjectId_idx" ON "video_clip"("videoProjectId");

-- CreateIndex
CREATE INDEX "video_clip_imageId_idx" ON "video_clip"("imageId");

-- CreateIndex
CREATE INDEX "property_demo_concept_propertyId_idx" ON "property_demo_concept"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "property_demo_concept_propertyId_style_key" ON "property_demo_concept"("propertyId", "style");

-- CreateIndex
CREATE INDEX "ai_usage_log_workspaceId_createdAt_idx" ON "ai_usage_log"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "ai_usage_log_feature_createdAt_idx" ON "ai_usage_log"("feature", "createdAt");

-- CreateIndex
CREATE INDEX "ai_usage_log_service_createdAt_idx" ON "ai_usage_log"("service", "createdAt");

-- CreateIndex
CREATE INDEX "ai_usage_log_createdAt_idx" ON "ai_usage_log"("createdAt");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_defaultWorkspaceId_fkey" FOREIGN KEY ("defaultWorkspaceId") REFERENCES "workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_activeWorkspaceId_fkey" FOREIGN KEY ("activeWorkspaceId") REFERENCES "workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_member" ADD CONSTRAINT "workspace_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_member" ADD CONSTRAINT "workspace_member_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_invitation" ADD CONSTRAINT "workspace_invitation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_invitation" ADD CONSTRAINT "workspace_invitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agency_member" ADD CONSTRAINT "agency_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agency_member" ADD CONSTRAINT "agency_member_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agency_invitation" ADD CONSTRAINT "agency_invitation_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agency_invitation" ADD CONSTRAINT "agency_invitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seeker_profile" ADD CONSTRAINT "seeker_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_profile" ADD CONSTRAINT "agent_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_profile" ADD CONSTRAINT "agent_profile_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property" ADD CONSTRAINT "property_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property" ADD CONSTRAINT "property_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property" ADD CONSTRAINT "property_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_image" ADD CONSTRAINT "property_image_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_feature" ADD CONSTRAINT "property_feature_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_inquiry" ADD CONSTRAINT "property_inquiry_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_inquiry" ADD CONSTRAINT "property_inquiry_seekerId_fkey" FOREIGN KEY ("seekerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_inquiry" ADD CONSTRAINT "property_inquiry_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_property" ADD CONSTRAINT "saved_property_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_property" ADD CONSTRAINT "saved_property_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_view" ADD CONSTRAINT "property_view_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_view" ADD CONSTRAINT "property_view_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_alert" ADD CONSTRAINT "search_alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_financials" ADD CONSTRAINT "property_financials_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_building" ADD CONSTRAINT "property_building_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_staffing" ADD CONSTRAINT "property_staffing_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_license" ADD CONSTRAINT "property_license_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_installation" ADD CONSTRAINT "property_installation_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_obligation" ADD CONSTRAINT "property_obligation_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_history" ADD CONSTRAINT "property_history_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_document" ADD CONSTRAINT "property_document_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_document" ADD CONSTRAINT "property_document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_ai_content" ADD CONSTRAINT "property_ai_content_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_activity" ADD CONSTRAINT "project_activity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_activity" ADD CONSTRAINT "project_activity_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_member" ADD CONSTRAINT "project_member_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_member" ADD CONSTRAINT "project_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_task" ADD CONSTRAINT "project_task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_task" ADD CONSTRAINT "project_task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_task" ADD CONSTRAINT "project_task_workstreamId_fkey" FOREIGN KEY ("workstreamId") REFERENCES "project_workstream"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_deliverable" ADD CONSTRAINT "project_deliverable_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_metric" ADD CONSTRAINT "project_metric_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_scope_item" ADD CONSTRAINT "project_scope_item_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_feature" ADD CONSTRAINT "project_feature_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_file" ADD CONSTRAINT "project_file_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_file" ADD CONSTRAINT "project_file_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_tag" ADD CONSTRAINT "project_tag_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_tag_assignment" ADD CONSTRAINT "project_tag_assignment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_tag_assignment" ADD CONSTRAINT "project_tag_assignment_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "project_tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_workstream" ADD CONSTRAINT "project_workstream_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_note" ADD CONSTRAINT "project_note_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_note" ADD CONSTRAINT "project_note_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_property" ADD CONSTRAINT "favorite_property_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_property" ADD CONSTRAINT "favorite_property_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image_project" ADD CONSTRAINT "image_project_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image_project" ADD CONSTRAINT "image_project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image_project" ADD CONSTRAINT "image_project_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image" ADD CONSTRAINT "image_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image" ADD CONSTRAINT "image_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image" ADD CONSTRAINT "image_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "image_project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image" ADD CONSTRAINT "image_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_project" ADD CONSTRAINT "video_project_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_clip" ADD CONSTRAINT "video_clip_videoProjectId_fkey" FOREIGN KEY ("videoProjectId") REFERENCES "video_project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_demo_concept" ADD CONSTRAINT "property_demo_concept_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
