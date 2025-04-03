-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create rat_migration schema
CREATE SCHEMA IF NOT EXISTS rat;

-- A function for updating the modified_date and modified_by columns
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified_date = CURRENT_TIMESTAMP;
    NEW.modified_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create country table
CREATE TABLE dev.country (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_by UUID NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by UUID,
    modified_date TIMESTAMP WITH TIME ZONE
);

-- Create Organisation table
CREATE TABLE dev.organisation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100),
    type VARCHAR(50),
    country_id UUID,
    created_by UUID NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by UUID,
    modified_date TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (country_id) REFERENCES dev.country(id)
);

ALTER TABLE dev.organisation ADD CONSTRAINT organisation_unique UNIQUE (name);

-- Create location table
--ALTER TABLE dev.location ADD CONSTRAINT location_name_key UNIQUE (name);
CREATE TABLE dev.location (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    country_id UUID,
    created_by UUID NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by UUID,
    modified_date TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (country_id) REFERENCES dev.country(id)
);

-- Add check to prevent self-referential routes
-- ADD CONSTRAINT different_locations CHECK (start_location_id != end_location_id);

-- Create Route table
--ALTER TABLE dev.route ADD CONSTRAINT route_name_key UNIQUE (name);
CREATE TABLE dev.route (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    start_location_id UUID,
    end_location_id UUID,
    created_by UUID NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by UUID,
    modified_date TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (start_location_id) REFERENCES dev.location(id),
    FOREIGN KEY (end_location_id) REFERENCES dev.location(id)
);

-- Create collection table
CREATE TABLE dev.collection (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    owner VARCHAR(100),
    donor VARCHAR(100),
    storage_location VARCHAR(100),
    created_by UUID NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by UUID,
    modified_date TIMESTAMP WITH TIME ZONE
);

ALTER TABLE dev.collection ADD CONSTRAINT collection_unique UNIQUE (name);

-- Create Photographer table
CREATE TABLE dev.photographer (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    created_by UUID NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by UUID,
    modified_date TIMESTAMP WITH TIME ZONE
);

ALTER TABLE dev.photographer ADD CONSTRAINT photographer_unique UNIQUE (name);

-- Create Builder table
CREATE TABLE dev.builder (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100),
    location_id UUID,
    plant_code VARCHAR(20),
    builder_plant VARCHAR(100),
    remarks VARCHAR(400),
    created_by UUID NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by UUID,
    modified_date TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (location_id) REFERENCES dev.location(id)
);

ALTER TABLE dev.builder ADD CONSTRAINT builder_unique UNIQUE (code);
--ALTER TABLE dev.builder DROP CONSTRAINT builder_unique;

-- Create Catalog table
CREATE TABLE dev.catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_no VARCHAR(50) UNIQUE NOT NULL,
    accession_no DECIMAL(10,2),
    category VARCHAR(50),
    date_taken DATE,
    circa VARCHAR(50),
    imprecise_date VARCHAR(50),
    description TEXT,
    condition VARCHAR(50),
    valuation DECIMAL(10,2),
    entry_date DATE,
    owners_ref VARCHAR(200),
    cd_no VARCHAR(50),
    cd_no_hr VARCHAR(50),
    BW_image_no VARCHAR(50),
    bw_cd_no VARCHAR(50),
    gauge VARCHAR(20),
    works_number VARCHAR(50),
    year_built VARCHAR(20),
    plant_code VARCHAR(20),
    picture VARCHAR(255),
    active_area VARCHAR(100),
    corporate_body VARCHAR(100),
    facility VARCHAR(100),
    parent_folder VARCHAR(255),
    imgref_stem VARCHAR(255),
    website VARCHAR(255),
    created_by UUID NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by UUID,
    modified_date TIMESTAMP WITH TIME ZONE
);

