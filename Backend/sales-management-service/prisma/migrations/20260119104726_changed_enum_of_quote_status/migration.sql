/*
  Warnings:

  - The values [OPEN,PROCESSING,SHIPPED,DELIVERED,CANCELLED] on the enum `QuoteStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "QuoteStatus_new" AS ENUM ('DRAFT', 'SENT', 'APPROVED', 'ACCEPTED', 'REJECTED');
ALTER TABLE "public"."SalesQuote" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "SalesQuote" ALTER COLUMN "status" TYPE "QuoteStatus_new" USING ("status"::text::"QuoteStatus_new");
ALTER TYPE "QuoteStatus" RENAME TO "QuoteStatus_old";
ALTER TYPE "QuoteStatus_new" RENAME TO "QuoteStatus";
DROP TYPE "public"."QuoteStatus_old";
ALTER TABLE "SalesQuote" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterTable
ALTER TABLE "SalesQuote" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
