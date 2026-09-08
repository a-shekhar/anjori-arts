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
INSERT INTO arts.blog_posts (id, slug, title, excerpt, content, cover_image, author, is_published, published_at, tags)
VALUES
-- 1. Madhubani
(
  gen_random_uuid()::text,
  'the-history-of-madhubani-art',
  'The History of Madhubani Art',
  'Discover the origins and rich cultural significance of Madhubani painting, a tradition rooted in the Mithila region.',
  'Madhubani art, also known as Mithila painting, is a timeless traditional art form originating from the ancient Mithila region of northern Bihar and Nepal. 

## Origins & Mythological Roots

According to regional lore, King Janaka commissioned local village artisans to paint the palace walls on the auspicious occasion of Princess Sita''s wedding to Lord Rama. For centuries, this sacred visual language was passed down through generations of women, painted onto freshly plastered mud walls and floors of domestic courtyards (*Kohbar ghar*).

Today, while preserving its heritage, Madhubani has gracefully transitioned onto handmade cotton paper, raw silk, and stretched linen canvas.

## Visual Grammar & Techniques

Authentic Madhubani art is renowned for its vibrant, two-dimensional composition and complete absence of empty space:
- **Intricate Line Work:** Historically executed using sharpened bamboo twigs, nib pens, and fine bristle brushes.
- **Natural Pigments:** Traditionally sourced from soot (*kajal*), turmeric (*haldi*), marigold petals, indigo, and crushed peepal leaves bound with natural acacia gum.
- **Symbolic Fillers:** Every negative space is filled with intricate flora, birds, fish, and geometric borders.

## Enduring Motifs

The artwork draws deeply from nature and the divine:
- **The Tree of Life (*Kalpavriksha*):** Symbolizing fertility, ancestral continuity, and universal balance.
- **Sacred Flora & Fauna:** Pairs of peacocks embodying romance, fish signifying abundance, and lotuses representing purity.
- **Devotional Narratives:** Dynamic episodes depicting Krishna''s Raas Leela, Rama''s court, and Goddess Durga.

At Anjori Arts, our Madhubani collection bridges ancestral Mithila craftsmanship with archival, museum-grade fine art standards.',
  '/images/categories/madhubani.jpg',
  'Anjori Arts',
  true,
  '2023-10-15T00:00:00Z',
  ARRAY['Madhubani', 'Mithila', 'Folk Art', 'Indian Heritage']
),

-- 2. Tanjore
(
  gen_random_uuid()::text,
  'preserving-the-tanjore-tradition',
  'Preserving the Tanjore Tradition',
  'A deep dive into the intricate techniques and materials used to create classic Tanjore paintings with pure 22-karat gold leaf.',
  'Tanjore painting (*Thanjavur Oviyam*) is one of South India''s most celebrated classical art forms, flourishing under the patronage of the Maratha rulers, Nayakas, and the Vijayanagara Empire during the 16th to 18th centuries.

## The Distinctive 3D Relief Technique

Unlike flat fresco styles, Tanjore paintings are celebrated for their sculptural, three-dimensional tactile relief work (*gesso work*):
1. **Wooden Plank Preparation (*Palagai Padam*):** Traditionally mounted on seasoned jackwood or teak boards, covered with unbleached organic cotton cloth and coated with French chalk paste.
2. **Embossed Gesso Detailing:** A specialized paste crafted from Arabic gum and refined unboiled limestone powder is applied using fine brushes to sculpt raised canopies, jewelry, pillars, and arches.
3. **22-Karat Gold Foil Gilding:** Pure 22-karat gold leaves are meticulously pressed over the embossed gesso, catching the softest ambient light and giving the artwork its immortal luminescence.
4. **Semi-Precious Embellishments:** Jaipur gemstones, sparkling cut-glass, and teardrop pearls are set directly into the ornate gilded borders.

## Devotional Iconography

The central subject of classical Tanjore painting is almost universally sacred—most commonly depicting:
- **Bala Krishna (Navaneetha Krishna):** Chubby, almond-eyed baby Krishna holding a pot of fresh butter.
- **Goddess Lakshmi & Saraswati:** Enthroned on blooming lotuses with auspicious royal regalia.
- **Lord Venkateswara of Tirupati:** Adorned with glittering kiritas and ceremonial garlands.

A genuine Tanjore painting is designed to be an heirloom, glowing with silent reverence in domestic prayer spaces across centuries.',
  '/images/categories/tanjore.jpg',
  'Anjori Arts',
  true,
  '2023-11-02T00:00:00Z',
  ARRAY['Tanjore', 'Gold Foil', 'Classical Art', 'South Indian Heritage']
),

