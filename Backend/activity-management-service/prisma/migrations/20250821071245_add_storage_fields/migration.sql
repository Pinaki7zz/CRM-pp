-- AlterTable
ALTER TABLE "public"."Attachment" ADD COLUMN     "downloadUrl" TEXT,
ADD COLUMN     "sharePointId" TEXT,
ADD COLUMN     "storageProvider" TEXT NOT NULL DEFAULT 'local';
