-- ==========================================================
-- 20260907233001_seed_data.sql
-- Anjori Arts — Consolidated DML Seed Data
-- Target Schema: `arts`
-- ==========================================================

-- ==========================================================
-- 1. MEDIUMS
-- ==========================================================
INSERT INTO arts.mediums (id, slug, name, description, display_order) VALUES
  ('med-1', 'oil', 'Oil', 'Traditional oil painting medium.', 20),
  ('med-2', 'acrylic', 'Acrylic', 'Fast-drying acrylic paints.', 10)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, 
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;


-- ==========================================================
-- 2. SURFACES
-- ==========================================================
INSERT INTO arts.surfaces (slug, name, display_order) VALUES
  ('stretched-canvas', 'Stretched Canvas', 10),
  ('watercolor-paper', 'Watercolor Paper', 20),
  ('wood-panel', 'Wood Panel', 30),
  ('not-sure', 'Not sure / Recommend me something', 90),
  ('other', 'Other', 99)
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name, 
  display_order = EXCLUDED.display_order;


-- ==========================================================
-- 3. CATEGORIES (Core 12 Art Traditions & Collections)
-- ==========================================================
INSERT INTO arts.categories (id, slug, name, description, cover_image, alt_text, display_order) VALUES
  (
    'cat-1', 'madhubani', 'Madhubani', 
    'Traditional folk art from the Mithila region known for geometric patterns.',
    '/images/categories/madhubani.jpg',
    'Handcrafted authentic Madhubani painting depicting traditional peacocks, fish, and Tree of Life with natural mineral dyes',
    10
  ),
  (
    'cat-2', 'tanjore', 'Tanjore', 
    'Classical South Indian art famous for rich colours and gold foil embellishments.',
    '/images/categories/tanjore.jpg',
    'Classical Tanjore gold foil relief painting of Lord Krishna with rich 22-karat gold leaf and gemstone embellishments',
    20
  ),
  (
    'cat-3', 'warli', 'Warli Art', 
    'Tribal art style from Maharashtra depicting daily life and nature.',
    '/images/categories/warli.jpg',
    'Traditional Warli tribal painting on red-ochre clay surface depicting the circular Tarpa harvest dance in rice pigment',
    30
  ),
  (
    'cat-4', 'mythological-devotional', 'Mythological & Devotional', 
    'Intricate devotional paintings capturing stories of the divine.',
    '/images/categories/mythological-devotional.jpg',
    'Original monochrome charcoal and acrylic painting of Lord Ganesha on deep black canvas by Anjori Arts',
    40
  ),
  (
    'cat-12', 'mandala', 'Mandala Art', 
    'Intricate geometric designs that represent the universe, offering visual harmony and meditative focus.',
    '/images/categories/mandala.jpg',
    'Original radiant lotus deity mandala painting with jewel-toned cerulean blue and gold petals by Anjori Arts',
    50
  ),
  (
    'cat-5', 'contemporary', 'Contemporary Works', 
    'Modern artistic expressions breaking traditional boundaries.',
    '/images/categories/contemporary.jpg',
    'Contemporary Indian fine art gallery painting with expressive impasto palette knife textures and gold leaf accents',
    60
  ),
  (
    'cat-6', 'portraiture', 'Portraiture', 
    'Lifelike custom portraits tailored to capture the essence of the subject.',
    '/images/categories/portraiture.jpg',
    'Bespoke fine art oil painting portrait of an Indian woman with classical chiaroscuro candlelight illumination',
    70
  ),
  (
    'cat-7', 'figurative', 'Figurative Painting', 
    'Artworks retaining strong references to the real world and human form.',
    '/images/categories/figurative.jpg',
    'Original narrative figurative painting celebrating the Chipko Movement and rural Indian heritage by Anjori Arts',
    80
  ),
  (
    'cat-8', 'customised-branding', 'Branding & Logo Art', 
    'Art-based conceptual branding, logos, and business artwork.',
    '/images/categories/customised-branding.jpg',
    'Bespoke artisanal branding identity mockup with metallic gold lotus emblem, calligraphy pen, and custom wax seal',
    90
  ),
  (
    'cat-9', 'poster-designing', 'Poster Designing', 
    'Aesthetic and communicative poster designs.',
    '/images/categories/poster-designing.jpg',
    'Vintage Indian art exhibition poster design with intricate block-print ornamental borders and classical typography',
    100
  ),
  (
    'cat-10', 'cyanotype', 'Cyanotype Prints', 
    'Photographic printing process that produces a cyan-blue print.',
    '/images/categories/cyanotype.jpg',
    'Botanical Prussian blue cyanotype sun-print of wild ferns and wildflowers on deckled-edge cotton rag paper',
    110
  ),
  (
    'cat-11', 'earrings', 'Handcrafted Earrings', 
    'Unique artisan-made earrings combining traditional motifs with modern wearability.',
    '/images/categories/earrings.jpg',
    'Handcrafted artisan terracotta clay jhumka earrings with traditional Indian hand-painted motifs on cream linen',
    120
  )
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, 
  description = EXCLUDED.description, 
  cover_image = EXCLUDED.cover_image,
  alt_text = EXCLUDED.alt_text,
  display_order = EXCLUDED.display_order;


