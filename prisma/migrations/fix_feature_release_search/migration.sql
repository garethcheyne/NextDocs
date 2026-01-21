-- Fix search vectors for FeatureRequest and Release tables
-- This adds the missing GIN indexes, trigger functions, and initial data population

-- Add searchVector column to Release table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Release' AND column_name = 'searchVector'
    ) THEN
        ALTER TABLE "Release" ADD COLUMN "searchVector" tsvector;
    END IF;
END $$;

-- Create GIN indexes for fast full-text search
CREATE INDEX CONCURRENTLY IF NOT EXISTS "FeatureRequest_searchVector_idx"
ON "FeatureRequest" USING GIN("searchVector");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "Release_searchVector_idx"
ON "Release" USING GIN("searchVector");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "APISpec_searchVector_idx"
ON "APISpec" USING GIN("searchVector");

-- Initialize search vectors for existing feature requests
UPDATE "FeatureRequest"
SET "searchVector" = to_tsvector('english',
    concat_ws(' ',
        "title", "title", "title",  -- Weight title 3x
        COALESCE("description", ''),
        "slug"
    )
)
WHERE "searchVector" IS NULL;

-- Initialize search vectors for existing releases
UPDATE "Release"
SET "searchVector" = to_tsvector('english',
    concat_ws(' ',
        COALESCE("title", ''), COALESCE("title", ''), COALESCE("title", ''),  -- Weight title 3x
        "version",
        COALESCE("content", '')
    )
)
WHERE "searchVector" IS NULL;

-- Initialize search vectors for existing API specs
UPDATE "APISpec"
SET "searchVector" = to_tsvector('english',
    concat_ws(' ',
        "name", "name", "name",  -- Weight name 3x
        COALESCE("description", ''),
        "slug",
        "version"
    )
)
WHERE "searchVector" IS NULL;

-- Create trigger function to auto-update search vectors for FeatureRequest
CREATE OR REPLACE FUNCTION update_feature_request_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW."searchVector" = to_tsvector('english',
        concat_ws(' ',
            NEW."title", NEW."title", NEW."title",
            COALESCE(NEW."description", ''),
            NEW."slug"
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to auto-update search vectors for Release
CREATE OR REPLACE FUNCTION update_release_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW."searchVector" = to_tsvector('english',
        concat_ws(' ',
            COALESCE(NEW."title", ''), COALESCE(NEW."title", ''), COALESCE(NEW."title", ''),
            NEW."version",
            COALESCE(NEW."content", '')
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to auto-update search vectors for APISpec
CREATE OR REPLACE FUNCTION update_api_spec_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW."searchVector" = to_tsvector('english',
        concat_ws(' ',
            NEW."name", NEW."name", NEW."name",
            COALESCE(NEW."description", ''),
            NEW."slug",
            NEW."version"
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for FeatureRequest
DROP TRIGGER IF EXISTS feature_request_search_vector_update ON "FeatureRequest";
CREATE TRIGGER feature_request_search_vector_update
BEFORE INSERT OR UPDATE ON "FeatureRequest"
FOR EACH ROW
EXECUTE FUNCTION update_feature_request_search_vector();

-- Create triggers for Release
DROP TRIGGER IF EXISTS release_search_vector_update ON "Release";
CREATE TRIGGER release_search_vector_update
BEFORE INSERT OR UPDATE ON "Release"
FOR EACH ROW
EXECUTE FUNCTION update_release_search_vector();

-- Create triggers for APISpec
DROP TRIGGER IF EXISTS api_spec_search_vector_update ON "APISpec";
CREATE TRIGGER api_spec_search_vector_update
BEFORE INSERT OR UPDATE ON "APISpec"
FOR EACH ROW
EXECUTE FUNCTION update_api_spec_search_vector();
