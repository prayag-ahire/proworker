-- DropForeignKey
ALTER TABLE "public"."WorkerSettings" DROP CONSTRAINT "WorkerSettings_workerId_fkey";

-- AddForeignKey
ALTER TABLE "WorkerSettings" ADD CONSTRAINT "WorkerSettings_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
