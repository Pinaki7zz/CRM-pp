-- CreateEnum
CREATE TYPE "ProductCategoryStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CLOSED');

-- AlterTable
ALTER TABLE "ProductCategory" ADD COLUMN     "status" "ProductCategoryStatus" NOT NULL DEFAULT 'INACTIVE';
