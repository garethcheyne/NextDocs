#!/bin/sh
# PostgreSQL initialization script
# This script runs when the container is first created

echo "Initializing NextDocs database..."

# Set optimal PostgreSQL settings for production
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Enable necessary extensions
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
    CREATE EXTENSION IF NOT EXISTS btree_gin;
    
    -- Set performance parameters
    ALTER SYSTEM SET shared_buffers = '256MB';
    ALTER SYSTEM SET effective_cache_size = '1GB';
    ALTER SYSTEM SET maintenance_work_mem = '64MB';
    ALTER SYSTEM SET checkpoint_completion_target = 0.9;
    ALTER SYSTEM SET wal_buffers = '16MB';
    ALTER SYSTEM SET default_statistics_target = 100;
    ALTER SYSTEM SET random_page_cost = 1.1;
    ALTER SYSTEM SET effective_io_concurrency = 200;
    ALTER SYSTEM SET work_mem = '16MB';
    ALTER SYSTEM SET min_wal_size = '1GB';
    ALTER SYSTEM SET max_wal_size = '4GB';
    
    -- Log settings
    ALTER SYSTEM SET log_statement = 'ddl';
    ALTER SYSTEM SET log_duration = on;
    ALTER SYSTEM SET log_min_duration_statement = 1000;
EOSQL

echo "Database initialization complete!"