-- 3. Warli Art
(
  gen_random_uuid()::text,
  'understanding-warli-motifs',
  'Understanding Warli Motifs',
  'Learn how simple geometric shapes in Warli art convey profound messages about community, rhythm, and reverence for Mother Earth.',
  'Nestled in the North Sahyadri range of Maharashtra, the indigenous Warli community has practiced their distinctive monochrome wall art for thousands of years, with roots stretching back to 2500 BCE.

## The Sacred Geometry of Nature

Unlike many traditional Indian art traditions, Warli art is completely non-iconographic—it avoids depicting anthropomorphic deities, choosing instead to revere nature, seasonal harvests, and community harmony.

The visual language relies entirely on three elemental shapes:
- **The Circle:** Born from observing the sun and the full moon.
- **The Triangle:** Inspired by jagged mountain horizons and conical treetops.
- **The Square:** Representing human sanctified ground, hearths, and sacred domestic enclosures (*Chauk*).

Human and animal figures are painted with two inverted triangles joined at their vertices—a visual metaphor for balance, movement, and physical vitality.

## The Tarpa Dance: The Wheel of Existence

The most celebrated Warli motif is the grand **Tarpa Dance**. As a village elder sounds the hypnotic notes of the *Tarpa* (a trumpet crafted from dried bottle gourd and bamboo), men and women intertwine fingers in an ever-expanding concentric spiral. 

This rhythmic circular movement mirrors the cosmic cycles of life, rebirth, and the seasons—never broken, continuously flowing.

## Earth-Friendly Materials

Original Warli works use natural ochre clay (*geru*) and cow-dung wash as the warm earthen canvas, painted solely with ground white rice paste mixed with water and edible tree gum. Anjori Arts honors this ancient simplicity, translating indigenous rhythms onto archival cotton paper and linen canvases for modern living spaces.',
  '/images/categories/warli.jpg',
  'Anjori Arts',
  true,
  '2023-12-10T00:00:00Z',
  ARRAY['Warli', 'Tribal Art', 'Geometry', 'Indigenous Culture']
),

