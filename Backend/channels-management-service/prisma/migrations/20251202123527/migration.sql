-- CreateTable
CREATE TABLE "webforms" (
    "id" TEXT NOT NULL,
    "webformId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "fields" JSONB NOT NULL,
    "formLocationUrls" TEXT[],
    "actionOnSubmission" TEXT NOT NULL DEFAULT 'thankyou',
    "customRedirectUrl" TEXT,
    "thankYouMessage" TEXT NOT NULL DEFAULT 'Thank you for your response.',
    "assignedOwner" TEXT,
    "enableContactCreation" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "embedCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webform_submissions" (
    "id" TEXT NOT NULL,
    "webformId" TEXT NOT NULL,
    "submissionData" JSONB NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webform_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "webforms_webformId_key" ON "webforms"("webformId");

-- CreateIndex
CREATE UNIQUE INDEX "webforms_url_key" ON "webforms"("url");

-- AddForeignKey
ALTER TABLE "webform_submissions" ADD CONSTRAINT "webform_submissions_webformId_fkey" FOREIGN KEY ("webformId") REFERENCES "webforms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
