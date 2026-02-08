/*
  Warnings:

  - You are about to drop the column `leadSourceId` on the `Opportunity` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Opportunity" DROP COLUMN "leadSourceId",
ADD COLUMN     "leadSource" TEXT;
