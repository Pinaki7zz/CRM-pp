-- AlterTable
ALTER TABLE "public"."chatflows" ADD COLUMN     "assignedTeam" TEXT,
ADD COLUMN     "autoAssignConversations" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "chatAvatar" TEXT,
ADD COLUMN     "emailCaptureMessage" TEXT NOT NULL DEFAULT 'Please provide your email to continue',
ADD COLUMN     "emailCaptureWhen" TEXT NOT NULL DEFAULT 'never',
ADD COLUMN     "excludePages" TEXT,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'english',
ADD COLUMN     "showOnAllPages" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "specificPages" TEXT;
