/*
  Warnings:

  - Changed the type of `usageUnit` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "UsageUnit" AS ENUM ('BOX', 'CARTON', 'DOZEN', 'EACH', 'HOUR', 'IMPRESSIONS', 'LB', 'M', 'PACK', 'PAGES', 'PIECES', 'QUANTITY', 'REAMS', 'SHEET', 'SPIRAL_BINDER', 'SQUARE_FEET');

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "usageUnit",
ADD COLUMN     "usageUnit" "UsageUnit" NOT NULL;
