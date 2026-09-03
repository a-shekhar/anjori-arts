-- Migration to add framing options to artworks

ALTER TABLE arts.artworks
ADD COLUMN can_be_framed boolean DEFAULT false NOT NULL,
ADD COLUMN framing_price integer DEFAULT 0 NOT NULL;
