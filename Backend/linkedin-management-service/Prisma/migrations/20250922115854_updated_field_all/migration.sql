/*
  Warnings:

  - You are about to drop the column `userId` on the `AddExternalBody` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `AddIdentityProvider` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `AddNamedCredential` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `AddPrincipal` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Integration` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `LinkedinExternalCredentialName` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[providerType]` on the table `Integration` will be added. If there are existing duplicate values, this will fail.
  - Made the column `integrationId` on table `AddPrincipal` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."AddExternalBody" DROP CONSTRAINT "AddExternalBody_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AddIdentityProvider" DROP CONSTRAINT "AddIdentityProvider_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AddNamedCredential" DROP CONSTRAINT "AddNamedCredential_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AddPrincipal" DROP CONSTRAINT "AddPrincipal_integrationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AddPrincipal" DROP CONSTRAINT "AddPrincipal_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Integration" DROP CONSTRAINT "Integration_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LinkedinExternalCredentialName" DROP CONSTRAINT "LinkedinExternalCredentialName_userId_fkey";

-- DropIndex
DROP INDEX "public"."Integration_userId_providerType_key";

-- AlterTable
ALTER TABLE "public"."AddExternalBody" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "public"."AddIdentityProvider" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "public"."AddNamedCredential" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "public"."AddPrincipal" DROP COLUMN "userId",
ALTER COLUMN "integrationId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Integration" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "public"."LinkedinExternalCredentialName" DROP COLUMN "userId";

-- CreateIndex
CREATE UNIQUE INDEX "Integration_providerType_key" ON "public"."Integration"("providerType");

-- AddForeignKey
ALTER TABLE "public"."AddPrincipal" ADD CONSTRAINT "AddPrincipal_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "public"."Integration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
