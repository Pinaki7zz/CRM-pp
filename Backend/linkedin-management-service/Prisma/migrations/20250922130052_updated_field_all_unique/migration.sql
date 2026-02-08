/*
  Warnings:

  - A unique constraint covering the columns `[externalCredentialName]` on the table `AddExternalBody` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[identityProviderName]` on the table `AddIdentityProvider` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[credentialName]` on the table `AddNamedCredential` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[principalName]` on the table `AddPrincipal` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[externalCredentialName]` on the table `LinkedinExternalCredentialName` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AddExternalBody_externalCredentialName_key" ON "public"."AddExternalBody"("externalCredentialName");

-- CreateIndex
CREATE UNIQUE INDEX "AddIdentityProvider_identityProviderName_key" ON "public"."AddIdentityProvider"("identityProviderName");

-- CreateIndex
CREATE UNIQUE INDEX "AddNamedCredential_credentialName_key" ON "public"."AddNamedCredential"("credentialName");

-- CreateIndex
CREATE UNIQUE INDEX "AddPrincipal_principalName_key" ON "public"."AddPrincipal"("principalName");

-- CreateIndex
CREATE UNIQUE INDEX "LinkedinExternalCredentialName_externalCredentialName_key" ON "public"."LinkedinExternalCredentialName"("externalCredentialName");
