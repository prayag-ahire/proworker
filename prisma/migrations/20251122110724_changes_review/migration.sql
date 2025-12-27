/*
  Warnings:

  - Added the required column `date` to the `Month_Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Order_Id` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Month_Schedule" ADD COLUMN     "date" DATE NOT NULL,
ADD COLUMN     "note" TEXT;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "Order_Id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Week_Schedule" ALTER COLUMN "Start_Sunday" DROP NOT NULL,
ALTER COLUMN "End_Sunday" DROP NOT NULL,
ALTER COLUMN "Start_Monday" DROP NOT NULL,
ALTER COLUMN "End_Monday" DROP NOT NULL,
ALTER COLUMN "Start_Tuesday" DROP NOT NULL,
ALTER COLUMN "End_Tuesday" DROP NOT NULL,
ALTER COLUMN "Start_wednesday" DROP NOT NULL,
ALTER COLUMN "End_wednesday" DROP NOT NULL,
ALTER COLUMN "Start_thursday" DROP NOT NULL,
ALTER COLUMN "End_thursday" DROP NOT NULL,
ALTER COLUMN "Start_friday" DROP NOT NULL,
ALTER COLUMN "End_friday" DROP NOT NULL,
ALTER COLUMN "Start_saturday" DROP NOT NULL,
ALTER COLUMN "End_saturday" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Worker_Order" ADD COLUMN     "reschedule_comment" TEXT;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_Order_Id_fkey" FOREIGN KEY ("Order_Id") REFERENCES "Worker_Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
