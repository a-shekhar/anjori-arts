-- Migration to move framing options to variants

-- Remove from artworks
ALTER TABLE arts.artworks
DROP COLUMN can_be_framed,
DROP COLUMN framing_price;

-- Add to artwork_variants
ALTER TABLE arts.artwork_variants
ADD COLUMN can_be_framed boolean DEFAULT false NOT NULL,
ADD COLUMN framing_price integer DEFAULT 0 NOT NULL;