-- Create CatalogMetadata table
CREATE TABLE dev.catalog_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    catalog_id UUID,
    organisation_id UUID,
    location_id UUID,
    route_id UUID,
    collection_id UUID,
    photographer_id UUID,
    created_by UUID NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by UUID,
    modified_date TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (catalog_id) REFERENCES dev.catalog(id),
    FOREIGN KEY (organisation_id) REFERENCES dev.organisation(id),
    FOREIGN KEY (location_id) REFERENCES dev.location(id),
    FOREIGN KEY (route_id) REFERENCES dev.route(id),
    FOREIGN KEY (collection_id) REFERENCES dev.collection(id),
    FOREIGN KEY (photographer_id) REFERENCES dev.photographer(id)
);

ALTER TABLE dev.catalog_metadata DROP CONSTRAINT unique_metadata_combination;
ALTER TABLE dev.catalog_metadata 
ADD CONSTRAINT unique_metadata_combination 
UNIQUE (catalog_id, collection_id, photographer_id, organisation_id, location_id, route_id);

--'catalog_id', 'collection_id', 'photographer_id', 'organisation_id', 'location_id', 'route_id'

-- Create Usage table
CREATE TABLE dev.usage (
    catalog_id UUID,
    prints_allowed BOOLEAN,
    internet_use BOOLEAN,
    publications_use BOOLEAN,
    created_by UUID NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by UUID,
    modified_date TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (catalog_id) REFERENCES dev.catalog(id)
);

ALTER TABLE dev.usage ADD CONSTRAINT usage_unique UNIQUE (catalog_id);

-- Create CatalogBuilder table
CREATE TABLE dev.catalog_builder (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    catalog_id UUID REFERENCES dev.catalog(id),
    builder_id UUID REFERENCES dev.builder(id) NULL,  -- Allow NULL for plant-code-only cases
    builder_order INT NOT NULL,                       -- 1,2,3 to maintain position in image
    plant_code VARCHAR(20),
    works_number VARCHAR(50),
    year_built VARCHAR(20),
    created_by UUID NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by UUID,
    modified_date TIMESTAMP WITH TIME ZONE,
    CONSTRAINT at_least_one_value CHECK (builder_id IS NOT NULL OR plant_code IS NOT NULL OR works_number IS NOT NULL OR year_built IS NOT NULL)
);

ALTER TABLE dev.catalog_builder ADD CONSTRAINT catalog_builder_unique UNIQUE (catalog_id, builder_id, builder_order, plant_code, works_number);

-- Create PictureMetadata table
CREATE TABLE dev.picture_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    catalog_id UUID REFERENCES dev.catalog(id),
    file_name VARCHAR(50),
    file_location VARCHAR(255),
    file_type VARCHAR(50),
    file_size BIGINT, 
    width INTEGER,
    height INTEGER,
    resolution VARCHAR(50),
    colour_space VARCHAR(50),
    colour_mode VARCHAR(20),
    ai_description TEXT,
    tags TEXT[],
    created_by UUID NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by UUID,
    modified_date TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (catalog_id) REFERENCES dev.catalog(id)
);

ALTER TABLE dev.picture_metadata ADD CONSTRAINT picture_metadata_unique UNIQUE (catalog_id);

-- Add colour_mode with constraint
ALTER TABLE dev.picture_metadata 
ADD CONSTRAINT valid_colour_mode
CHECK (colour_mode IS NULL OR colour_mode IN ('colour', 'black_and_white', 'grayscale', 'sepia'));

-- Add constraint for existing colour_space column
ALTER TABLE dev.picture_metadata
ADD CONSTRAINT valid_colour_space 
CHECK (colour_space IS NULL OR colour_space IN ('sRGB', 'Adobe RGB', 'ProPhoto RGB', 'CMYK', 'LAB', 'Grayscale'));

-- Add constraints
ALTER TABLE dev.catalog ADD CONSTRAINT check_valuation CHECK (valuation >= 0);
ALTER TABLE dev.catalog ADD CONSTRAINT check_entry_date CHECK (entry_date <= CURRENT_DATE);


-- Add indexes for frequently queried columns:
CREATE INDEX idx_catalog_date_taken ON dev.catalog(date_taken);
CREATE INDEX idx_catalog_gauge ON dev.catalog(gauge);
CREATE INDEX idx_location_country ON dev.location(country_id);


