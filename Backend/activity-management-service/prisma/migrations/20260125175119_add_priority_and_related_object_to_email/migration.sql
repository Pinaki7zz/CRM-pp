-- AlterEnum
ALTER TYPE "Priority" ADD VALUE 'NORMAL';

-- AlterTable
ALTER TABLE "emails" ADD COLUMN     "priority" "Priority" DEFAULT 'NORMAL',
ADD COLUMN     "relatedObject" TEXT;