-- ==========================================================
-- 4. BLOG POSTS
-- ==========================================================
INSERT INTO arts.blog_posts (id, slug, title, excerpt, content, cover_image, author, published_at, tags)
VALUES
(
  gen_random_uuid()::text,
  'the-history-of-madhubani-art',
  'The History of Madhubani Art',
  'Discover the origins and rich cultural significance of Madhubani painting, a tradition rooted in the Mithila region.',
  'Madhubani art, also known as Mithila painting, is a traditional style of painting that originated in the Mithila region of India and Nepal. 

## Origins

Historically, these paintings were done on freshly plastered mud walls and floors of huts, but now they are also done on cloth, handmade paper, and canvas. The paintings use two-dimensional imagery, and the colours used are derived from plants.

## Characteristics

Madhubani paintings are characterized by eye-catching geometrical patterns. There is ritual content for particular occasions, such as birth or marriage, and festivals, such as Holi, Surya Shasti, Kali Puja, Upanayana, and Durga Puja.

The art is deeply tied to nature and mythology, often depicting deities like Krishna, Rama, Shiva, Durga, Lakshmi, and Saraswati. Natural objects like the sun, the moon, and religious plants like tulsi are also widely painted, along with scenes from the royal court and social events like weddings.',
  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop',
  'Anjori Arts',
  '2023-10-15T00:00:00Z',
  ARRAY['Madhubani', 'History', 'Indian Art']
),
(
  gen_random_uuid()::text,
  'preserving-the-tanjore-tradition',
  'Preserving the Tanjore Tradition',
  'A deep dive into the intricate techniques and materials used to create the classic Tanjore paintings.',
  'Tanjore painting is a classical South Indian painting style, which was inaugurated from the town of Thanjavur (anglicized as Tanjore).

## The Technique

Tanjore paintings are known for their surface richness, vivid colours, and compact composition. They consist of one main figure, a deity, with a well-rounded body and almond-shaped eyes. This figure would be housed in an enclosure created by means of an arch, curtains, etc.

The process involves multiple stages, starting with the preparation of the board (a piece of wood covered with a cloth). A sketch is made on the fabric, and a paste made of limestone and a binding medium is used to create 3D effects. 22K gold foil is then applied to these raised areas, alongside semi-precious stones.

## Cultural Heritage

This art form is heavily influenced by the Vijayanagara and Maratha styles and serves as an important medium for devotional focus in traditional homes.',
  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop',
  'Anjori Arts',
  '2023-11-02T00:00:00Z',
  ARRAY['Tanjore', 'Heritage', 'Technique']
),
(
  gen_random_uuid()::text,
  'understanding-warli-motifs',
  'Understanding Warli Motifs',
  'Learn how the simple geometric shapes in Warli art convey profound messages about community and nature.',
  'Warli art is a beautiful folk art of Maharashtra, created by the tribal women. This art form does not depict mythological characters or images of deities, but depicts social life.

## Simplicity in Design

The Warli artists use simple geometric shapes: a circle, a triangle, and a square. The circle and triangle come from their observation of nature, the circle representing the sun and the moon, the triangle derived from mountains and pointed trees.

## The Tarpa Dance

A central motif in many Warli paintings is the Tarpa dance. The Tarpa, a trumpet-like instrument, is played in turns by different village men. Men and women entwine their hands and move in a circle around the Tarpa player. This circle of dancers is believed to resemble the circle of life.

The rhythmic patterns and simple figures of Warli paintings have found their way onto modern textiles and home decor, proving the timeless appeal of this ancient art.',
  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop',
  'Anjori Arts',
  '2023-12-10T00:00:00Z',
  ARRAY['Warli', 'Tribal Art', 'Motifs']
)
ON CONFLICT (slug) DO NOTHING;


-- ==========================================================
-- 5. ADMIN USER PROMOTION (TEMPLATE HELPER)
-- ==========================================================
-- To promote an existing authenticated user to ADMIN, execute:
-- UPDATE arts.profiles 
-- SET role = 'ADMIN' 
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'your-admin-email@example.com');

