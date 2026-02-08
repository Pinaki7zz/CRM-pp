-- CreateTable
CREATE TABLE "SalesTeamEmployee" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3),
    "primary" BOOLEAN NOT NULL DEFAULT false,
    "job" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesTeamEmployee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingTeamEmployee" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3),
    "primary" BOOLEAN NOT NULL DEFAULT false,
    "job" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketingTeamEmployee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceTeamEmployee" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3),
    "primary" BOOLEAN NOT NULL DEFAULT false,
    "job" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceTeamEmployee_pkey" PRIMARY KEY ("id")
);
