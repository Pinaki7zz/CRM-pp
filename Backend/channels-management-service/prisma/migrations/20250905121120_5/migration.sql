/*
  Warnings:

  - You are about to drop the column `customCSS` on the `chatflows` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `chatflows` table. All the data in the column will be lost.
  - You are about to drop the column `targetAudience` on the `chatflows` table. All the data in the column will be lost.
  - You are about to drop the column `workingHours` on the `chatflows` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[chatId]` on the table `chatflows` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `chatId` to the `chatflows` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."chatflows" DROP COLUMN "customCSS",
DROP COLUMN "department",
DROP COLUMN "targetAudience",
DROP COLUMN "workingHours",
ADD COLUMN     "chatId" TEXT NOT NULL,
ADD COLUMN     "fallbackTeam" TEXT,
ADD COLUMN     "keywordTeamPairs" JSONB,
ALTER COLUMN "accentColor" SET DEFAULT '#3b82f6';

-- CreateIndex
CREATE UNIQUE INDEX "chatflows_chatId_key" ON "public"."chatflows"("chatId");
