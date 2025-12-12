-- CreateFeatureInternalNote and add new fields to FeatureRequest
-- Add new fields to FeatureRequest
ALTER TABLE "FeatureRequest" ADD COLUMN "isPinned" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "FeatureRequest" ADD COLUMN "isArchived" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "FeatureRequest" ADD COLUMN "commentsLocked" BOOLEAN NOT NULL DEFAULT false;

-- Create index for isPinned and isArchived for faster queries
CREATE INDEX "FeatureRequest_isPinned_idx" ON "FeatureRequest"("isPinned");
CREATE INDEX "FeatureRequest_isArchived_idx" ON "FeatureRequest"("isArchived");

-- CreateFeatureInternalNote table
CREATE TABLE "FeatureInternalNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "featureId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FeatureInternalNote_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "FeatureRequest" ("id") ON DELETE CASCADE,
    CONSTRAINT "FeatureInternalNote_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT
);

-- Create indices for FeatureInternalNote
CREATE INDEX "FeatureInternalNote_featureId_idx" ON "FeatureInternalNote"("featureId");
CREATE INDEX "FeatureInternalNote_createdBy_idx" ON "FeatureInternalNote"("createdBy");
