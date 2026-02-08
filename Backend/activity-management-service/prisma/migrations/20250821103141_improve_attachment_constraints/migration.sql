/*
  Warnings:

  - A unique constraint covering the columns `[emailId,filename,size]` on the table `Attachment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Attachment_emailId_filename_key";

-- CreateIndex
CREATE UNIQUE INDEX "Attachment_emailId_filename_size_key" ON "public"."Attachment"("emailId", "filename", "size");