-- 4. Mythological & Devotional
(
  gen_random_uuid()::text,
  'divine-iconography-indian-devotional-art',
  'Divine Iconography: The Sacred Symbolism in Indian Devotional Art',
  'Explore the profound spiritual symbolism, sacred mudras, and timeless iconography found in traditional Indian devotional and mythological paintings.',
  'In the Indian artistic tradition, painting the divine is never merely aesthetic; it is an act of *dhyana*—profound meditation and contemplation. From the peaceful gaze of Lord Shiva in deep samadhi to the benevolent presence of Lord Ganesha, devotional paintings bridge the tangible world with eternal cosmic truths.

## Deconstructing Sacred Iconography

Every gesture, weapon, and emblem rendered in devotional art carries deliberate philosophical meaning:

- **Mudras (Sacred Hand Gestures):** The *Abhaya Mudra* (upturned open right palm) offers universal protection and fearlessness, while the *Varada Mudra* (downward open left palm) symbolizes compassionate bestowal of spiritual boons.
- **Divine Attributes & Implements:**
  - *The Lotus (*Padma*):* Purity rising untainted from worldly waters.
  - *The Conch (*Shankha*):* The primordial sound of creation (*Om*).
  - *The Trident (*Trishula*):* Mastery over the three gunas (Sattva, Rajas, Tamas) and the triads of past, present, and future.
- **The Vahanas (Divine Mounts):** Ganesha''s humble mouse (*Mushika*) represents conquering restlessness and ego, while Shiva''s bull (*Nandi*) personifies steadfast patience and truth.

## Contemporary Devotional Expressions

While classical iconometry (*Shilpa Shastras*) dictates precise proportions, modern devotional masters at Anjori Arts explore bold monochromatic charcoal, deep textural backgrounds, and subtle gold illumination. 

A monochrome charcoal Ganesha on a deep midnight canvas strips away external clutter, drawing the viewer''s eye straight into the inner sanctuary of peace and poise.

## Bringing Sacred Art into Modern Homes

A thoughtfully positioned devotional painting does more than elevate interior decor; it establishes a calming focal point in prayer rooms, entryways, or study spaces, creating an oasis of quiet mindfulness amidst modern rush.',
  '/images/categories/mythological-devotional.jpg',
  'Anjori Arts',
  true,
  '2024-01-15T00:00:00Z',
  ARRAY['Devotional Art', 'Mythology', 'Iconography', 'Spiritual', 'Indian Heritage']
),

-- 5. Mandala Art
(
  gen_random_uuid()::text,
  'sacred-circles-mandala-art-meditation',
  'Sacred Circles: The Meditative Power & Geometry of Mandala Art',
  'Discover how the concentric geometry and sacred symmetry of mandala art cultivate mindfulness, inner balance, and spiritual harmony in contemporary spaces.',
  'Originating from the ancient Sanskrit word meaning "circle" or "wholeness," the mandala is far more than a decorative geometric pattern. It is an archetype of the universe, a visual map of cosmic harmony, and an ancient tool for psychological centering.

## The Anatomy of a Sacred Mandala

At first glance, a mandala mesmerizes through repetition. Yet, behind every stroke lies rigorous mathematical precision and symbolic intent:

1. **The Bindu (Central Focal Point):** The microscopic center from which all creation emanates and to which all consciousness returns.
2. **Concentric Rings:** Representing layers of awareness, progression through obstacles, and spiritual growth.
3. **The Lotus Petal Radiance:** Eightfold or sixteenfold symmetrical petals mirroring purity, beauty, and the unfolding mind.
4. **Square Gates & Enclosures:** Marking sacred perimeters that guard the contemplative sanctum from external distractions.

## Psychological & Meditative Benefits

Pioneering psychologist Carl Jung recognized mandalas as reflections of the human self. Modern research shows that engaging with concentric radial art:
- Lowers resting cortisol levels and calms the autonomic nervous system.
- Encourages mindful presence by drawing the gaze inward toward the central point.
- Enhances focus in study areas, meditation corners, and contemporary work environments.

## Modern Aesthetics at Anjori Arts

Our mandala artworks merge traditional sacred geometry with jewel-toned palettes—radiant cerulean blues, imperial lapis lazuli, rich ochres, and hand-embossed gold details. Whether featured as a monumental centerpiece in a living salon or as a tranquil accent in a wellness studio, a finely crafted mandala breathes serenity into any architectural space.',
  '/images/categories/mandala.jpg',
  'Anjori Arts',
  true,
  '2024-01-28T00:00:00Z',
  ARRAY['Mandala', 'Sacred Geometry', 'Meditation', 'Mindfulness', 'Fine Art']
),

