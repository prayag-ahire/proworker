-- DropForeignKey
ALTER TABLE "public"."ClientSettings" DROP CONSTRAINT "ClientSettings_clientId_fkey";

-- AddForeignKey
ALTER TABLE "ClientSettings" ADD CONSTRAINT "ClientSettings_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
