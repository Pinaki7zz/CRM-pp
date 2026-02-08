/*
  Warnings:

  - Made the column `dueDate` on table `SalesQuote` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "SalesQuote" ALTER COLUMN "dueDate" SET NOT NULL;