-- 6. Contemporary Works
(
  gen_random_uuid()::text,
  'contemporary-indian-fine-art-tradition-modernity',
  'Echoes of Heritage: The Language of Contemporary Indian Fine Art',
  'How contemporary Indian painters blend ancient cultural soul with bold impasto knife textures, 24K gold accents, and expressive modern abstraction.',
  'Contemporary Indian fine art stands at an electrifying crossroads. While honoring thousands of years of aesthetic philosophy—from *Rasa* (emotional essence) to classical symbolism—today''s artists are breaking free from rigid boundaries to forge bold, expressive visual dialogues.

## The Power of the Palette Knife: Impasto Textures

Where classical miniatures celebrated smooth, unblemished surfaces, modern canvas works celebrate tactile drama:
- **Heavy Impasto:** Applying thick, sculptured layers of pure oil and acrylic using steel palette knives creates dramatic shadows that change as ambient sunlight moves across the room.
- **Gold Leaf Illuminations:** Modern interpretations of Tanjore gold leafing use distressed 24-karat gold foil layered between raw textures, reflecting light with unexpected warmth.
- **Abstracted Narratives:** Deities, figures, and architectural forms are suggested through fluid gestural strokes rather than hyper-literal outlines, inviting the collector into a deeper interpretive journey.

## Emotional Resonance (*Rasa* Theory)

In Indian aesthetic tradition, an artwork achieves mastery only when it evokes a genuine emotional state (*bhava*) in the viewer. Contemporary works achieve this through daring contrasts:
- Deep charcoal tones paired with brilliant saffron flares.
- Tranquil mineral whites meeting energetic crimson strokes.
- Raw linen grounds contrasting with glistening metallic leaf.

## Curating Contemporary Art for Modern Spaces

Large-scale contemporary statement paintings have become the cornerstone of modern luxury interior design. They introduce warmth, cultural depth, and unmistakable character into modern minimalist, Scandinavian, or brutalist architectural spaces.',
  '/images/categories/contemporary.jpg',
  'Anjori Arts',
  true,
  '2024-02-10T00:00:00Z',
  ARRAY['Contemporary Art', 'Fine Art', 'Impasto', 'Modern Indian', 'Texture']
),

-- 7. Portraiture
(
  gen_random_uuid()::text,
  'art-of-fine-art-portraiture',
  'Beyond the Lens: The Timeless Intimacy of Fine Art Portraiture',
  'In an era of fleeting digital photography, custom handmade oil and acrylic portraits capture character, generational warmth, and archival emotional permanence.',
  'In our hyper-digital age, billions of photographs are captured in seconds—only to be buried in smartphone galleries and forgotten in cloud servers. Yet, when one stands before a genuine, hand-painted fine art portrait, time slows down.

A painted portrait does not merely duplicate pixels; it interprets personality, legacy, and human spirit.

## The Mastery of Chiaroscuro & Candlelight

At Anjori Arts, our bespoke portraiture masters study classical techniques pioneered by masters of light:
- **Chiaroscuro:** The dramatic interplay of luminous highlights and velvety deep shadows that lends three-dimensional life to the canvas.
- **Skin Tones & Translucency:** Building flesh tones through successive transparent glazes (*velaturas*) gives portraits an inner, breathing radiance that cameras flatten.
- **The Soulful Gaze:** The subtle angle of an eye, the softness of a smile, or the tender warmth of an elder''s expression are distilled over dozens of painting hours.

## The Commission Journey

Commissioning an original portrait is a deeply personal and collaborative journey:
1. **Curating the Narrative:** We work with family archives, wedding photos, or legacy portraits to establish lighting, composition, and emotional tone.
2. **Archival Mediums:** Painted on heavy Belgium linen or museum-grade stretched cotton canvases using lightfast oil and archival acrylic pigments.
3. **Generational Legacy:** Treated with protective damar or archival satin varnishes, ensuring the painting survives for centuries without fading or yellowing.

A bespoke portrait is not merely art; it is an heirloom that anchors a family''s heritage across generations.',
  '/images/categories/portraiture.jpg',
  'Anjori Arts',
  true,
  '2024-02-22T00:00:00Z',
  ARRAY['Portraiture', 'Oil Painting', 'Custom Art', 'Heirloom', 'Fine Art']
),

