-- CreateCheck
ALTER TABLE "CustomerOrder" ADD CONSTRAINT "CustomerOrder_code_format_check" CHECK ("code" ~ '^[A-Z0-9]{10}$');

-- CreateCheck
ALTER TABLE "CustomerOrder" ADD CONSTRAINT "CustomerOrder_totalInCents_non_negative_check" CHECK ("totalInCents" >= 0);

-- CreateCheck
ALTER TABLE "CustomerOrderItem" ADD CONSTRAINT "CustomerOrderItem_quantity_positive_check" CHECK ("quantity" > 0);

-- CreateCheck
ALTER TABLE "CustomerOrderItem" ADD CONSTRAINT "CustomerOrderItem_unitPriceInCents_non_negative_check" CHECK ("unitPriceInCents" >= 0);

-- CreateCheck
ALTER TABLE "CustomerOrderItem" ADD CONSTRAINT "CustomerOrderItem_subtotalInCents_non_negative_check" CHECK ("subtotalInCents" >= 0);

-- CreateCheck
ALTER TABLE "CustomerOrderItem" ADD CONSTRAINT "CustomerOrderItem_source_by_type_check" CHECK (
    (
        "type" = 'PRODUCT'
        AND "sourceProductId" IS NOT NULL
        AND "sourceProductVariantId" IS NULL
        AND "sourcePromotionId" IS NULL
    )
    OR
    (
        "type" = 'VARIANT'
        AND "sourceProductVariantId" IS NOT NULL
        AND "sourcePromotionId" IS NULL
    )
    OR
    (
        "type" = 'COMBO'
        AND "sourceProductId" IS NULL
        AND "sourceProductVariantId" IS NULL
        AND "sourcePromotionId" IS NOT NULL
    )
);