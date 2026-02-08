/*
  Warnings:

  - You are about to drop the column `downloadUrl` on the `Attachment` table. All the data in the column will be lost.
  - You are about to drop the column `sharePointId` on the `Attachment` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Email` table. All the data in the column will be lost.
  - You are about to drop the column `externalId` on the `Email` table. All the data in the column will be lost.
  - You are about to drop the column `inReplyTo` on the `Email` table. All the data in the column will be lost.
  - You are about to drop the column `messageId` on the `Email` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `Email` table. All the data in the column will be lost.
  - You are about to drop the column `readAt` on the `Email` table. All the data in the column will be lost.
  - You are about to drop the column `senderName` on the `Email` table. All the data in the column will be lost.
  - You are about to drop the column `threadId` on the `Email` table. All the data in the column will be lost.
  - The `status` column on the `Email` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `EmailContact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Meeting` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MeetingContact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PhoneCall` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PhoneCallContact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Task` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaskAccount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaskContact` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EmailContact" DROP CONSTRAINT "EmailContact_emailId_fkey";

-- DropForeignKey
ALTER TABLE "MeetingContact" DROP CONSTRAINT "MeetingContact_meetingId_fkey";

-- DropForeignKey
ALTER TABLE "PhoneCallContact" DROP CONSTRAINT "PhoneCallContact_phoneCallId_fkey";

-- DropForeignKey
ALTER TABLE "TaskAccount" DROP CONSTRAINT "TaskAccount_taskId_fkey";

-- DropForeignKey
ALTER TABLE "TaskContact" DROP CONSTRAINT "TaskContact_taskId_fkey";

-- DropIndex
DROP INDEX "Attachment_emailId_filename_size_key";

-- DropIndex
DROP INDEX "Email_externalId_key";

-- AlterTable
ALTER TABLE "Attachment" DROP COLUMN "downloadUrl",
DROP COLUMN "sharePointId";

-- AlterTable
ALTER TABLE "Email" DROP COLUMN "createdAt",
DROP COLUMN "externalId",
DROP COLUMN "inReplyTo",
DROP COLUMN "messageId",
DROP COLUMN "priority",
DROP COLUMN "readAt",
DROP COLUMN "senderName",
DROP COLUMN "threadId",
ADD COLUMN     "accountId" TEXT,
ADD COLUMN     "contactId" TEXT,
ADD COLUMN     "isExternal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ticketId" TEXT,
ALTER COLUMN "subject" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'UNREAD',
ALTER COLUMN "receivedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "EmailContact";

-- DropTable
DROP TABLE "Meeting";

-- DropTable
DROP TABLE "MeetingContact";

-- DropTable
DROP TABLE "PhoneCall";

-- DropTable
DROP TABLE "PhoneCallContact";

-- DropTable
DROP TABLE "Task";

-- DropTable
DROP TABLE "TaskAccount";

-- DropTable
DROP TABLE "TaskContact";

-- DropEnum
DROP TYPE "ActivityType";

-- DropEnum
DROP TYPE "CallFor";

-- DropEnum
DROP TYPE "CallPurpose";

-- DropEnum
DROP TYPE "CallStatus";

-- DropEnum
DROP TYPE "CallType";

-- DropEnum
DROP TYPE "EmailStatus";

-- DropEnum
DROP TYPE "LeadSource";

-- DropEnum
DROP TYPE "LeadStatus";

-- DropEnum
DROP TYPE "MeetingStatus";

-- DropEnum
DROP TYPE "Priority";
