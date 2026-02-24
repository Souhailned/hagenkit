-- AlterTable
ALTER TABLE "property_demo_concept" ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ALTER COLUMN "imageUrl" DROP NOT NULL,
ALTER COLUMN "generatedAt" DROP NOT NULL,
ALTER COLUMN "generatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "user_ai_quota" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "freeEditsUsed" INTEGER NOT NULL DEFAULT 0,
    "freeEditsLimit" INTEGER NOT NULL DEFAULT 3,
    "totalEdits" INTEGER NOT NULL DEFAULT 0,
    "lastEditAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_ai_quota_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_ai_quota_userId_key" ON "user_ai_quota"("userId");

-- AddForeignKey
ALTER TABLE "user_ai_quota" ADD CONSTRAINT "user_ai_quota_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
