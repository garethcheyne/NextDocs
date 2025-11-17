-- AlterTable
ALTER TABLE "CategoryMetadata" ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "parentSlug" TEXT;

-- CreateIndex
CREATE INDEX "CategoryMetadata_parentSlug_idx" ON "CategoryMetadata"("parentSlug");
