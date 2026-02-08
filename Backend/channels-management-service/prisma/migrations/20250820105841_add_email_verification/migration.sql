-- CreateTable
CREATE TABLE "public"."email_channels" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "tokenExpiry" TIMESTAMP(3),
    "channelName" TEXT,
    "senderDisplayName" TEXT,
    "template" TEXT,
    "channelDirection" TEXT NOT NULL DEFAULT 'INBOUND_OUTBOUND',
    "subjectPattern" TEXT NOT NULL DEFAULT 'TICKET_SUBJECT',
    "channelType" TEXT NOT NULL DEFAULT 'B2B',
    "status" TEXT NOT NULL DEFAULT 'INACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_verifications" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "verificationToken" TEXT NOT NULL,
    "tokenExpiry" TIMESTAMP(3) NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_channels_channelId_key" ON "public"."email_channels"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "email_channels_email_key" ON "public"."email_channels"("email");

-- CreateIndex
CREATE UNIQUE INDEX "email_verifications_verificationToken_key" ON "public"."email_verifications"("verificationToken");
