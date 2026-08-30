-- 01_seed_data.sql
-- Seed Data for Anjori Arts

-- ==========================================
-- 1. MEDIUMS (Restricted to Oil & Acrylic)
-- ==========================================
INSERT INTO arts.mediums (id, slug, name, description) VALUES
  ('med-1', 'oil', 'Oil', 'Traditional oil painting medium.'),
  ('med-2', 'acrylic', 'Acrylic', 'Fast-drying acrylic paints.')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, description = EXCLUDED.description;


-- ==========================================
-- 2. SURFACES
-- ==========================================
INSERT INTO arts.surfaces (slug, name, display_order) VALUES
  ('stretched-canvas', 'Stretched Canvas', 10),
  ('watercolor-paper', 'Watercolor Paper', 20),
  ('wood-panel', 'Wood Panel', 30),
  ('not-sure', 'Not sure / Recommend me something', 90),
  ('other', 'Other', 99)
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name, display_order = EXCLUDED.display_order;





-- ==========================================
-- 4. CATEGORIES (MVP 1 Core 12 Categories)
-- ==========================================
INSERT INTO arts.categories (id, slug, name, description, cover_image) VALUES
  (
    'cat-1', 'madhubani', 'Madhubani', 
    'Traditional folk art from the Mithila region known for geometric patterns.',
    'https://images.unsplash.com/photo-1583594895781-8d0702c2db26?q=80&w=800&auto=format&fit=crop'
  ),
  (
    'cat-2', 'tanjore', 'Tanjore', 
    'Classical South Indian art famous for rich colours and gold foil embellishments.',
    'https://images.unsplash.com/photo-1599557766399-52e850b55146?q=80&w=800&auto=format&fit=crop'
  ),
  (
    'cat-3', 'warli', 'Warli Art', 
    'Tribal art style from Maharashtra depicting daily life and nature.', ''
  ),
  (
    'cat-4', 'mythological-devotional', 'Mythological & Devotional', 
    'Intricate devotional paintings capturing stories of the divine.', ''
  ),
  (
    'cat-5', 'contemporary', 'Contemporary Works', 
    'Modern artistic expressions breaking traditional boundaries.', ''
  ),
  (
    'cat-6', 'portraiture', 'Portraiture', 
    'Lifelike custom portraits tailored to capture the essence of the subject.', ''
  ),
  (
    'cat-7', 'figurative', 'Figurative Painting', 
    'Artworks retaining strong references to the real world and human form.', ''
  ),
  (
    'cat-8', 'customised-branding', 'Branding & Logo Art', 
    'Art-based conceptual branding, logos, and business artwork.', ''
  ),
  (
    'cat-9', 'poster-designing', 'Poster Designing', 
    'Aesthetic and communicative poster designs.', ''
  ),
  (
    'cat-10', 'cyanotype', 'Cyanotype Prints', 
    'Photographic printing process that produces a cyan-blue print.', ''
  ),
  (
    'cat-11', 'earrings', 'Handcrafted Earrings', 
    'Unique artisan-made earrings combining traditional motifs with modern wearability.', ''
  ),
  (
    'cat-12', 'mandala', 'Mandala Art', 
    'Intricate geometric designs that represent the universe, offering visual harmony and meditative focus.', ''
  )
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, description = EXCLUDED.description, cover_image = EXCLUDED.cover_image;


-- ==========================================
-- 5. BLOG POSTS (Dummy Data)
-- ==========================================
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
