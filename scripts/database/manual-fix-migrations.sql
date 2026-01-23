-- Manual fix for failed migrations
-- Run this directly on your production database if the automatic fix doesn't work

-- Step 1: Mark the failed migration as applied
UPDATE "_prisma_migrations" 
SET finished_at = NOW(), 
    logs = 'Manually resolved - fixed CREATE INDEX CONCURRENTLY issue'
WHERE migration_name = 'fix_feature_release_search' 
AND finished_at IS NULL;

-- Step 2: Apply the two-way sync fields migration manually if needed
-- Add localUpdatedAt with default value for existing rows
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'FeatureRequest' AND column_name = 'localUpdatedAt'
    ) THEN
        ALTER TABLE "FeatureRequest" 
        ADD COLUMN "localUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW();
        
        -- Set localUpdatedAt to match updatedAt for existing rows
        UPDATE "FeatureRequest" 
        SET "localUpdatedAt" = "updatedAt";
    END IF;
END $$;

-- Add other sync tracking fields (nullable)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'FeatureRequest' AND column_name = 'externalUpdatedAt'
    ) THEN
        ALTER TABLE "FeatureRequest" 
        ADD COLUMN "externalUpdatedAt" TIMESTAMP(3),
        ADD COLUMN "lastSyncedTitle" TEXT,
        ADD COLUMN "lastSyncedDesc" TEXT,
        ADD COLUMN "syncConflict" BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'FeatureRequest'
AND column_name IN ('localUpdatedAt', 'externalUpdatedAt', 'lastSyncedTitle', 'lastSyncedDesc', 'syncConflict')
ORDER BY column_name;
