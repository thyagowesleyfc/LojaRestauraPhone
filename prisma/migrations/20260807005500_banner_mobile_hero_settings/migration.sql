ALTER TABLE "Banner"
  ADD COLUMN "mobileImageUrl" TEXT,
  ADD COLUMN "mobileImagePublicId" TEXT;

ALTER TABLE "StoreSettings"
  ADD COLUMN "bannerTransitionSeconds" INTEGER NOT NULL DEFAULT 5;