-- Create triggers for updating modified columns
CREATE TRIGGER update_country_modtime BEFORE UPDATE ON dev.country FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_organisation_modtime BEFORE UPDATE ON dev.organisation FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_location_modtime BEFORE UPDATE ON dev.location FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_route_modtime BEFORE UPDATE ON dev.route FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_collection_modtime BEFORE UPDATE ON dev.collection FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_photographer_modtime BEFORE UPDATE ON dev.photographer FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_builder_modtime BEFORE UPDATE ON dev.builder FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_catalog_modtime BEFORE UPDATE ON dev.catalog FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_catalog_metadata_modtime BEFORE UPDATE ON dev.catalog_metadata FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_usage_modtime BEFORE UPDATE ON dev.usage FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_catalog_builder_modtime BEFORE UPDATE ON dev.catalog_builder FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_picture_metadata_modtime BEFORE UPDATE ON dev.picture_metadata FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE dev.country ENABLE ROW LEVEL SECURITY;
ALTER TABLE dev.organisation ENABLE ROW LEVEL SECURITY;
ALTER TABLE dev.location ENABLE ROW LEVEL SECURITY;
ALTER TABLE dev.route ENABLE ROW LEVEL SECURITY;
ALTER TABLE dev.collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE dev.photographer ENABLE ROW LEVEL SECURITY;
ALTER TABLE dev.builder ENABLE ROW LEVEL SECURITY;
ALTER TABLE dev.catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE dev.catalog_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE dev.usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE dev.catalog_builder ENABLE ROW LEVEL SECURITY;
ALTER TABLE dev.picture_metadata ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (you may want to adjust these based on your specific requirements)
CREATE POLICY "Users can view all records" ON dev.country FOR SELECT USING (true);
CREATE POLICY "Users can view all records" ON dev.organisation FOR SELECT USING (true);
CREATE POLICY "Users can view all records" ON dev.location FOR SELECT USING (true);
CREATE POLICY "Users can view all records" ON dev.route FOR SELECT USING (true);
CREATE POLICY "Users can view all records" ON dev.collection FOR SELECT USING (true);
CREATE POLICY "Users can view all records" ON dev.photographer FOR SELECT USING (true);
CREATE POLICY "Users can view all records" ON dev.builder FOR SELECT USING (true);
CREATE POLICY "Users can view all records" ON dev.catalog FOR SELECT USING (true);
CREATE POLICY "Users can view all records" ON dev.catalog_metadata FOR SELECT USING (true);
CREATE POLICY "Users can view all records" ON dev.usage FOR SELECT USING (true);
CREATE POLICY "Users can view all records" ON dev.catalog_builder FOR SELECT USING (true);
CREATE POLICY "Users can view all records" ON dev.picture_metadata FOR SELECT USING (true);



-- Example of a more restrictive policy (uncomment and modify as needed)
-- CREATE POLICY "Users can update their own records" ON catalog FOR UPDATE USING (auth.uid() = created_by);

--- View

--- Mobile App View and Indexes

-- Create indexes to optimize view performance
CREATE INDEX IF NOT EXISTS idx_catalog_image_no ON dev.catalog(image_no);
CREATE INDEX IF NOT EXISTS idx_catalog_date_taken ON dev.catalog(date_taken);
CREATE INDEX IF NOT EXISTS idx_catalog_category ON dev.catalog(category);
CREATE INDEX IF NOT EXISTS idx_catalog_gauge ON dev.catalog(gauge);
CREATE INDEX IF NOT EXISTS idx_catalog_year_built ON dev.catalog(year_built);

CREATE INDEX IF NOT EXISTS idx_catalog_metadata_catalog_id ON dev.catalog_metadata(catalog_id);
CREATE INDEX IF NOT EXISTS idx_catalog_metadata_organisation_id ON dev.catalog_metadata(organisation_id);
CREATE INDEX IF NOT EXISTS idx_catalog_metadata_location_id ON dev.catalog_metadata(location_id);
CREATE INDEX IF NOT EXISTS idx_catalog_metadata_route_id ON dev.catalog_metadata(route_id);
CREATE INDEX IF NOT EXISTS idx_catalog_metadata_collection_id ON dev.catalog_metadata(collection_id);
CREATE INDEX IF NOT EXISTS idx_catalog_metadata_photographer_id ON dev.catalog_metadata(photographer_id);

