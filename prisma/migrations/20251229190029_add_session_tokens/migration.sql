-- CreateTable
CREATE TABLE "ClientSession" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerSession" (
    "id" SERIAL NOT NULL,
    "workerId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkerSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientSession_tokenHash_key" ON "ClientSession"("tokenHash");

-- CreateIndex
CREATE INDEX "ClientSession_clientId_idx" ON "ClientSession"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkerSession_tokenHash_key" ON "WorkerSession"("tokenHash");

-- CreateIndex
CREATE INDEX "WorkerSession_workerId_idx" ON "WorkerSession"("workerId");

-- AddForeignKey
ALTER TABLE "ClientSession" ADD CONSTRAINT "ClientSession_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client_User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerSession" ADD CONSTRAINT "WorkerSession_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker_User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
