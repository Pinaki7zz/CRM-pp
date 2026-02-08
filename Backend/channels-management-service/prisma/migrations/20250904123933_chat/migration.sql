/*
  Warnings:

  - You are about to drop the column `aiHandled` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `aiScore` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `ownerUserId` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `widgetId` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the `chat_widgets` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."chats" DROP CONSTRAINT "chats_widgetId_fkey";

-- AlterTable
ALTER TABLE "public"."chat_sessions" ADD COLUMN     "chatflowId" TEXT;

-- AlterTable
ALTER TABLE "public"."chats" DROP COLUMN "aiHandled",
DROP COLUMN "aiScore",
DROP COLUMN "ownerUserId",
DROP COLUMN "widgetId",
ADD COLUMN     "chatflowId" TEXT,
ALTER COLUMN "status" SET DEFAULT 'active',
ALTER COLUMN "priority" SET DEFAULT 'medium';

-- AlterTable
ALTER TABLE "public"."customers" ADD COLUMN     "company" TEXT;

-- AlterTable
ALTER TABLE "public"."messages" DROP COLUMN "isRead",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'sending',
ALTER COLUMN "messageType" SET DEFAULT 'text';

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'offline';

-- DropTable
DROP TABLE "public"."chat_widgets";

-- CreateTable
CREATE TABLE "public"."chatflows" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "welcomeMessage" TEXT NOT NULL DEFAULT 'Hi! How can we help you today?',
    "companyName" TEXT NOT NULL,
    "showAvatar" BOOLEAN NOT NULL DEFAULT true,
    "enableKnowledgeBase" BOOLEAN NOT NULL DEFAULT false,
    "targetAudience" TEXT,
    "websiteUrl" TEXT,
    "department" TEXT,
    "accentColor" TEXT NOT NULL DEFAULT '#2563eb',
    "chatPlacement" TEXT NOT NULL DEFAULT 'bottom-right',
    "customCSS" TEXT,
    "requireConsent" BOOLEAN NOT NULL DEFAULT false,
    "enableFeedback" BOOLEAN NOT NULL DEFAULT false,
    "workingHours" JSONB,
    "autoAssignment" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "embedCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chatflows_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."chats" ADD CONSTRAINT "chats_chatflowId_fkey" FOREIGN KEY ("chatflowId") REFERENCES "public"."chatflows"("id") ON DELETE SET NULL ON UPDATE CASCADE;
