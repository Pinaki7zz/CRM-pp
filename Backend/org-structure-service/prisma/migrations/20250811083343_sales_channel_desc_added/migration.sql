/*
  Warnings:

  - Added the required column `salesChannelDesc` to the `SalesChannel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SalesChannel" ADD COLUMN     "salesChannelDesc" VARCHAR(50) NOT NULL;
