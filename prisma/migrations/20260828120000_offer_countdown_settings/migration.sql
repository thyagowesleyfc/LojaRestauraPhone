ALTER TABLE "StoreSettings"
  ADD COLUMN "offerCountdownHeadline" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "offerCountdownLink" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "offerCountdownDurationSeconds" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "offerCountdownBackgroundColor" TEXT NOT NULL DEFAULT '#16a34a';

ALTER TABLE "StoreSettings" ADD CONSTRAINT "StoreSettings_offerCountdownDurationSeconds_range_check" CHECK ("offerCountdownDurationSeconds" >= 0 AND "offerCountdownDurationSeconds" <= 604800);

ALTER TABLE "StoreSettings" ADD CONSTRAINT "StoreSettings_offerCountdownBackgroundColor_hex_check" CHECK ("offerCountdownBackgroundColor" ~ '^#[0-9A-Fa-f]{6}$');