-- Add alt_text column to arts.categories for SEO & accessibility
ALTER TABLE arts.categories 
ADD COLUMN IF NOT EXISTS alt_text text DEFAULT NULL;

