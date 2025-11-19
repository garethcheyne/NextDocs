-- Add search vector columns if they don't exist (for PostgreSQL full-text search)
DO $$ 
BEGIN
    -- Add searchVector column to Document table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Document' AND column_name = 'searchVector'
    ) THEN
        ALTER TABLE "Document" ADD COLUMN "searchVector" tsvector;
    END IF;

    -- Add searchVector column to BlogPost table if it doesn't exist  
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'BlogPost' AND column_name = 'searchVector'
    ) THEN
        ALTER TABLE "BlogPost" ADD COLUMN "searchVector" tsvector;
    END IF;
END $$;

-- Create GIN indexes for fast full-text search
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Document_searchVector_idx" 
ON "Document" USING GIN("searchVector");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "BlogPost_searchVector_idx" 
ON "BlogPost" USING GIN("searchVector");

-- Initialize search vectors for existing documents
UPDATE "Document"
SET "searchVector" = to_tsvector('english', 
    concat_ws(' ', 
        "title", "title", "title",  -- Weight title 3x
        COALESCE("excerpt", ''),
        "content",
        array_to_string("tags", ' ')
    )
)
WHERE "searchVector" IS NULL;

-- Initialize search vectors for existing blog posts
UPDATE "BlogPost"
SET "searchVector" = to_tsvector('english',
    concat_ws(' ',
        "title", "title", "title",  -- Weight title 3x
        COALESCE("excerpt", ''),
        "content",
        array_to_string("tags", ' ')
    )
)
WHERE "searchVector" IS NULL;

-- Create trigger functions to auto-update search vectors on insert/update
CREATE OR REPLACE FUNCTION update_document_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW."searchVector" = to_tsvector('english',
        concat_ws(' ',
            NEW."title", NEW."title", NEW."title",
            COALESCE(NEW."excerpt", ''),
            NEW."content",
            array_to_string(NEW."tags", ' ')
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_blog_post_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW."searchVector" = to_tsvector('english',
        concat_ws(' ',
            NEW."title", NEW."title", NEW."title",
            COALESCE(NEW."excerpt", ''),
            NEW."content",
            array_to_string(NEW."tags", ' ')
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS document_search_vector_update ON "Document";
CREATE TRIGGER document_search_vector_update
BEFORE INSERT OR UPDATE ON "Document"
FOR EACH ROW
EXECUTE FUNCTION update_document_search_vector();

DROP TRIGGER IF EXISTS blog_post_search_vector_update ON "BlogPost";
CREATE TRIGGER blog_post_search_vector_update
BEFORE INSERT OR UPDATE ON "BlogPost"
FOR EACH ROW
EXECUTE FUNCTION update_blog_post_search_vector();
