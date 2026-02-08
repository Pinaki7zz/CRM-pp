/*
  Warnings:

  - You are about to drop the `Attachment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Email` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('EMAIL', 'PHONE_CALL', 'WEB_ENQUIRY');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_ANSWER', 'BUSY');

-- CreateEnum
CREATE TYPE "CallType" AS ENUM ('OUTBOUND');

-- CreateEnum
CREATE TYPE "CallFor" AS ENUM ('LEADS', 'CONTACTS', 'CASES');

-- CreateEnum
CREATE TYPE "CallPurpose" AS ENUM ('NEGOTIATION', 'DEMO', 'PROJECT', 'PROSPECTING');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED', 'DELETED', 'SPAM', 'DRAFT', 'SENT');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('EMAIL', 'TASK', 'MEETING', 'PHONE_CALL');

-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_emailId_fkey";

-- DropTable
DROP TABLE "Attachment";

-- DropTable
DROP TABLE "Email";

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "taskOwner" TEXT NOT NULL,
    "opportunityName" TEXT,
    "subject" TEXT NOT NULL,
    "priority" "Priority",
    "startDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "leadSource" "LeadSource",
    "status" "LeadStatus" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskAccount" (
    "taskId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "TaskAccount_pkey" PRIMARY KEY ("taskId","accountId")
);

-- CreateTable
CREATE TABLE "TaskContact" (
    "taskId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,

    CONSTRAINT "TaskContact_pkey" PRIMARY KEY ("taskId","contactId")
);

-- CreateTable
CREATE TABLE "Meeting" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "location" TEXT,
    "meetingOwnerId" TEXT NOT NULL,
    "primaryContactId" TEXT,
    "hostId" TEXT,
    "relatedTo" TEXT,
    "status" "MeetingStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "fromDate" TIMESTAMP(3),
    "toDate" TIMESTAMP(3),
    "participants" TEXT[],
    "participantReminder" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingContact" (
    "meetingId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,

    CONSTRAINT "MeetingContact_pkey" PRIMARY KEY ("meetingId","contactId")
);

-- CreateTable
CREATE TABLE "PhoneCall" (
    "id" TEXT NOT NULL,
    "callFor" "CallFor" NOT NULL,
    "relatedTo" TEXT,
    "relatedRecordId" TEXT,
    "callTimeFrom" TIMESTAMP(3),
    "callTimeTo" TIMESTAMP(3),
    "callType" "CallType" NOT NULL DEFAULT 'OUTBOUND',
    "owner" TEXT NOT NULL,
    "status" "CallStatus" NOT NULL DEFAULT 'SCHEDULED',
    "primaryContactId" TEXT,
    "subject" TEXT,
    "callPurpose" "CallPurpose",
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhoneCall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhoneCallContact" (
    "phoneCallId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,

    CONSTRAINT "PhoneCallContact_pkey" PRIMARY KEY ("phoneCallId","contactId")
);

-- CreateTable
CREATE TABLE "emails" (
    "id" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT,
    "sender" TEXT,
    "recipient" TEXT,
    "cc" TEXT,
    "bcc" TEXT,
    "status" "EmailStatus" NOT NULL DEFAULT 'UNREAD',
    "isExternal" BOOLEAN NOT NULL DEFAULT false,
    "ticketId" TEXT,
    "accountId" TEXT,
    "contactId" TEXT,
    "opportunityId" TEXT,
    "receivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "contentType" TEXT,
    "size" INTEGER,
    "path" TEXT NOT NULL,
    "storageProvider" TEXT NOT NULL DEFAULT 'local',
    "downloadUrl" TEXT,
    "sharePointId" TEXT,
    "emailId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailContact" (
    "emailId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,

    CONSTRAINT "EmailContact_pkey" PRIMARY KEY ("emailId","contactId")
);

-- AddForeignKey
ALTER TABLE "TaskAccount" ADD CONSTRAINT "TaskAccount_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskContact" ADD CONSTRAINT "TaskContact_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingContact" ADD CONSTRAINT "MeetingContact_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneCallContact" ADD CONSTRAINT "PhoneCallContact_phoneCallId_fkey" FOREIGN KEY ("phoneCallId") REFERENCES "PhoneCall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "emails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailContact" ADD CONSTRAINT "EmailContact_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "emails"("id") ON DELETE CASCADE ON UPDATE CASCADE;
