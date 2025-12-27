/*
  Warnings:

  - You are about to drop the column `img_URL` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `video_URL` on the `Review` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Review" DROP COLUMN "img_URL",
DROP COLUMN "video_URL",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Review_Image" (
    "id" SERIAL NOT NULL,
    "review_Id" INTEGER NOT NULL,
    "img_URL" TEXT NOT NULL,
    "worker_Id" INTEGER NOT NULL,

    CONSTRAINT "Review_Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review_Video" (
    "id" SERIAL NOT NULL,
    "review_Id" INTEGER NOT NULL,
    "video_URL" TEXT NOT NULL,
    "worker_Id" INTEGER NOT NULL,

    CONSTRAINT "Review_Video_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Review_Image" ADD CONSTRAINT "Review_Image_review_Id_fkey" FOREIGN KEY ("review_Id") REFERENCES "Review"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review_Image" ADD CONSTRAINT "Review_Image_worker_Id_fkey" FOREIGN KEY ("worker_Id") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review_Video" ADD CONSTRAINT "Review_Video_review_Id_fkey" FOREIGN KEY ("review_Id") REFERENCES "Review"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review_Video" ADD CONSTRAINT "Review_Video_worker_Id_fkey" FOREIGN KEY ("worker_Id") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
