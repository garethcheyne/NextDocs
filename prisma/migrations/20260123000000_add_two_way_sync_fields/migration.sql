-- Add two-way sync tracking fields to FeatureRequest table

-- Add localUpdatedAt with default value for existing rows
ALTER TABLE "FeatureRequest" 
ADD COLUMN "localUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW();

-- Add other sync tracking fields (nullable)
ALTER TABLE "FeatureRequest" 
ADD COLUMN "externalUpdatedAt" TIMESTAMP(3),
ADD COLUMN "lastSyncedTitle" TEXT,
ADD COLUMN "lastSyncedDesc" TEXT,
ADD COLUMN "syncConflict" BOOLEAN NOT NULL DEFAULT false;

-- Set localUpdatedAt to match updatedAt for existing rows
UPDATE "FeatureRequest" 
SET "localUpdatedAt" = "updatedAt"
WHERE "localUpdatedAt" = NOW();
