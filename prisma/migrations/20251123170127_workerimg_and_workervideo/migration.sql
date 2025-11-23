/*
  Warnings:

  - Added the required column `name` to the `ReviewImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `ReviewVideo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReviewImage" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ReviewVideo" ADD COLUMN     "name" TEXT NOT NULL;
