-- AlterTable
ALTER TABLE "Opportunity" ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "SalesQuote" ALTER COLUMN "status" SET DEFAULT 'OPEN';
