-- AlterTable
-- Remove autoCreateOnApproval column from FeatureCategory table
-- This feature has been removed - admins must manually create work items
ALTER TABLE "FeatureCategory" DROP COLUMN IF EXISTS "autoCreateOnApproval";