-- 8. Figurative Painting
(
  gen_random_uuid()::text,
  'narrative-power-figurative-art',
  'Stories on Canvas: The Narrative Power of Figurative Art',
  'Delve into narrative figurative painting—where the human form, social movements like Chipko, and vibrant Indian rural heritage converse on canvas.',
  'Figurative painting occupies a revered position in art history: it takes the human condition, bodily expression, and community history and translates them into compelling visual narratives. In the Indian context, figurative art has long served as a mirror to social movements, cultural ceremonies, and everyday village life.

## Celebrating Cultural Resilience: The Chipko Movement

One of the most moving examples in Anjori Arts'' figurative series is our celebration of the **Chipko Movement**—the historic 1970s grassroots environmental resistance in Uttarakhand, where rural village women clung to ancient Himalayan trees to shield them from commercial loggers.

On canvas, this narrative comes alive through:
- **Emotive Body Language:** Determined postures, interlocked arms, and expressive eyes reflecting fierce protective love for nature.
- **Textural Drapery:** The folds of handloom cotton saris, weathered skin tones, and earthy forest foliage rendered in rich oil pigments.
- **Aesthetic Dialogue:** Blending social commentary with fine artistic composition to provoke thought, gratitude, and ecological consciousness.

## The Human Form as a Cultural Storyteller

Figurative art connects instantly with viewers because the human brain is wired for empathy. Whether portraying a mother braiding her daughter''s jasmine-adorned hair, musicians lost in raga melodies, or village artisans at their wheels, figurative paintings bring the warmth of authentic Indian life directly into contemporary homes.',
  '/images/categories/figurative.jpg',
  'Anjori Arts',
  true,
  '2024-03-05T00:00:00Z',
  ARRAY['Figurative', 'Storytelling', 'Indian Culture', 'Folklore', 'Social Art']
),

-- 9. Branding & Logo Art (Customised Branding)
(
  gen_random_uuid()::text,
  'artisanal-branding-and-logo-design',
  'The Handcrafted Brand: Why Artisanal Identity Matters in a Digital World',
  'Why discerning brands are trading sterile digital vector graphics for bespoke, hand-drawn emblems, calligraphy, wax seals, and tactile artisanal branding.',
  'In a marketplace flooded with algorithmic logo generators and identical minimalist tech branding, businesses face a critical dilemma: how do you establish genuine soul, prestige, and memorability?

The answer lies in the revival of **artisanal, hand-drawn brand identities**.

## The Tactile Difference

When a brand mark is created by the hand of a fine artist rather than clicked together with stock vectors, customers sense the difference immediately:
- **Hand-Rendered Emblems:** Custom hand-drawn heraldry, botanical crests, and sacred Indian motifs (such as blooming royal lotuses, peacock plumes, and antique ornate arches).
- **Custom Calligraphy & Lettering:** Unique typographical rhythm crafted with calligraphy pens, fountain nibs, and organic ink washes.
- **Physical Brand Collateral:** Tactile debossed business stationery, antique brass wax seals, hand-stamped packaging, and archival packaging certificates.

## Why Luxury & Heritage Brands Choose Handcrafted Identities

1. **Uniqueness:** A hand-drawn emblem cannot be reverse-engineered by automated design software.
2. **Emotional Depth:** Artisanal design communicates heritage, authenticity, and obsessive attention to quality—qualities that premium hospitality, fine jewellery, culinary, and craft studios prioritize.
3. **Multi-Sensory Impact:** In an increasingly intangible digital world, tactile experiences like textured linen business cards and sealing wax create lasting sensory memories.

At Anjori Arts, our design atelier collaborates with entrepreneurs to create bespoke artistic brand identities that command respect, spark curiosity, and stand the test of time.',
  '/images/categories/customised-branding.jpg',
  'Anjori Arts',
  true,
  '2024-03-18T00:00:00Z',
  ARRAY['Branding', 'Custom Design', 'Artisanal', 'Visual Identity', 'Typography']
),

