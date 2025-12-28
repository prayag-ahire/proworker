/*
  Warnings:

  - Added the required column `Distance_charges` to the `Worker` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Worker" ADD COLUMN     "Distance_charges" INTEGER NOT NULL;
