-- Add support for multiple images per post
ALTER TABLE "Post"
ADD COLUMN "imagemUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Backfill existing single image into the new array field
UPDATE "Post"
SET "imagemUrls" = ARRAY["imagemUrl"]
WHERE "imagemUrl" IS NOT NULL AND "imagemUrl" <> '';
