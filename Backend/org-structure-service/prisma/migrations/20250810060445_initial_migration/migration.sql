-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'ES', 'FR', 'DE', 'IT', 'NL', 'ID', 'VI');

-- CreateTable
CREATE TABLE "BusinessEntity" (
    "id" SERIAL NOT NULL,
    "businessEntityCode" VARCHAR(4) NOT NULL,
    "businessEntityName" VARCHAR(30) NOT NULL,
    "street1" VARCHAR(50) NOT NULL,
    "street2" VARCHAR(50),
    "city" VARCHAR(30) NOT NULL,
    "state" VARCHAR(30) NOT NULL,
    "region" VARCHAR(50),
    "country" VARCHAR(30) NOT NULL,
    "pinCode" VARCHAR(6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessUnit" (
    "id" SERIAL NOT NULL,
    "businessUnitCode" VARCHAR(4) NOT NULL,
    "businessUnitDesc" VARCHAR(30) NOT NULL,
    "street1" VARCHAR(50) NOT NULL,
    "street2" VARCHAR(50),
    "city" VARCHAR(30) NOT NULL,
    "state" VARCHAR(30) NOT NULL,
    "region" VARCHAR(50),
    "country" VARCHAR(30) NOT NULL,
    "pinCode" VARCHAR(6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessEntityUnitPair" (
    "id" SERIAL NOT NULL,
    "businessEntityCode" VARCHAR(4) NOT NULL,
    "businessUnitCode" VARCHAR(4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessEntityUnitPair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesChannel" (
    "id" SERIAL NOT NULL,
    "salesChannelCode" VARCHAR(4) NOT NULL,
    "salesChannelName" VARCHAR(30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOffice" (
    "id" SERIAL NOT NULL,
    "salesOfficeCode" VARCHAR(4) NOT NULL,
    "salesOfficeDesc" VARCHAR(30) NOT NULL,
    "street1" VARCHAR(50) NOT NULL,
    "street2" VARCHAR(50),
    "city" VARCHAR(30) NOT NULL,
    "state" VARCHAR(30) NOT NULL,
    "region" VARCHAR(50),
    "country" VARCHAR(30) NOT NULL,
    "pinCode" VARCHAR(6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesOffice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesTeam" (
    "id" SERIAL NOT NULL,
    "salesTeamCode" VARCHAR(4) NOT NULL,
    "salesTeamName" VARCHAR(30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesChannelOfficeTeamPair" (
    "id" SERIAL NOT NULL,
    "salesChannelCode" TEXT NOT NULL,
    "salesOfficeCode" TEXT NOT NULL,
    "salesTeamCode" TEXT NOT NULL,

    CONSTRAINT "SalesChannelOfficeTeamPair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingChannel" (
    "id" SERIAL NOT NULL,
    "marketingChannelCode" VARCHAR(4) NOT NULL,
    "marketingChannelName" VARCHAR(30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingOffice" (
    "id" SERIAL NOT NULL,
    "marketingOfficeCode" VARCHAR(4) NOT NULL,
    "marketingOfficeDesc" VARCHAR(30) NOT NULL,
    "street1" VARCHAR(50) NOT NULL,
    "street2" VARCHAR(50),
    "city" VARCHAR(30) NOT NULL,
    "state" VARCHAR(30) NOT NULL,
    "region" VARCHAR(50),
    "country" VARCHAR(30) NOT NULL,
    "pinCode" VARCHAR(6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingOffice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingTeam" (
    "id" SERIAL NOT NULL,
    "marketingTeamCode" VARCHAR(4) NOT NULL,
    "marketingTeamName" VARCHAR(30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingChannelOfficeTeamPair" (
    "id" SERIAL NOT NULL,
    "marketingChannelCode" TEXT NOT NULL,
    "marketingOfficeCode" TEXT NOT NULL,
    "marketingTeamCode" TEXT NOT NULL,

    CONSTRAINT "MarketingChannelOfficeTeamPair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceChannel" (
    "id" SERIAL NOT NULL,
    "serviceChannelCode" VARCHAR(4) NOT NULL,
    "serviceChannelName" VARCHAR(30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceOffice" (
    "id" SERIAL NOT NULL,
    "serviceOfficeCode" VARCHAR(4) NOT NULL,
    "serviceOfficeDesc" VARCHAR(30) NOT NULL,
    "street1" VARCHAR(50) NOT NULL,
    "street2" VARCHAR(50),
    "city" VARCHAR(30) NOT NULL,
    "state" VARCHAR(30) NOT NULL,
    "region" VARCHAR(50),
    "country" VARCHAR(30) NOT NULL,
    "pinCode" VARCHAR(6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceOffice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceTeam" (
    "id" SERIAL NOT NULL,
    "serviceTeamCode" VARCHAR(4) NOT NULL,
    "serviceTeamName" VARCHAR(30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceChannelOfficeTeamPair" (
    "id" SERIAL NOT NULL,
    "serviceChannelCode" TEXT NOT NULL,
    "serviceOfficeCode" TEXT NOT NULL,
    "serviceTeamCode" TEXT NOT NULL,

    CONSTRAINT "ServiceChannelOfficeTeamPair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessUnitSalesPair" (
    "id" TEXT NOT NULL,
    "businessUnitCode" TEXT NOT NULL,
    "salesChannelCode" TEXT NOT NULL,
    "salesOfficeCode" TEXT NOT NULL,
    "salesTeamCode" TEXT NOT NULL,

    CONSTRAINT "BusinessUnitSalesPair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessUnitMarketingPair" (
    "id" TEXT NOT NULL,
    "businessUnitCode" TEXT NOT NULL,
    "marketingChannelCode" TEXT NOT NULL,
    "marketingOfficeCode" TEXT NOT NULL,
    "marketingTeamCode" TEXT NOT NULL,

    CONSTRAINT "BusinessUnitMarketingPair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessUnitServicePair" (
    "id" TEXT NOT NULL,
    "businessUnitCode" TEXT NOT NULL,
    "serviceChannelCode" TEXT NOT NULL,
    "serviceOfficeCode" TEXT NOT NULL,
    "serviceTeamCode" TEXT NOT NULL,

    CONSTRAINT "BusinessUnitServicePair_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessEntity_businessEntityCode_key" ON "BusinessEntity"("businessEntityCode");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessUnit_businessUnitCode_key" ON "BusinessUnit"("businessUnitCode");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessEntityUnitPair_businessEntityCode_businessUnitCode_key" ON "BusinessEntityUnitPair"("businessEntityCode", "businessUnitCode");

-- CreateIndex
CREATE UNIQUE INDEX "SalesChannel_salesChannelCode_key" ON "SalesChannel"("salesChannelCode");

-- CreateIndex
CREATE UNIQUE INDEX "SalesOffice_salesOfficeCode_key" ON "SalesOffice"("salesOfficeCode");

-- CreateIndex
CREATE UNIQUE INDEX "SalesTeam_salesTeamCode_key" ON "SalesTeam"("salesTeamCode");

-- CreateIndex
CREATE UNIQUE INDEX "SalesChannelOfficeTeamPair_salesChannelCode_salesOfficeCode_key" ON "SalesChannelOfficeTeamPair"("salesChannelCode", "salesOfficeCode", "salesTeamCode");

-- CreateIndex
CREATE UNIQUE INDEX "MarketingChannel_marketingChannelCode_key" ON "MarketingChannel"("marketingChannelCode");

-- CreateIndex
CREATE UNIQUE INDEX "MarketingOffice_marketingOfficeCode_key" ON "MarketingOffice"("marketingOfficeCode");

-- CreateIndex
CREATE UNIQUE INDEX "MarketingTeam_marketingTeamCode_key" ON "MarketingTeam"("marketingTeamCode");

-- CreateIndex
CREATE UNIQUE INDEX "MarketingChannelOfficeTeamPair_marketingChannelCode_marketi_key" ON "MarketingChannelOfficeTeamPair"("marketingChannelCode", "marketingOfficeCode", "marketingTeamCode");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceChannel_serviceChannelCode_key" ON "ServiceChannel"("serviceChannelCode");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceOffice_serviceOfficeCode_key" ON "ServiceOffice"("serviceOfficeCode");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceTeam_serviceTeamCode_key" ON "ServiceTeam"("serviceTeamCode");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceChannelOfficeTeamPair_serviceChannelCode_serviceOffi_key" ON "ServiceChannelOfficeTeamPair"("serviceChannelCode", "serviceOfficeCode", "serviceTeamCode");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessUnitSalesPair_businessUnitCode_salesChannelCode_sal_key" ON "BusinessUnitSalesPair"("businessUnitCode", "salesChannelCode", "salesOfficeCode", "salesTeamCode");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessUnitMarketingPair_businessUnitCode_marketingChannel_key" ON "BusinessUnitMarketingPair"("businessUnitCode", "marketingChannelCode", "marketingOfficeCode", "marketingTeamCode");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessUnitServicePair_businessUnitCode_serviceChannelCode_key" ON "BusinessUnitServicePair"("businessUnitCode", "serviceChannelCode", "serviceOfficeCode", "serviceTeamCode");

-- AddForeignKey
ALTER TABLE "BusinessEntityUnitPair" ADD CONSTRAINT "BusinessEntityUnitPair_businessEntityCode_fkey" FOREIGN KEY ("businessEntityCode") REFERENCES "BusinessEntity"("businessEntityCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessEntityUnitPair" ADD CONSTRAINT "BusinessEntityUnitPair_businessUnitCode_fkey" FOREIGN KEY ("businessUnitCode") REFERENCES "BusinessUnit"("businessUnitCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesChannelOfficeTeamPair" ADD CONSTRAINT "SalesChannelOfficeTeamPair_salesChannelCode_fkey" FOREIGN KEY ("salesChannelCode") REFERENCES "SalesChannel"("salesChannelCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesChannelOfficeTeamPair" ADD CONSTRAINT "SalesChannelOfficeTeamPair_salesOfficeCode_fkey" FOREIGN KEY ("salesOfficeCode") REFERENCES "SalesOffice"("salesOfficeCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesChannelOfficeTeamPair" ADD CONSTRAINT "SalesChannelOfficeTeamPair_salesTeamCode_fkey" FOREIGN KEY ("salesTeamCode") REFERENCES "SalesTeam"("salesTeamCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingChannelOfficeTeamPair" ADD CONSTRAINT "MarketingChannelOfficeTeamPair_marketingChannelCode_fkey" FOREIGN KEY ("marketingChannelCode") REFERENCES "MarketingChannel"("marketingChannelCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingChannelOfficeTeamPair" ADD CONSTRAINT "MarketingChannelOfficeTeamPair_marketingOfficeCode_fkey" FOREIGN KEY ("marketingOfficeCode") REFERENCES "MarketingOffice"("marketingOfficeCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingChannelOfficeTeamPair" ADD CONSTRAINT "MarketingChannelOfficeTeamPair_marketingTeamCode_fkey" FOREIGN KEY ("marketingTeamCode") REFERENCES "MarketingTeam"("marketingTeamCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceChannelOfficeTeamPair" ADD CONSTRAINT "ServiceChannelOfficeTeamPair_serviceChannelCode_fkey" FOREIGN KEY ("serviceChannelCode") REFERENCES "ServiceChannel"("serviceChannelCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceChannelOfficeTeamPair" ADD CONSTRAINT "ServiceChannelOfficeTeamPair_serviceOfficeCode_fkey" FOREIGN KEY ("serviceOfficeCode") REFERENCES "ServiceOffice"("serviceOfficeCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceChannelOfficeTeamPair" ADD CONSTRAINT "ServiceChannelOfficeTeamPair_serviceTeamCode_fkey" FOREIGN KEY ("serviceTeamCode") REFERENCES "ServiceTeam"("serviceTeamCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessUnitSalesPair" ADD CONSTRAINT "BusinessUnitSalesPair_businessUnitCode_fkey" FOREIGN KEY ("businessUnitCode") REFERENCES "BusinessUnit"("businessUnitCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessUnitSalesPair" ADD CONSTRAINT "BusinessUnitSalesPair_salesChannelCode_fkey" FOREIGN KEY ("salesChannelCode") REFERENCES "SalesChannel"("salesChannelCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessUnitSalesPair" ADD CONSTRAINT "BusinessUnitSalesPair_salesOfficeCode_fkey" FOREIGN KEY ("salesOfficeCode") REFERENCES "SalesOffice"("salesOfficeCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessUnitSalesPair" ADD CONSTRAINT "BusinessUnitSalesPair_salesTeamCode_fkey" FOREIGN KEY ("salesTeamCode") REFERENCES "SalesTeam"("salesTeamCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessUnitMarketingPair" ADD CONSTRAINT "BusinessUnitMarketingPair_businessUnitCode_fkey" FOREIGN KEY ("businessUnitCode") REFERENCES "BusinessUnit"("businessUnitCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessUnitMarketingPair" ADD CONSTRAINT "BusinessUnitMarketingPair_marketingChannelCode_fkey" FOREIGN KEY ("marketingChannelCode") REFERENCES "MarketingChannel"("marketingChannelCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessUnitMarketingPair" ADD CONSTRAINT "BusinessUnitMarketingPair_marketingOfficeCode_fkey" FOREIGN KEY ("marketingOfficeCode") REFERENCES "MarketingOffice"("marketingOfficeCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessUnitMarketingPair" ADD CONSTRAINT "BusinessUnitMarketingPair_marketingTeamCode_fkey" FOREIGN KEY ("marketingTeamCode") REFERENCES "MarketingTeam"("marketingTeamCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessUnitServicePair" ADD CONSTRAINT "BusinessUnitServicePair_businessUnitCode_fkey" FOREIGN KEY ("businessUnitCode") REFERENCES "BusinessUnit"("businessUnitCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessUnitServicePair" ADD CONSTRAINT "BusinessUnitServicePair_serviceChannelCode_fkey" FOREIGN KEY ("serviceChannelCode") REFERENCES "ServiceChannel"("serviceChannelCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessUnitServicePair" ADD CONSTRAINT "BusinessUnitServicePair_serviceOfficeCode_fkey" FOREIGN KEY ("serviceOfficeCode") REFERENCES "ServiceOffice"("serviceOfficeCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessUnitServicePair" ADD CONSTRAINT "BusinessUnitServicePair_serviceTeamCode_fkey" FOREIGN KEY ("serviceTeamCode") REFERENCES "ServiceTeam"("serviceTeamCode") ON DELETE RESTRICT ON UPDATE CASCADE;
