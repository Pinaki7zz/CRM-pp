/*
  Warnings:

  - Added the required column `integrationId` to the `LinkedinExternalCredentialName` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."LinkedinExternalCredentialName" ADD COLUMN     "integrationId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."LinkedinExternalCredentialName" ADD CONSTRAINT "LinkedinExternalCredentialName_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "public"."Integration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
