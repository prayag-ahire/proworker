/*
  Warnings:

  - Changed the type of `Work_Status` on the `WorkerOrder` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Worker" ADD COLUMN     "Active_Status" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "WorkerOrder" DROP COLUMN "Work_Status",
ADD COLUMN     "Work_Status" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "public"."Status";

-- CreateTable
CREATE TABLE "Status" (
    "id" SERIAL NOT NULL,
    "status_name" TEXT NOT NULL,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Status_status_name_key" ON "Status"("status_name");
