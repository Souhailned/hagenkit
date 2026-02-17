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

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PropertyType" ADD VALUE 'EETCAFE';
ALTER TYPE "PropertyType" ADD VALUE 'GRAND_CAFE';
ALTER TYPE "PropertyType" ADD VALUE 'COCKTAILBAR';
ALTER TYPE "PropertyType" ADD VALUE 'HOTEL_RESTAURANT';
ALTER TYPE "PropertyType" ADD VALUE 'BED_AND_BREAKFAST';
ALTER TYPE "PropertyType" ADD VALUE 'LUNCHROOM';
ALTER TYPE "PropertyType" ADD VALUE 'KOFFIEBAR';
ALTER TYPE "PropertyType" ADD VALUE 'BRASSERIE';
ALTER TYPE "PropertyType" ADD VALUE 'PIZZERIA';
ALTER TYPE "PropertyType" ADD VALUE 'SNACKBAR';
ALTER TYPE "PropertyType" ADD VALUE 'IJSSALON';
ALTER TYPE "PropertyType" ADD VALUE 'WOK_RESTAURANT';
ALTER TYPE "PropertyType" ADD VALUE 'SUSHI';
ALTER TYPE "PropertyType" ADD VALUE 'BEZORG_AFHAAL';
ALTER TYPE "PropertyType" ADD VALUE 'PARTYCENTRUM';
ALTER TYPE "PropertyType" ADD VALUE 'STRANDPAVILJOEN';
ALTER TYPE "PropertyType" ADD VALUE 'PANNENKOEKHUIS';
ALTER TYPE "PropertyType" ADD VALUE 'TEAROOM';
ALTER TYPE "PropertyType" ADD VALUE 'WIJNBAR';
ALTER TYPE "PropertyType" ADD VALUE 'BROUWERIJ_CAFE';
ALTER TYPE "PropertyType" ADD VALUE 'LEISURE';

-- AlterTable
ALTER TABLE "agency" ADD COLUMN     "whatsappNumber" TEXT;

-- AlterTable
ALTER TABLE "property" ADD COLUMN     "bereikbaarheidAuto" TEXT,
ADD COLUMN     "bereikbaarheidFiets" TEXT,
ADD COLUMN     "bereikbaarheidOV" TEXT,
ADD COLUMN     "beslagenInventaris" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "boetesOvertredingen" TEXT,
ADD COLUMN     "brandpreventieGoedgekeurd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "currentlyOperating" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "eigenParkeerterrein" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "haccpCertificering" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "horecaConcentratie" BOOLEAN,
ADD COLUMN     "kadastralGemeente" TEXT,
ADD COLUMN     "kadastralNummer" TEXT,
ADD COLUMN     "kadastralSectie" TEXT,
ADD COLUMN     "locationClassification" "LocationClassification",
ADD COLUMN     "operationalDays" TEXT,
ADD COLUMN     "operationalHours" TEXT,
ADD COLUMN     "parkeerType" TEXT,
ADD COLUMN     "passantenTelling" INTEGER,
ADD COLUMN     "perceelOppervlakte" INTEGER,
ADD COLUMN     "scopeKeuring" TEXT,
ADD COLUMN     "surfaceOffice" INTEGER,
ADD COLUMN     "surfaceWoning" INTEGER,
ADD COLUMN     "toeristischGebied" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totalCapacity" INTEGER,
ADD COLUMN     "warenwetGoedgekeurd" BOOLEAN NOT NULL DEFAULT false;

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
CREATE INDEX "video_project_workspaceId_idx" ON "video_project"("workspaceId");

-- CreateIndex
CREATE INDEX "video_clip_videoProjectId_idx" ON "video_clip"("videoProjectId");

-- CreateIndex
CREATE INDEX "video_clip_imageId_idx" ON "video_clip"("imageId");

-- CreateIndex
CREATE INDEX "property_locationClassification_idx" ON "property"("locationClassification");

-- CreateIndex
CREATE INDEX "property_currentlyOperating_idx" ON "property"("currentlyOperating");

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
ALTER TABLE "video_clip" ADD CONSTRAINT "video_clip_videoProjectId_fkey" FOREIGN KEY ("videoProjectId") REFERENCES "video_project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