-- 10. Poster Designing
(
  gen_random_uuid()::text,
  'revival-vintage-indian-poster-art',
  'Graphic Heritage: The Revival of Vintage Indian Poster Art',
  'Uncover the aesthetic evolution of Indian poster design, from 20th-century woodblock exhibition prints and retro typography to modern collectible wall art.',
  'Poster design has always been the visual heartbeat of public communication. In India, the golden era of poster design—spanning early 20th-century Swadeshi exhibition announcements, vintage railway travel prints, and hand-painted cinema hoardings—created an indelible aesthetic tradition.

Today, a passionate revival is underway as vintage graphic design finds its way onto the gallery walls of discerning art lovers.

## Anatomy of Vintage Graphic Heritage

What gives vintage-inspired art posters their irresistible charm?
- **Vernacular & Retro Typography:** Hand-lettered bilingual scripts, ornate serifs, and bold block type that exude historical weight.
- **Block-Print Ornamental Borders:** Intricate floral corner flourishes inspired by Mughal miniature borders and Rajasthani woodblock patterns.
- **Halftone & Paper Textures:** Warm sepia backgrounds, subtle paper grain, and distressed ink textures that evoke the look of historic stone lithography.

## Styling Posters in Modern Spaces

Fine art posters bridge the gap between casual decor and high-end fine art:
- **Gallery Walls:** Grouping framed vintage exhibition posters with varying sizes creates a layered, worldly salon look.
- **Statement Displays:** A large, matted architectural or botanical poster over a study desk or console table adds instant mid-century intellectual charm.
- **Archival Giclée Quality:** Anjori Arts prints its poster designs on 300 GSM acid-free fine art paper using archival pigment inks, ensuring colours remain vibrant for decades.',
  '/images/categories/poster-designing.jpg',
  'Anjori Arts',
  true,
  '2024-04-02T00:00:00Z',
  ARRAY['Poster Design', 'Vintage Art', 'Typography', 'Printmaking', 'Graphic Art']
),

-- 11. Cyanotype Prints
(
  gen_random_uuid()::text,
  'sunlight-alchemy-cyanotype-prints',
  'Sunlight & Alchemy: The 19th-Century Magic of Cyanotype Art',
  'Learn how the delicate alchemy of sunlight, iron salts, and botanical specimens creates luminous Prussian blue cyanotype impressions on deckled cotton paper.',
  'Invented in 1842 by English scientist and astronomer Sir John Herschel, the cyanotype is one of the earliest photographic printing techniques known to humanity. It was soon popularized by Anna Atkins, a British botanist widely celebrated as the world''s first female photographer, who created breathtaking botanical albums using pressed wild ferns and seaweeds.

Today, in an age of instant digital phone cameras, the cyanotype offers a meditative return to solar alchemy and tactile craftsmanship.

## The Chemistry of Solar Printing

Unlike silver-halide photography, cyanotype prints rely entirely on iron salts:
1. **Light-Sensitive Emulsion:** Equal parts of *Potassium Ferricyanide* and *Ferric Ammonium Citrate* are blended in a darkroom to form a light-sensitive, lime-green solution.
2. **Coating Archival Paper:** The emulsion is hand-brushed onto heavy, deckled-edge 300 GSM cotton rag paper, creating organic brushstroke edges.
3. **Solar Exposure:** Freshly harvested botanical specimens—wild ferns, medicinal leaves, or dried wildflowers—are arranged directly on the paper and exposed to natural midday sunlight.
4. **Water Wash & Oxidation:** The paper is submerged in cold flowing water. Unexposed iron salts wash away, while exposed compounds oxidize into an intense, luminous **Prussian Blue** (*Fe4[Fe(CN)6]3*).

## One-of-a-Kind Botanical Silhouettes

Because no two leaves are identical and sunlight intensity shifts with every passing cloud, every single cyanotype print is completely unique. The delicate translucency of plant veins, serrated leaf edges, and natural shadows are permanently captured in brilliant Prussian indigo.

Framed in natural raw oak or floating inside clear glass frames, botanical cyanotypes bring the tranquil beauty of nature into modern sanctuaries.',
  '/images/categories/cyanotype.jpg',
  'Anjori Arts',
  true,
  '2024-04-16T00:00:00Z',
  ARRAY['Cyanotype', 'Sun Print', 'Botanical Art', 'Alternative Photography', 'Handmade']
),

