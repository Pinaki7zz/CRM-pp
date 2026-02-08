/*
  Warnings:

  - You are about to drop the column `externalBodyId` on the `AddPrincipal` table. All the data in the column will be lost.
  - You are about to drop the column `integrationId` on the `AddPrincipal` table. All the data in the column will be lost.
  - You are about to drop the column `integrationId` on the `LinkedinExternalCredentialName` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."AddPrincipal" DROP CONSTRAINT "AddPrincipal_externalBodyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AddPrincipal" DROP CONSTRAINT "AddPrincipal_integrationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LinkedinExternalCredentialName" DROP CONSTRAINT "LinkedinExternalCredentialName_integrationId_fkey";

-- AlterTable
ALTER TABLE "public"."AddPrincipal" DROP COLUMN "externalBodyId",
DROP COLUMN "integrationId";

-- AlterTable
ALTER TABLE "public"."LinkedinExternalCredentialName" DROP COLUMN "integrationId";
