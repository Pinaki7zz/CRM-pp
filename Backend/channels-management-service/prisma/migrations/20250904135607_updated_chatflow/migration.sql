-- AlterTable
ALTER TABLE "public"."messages" ALTER COLUMN "status" SET DEFAULT 'delivered';

-- AddForeignKey
ALTER TABLE "public"."chat_sessions" ADD CONSTRAINT "chat_sessions_chatflowId_fkey" FOREIGN KEY ("chatflowId") REFERENCES "public"."chatflows"("id") ON DELETE SET NULL ON UPDATE CASCADE;
