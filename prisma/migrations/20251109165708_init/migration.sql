-- CreateEnum
CREATE TYPE "App_Language" AS ENUM ('English', 'Hindi', 'Marathi', 'Gujarati');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('completed', 'pending', 'canceled');

-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "ImgURL" TEXT NOT NULL,
    "Contect_number" BIGINT NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client_Settings" (
    "id" SERIAL NOT NULL,
    "Client_id" INTEGER NOT NULL,
    "ReferCode" INTEGER NOT NULL,
    "Reference_Id" INTEGER NOT NULL,
    "App_Language" "App_Language" NOT NULL,

    CONSTRAINT "Client_Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Worker" (
    "id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "ImgURL" TEXT NOT NULL,
    "Contect_number" BIGINT NOT NULL,
    "Rating" DECIMAL(65,30) NOT NULL,
    "Description" TEXT NOT NULL,
    "Charges_PerHour" INTEGER NOT NULL,
    "Charges_PerVisit" INTEGER NOT NULL,
    "ReferCode" INTEGER NOT NULL,
    "Reference_Id" INTEGER NOT NULL,

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Worker_Settings" (
    "id" SERIAL NOT NULL,
    "Worker_Id" INTEGER NOT NULL,
    "App_Language" "App_Language" NOT NULL,
    "ReferCode" INTEGER NOT NULL,
    "Reference_Id" INTEGER NOT NULL,

    CONSTRAINT "Worker_Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "Worker_Settings_Id" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Week_Schedule" (
    "id" SERIAL NOT NULL,
    "Worker_Id" INTEGER NOT NULL,
    "Start_Sunday" TIME NOT NULL,
    "End_Sunday" TIME NOT NULL,
    "Start_Monday" TIME NOT NULL,
    "End_Monday" TIME NOT NULL,
    "Start_Tuesday" TIME NOT NULL,
    "End_Tuesday" TIME NOT NULL,
    "Start_wednesday" TIME NOT NULL,
    "End_wednesday" TIME NOT NULL,
    "Start_thursday" TIME NOT NULL,
    "End_thursday" TIME NOT NULL,
    "Start_friday" TIME NOT NULL,
    "End_friday" TIME NOT NULL,
    "Start_saturday" TIME NOT NULL,
    "End_saturday" TIME NOT NULL,

    CONSTRAINT "Week_Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Month_Schedule" (
    "id" SERIAL NOT NULL,
    "Worker_Id" INTEGER NOT NULL,

    CONSTRAINT "Month_Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Worker_Training" (
    "id" SERIAL NOT NULL,
    "Worker_id" INTEGER NOT NULL,
    "videoId" INTEGER NOT NULL,
    "Status" BOOLEAN NOT NULL,

    CONSTRAINT "Worker_Training_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Training_Video" (
    "id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Video_URL" TEXT NOT NULL,

    CONSTRAINT "Training_Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Worker_Order" (
    "id" SERIAL NOT NULL,
    "worker_Id" INTEGER NOT NULL,
    "Client_Id" INTEGER NOT NULL,
    "Work_Status" "Status" NOT NULL,
    "date" DATE NOT NULL,
    "time" TIME NOT NULL,

    CONSTRAINT "Worker_Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_image" (
    "id" SERIAL NOT NULL,
    "worker_Id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "img_URL" TEXT NOT NULL,

    CONSTRAINT "worker_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_Video" (
    "id" SERIAL NOT NULL,
    "worker_Id" INTEGER NOT NULL,
    "Name" TEXT NOT NULL,
    "Video_URL" TEXT NOT NULL,

    CONSTRAINT "worker_Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "img_URL" TEXT,
    "video_URL" TEXT,
    "Comment" TEXT NOT NULL,
    "worker_Id" INTEGER NOT NULL,
    "Client_Id" INTEGER NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_Settings_Client_id_key" ON "Client_Settings"("Client_id");

-- CreateIndex
CREATE UNIQUE INDEX "Worker_Settings_Worker_Id_key" ON "Worker_Settings"("Worker_Id");

-- CreateIndex
CREATE UNIQUE INDEX "Location_Worker_Settings_Id_key" ON "Location"("Worker_Settings_Id");

-- CreateIndex
CREATE UNIQUE INDEX "Week_Schedule_Worker_Id_key" ON "Week_Schedule"("Worker_Id");

-- AddForeignKey
ALTER TABLE "Client_Settings" ADD CONSTRAINT "Client_Settings_Client_id_fkey" FOREIGN KEY ("Client_id") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worker_Settings" ADD CONSTRAINT "Worker_Settings_Worker_Id_fkey" FOREIGN KEY ("Worker_Id") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_Worker_Settings_Id_fkey" FOREIGN KEY ("Worker_Settings_Id") REFERENCES "Worker_Settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Week_Schedule" ADD CONSTRAINT "Week_Schedule_Worker_Id_fkey" FOREIGN KEY ("Worker_Id") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Month_Schedule" ADD CONSTRAINT "Month_Schedule_Worker_Id_fkey" FOREIGN KEY ("Worker_Id") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worker_Training" ADD CONSTRAINT "Worker_Training_Worker_id_fkey" FOREIGN KEY ("Worker_id") REFERENCES "Worker_Settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worker_Training" ADD CONSTRAINT "Worker_Training_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Training_Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worker_Order" ADD CONSTRAINT "Worker_Order_worker_Id_fkey" FOREIGN KEY ("worker_Id") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worker_Order" ADD CONSTRAINT "Worker_Order_Client_Id_fkey" FOREIGN KEY ("Client_Id") REFERENCES "Client_Settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_image" ADD CONSTRAINT "worker_image_worker_Id_fkey" FOREIGN KEY ("worker_Id") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_Video" ADD CONSTRAINT "worker_Video_worker_Id_fkey" FOREIGN KEY ("worker_Id") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_worker_Id_fkey" FOREIGN KEY ("worker_Id") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_Client_Id_fkey" FOREIGN KEY ("Client_Id") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
