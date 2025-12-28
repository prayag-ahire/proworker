/*
  Warnings:

  - A unique constraint covering the columns `[Email]` on the table `Worker` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `Age` to the `Worker` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Email` to the `Worker` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Worker` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "gender" AS ENUM ('MALE', 'Female');

-- AlterTable
ALTER TABLE "Worker" ADD COLUMN     "Age" INTEGER NOT NULL,
ADD COLUMN     "Email" TEXT NOT NULL,
ADD COLUMN     "gender" "gender" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Worker_Email_key" ON "Worker"("Email");
