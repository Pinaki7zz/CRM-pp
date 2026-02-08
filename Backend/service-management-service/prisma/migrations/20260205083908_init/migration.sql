-- CreateTable
CREATE TABLE "ticket_categories" (
    "id" TEXT NOT NULL,
    "catalogName" VARCHAR(255) NOT NULL,
    "catalogId" TEXT NOT NULL,
    "ticketCategoryId" VARCHAR(50) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'In Preparation',
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3),
    "createdOnDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "createdBy" TEXT,
    "createdOnDateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedById" TEXT,
    "changedBy" TEXT,
    "changedOnDateTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ticket_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ticket_categories_catalogId_key" ON "ticket_categories"("catalogId");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_categories_ticketCategoryId_key" ON "ticket_categories"("ticketCategoryId");

-- CreateIndex
CREATE INDEX "ticket_categories_catalogName_idx" ON "ticket_categories"("catalogName");

-- CreateIndex
CREATE INDEX "ticket_categories_ticketCategoryId_idx" ON "ticket_categories"("ticketCategoryId");

-- CreateIndex
CREATE INDEX "ticket_categories_status_idx" ON "ticket_categories"("status");

-- CreateIndex
CREATE INDEX "ticket_categories_createdById_idx" ON "ticket_categories"("createdById");
