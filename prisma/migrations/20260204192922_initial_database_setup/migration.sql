-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('seeker', 'agent', 'admin');

-- CreateEnum
CREATE TYPE "AgencyRole" AS ENUM ('OWNER', 'ADMIN', 'AGENT', 'VIEWER');

-- CreateEnum
CREATE TYPE "AgencyPlan" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('RESTAURANT', 'CAFE', 'BAR', 'HOTEL', 'DARK_KITCHEN', 'NIGHTCLUB', 'FOOD_COURT', 'FOOD_TRUCK_SPOT', 'CATERING', 'BAKERY', 'OTHER');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'UNDER_OFFER', 'RENTED', 'SOLD', 'ARCHIVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PriceType" AS ENUM ('RENT', 'SALE', 'RENT_OR_SALE');

-- CreateEnum
CREATE TYPE "FeatureCategory" AS ENUM ('LICENSE', 'FACILITY', 'UTILITY', 'ACCESSIBILITY');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'VIEWED', 'CONTACTED', 'VIEWING_SCHEDULED', 'NEGOTIATING', 'CLOSED_WON', 'CLOSED_LOST', 'SPAM');

-- CreateEnum
CREATE TYPE "InquirySource" AS ENUM ('WEBSITE', 'PHONE', 'EMAIL', 'REFERRAL', 'WALK_IN');

-- CreateEnum
CREATE TYPE "AlertFrequency" AS ENUM ('INSTANT', 'DAILY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "PropertyImageType" AS ENUM ('EXTERIOR', 'INTERIOR', 'KITCHEN', 'TERRACE', 'BATHROOM', 'STORAGE', 'FLOORPLAN', 'LOCATION', 'RENDER', 'OTHER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

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
    "previousUse" TEXT,
    "wasHoreca" BOOLEAN NOT NULL DEFAULT false,
    "previousHorecaType" "PropertyType",
    "yearsHoreca" INTEGER,
    "buildYear" INTEGER,
    "lastRenovation" INTEGER,
    "monumentStatus" BOOLEAN NOT NULL DEFAULT false,
    "energyLabel" TEXT,
    "horecaScore" TEXT,
    "horecaScoreDetails" JSONB,
    "locationScore" INTEGER,
    "footfallEstimate" INTEGER,
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
ALTER TABLE "project" ADD CONSTRAINT "project_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_member" ADD CONSTRAINT "project_member_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_member" ADD CONSTRAINT "project_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_task" ADD CONSTRAINT "project_task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_task" ADD CONSTRAINT "project_task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
