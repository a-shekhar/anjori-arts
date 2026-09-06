-- ====================================================================
-- Migration: Update Category Cover Images & Alt Descriptions
-- Replaces Unsplash links and fills empty categories with local bespoke assets
-- ====================================================================

UPDATE arts.categories SET 
  cover_image = '/images/categories/madhubani.jpg',
  alt_text = 'Handcrafted authentic Madhubani painting depicting traditional peacocks, fish, and Tree of Life with natural mineral dyes'
WHERE slug = 'madhubani';

UPDATE arts.categories SET 
  cover_image = '/images/categories/tanjore.jpg',
  alt_text = 'Classical Tanjore gold foil relief painting of Lord Krishna with rich 22-karat gold leaf and gemstone embellishments'
WHERE slug = 'tanjore';

UPDATE arts.categories SET 
  cover_image = '/images/categories/warli.jpg',
  alt_text = 'Traditional Warli tribal painting on red-ochre clay surface depicting the circular Tarpa harvest dance in rice pigment'
WHERE slug = 'warli';

UPDATE arts.categories SET 
  cover_image = '/images/categories/mythological-devotional.jpg',
  alt_text = 'Original monochrome charcoal and acrylic painting of Lord Ganesha on deep black canvas by Anjori Arts'
WHERE slug = 'mythological-devotional';

UPDATE arts.categories SET 
  cover_image = '/images/categories/contemporary.jpg',
  alt_text = 'Contemporary Indian fine art gallery painting with expressive impasto palette knife textures and gold leaf accents'
WHERE slug = 'contemporary';

UPDATE arts.categories SET 
  cover_image = '/images/categories/portraiture.jpg',
  alt_text = 'Bespoke fine art oil painting portrait of an Indian woman with classical chiaroscuro candlelight illumination'
WHERE slug = 'portraiture';

UPDATE arts.categories SET 
  cover_image = '/images/categories/figurative.jpg',
  alt_text = 'Original narrative figurative painting celebrating the Chipko Movement and rural Indian heritage by Anjori Arts'
WHERE slug = 'figurative';

UPDATE arts.categories SET 
  cover_image = '/images/categories/customised-branding.jpg',
  alt_text = 'Bespoke artisanal branding identity mockup with metallic gold lotus emblem, calligraphy pen, and custom wax seal'
WHERE slug = 'customised-branding';

UPDATE arts.categories SET 
  cover_image = '/images/categories/poster-designing.jpg',
  alt_text = 'Vintage Indian art exhibition poster design with intricate block-print ornamental borders and classical typography'
WHERE slug = 'poster-designing';

UPDATE arts.categories SET 
  cover_image = '/images/categories/cyanotype.jpg',
  alt_text = 'Botanical Prussian blue cyanotype sun-print of wild ferns and wildflowers on deckled-edge cotton rag paper'
WHERE slug = 'cyanotype';

UPDATE arts.categories SET 
  cover_image = '/images/categories/earrings.jpg',
  alt_text = 'Handcrafted artisan terracotta clay jhumka earrings with traditional Indian hand-painted motifs on cream linen'
WHERE slug = 'earrings';

UPDATE arts.categories SET 
  cover_image = '/images/categories/mandala.jpg',
  alt_text = 'Original radiant lotus deity mandala painting with jewel-toned cerulean blue and gold petals by Anjori Arts'
WHERE slug = 'mandala';

