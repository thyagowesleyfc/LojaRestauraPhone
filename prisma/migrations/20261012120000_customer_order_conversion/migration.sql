-- AlterTable
ALTER TABLE "CustomerOrder" ADD COLUMN "converted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "CustomerOrder_converted_createdAt_idx" ON "CustomerOrder"("converted", "createdAt");