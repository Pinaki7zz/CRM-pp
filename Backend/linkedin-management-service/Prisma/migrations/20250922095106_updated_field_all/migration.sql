/*
  Warnings:

  - A unique constraint covering the columns `[linkedinUrl]` on the table `Lead` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PrincipalStatus" AS ENUM ('NOT_CONFIGURED', 'CONFIGURED');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "password" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."Integration" (
    "id" SERIAL NOT NULL,
    "providerType" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecretKey" TEXT NOT NULL,
    "authorizedEndpointURL" TEXT,
    "tokenEndpointURL" TEXT,
    "userInfoEndpointURL" TEXT,
    "defaultScopes" TEXT,
    "callBackURL" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AddIdentityProvider" (
    "id" SERIAL NOT NULL,
    "identityProviderName" TEXT NOT NULL,
    "authenticationProtocol" TEXT NOT NULL,
    "authenticationFlowType" TEXT NOT NULL,
    "clientId" TEXT,
    "clientSecretKey" TEXT,
    "authorizedEndpointURL" TEXT,
    "tokenEndpointURL" TEXT,
    "userInfoEndpointURL" TEXT,
    "checkboxCredentialsBody" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "AddIdentityProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AddExternalBody" (
    "id" SERIAL NOT NULL,
    "externalCredentialName" TEXT NOT NULL,
    "authenticationProtocol" TEXT NOT NULL,
    "authenticationFlowType" TEXT NOT NULL,
    "identityProvider" TEXT NOT NULL,
    "scope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "AddExternalBody_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AddPrincipal" (
    "id" SERIAL NOT NULL,
    "principalName" TEXT NOT NULL,
    "principalType" TEXT NOT NULL,
    "status" "public"."PrincipalStatus" NOT NULL DEFAULT 'NOT_CONFIGURED',
    "scope" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "externalBodyId" INTEGER NOT NULL,
    "integrationId" INTEGER,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "AddPrincipal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AddNamedCredential" (
    "id" SERIAL NOT NULL,
    "credentialName" TEXT NOT NULL,
    "baseURL" TEXT NOT NULL,
    "externalCredential" TEXT NOT NULL,
    "enabledForCallouts" BOOLEAN NOT NULL DEFAULT true,
    "generateAuthorizationHeader" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "AddNamedCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LinkedinExternalCredentialName" (
    "id" SERIAL NOT NULL,
    "externalCredentialName" TEXT NOT NULL,
    "authenticationProtocol" TEXT NOT NULL,
    "authenticationFlowType" TEXT NOT NULL,
    "scope" TEXT,
    "providerName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "integrationId" INTEGER NOT NULL,

    CONSTRAINT "LinkedinExternalCredentialName_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Integration_userId_providerType_key" ON "public"."Integration"("userId", "providerType");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_linkedinUrl_key" ON "public"."Lead"("linkedinUrl");

-- AddForeignKey
ALTER TABLE "public"."Integration" ADD CONSTRAINT "Integration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AddIdentityProvider" ADD CONSTRAINT "AddIdentityProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AddExternalBody" ADD CONSTRAINT "AddExternalBody_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AddPrincipal" ADD CONSTRAINT "AddPrincipal_externalBodyId_fkey" FOREIGN KEY ("externalBodyId") REFERENCES "public"."AddExternalBody"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AddPrincipal" ADD CONSTRAINT "AddPrincipal_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "public"."Integration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AddPrincipal" ADD CONSTRAINT "AddPrincipal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AddNamedCredential" ADD CONSTRAINT "AddNamedCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LinkedinExternalCredentialName" ADD CONSTRAINT "LinkedinExternalCredentialName_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LinkedinExternalCredentialName" ADD CONSTRAINT "LinkedinExternalCredentialName_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "public"."Integration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