-- 12. Handcrafted Earrings
(
  gen_random_uuid()::text,
  'craft-of-handcrafted-terracotta-earrings',
  'Wearable Stories: The Ancient Craft of Handcrafted Terracotta Jewelry',
  'How 5,000 years of earthen clay tradition is transformed into vibrant, lightweight, hand-painted terracotta jhumkas and contemporary wearable art.',
  'Terracotta—literally meaning "baked earth" in Italian—is among humanity''s oldest creative mediums. In India, terracotta artifacts, ceremonial figurines, and terracotta seals date back over 5,000 years to the ancient Indus Valley Civilization and the temple architectures of Bishnupur, West Bengal.

Today, this earthy craft finds an exquisite modern expression in **handcrafted artisanal jewelry**.

## From Riverbed Clay to Wearable Art

Crafting a pair of fine terracotta earrings requires extraordinary patience and deft fingers:

1. **Clay Purification:** Natural, alluvial clay is filtered through fine sieves to remove gravel, then kneaded with water to achieve silk-like elasticity.
2. **Sculpting Miniature Forms:** Without mechanical molds, artisans hand-sculpt delicate bell shapes (*jhumkas*), textured studs, geometric danglers, and intricate micro-filigree beads.
3. **Sun Drying & Kiln Firing:** The pieces dry in gentle shade for several days before being fired in small artisanal kilns at 700°C to 900°C, transforming fragile raw clay into durable terracotta ceramic stone.
4. **Intricate Hand-Painting:** Using ultra-fine single-hair brushes, artisans paint traditional Indian motifs—lotus petals, peacock feathers, temple borders, and festive gold leaf accents.
5. **Protective Varnishing:** Sealed with hypoallergenic, water-resistant archival varnishes that protect the mineral colors from moisture and daily wear.

## Why Handcrafted Terracotta Jewelry is Loved

- **Surpassingly Lightweight:** Despite their substantial, sculptural presence, well-fired terracotta earrings are feather-light, ensuring comfortable all-day wear without earlobe strain.
- **Skin-Friendly & Organic:** Made from natural Mother Earth, terracotta is completely free from harsh nickel or heavy industrial metals.
- **Effortless Styling:** Hand-painted terracotta earrings transition seamlessly from pairing with traditional Kanjeevarams and handloom khadi saris to elevating white linen shirts and contemporary fusion wear.

Each pair in the Anjori Arts collection is a miniature work of fine art you can carry with you wherever you go.',
  '/images/categories/earrings.jpg',
  'Anjori Arts',
  true,
  '2024-04-30T00:00:00Z',
  ARRAY['Jewelry', 'Terracotta', 'Handcrafted', 'Wearable Art', 'Artisanal']
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  cover_image = EXCLUDED.cover_image,
  author = EXCLUDED.author,
  is_published = EXCLUDED.is_published,
  published_at = EXCLUDED.published_at,
  tags = EXCLUDED.tags,
  updated_at = timezone('utc'::text, now());


-- ==========================================================
-- 5. ADMIN USER PROMOTION (TEMPLATE HELPER)
-- ==========================================================
-- To promote an existing authenticated user to ADMIN, execute:
-- UPDATE arts.profiles 
-- SET role = 'ADMIN' 
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'your-admin-email@example.com');

