/*
  Warnings:

  - You are about to drop the column `Contact_number` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `Password` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `Charges_PerHour` on the `Worker` table. All the data in the column will be lost.
  - You are about to drop the column `Contact_number` on the `Worker` table. All the data in the column will be lost.
  - You are about to drop the column `Name` on the `Worker` table. All the data in the column will be lost.
  - You are about to drop the column `Password` on the `Worker` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Worker` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `age` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Worker` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Worker` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `Worker` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'Other');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- DropForeignKey
ALTER TABLE "public"."ClientSettings" DROP CONSTRAINT "ClientSettings_clientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkerSettings" DROP CONSTRAINT "WorkerSettings_workerId_fkey";

-- DropIndex
DROP INDEX "public"."Client_Contact_number_key";

-- DropIndex
DROP INDEX "public"."Worker_Contact_number_key";

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "Contact_number",
DROP COLUMN "Password",
DROP COLUMN "name",
ADD COLUMN     "Active_Status" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "age" INTEGER NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "gender" "Gender" NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Worker" DROP COLUMN "Charges_PerHour",
DROP COLUMN "Contact_number",
DROP COLUMN "Name",
DROP COLUMN "Password",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL,
ALTER COLUMN "Rating" SET DEFAULT 0.0,
ALTER COLUMN "ReferCode" DROP NOT NULL,
ALTER COLUMN "ReferenceId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Client_User" (
    "id" SERIAL NOT NULL,
    "phone_no" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "Profile_Completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Worker_User" (
    "id" SERIAL NOT NULL,
    "phone_no" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profileCompleted" BOOLEAN NOT NULL DEFAULT false,
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Worker_User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_User_phone_no_key" ON "Client_User"("phone_no");

-- CreateIndex
CREATE UNIQUE INDEX "Worker_User_phone_no_key" ON "Worker_User"("phone_no");

-- CreateIndex
CREATE UNIQUE INDEX "Client_userId_key" ON "Client"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Worker_userId_key" ON "Worker"("userId");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Client_User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientSettings" ADD CONSTRAINT "ClientSettings_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client_User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Worker_User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerSettings" ADD CONSTRAINT "WorkerSettings_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker_User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
