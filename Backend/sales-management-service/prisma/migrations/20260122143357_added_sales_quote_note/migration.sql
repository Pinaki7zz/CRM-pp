-- CreateTable
CREATE TABLE "SalesQuoteNote" (
    "id" TEXT NOT NULL,
    "salesQuoteId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesQuoteNote_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SalesQuoteNote" ADD CONSTRAINT "SalesQuoteNote_salesQuoteId_fkey" FOREIGN KEY ("salesQuoteId") REFERENCES "SalesQuote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
