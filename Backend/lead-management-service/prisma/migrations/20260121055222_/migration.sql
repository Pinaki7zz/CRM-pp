-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('EMAIL', 'COLD_CALL', 'EMPLOYEE_REFERRAL', 'EXTERNAL_REFERRAL', 'SOCIAL_MEDIA', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'CONVERTED', 'LOST');

-- CreateEnum
CREATE TYPE "InterestLevel" AS ENUM ('COLD', 'WARM', 'HOT');

-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('PHONE_CALL', 'EMAIL', 'IN_PERSON');

-- CreateEnum
CREATE TYPE "InteractionOutcome" AS ENUM ('POSITIVE', 'NEGATIVE', 'NEUTRAL');

-- CreateEnum
CREATE TYPE "Title" AS ENUM ('MR', 'MRS', 'MS', 'OTHERS');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "title" "Title",
    "dateOfBirth" TIMESTAMP(3),
    "email" TEXT NOT NULL,
    "secondaryEmail" TEXT,
    "phoneNumber" TEXT,
    "fax" TEXT,
    "website" TEXT,
    "accountId" TEXT,
    "contactId" TEXT,
    "company" TEXT NOT NULL,
    "budget" DOUBLE PRECISION,
    "potentialRevenue" DOUBLE PRECISION,
    "leadOwnerId" TEXT NOT NULL,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "postalCode" TEXT,
    "leadSource" "LeadSource",
    "leadStatus" "LeadStatus" DEFAULT 'OPEN',
    "interestLevel" "InterestLevel",
    "interactionType" "InteractionType",
    "interactionOutcome" "InteractionOutcome",
    "interactionDate" TIMESTAMP(3),
    "interactionNote" TEXT,
    "notes" TEXT,
    "leadImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadConversion" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "convertedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadConversion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadAttachment" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_leadId_key" ON "Lead"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "LeadConversion_leadId_key" ON "LeadConversion"("leadId");

-- CreateIndex
CREATE INDEX "LeadConversion_accountId_idx" ON "LeadConversion"("accountId");

-- CreateIndex
CREATE INDEX "LeadConversion_contactId_idx" ON "LeadConversion"("contactId");

-- AddForeignKey
ALTER TABLE "LeadConversion" ADD CONSTRAINT "LeadConversion_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadAttachment" ADD CONSTRAINT "LeadAttachment_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
