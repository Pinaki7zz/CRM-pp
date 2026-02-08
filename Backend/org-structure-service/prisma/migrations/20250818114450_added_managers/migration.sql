-- CreateTable
CREATE TABLE "SalesTeamManager" (
    "id" TEXT NOT NULL,
    "salesTeamCode" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3),
    "primary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesTeamManager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingTeamManager" (
    "id" TEXT NOT NULL,
    "marketingTeamCode" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3),
    "primary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingTeamManager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceTeamManager" (
    "id" TEXT NOT NULL,
    "serviceTeamCode" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3),
    "primary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceTeamManager_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SalesTeamManager" ADD CONSTRAINT "SalesTeamManager_salesTeamCode_fkey" FOREIGN KEY ("salesTeamCode") REFERENCES "SalesTeam"("salesTeamCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingTeamManager" ADD CONSTRAINT "MarketingTeamManager_marketingTeamCode_fkey" FOREIGN KEY ("marketingTeamCode") REFERENCES "MarketingTeam"("marketingTeamCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceTeamManager" ADD CONSTRAINT "ServiceTeamManager_serviceTeamCode_fkey" FOREIGN KEY ("serviceTeamCode") REFERENCES "ServiceTeam"("serviceTeamCode") ON DELETE RESTRICT ON UPDATE CASCADE;