CREATE INDEX IF NOT EXISTS idx_catalog_builder_catalog_id ON dev.catalog_builder(catalog_id);
CREATE INDEX IF NOT EXISTS idx_catalog_builder_builder_id ON dev.catalog_builder(builder_id);

CREATE INDEX IF NOT EXISTS idx_usage_catalog_id ON dev.usage(catalog_id);
CREATE INDEX IF NOT EXISTS idx_picture_metadata_catalog_id ON dev.picture_metadata(catalog_id);

-- Drop existing view if exists
DROP VIEW IF EXISTS dev.mobile_catalog_view;

-- Create the mobile app view with thumbnail URL
CREATE OR REPLACE VIEW dev.mobile_catalog_view AS
SELECT 
    -- Primary image information
    c.image_no,
    c.category,
    c.date_taken,
    c.circa,
    c.imprecise_date,
    c.description,
    c.gauge,
    
    -- Thumbnail URL construction
    CONCAT('https://cdn.example.com/thumbnails/', c.image_no, '.webp') AS thumbnail_url,
    
    -- Location and route information
    cnt.name AS country,
    org.name AS organisation,
    org.type AS organisation_type,
    l.name AS location,
    r.name AS route,
    
    -- Collection and photographer details
    col.name AS collection,
    p.name AS photographer,
    
    -- Usage rights
    u.prints_allowed,
    u.internet_use,
    u.publications_use,
    
    -- Builder information (as JSON array for easier mobile consumption)
    ARRAY_AGG(DISTINCT jsonb_build_object(
        'builder_name', b.name,
        'builder_code', b.code,
        'works_number', cb.works_number,
        'year_built', cb.year_built,
        'plant_code', cb.plant_code,
        'builder_order', cb.builder_order
    )) FILTER (WHERE b.id IS NOT NULL) AS builders,
    
    -- Image metadata
    pm.file_type,
    pm.width,
    pm.height,
    pm.resolution,
    pm.colour_space,
    pm.colour_mode,
    
    -- Reference numbers
    c.cd_no,
    c.cd_no_hr,
    c.BW_image_no,
    c.bw_cd_no,
    
    -- Additional metadata
    c.active_area,
    c.corporate_body,
    c.facility,
    
    -- Timestamps for caching/syncing
    c.modified_date AS last_updated

FROM 
    dev.catalog c
    LEFT JOIN dev.catalog_metadata cm ON c.id = cm.catalog_id
    LEFT JOIN dev.organisation org ON cm.organisation_id = org.id
    LEFT JOIN dev.country cnt ON org.country_id = cnt.id
    LEFT JOIN dev.location l ON cm.location_id = l.id
    LEFT JOIN dev.route r ON cm.route_id = r.id
    LEFT JOIN dev.collection col ON cm.collection_id = col.id
    LEFT JOIN dev.photographer p ON cm.photographer_id = p.id
    LEFT JOIN dev.usage u ON c.id = u.catalog_id
    LEFT JOIN dev.catalog_builder cb ON c.id = cb.catalog_id
    LEFT JOIN dev.builder b ON cb.builder_id = b.id
    LEFT JOIN dev.picture_metadata pm ON c.id = pm.catalog_id

GROUP BY 
    c.id,
    c.image_no,
    c.category,
    c.date_taken,
    c.circa,
    c.imprecise_date,
    c.description,
    c.gauge,
    cnt.name,
    org.name,
    org.type,
    l.name,
    r.name,
    col.name,
    p.name,
    u.prints_allowed,
    u.internet_use,
    u.publications_use,
    pm.file_type,
    pm.width,
    pm.height,
    pm.resolution,
    pm.colour_space,
    pm.colour_mode,
    c.cd_no,
    c.cd_no_hr,
    c.BW_image_no,
    c.bw_cd_no,
    c.active_area,
    c.corporate_body,
    c.facility,
    c.modified_date;

