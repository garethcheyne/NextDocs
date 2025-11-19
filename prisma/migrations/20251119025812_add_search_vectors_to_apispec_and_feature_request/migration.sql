-- AlterTable
ALTER TABLE "APISpec" ADD COLUMN     "searchVector" tsvector;

-- AlterTable
ALTER TABLE "FeatureRequest" ADD COLUMN     "searchVector" tsvector;
