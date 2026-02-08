/*
  Warnings:

  - The values [COLD_CALL,EMPLOYEE_REFERRAL,EXTERNAL_REFERRAL,WHATSAPP] on the enum `LeadSource` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LeadSource_new" AS ENUM ('EMAIL', 'WEB', 'CALL', 'REFERRAL', 'SOCIAL_MEDIA');
ALTER TABLE "Opportunity" ALTER COLUMN "leadSource" TYPE "LeadSource_new" USING ("leadSource"::text::"LeadSource_new");
ALTER TYPE "LeadSource" RENAME TO "LeadSource_old";
ALTER TYPE "LeadSource_new" RENAME TO "LeadSource";
DROP TYPE "public"."LeadSource_old";
COMMIT;

-- AlterTable
ALTER TABLE "Opportunity" ALTER COLUMN "leadSource" DROP NOT NULL;