-- Add comment explaining the view
COMMENT ON VIEW dev.mobile_catalog_view IS 'Comprehensive view of catalog entries optimized for mobile app usage. Includes image details, location info, builders, and CDN-served thumbnail URLs.';

-- Grant permissions
GRANT SELECT ON dev.mobile_catalog_view TO authenticated;

-- Create indexes on the most commonly queried columns in the view
CREATE INDEX IF NOT EXISTS idx_mobile_view_date ON dev.catalog(date_taken) 
WHERE date_taken IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_mobile_view_country ON dev.country(name) 
WHERE name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_mobile_view_location ON dev.location(name) 
WHERE name IS NOT NULL;

-- Add a gin index for text search on description
CREATE INDEX IF NOT EXISTS idx_catalog_description_gin ON dev.catalog 
USING gin(to_tsvector('english', description));

-- Add a gin index for tags array searching
CREATE INDEX IF NOT EXISTS idx_picture_metadata_tags_gin ON dev.picture_metadata 
USING gin(tags);




--- Query

-- Basic search
SELECT image_no, thumbnail_url, description, date_taken 
FROM dev.mobile_catalog_view 
WHERE location = 'London'
ORDER BY date_taken DESC
LIMIT 20;

-- Search by builder
SELECT image_no, thumbnail_url, description 
FROM dev.mobile_catalog_view 
WHERE builders @> '[{"builder_name": "Swindon Works"}]'::jsonb;

-- Full text search in description
SELECT image_no, thumbnail_url, description 
FROM dev.mobile_catalog_view 
WHERE to_tsvector('english', description) @@ to_tsquery('english', 'steam & engine')
LIMIT 20;



-- Supabase stored procedure to get total size
CREATE OR REPLACE FUNCTION total_size_in_bucket(bucket_name text, bucket_prefix text)
RETURNS bigint AS $$
BEGIN
    RETURN (SELECT COALESCE(SUM((metadata->>'size')::bigint), 0) 
            FROM storage.objects 
            WHERE bucket_id = bucket_name 
            AND name LIKE bucket_prefix || '%');
END;
$$ LANGUAGE plpgsql;

-- Test
SELECT total_size_in_bucket('rat', 'images/');


-- reload cache??
NOTIFY pgrst, 'reload schema';

DROP FUNCTION reduce_storage_lifo(text,text,bigint)

-- Purge storage to a certain size
CREATE OR REPLACE FUNCTION public.reduce_storage_lifo(
    bucket_name text,
    bucket_prefix text,
    max_size_bytes bigint
) RETURNS bigint AS $$
DECLARE
    current_size bigint;
    file_row record;
BEGIN
    -- Get initial size
    SELECT COALESCE(SUM(NULLIF((metadata->>'size')::bigint, NULL)), 0) INTO current_size
    FROM storage.objects 
    WHERE bucket_id = bucket_name 
    AND name LIKE bucket_prefix || '%';

    -- Loop to delete files until we're under the threshold
    FOR file_row IN 
        SELECT id, name, (metadata->>'size')::bigint AS file_size
        FROM storage.objects 
        WHERE bucket_id = bucket_name 
        AND name LIKE bucket_prefix || '%'
        ORDER BY created_at DESC -- LIFO: most recently added first
    LOOP
        IF current_size <= max_size_bytes THEN
            EXIT;
        END IF;
        
        -- Delete the file
        DELETE FROM storage.objects WHERE id = file_row.id;
        
        -- Update current size
        current_size := current_size - file_row.file_size;
        
        RAISE NOTICE 'Deleted file: % - Size reduced by % bytes', file_row.name, file_row.file_size;
    END LOOP;

    -- Return the final size
    RETURN current_size;
END;
$$ LANGUAGE plpgsql;


select reduce_storage_lifo('rat', 'images/', 1073741824);