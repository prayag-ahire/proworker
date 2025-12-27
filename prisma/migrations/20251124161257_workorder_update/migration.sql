/*
  Warnings:

  - You are about to drop the column `Work_Status` on the `WorkerOrder` table. All the data in the column will be lost.
  - Added the required column `Order_Status` to the `WorkerOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkerOrder" DROP COLUMN "Work_Status",
ADD COLUMN     "Order_Status" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "WorkerOrder" ADD CONSTRAINT "WorkerOrder_Order_Status_fkey" FOREIGN KEY ("Order_Status") REFERENCES "Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
