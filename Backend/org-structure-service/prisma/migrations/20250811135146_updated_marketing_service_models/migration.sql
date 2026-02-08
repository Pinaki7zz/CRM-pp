/*
  Warnings:

  - Added the required column `company` to the `MarketingOffice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationName` to the `MarketingOffice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validFrom` to the `MarketingOffice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validTo` to the `MarketingOffice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company` to the `SalesOffice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validFrom` to the `SalesOffice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validTo` to the `SalesOffice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company` to the `ServiceOffice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationName` to the `ServiceOffice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validFrom` to the `ServiceOffice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validTo` to the `ServiceOffice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MarketingChannel" ADD COLUMN     "marketingChannelDesc" VARCHAR(50);

-- AlterTable
ALTER TABLE "MarketingOffice" ADD COLUMN     "company" VARCHAR(30) NOT NULL,
ADD COLUMN     "organizationName" VARCHAR(30) NOT NULL,
ADD COLUMN     "parentUnit" TEXT,
ADD COLUMN     "validFrom" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validTo" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "marketingOfficeDesc" DROP NOT NULL,
ALTER COLUMN "marketingOfficeDesc" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "SalesOffice" ADD COLUMN     "company" VARCHAR(30) NOT NULL,
ADD COLUMN     "parentUnit" TEXT,
ADD COLUMN     "validFrom" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validTo" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ServiceChannel" ADD COLUMN     "serviceChannelDesc" VARCHAR(50);

-- AlterTable
ALTER TABLE "ServiceOffice" ADD COLUMN     "company" VARCHAR(30) NOT NULL,
ADD COLUMN     "organizationName" VARCHAR(30) NOT NULL,
ADD COLUMN     "parentUnit" TEXT,
ADD COLUMN     "validFrom" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "validTo" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "serviceOfficeDesc" DROP NOT NULL,
ALTER COLUMN "serviceOfficeDesc" SET DATA TYPE VARCHAR(50);
