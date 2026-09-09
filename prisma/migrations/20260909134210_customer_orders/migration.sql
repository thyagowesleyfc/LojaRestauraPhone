-- CreateEnum
CREATE TYPE "OrderItemType" AS ENUM ('PRODUCT', 'VARIANT', 'COMBO');

-- CreateTable
CREATE TABLE "CustomerOrder" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "sessionId" TEXT,
    "totalInCents" INTEGER NOT NULL,
    "whatsappMessage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerOrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" "OrderItemType" NOT NULL,
    "sourceProductId" TEXT,
    "sourceProductVariantId" TEXT,
    "sourcePromotionId" TEXT,
    "description" TEXT NOT NULL,
    "detail" TEXT,
    "sku" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPriceInCents" INTEGER NOT NULL,
    "subtotalInCents" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerOrder_code_key" ON "CustomerOrder"("code");

-- CreateIndex
CREATE INDEX "CustomerOrder_createdAt_idx" ON "CustomerOrder"("createdAt");

-- CreateIndex
CREATE INDEX "CustomerOrder_sessionId_createdAt_idx" ON "CustomerOrder"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "CustomerOrderItem_orderId_idx" ON "CustomerOrderItem"("orderId");

-- CreateIndex
CREATE INDEX "CustomerOrderItem_type_idx" ON "CustomerOrderItem"("type");

-- CreateIndex
CREATE INDEX "CustomerOrderItem_sourceProductId_idx" ON "CustomerOrderItem"("sourceProductId");

-- CreateIndex
CREATE INDEX "CustomerOrderItem_sourceProductVariantId_idx" ON "CustomerOrderItem"("sourceProductVariantId");

-- CreateIndex
CREATE INDEX "CustomerOrderItem_sourcePromotionId_idx" ON "CustomerOrderItem"("sourcePromotionId");

-- AddForeignKey
ALTER TABLE "CustomerOrderItem" ADD CONSTRAINT "CustomerOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "CustomerOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
