/*
  Warnings:

  - Added the required column `profession` to the `Worker` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Worker" ADD COLUMN     "profession" TEXT NOT NULL;
