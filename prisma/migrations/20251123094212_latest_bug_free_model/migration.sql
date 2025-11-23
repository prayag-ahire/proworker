/*
  Warnings:

  - You are about to drop the column `Contect_number` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `Worker_Settings_Id` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `Client_Id` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `Order_Id` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `worker_Id` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `Contect_number` on the `Worker` table. All the data in the column will be lost.
  - You are about to drop the column `Reference_Id` on the `Worker` table. All the data in the column will be lost.
  - You are about to drop the `Client_Settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Month_Schedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Review_Image` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Review_Video` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Training_Video` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Week_Schedule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Worker_Order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Worker_Settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Worker_Training` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `worker_Video` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `worker_image` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[Contact_number]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workerSettingsId]` on the table `Location` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[Contact_number]` on the table `Worker` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `Contact_number` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Password` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workerSettingsId` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workerId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Contact_number` to the `Worker` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Password` to the `Worker` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ReferenceId` to the `Worker` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AppLanguage" AS ENUM ('English', 'Hindi', 'Marathi', 'Gujarati');

-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'rescheduled';

-- DropForeignKey
ALTER TABLE "public"."Client_Settings" DROP CONSTRAINT "Client_Settings_Client_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Location" DROP CONSTRAINT "Location_Worker_Settings_Id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Month_Schedule" DROP CONSTRAINT "Month_Schedule_Worker_Id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_Client_Id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_Order_Id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_worker_Id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review_Image" DROP CONSTRAINT "Review_Image_review_Id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review_Image" DROP CONSTRAINT "Review_Image_worker_Id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review_Video" DROP CONSTRAINT "Review_Video_review_Id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Review_Video" DROP CONSTRAINT "Review_Video_worker_Id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Week_Schedule" DROP CONSTRAINT "Week_Schedule_Worker_Id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Worker_Order" DROP CONSTRAINT "Worker_Order_Client_Id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Worker_Order" DROP CONSTRAINT "Worker_Order_worker_Id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Worker_Settings" DROP CONSTRAINT "Worker_Settings_Worker_Id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Worker_Training" DROP CONSTRAINT "Worker_Training_Worker_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Worker_Training" DROP CONSTRAINT "Worker_Training_videoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."worker_Video" DROP CONSTRAINT "worker_Video_worker_Id_fkey";

-- DropForeignKey
ALTER TABLE "public"."worker_image" DROP CONSTRAINT "worker_image_worker_Id_fkey";

-- DropIndex
DROP INDEX "public"."Location_Worker_Settings_Id_key";

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "Contect_number",
ADD COLUMN     "Contact_number" BIGINT NOT NULL,
ADD COLUMN     "Password" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "Worker_Settings_Id",
ADD COLUMN     "workerSettingsId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "Client_Id",
DROP COLUMN "Order_Id",
DROP COLUMN "worker_Id",
ADD COLUMN     "clientId" INTEGER NOT NULL,
ADD COLUMN     "orderId" INTEGER NOT NULL,
ADD COLUMN     "workerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Worker" DROP COLUMN "Contect_number",
DROP COLUMN "Reference_Id",
ADD COLUMN     "Contact_number" BIGINT NOT NULL,
ADD COLUMN     "Password" TEXT NOT NULL,
ADD COLUMN     "ReferenceId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."Client_Settings";

-- DropTable
DROP TABLE "public"."Month_Schedule";

-- DropTable
DROP TABLE "public"."Review_Image";

-- DropTable
DROP TABLE "public"."Review_Video";

-- DropTable
DROP TABLE "public"."Training_Video";

-- DropTable
DROP TABLE "public"."Week_Schedule";

-- DropTable
DROP TABLE "public"."Worker_Order";

-- DropTable
DROP TABLE "public"."Worker_Settings";

-- DropTable
DROP TABLE "public"."Worker_Training";

-- DropTable
DROP TABLE "public"."worker_Video";

-- DropTable
DROP TABLE "public"."worker_image";

-- DropEnum
DROP TYPE "public"."App_Language";

-- CreateTable
CREATE TABLE "ClientSettings" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "ReferCode" INTEGER NOT NULL,
    "ReferenceId" INTEGER NOT NULL,
    "AppLanguage" "AppLanguage" NOT NULL,

    CONSTRAINT "ClientSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerSettings" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "AppLanguage" "AppLanguage" NOT NULL,
    "ReferCode" INTEGER NOT NULL,
    "ReferenceId" INTEGER NOT NULL,

    CONSTRAINT "WorkerSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeekSchedule" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "Start_Sunday" TIME,
    "End_Sunday" TIME,
    "Start_Monday" TIME,
    "End_Monday" TIME,
    "Start_Tuesday" TIME,
    "End_Tuesday" TIME,
    "Start_Wednesday" TIME,
    "End_Wednesday" TIME,
    "Start_Thursday" TIME,
    "End_Thursday" TIME,
    "Start_Friday" TIME,
    "End_Friday" TIME,
    "Start_Saturday" TIME,
    "End_Saturday" TIME,

    CONSTRAINT "WeekSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthSchedule" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "note" TEXT,

    CONSTRAINT "MonthSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerTraining" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "videoId" INTEGER NOT NULL,
    "Status" BOOLEAN NOT NULL,

    CONSTRAINT "WorkerTraining_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingVideo" (
    "id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Video_URL" TEXT NOT NULL,

    CONSTRAINT "TrainingVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerOrder" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "Work_Status" "Status" NOT NULL,
    "date" DATE NOT NULL,
    "time" TIME NOT NULL,
    "reschedule_comment" TEXT,

    CONSTRAINT "WorkerOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerImage" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "img_URL" TEXT NOT NULL,

    CONSTRAINT "WorkerImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerVideo" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "Name" TEXT NOT NULL,
    "Video_URL" TEXT NOT NULL,

    CONSTRAINT "WorkerVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewImage" (
    "id" SERIAL NOT NULL,
    "reviewId" INTEGER NOT NULL,
    "img_URL" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,

    CONSTRAINT "ReviewImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewVideo" (
    "id" SERIAL NOT NULL,
    "reviewId" INTEGER NOT NULL,
    "video_URL" TEXT NOT NULL,
    "workerId" INTEGER NOT NULL,

    CONSTRAINT "ReviewVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientSettings_clientId_key" ON "ClientSettings"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkerSettings_workerId_key" ON "WorkerSettings"("workerId");

-- CreateIndex
CREATE UNIQUE INDEX "WeekSchedule_workerId_key" ON "WeekSchedule"("workerId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_Contact_number_key" ON "Client"("Contact_number");

-- CreateIndex
CREATE UNIQUE INDEX "Location_workerSettingsId_key" ON "Location"("workerSettingsId");

-- CreateIndex
CREATE UNIQUE INDEX "Worker_Contact_number_key" ON "Worker"("Contact_number");

-- AddForeignKey
ALTER TABLE "ClientSettings" ADD CONSTRAINT "ClientSettings_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerSettings" ADD CONSTRAINT "WorkerSettings_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_workerSettingsId_fkey" FOREIGN KEY ("workerSettingsId") REFERENCES "WorkerSettings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeekSchedule" ADD CONSTRAINT "WeekSchedule_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthSchedule" ADD CONSTRAINT "MonthSchedule_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerTraining" ADD CONSTRAINT "WorkerTraining_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerTraining" ADD CONSTRAINT "WorkerTraining_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "TrainingVideo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerOrder" ADD CONSTRAINT "WorkerOrder_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerOrder" ADD CONSTRAINT "WorkerOrder_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerImage" ADD CONSTRAINT "WorkerImage_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerVideo" ADD CONSTRAINT "WorkerVideo_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "WorkerOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewImage" ADD CONSTRAINT "ReviewImage_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewImage" ADD CONSTRAINT "ReviewImage_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewVideo" ADD CONSTRAINT "ReviewVideo_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewVideo" ADD CONSTRAINT "ReviewVideo_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
