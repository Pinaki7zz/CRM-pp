-- CreateEnum
CREATE TYPE "public"."LeadSource" AS ENUM ('EMAIL', 'PHONE_CALL', 'WEB_ENQUIRY');

-- CreateEnum
CREATE TYPE "public"."LeadStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."MeetingStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."CallStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_ANSWER', 'BUSY');

-- CreateEnum
CREATE TYPE "public"."CallType" AS ENUM ('OUTBOUND');

-- CreateEnum
CREATE TYPE "public"."CallFor" AS ENUM ('LEADS', 'CONTACTS', 'CASES');

-- CreateEnum
CREATE TYPE "public"."CallPurpose" AS ENUM ('NEGOTIATION', 'DEMO', 'PROJECT', 'PROSPECTING');

-- CreateEnum
CREATE TYPE "public"."EmailStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED', 'DELETED', 'SPAM');

-- CreateEnum
CREATE TYPE "public"."ActivityType" AS ENUM ('EMAIL', 'TASK', 'MEETING', 'PHONE_CALL');

-- CreateTable
CREATE TABLE "public"."Task" (
    "id" TEXT NOT NULL,
    "taskOwner" TEXT NOT NULL,
    "opportunityName" TEXT,
    "subject" TEXT NOT NULL,
    "priority" "public"."Priority",
    "startDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "leadSource" "public"."LeadSource",
    "status" "public"."LeadStatus" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TaskAccount" (
    "taskId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "TaskAccount_pkey" PRIMARY KEY ("taskId","accountId")
);

-- CreateTable
CREATE TABLE "public"."TaskContact" (
    "taskId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,

    CONSTRAINT "TaskContact_pkey" PRIMARY KEY ("taskId","contactId")
);

-- CreateTable
CREATE TABLE "public"."Meeting" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "location" TEXT,
    "meetingOwnerId" TEXT NOT NULL,
    "primaryContactId" TEXT,
    "hostId" TEXT,
    "relatedTo" TEXT,
    "status" "public"."MeetingStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "public"."Priority" NOT NULL DEFAULT 'MEDIUM',
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
CREATE TABLE "public"."MeetingContact" (
    "meetingId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,

    CONSTRAINT "MeetingContact_pkey" PRIMARY KEY ("meetingId","contactId")
);

-- CreateTable
CREATE TABLE "public"."PhoneCall" (
    "id" TEXT NOT NULL,
    "callFor" "public"."CallFor" NOT NULL,
    "relatedTo" TEXT,
    "relatedRecordId" TEXT,
    "callTimeFrom" TIMESTAMP(3),
    "callTimeTo" TIMESTAMP(3),
    "callType" "public"."CallType" NOT NULL DEFAULT 'OUTBOUND',
    "owner" TEXT NOT NULL,
    "status" "public"."CallStatus" NOT NULL DEFAULT 'SCHEDULED',
    "primaryContactId" TEXT,
    "subject" TEXT,
    "callPurpose" "public"."CallPurpose",
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhoneCall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PhoneCallContact" (
    "phoneCallId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,

    CONSTRAINT "PhoneCallContact_pkey" PRIMARY KEY ("phoneCallId","contactId")
);

-- CreateTable
CREATE TABLE "public"."Email" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "senderName" TEXT,
    "recipient" TEXT NOT NULL,
    "content" TEXT,
    "htmlContent" TEXT,
    "priority" "public"."Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "public"."EmailStatus" NOT NULL DEFAULT 'UNREAD',
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "readAt" TIMESTAMP(3),
    "messageId" TEXT,
    "inReplyTo" TEXT,
    "threadId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Attachment" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "contentType" TEXT,
    "size" INTEGER,
    "path" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailContact" (
    "emailId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,

    CONSTRAINT "EmailContact_pkey" PRIMARY KEY ("emailId","contactId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Email_externalId_key" ON "public"."Email"("externalId");

-- AddForeignKey
ALTER TABLE "public"."TaskAccount" ADD CONSTRAINT "TaskAccount_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TaskContact" ADD CONSTRAINT "TaskContact_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "public"."Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MeetingContact" ADD CONSTRAINT "MeetingContact_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "public"."Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PhoneCallContact" ADD CONSTRAINT "PhoneCallContact_phoneCallId_fkey" FOREIGN KEY ("phoneCallId") REFERENCES "public"."PhoneCall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attachment" ADD CONSTRAINT "Attachment_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "public"."Email"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailContact" ADD CONSTRAINT "EmailContact_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "public"."Email"("id") ON DELETE CASCADE ON UPDATE CASCADE;
