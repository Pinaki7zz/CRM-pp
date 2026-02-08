/*
  Warnings:

  - You are about to drop the column `contactEmail` on the `Opportunity` table. All the data in the column will be lost.
  - You are about to drop the column `contactPhone` on the `Opportunity` table. All the data in the column will be lost.
  - Added the required column `leadSource` to the `Opportunity` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('EMAIL', 'COLD_CALL', 'EMPLOYEE_REFERRAL', 'EXTERNAL_REFERRAL', 'SOCIAL_MEDIA', 'WHATSAPP');

-- AlterTable
ALTER TABLE "Opportunity" DROP COLUMN "contactEmail",
DROP COLUMN "contactPhone",
DROP COLUMN "leadSource",
ADD COLUMN     "leadSource" "LeadSource" NOT NULL;
