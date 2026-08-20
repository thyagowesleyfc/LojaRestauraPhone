-- CreateTable
CREATE TABLE "Characteristic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Characteristic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacteristicOption" (
    "id" TEXT NOT NULL,
    "characteristicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacteristicOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryCharacteristic" (
    "categoryId" TEXT NOT NULL,
    "characteristicId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CategoryCharacteristic_pkey" PRIMARY KEY ("categoryId","characteristicId")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "optionSignature" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariantValue" (
    "productVariantId" TEXT NOT NULL,
    "characteristicId" TEXT NOT NULL,
    "characteristicOptionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductVariantValue_pkey" PRIMARY KEY ("productVariantId","characteristicId")
);

-- CreateTable
CREATE TABLE "ProductVariantImage" (
    "id" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "altText" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductVariantImage_pkey" PRIMARY KEY ("id")
);

-- CreateCheck
ALTER TABLE "Characteristic" ADD CONSTRAINT "Characteristic_name_not_empty_check" CHECK (length(trim("name")) > 0);

-- CreateCheck
ALTER TABLE "Characteristic" ADD CONSTRAINT "Characteristic_slug_not_empty_check" CHECK (length(trim("slug")) > 0);

-- CreateCheck
ALTER TABLE "CharacteristicOption" ADD CONSTRAINT "CharacteristicOption_name_not_empty_check" CHECK (length(trim("name")) > 0);

-- CreateCheck
ALTER TABLE "CharacteristicOption" ADD CONSTRAINT "CharacteristicOption_slug_not_empty_check" CHECK (length(trim("slug")) > 0);

-- CreateCheck
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_sku_not_empty_check" CHECK (length(trim("sku")) > 0);

-- CreateCheck
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_optionSignature_not_empty_check" CHECK (length(trim("optionSignature")) > 0);

-- CreateCheck
ALTER TABLE "ProductVariantImage" ADD CONSTRAINT "ProductVariantImage_url_not_empty_check" CHECK (length(trim("url")) > 0);

-- CreateCheck
ALTER TABLE "ProductVariantImage" ADD CONSTRAINT "ProductVariantImage_publicId_not_empty_check" CHECK (length(trim("publicId")) > 0);

-- CreateIndex
CREATE UNIQUE INDEX "Characteristic_name_key" ON "Characteristic"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Characteristic_slug_key" ON "Characteristic"("slug");

-- CreateIndex
CREATE INDEX "Characteristic_active_displayOrder_idx" ON "Characteristic"("active", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CharacteristicOption_characteristicId_name_key" ON "CharacteristicOption"("characteristicId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "CharacteristicOption_characteristicId_slug_key" ON "CharacteristicOption"("characteristicId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "CharacteristicOption_id_characteristicId_key" ON "CharacteristicOption"("id", "characteristicId");

-- CreateIndex
CREATE INDEX "CharacteristicOption_characteristicId_active_displayOrder_idx" ON "CharacteristicOption"("characteristicId", "active", "displayOrder");

-- CreateIndex
CREATE INDEX "CategoryCharacteristic_categoryId_displayOrder_idx" ON "CategoryCharacteristic"("categoryId", "displayOrder");

-- CreateIndex
CREATE INDEX "CategoryCharacteristic_characteristicId_idx" ON "CategoryCharacteristic"("characteristicId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_productId_optionSignature_key" ON "ProductVariant"("productId", "optionSignature");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_active_idx" ON "ProductVariant"("productId", "active");

-- CreateIndex
CREATE INDEX "ProductVariant_active_idx" ON "ProductVariant"("active");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariantValue_productVariantId_characteristicOptionId_key" ON "ProductVariantValue"("productVariantId", "characteristicOptionId");

-- CreateIndex
CREATE INDEX "ProductVariantValue_characteristicId_idx" ON "ProductVariantValue"("characteristicId");

-- CreateIndex
CREATE INDEX "ProductVariantValue_characteristicOptionId_idx" ON "ProductVariantValue"("characteristicOptionId");

-- CreateIndex
CREATE INDEX "ProductVariantImage_productVariantId_displayOrder_idx" ON "ProductVariantImage"("productVariantId", "displayOrder");

-- AddForeignKey
ALTER TABLE "CharacteristicOption" ADD CONSTRAINT "CharacteristicOption_characteristicId_fkey" FOREIGN KEY ("characteristicId") REFERENCES "Characteristic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryCharacteristic" ADD CONSTRAINT "CategoryCharacteristic_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryCharacteristic" ADD CONSTRAINT "CategoryCharacteristic_characteristicId_fkey" FOREIGN KEY ("characteristicId") REFERENCES "Characteristic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantValue" ADD CONSTRAINT "ProductVariantValue_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantValue" ADD CONSTRAINT "ProductVariantValue_characteristicId_fkey" FOREIGN KEY ("characteristicId") REFERENCES "Characteristic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantValue" ADD CONSTRAINT "ProductVariantValue_characteristicOptionId_characteristicId_fkey" FOREIGN KEY ("characteristicOptionId", "characteristicId") REFERENCES "CharacteristicOption"("id", "characteristicId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantImage" ADD CONSTRAINT "ProductVariantImage_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;