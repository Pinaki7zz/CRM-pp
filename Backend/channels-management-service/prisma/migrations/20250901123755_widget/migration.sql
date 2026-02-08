-- AlterTable
ALTER TABLE "public"."chats" ADD COLUMN     "ownerUserId" TEXT,
ADD COLUMN     "widgetId" TEXT;

-- CreateTable
CREATE TABLE "public"."chat_widgets" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "widgetId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_widgets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chat_widgets_widgetId_key" ON "public"."chat_widgets"("widgetId");

-- AddForeignKey
ALTER TABLE "public"."chats" ADD CONSTRAINT "chats_widgetId_fkey" FOREIGN KEY ("widgetId") REFERENCES "public"."chat_widgets"("widgetId") ON DELETE SET NULL ON UPDATE CASCADE;
