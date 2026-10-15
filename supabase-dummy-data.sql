-- =============================================================
-- Dummy Data for Ecommerce App (Supabase)
-- Run this in Supabase SQL Editor AFTER the schema is created
-- =============================================================

-- ==================== BRANDS ====================
INSERT INTO brands (id, name, slug, description, image, is_active) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'EcoCraft', 'ecocraft', 'Premium handcrafted eco-friendly bags made from sustainable materials.', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&h=400&fit=crop', true),
  ('b0000002-0000-0000-0000-000000000002', 'GreenStitch', 'greenstitch', 'Sustainable fashion accessories for the environmentally conscious.', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', true),
  ('b0000003-0000-0000-0000-000000000003', 'NaturaBags', 'naturabags', 'Natural fibre bags that combine style with sustainability.', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop', true),
  ('b0000004-0000-0000-0000-000000000004', 'UrbanJute', 'urbanjute', 'Modern jute products designed for everyday urban life.', 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=400&fit=crop', true),
  ('b0000005-0000-0000-0000-000000000005', 'DenimCo', 'denimco', 'Upcycled denim transformed into trendy bags and accessories.', 'https://images.unsplash.com/photo-1582719188393-bb71ca45dbb9?w=400&h=400&fit=crop', true),
  ('b0000006-0000-0000-0000-000000000006', 'PouchPerfect', 'pouchperfect', 'Elegantly crafted pouches for all your everyday essentials.', 'https://images.unsplash.com/photo-1606522754091-a3bbf9ad4cb3?w=400&h=400&fit=crop', true);

-- ==================== CATEGORIES ====================
INSERT INTO categories (id, name, description, slug, featured, image) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'Canvas Bags', 'Durable and stylish canvas bags perfect for everyday use. Made from high-quality cotton canvas with reinforced stitching for long-lasting performance.', 'canvas-bags', true, '/categoryImages/canvas bags.webp'),
  ('c0000002-0000-0000-0000-000000000002', 'Cotton Bags', 'Lightweight and eco-friendly cotton bags ideal for shopping, travel, and daily errands. Soft, washable, and 100% biodegradable.', 'cotton-bags', true, '/categoryImages/cotton bag.webp'),
  ('c0000003-0000-0000-0000-000000000003', 'Denim Bags', 'Trendy upcycled denim bags that make a bold fashion statement. Each piece is uniquely crafted from premium recycled denim.', 'denim-bags', true, '/categoryImages/denim bags.webp'),
  ('c0000004-0000-0000-0000-000000000004', 'File Folders', 'Eco-friendly file folders and document organizers made from sustainable materials. Keep your documents safe and organized in style.', 'file-folders', false, '/categoryImages/file folder.webp'),
  ('c0000005-0000-0000-0000-000000000005', 'Jute Bags', 'Classic jute bags with a rustic charm. Strong, biodegradable, and perfect for groceries, gifts, and everyday carrying needs.', 'jute-bags', true, '/categoryImages/JUTE BAGS.webp'),
  ('c0000006-0000-0000-0000-000000000006', 'Pouches', 'Compact and versatile pouches for cosmetics, stationery, and travel essentials. Available in a variety of fabrics and designs.', 'pouches', true, '/categoryImages/pouch.webp');

-- ==================== PRODUCTS ====================

-- ────────────── Canvas Bags Products ──────────────
INSERT INTO products (id, name, category_id, description, featured, is_active, image, images, price, quantity, slug, size, fabric, color, weight) VALUES
(
  'a0000001-0000-0000-0000-000000000001',
  'Classic Canvas Tote Bag',
  'c0000001-0000-0000-0000-000000000001',
  'A timeless canvas tote bag with a spacious interior. Features sturdy handles and an inner pocket for your essentials. Perfect for daily shopping, beach trips, or casual outings. Made from 12oz heavy-duty cotton canvas.',
  true, true,
  'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1581605405669-fcdf81165b94?w=600&h=600&fit=crop'],
  499.00, 50, 'classic-canvas-tote-bag', 'Large (40x35x12 cm)', 'Cotton Canvas 12oz', ARRAY['Natural', 'Black', 'Navy'], '350g'
),
(
  'a0000002-0000-0000-0000-000000000002',
  'Canvas Crossbody Messenger Bag',
  'c0000001-0000-0000-0000-000000000001',
  'A versatile crossbody messenger bag made from washed canvas. Features adjustable shoulder strap, magnetic flap closure, multiple compartments, and a padded laptop sleeve. Great for work or travel.',
  true, true,
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop'],
  1299.00, 30, 'canvas-crossbody-messenger-bag', 'Medium (35x28x10 cm)', 'Washed Cotton Canvas', ARRAY['Olive Green', 'Charcoal', 'Tan'], '480g'
),
(
  'a0000003-0000-0000-0000-000000000003',
  'Canvas Drawstring Backpack',
  'c0000001-0000-0000-0000-000000000001',
  'A lightweight drawstring backpack crafted from premium canvas. Ideal for gym sessions, school, or a quick day out. Features a drawstring closure with an additional zip pocket on the front.',
  false, true,
  'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1581605405669-fcdf81165b94?w=600&h=600&fit=crop'],
  399.00, 75, 'canvas-drawstring-backpack', 'Standard (42x34 cm)', 'Cotton Canvas 10oz', ARRAY['White', 'Black', 'Grey', 'Red'], '250g'
),

-- ────────────── Cotton Bags Products ──────────────
(
  'a0000004-0000-0000-0000-000000000004',
  'Organic Cotton Shopping Bag',
  'c0000002-0000-0000-0000-000000000002',
  'A spacious organic cotton shopping bag with long handles. GOTS certified organic cotton, printed with water-based inks. Folds flat for easy storage. Say goodbye to plastic bags with this reusable eco-friendly alternative.',
  true, true,
  'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1607349913338-fca6f7fc608a?w=600&h=600&fit=crop'],
  249.00, 120, 'organic-cotton-shopping-bag', 'Large (42x38 cm)', '100% GOTS Organic Cotton', ARRAY['Natural', 'Cream'], '180g'
),
(
  'a0000005-0000-0000-0000-000000000005',
  'Cotton Sling Bag with Block Print',
  'c0000002-0000-0000-0000-000000000002',
  'A beautifully hand-block-printed cotton sling bag featuring traditional Indian motifs. Handmade by artisans using natural dyes. Comes with an adjustable strap and inner lining.',
  true, true,
  'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=600&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop'],
  599.00, 40, 'cotton-sling-bag-block-print', 'Medium (30x25x8 cm)', 'Hand Block Printed Cotton', ARRAY['Indigo', 'Red', 'Mustard'], '220g'
),
(
  'a0000006-0000-0000-0000-000000000006',
  'Cotton Tote with Zipper Closure',
  'c0000002-0000-0000-0000-000000000002',
  'A practical cotton tote bag with a full-length zipper closure for added security. Features an interior zip pocket and a sturdy base. Made from 8oz premium cotton with reinforced handles.',
  false, true,
  'https://images.unsplash.com/photo-1607349913338-fca6f7fc608a?w=600&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1607349913338-fca6f7fc608a?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop'],
  449.00, 60, 'cotton-tote-zipper-closure', 'Medium (38x32x10 cm)', 'Premium Cotton 8oz', ARRAY['Black', 'Natural', 'Sage Green'], '280g'
),

-- ────────────── Denim Bags Products ──────────────
(
  'a0000007-0000-0000-0000-000000000007',
  'Upcycled Denim Tote Bag',
  'c0000003-0000-0000-0000-000000000003',
  'A one-of-a-kind tote bag made from upcycled denim jeans. Each bag is unique with its own wash and distressing pattern. Features cotton lining, inner pocket, and sturdy handles. Eco-friendly fashion at its best.',
  true, true,
  'https://images.unsplash.com/photo-1582719188393-bb71ca45dbb9?w=600&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1582719188393-bb71ca45dbb9?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1578932750355-5eb30ece487f?w=600&h=600&fit=crop'],
  899.00, 25, 'upcycled-denim-tote-bag', 'Large (40x36x12 cm)', 'Upcycled Denim', ARRAY['Light Wash', 'Dark Wash', 'Medium Wash'], '450g'
),
(
  'a0000008-0000-0000-0000-000000000008',
  'Denim Patchwork Shoulder Bag',
  'c0000003-0000-0000-0000-000000000003',
  'A beautifully crafted patchwork shoulder bag combining different shades of denim. Features a magnetic snap closure, adjustable strap, and multiple pockets. A sustainable fashion accessory that turns heads.',
  true, true,
  'https://images.unsplash.com/photo-1578932750355-5eb30ece487f?w=600&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1578932750355-5eb30ece487f?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1582719188393-bb71ca45dbb9?w=600&h=600&fit=crop'],
  1199.00, 20, 'denim-patchwork-shoulder-bag', 'Medium (32x28x10 cm)', 'Patchwork Denim', ARRAY['Mixed Blue', 'Blue & White'], '380g'
),
(
  'a0000009-0000-0000-0000-000000000009',
  'Denim Laptop Sleeve',
  'c0000003-0000-0000-0000-000000000003',
  'Protect your laptop in style with this padded denim sleeve. Fits laptops up to 15 inches. Features foam padding, soft fleece lining, and a YKK zipper. Made from durable recycled denim.',
  false, true,
  'https://images.unsplash.com/photo-1625205299913-1b22cdba3790?w=600&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1625205299913-1b22cdba3790?w=600&h=600&fit=crop'],
  749.00, 35, 'denim-laptop-sleeve', '15 inch (38x27x2 cm)', 'Recycled Denim with Foam Padding', ARRAY['Dark Blue', 'Black Denim'], '320g'
),

-- ────────────── File Folders Products ──────────────
(
  'a0000010-0000-0000-0000-000000000010',
  'Jute File Folder A4',
  'c0000004-0000-0000-0000-000000000004',
  'An elegant A4 file folder made from natural jute fabric with cotton lining. Features a button-loop closure and a name card slot. Perfect for office documents, presentations, and conferences.',
  true, true,
  'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&h=600&fit=crop'],
  349.00, 80, 'jute-file-folder-a4', 'A4 (33x24 cm)', 'Natural Jute with Cotton Lining', ARRAY['Natural', 'Brown'], '200g'
),
(
  'a0000011-0000-0000-0000-000000000011',
  'Canvas Document Organizer',
  'c0000004-0000-0000-0000-000000000004',
  'A multi-pocket canvas document organizer with zipper closure. Features 5 compartments for files, a pen holder, and a card slot. Made from heavy-duty washed canvas with a leather pull tab.',
  false, true,
  'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&h=600&fit=crop'],
  549.00, 45, 'canvas-document-organizer', 'A4 (35x26x3 cm)', 'Heavy-Duty Washed Canvas', ARRAY['Charcoal', 'Khaki'], '300g'
),
(
  'a0000012-0000-0000-0000-000000000012',
  'Eco-Friendly Folder Set (Pack of 3)',
  'c0000004-0000-0000-0000-000000000004',
  'A set of 3 eco-friendly file folders in different colors. Made from recycled kraft paper with jute binding. String-tie closure keeps your documents secure. Great for gifting and corporate use.',
  false, true,
  'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=600&fit=crop'],
  699.00, 60, 'eco-friendly-folder-set-3', 'A4 (32x24 cm each)', 'Recycled Kraft Paper + Jute', ARRAY['Assorted'], '350g'
),

-- ────────────── Jute Bags Products ──────────────
(
  'a0000013-0000-0000-0000-000000000013',
  'Jute Grocery Bag with Cane Handle',
  'c0000005-0000-0000-0000-000000000005',
  'A sturdy jute grocery bag featuring natural cane handles. Laminated interior for easy cleaning. Can hold up to 15kg. The perfect sustainable replacement for plastic grocery bags.',
  true, true,
  'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=600&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=600&h=600&fit=crop'],
  399.00, 100, 'jute-grocery-bag-cane-handle', 'Large (40x30x18 cm)', 'Natural Jute (Laminated)', ARRAY['Natural', 'Natural with Red Trim'], '400g'
),
(
  'a0000014-0000-0000-0000-000000000014',
  'Printed Jute Gift Bag',
  'c0000005-0000-0000-0000-000000000005',
  'A beautifully screen-printed jute gift bag with satin ribbon handles. Available in multiple festive designs. Perfect for weddings, Diwali, Christmas, and corporate gifting.',
  true, true,
  'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=600&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=600&h=600&fit=crop'],
  299.00, 150, 'printed-jute-gift-bag', 'Medium (28x22x10 cm)', 'Printed Jute with Satin Handles', ARRAY['Floral', 'Paisley', 'Festive Gold'], '180g'
),
(
  'a0000015-0000-0000-0000-000000000015',
  'Jute Wine Bottle Bag (Pack of 2)',
  'c0000005-0000-0000-0000-000000000005',
  'An elegant jute wine bottle bag set. Features a drawstring closure and a small window to display the bottle label. Perfect for gifting wine or champagne bottles with a sustainable touch.',
  false, true,
  'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&h=600&fit=crop'],
  349.00, 70, 'jute-wine-bottle-bag-2-pack', 'Single Bottle (35x15 cm)', 'Natural Jute with Drawstring', ARRAY['Natural', 'Natural with Lace'], '150g'
),
(
  'a0000016-0000-0000-0000-000000000016',
  'Jute Beach Tote with Cotton Lining',
  'c0000005-0000-0000-0000-000000000005',
  'A roomy jute beach tote bag with colourful cotton lining and rope handles. Features a magnetic snap closure, interior zip pocket, and a waterproof base. Summer essentials never looked this good.',
  true, true,
  'https://images.unsplash.com/photo-1523199455310-87b16c0eed36?w=600&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1523199455310-87b16c0eed36?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=600&h=600&fit=crop'],
  799.00, 40, 'jute-beach-tote-cotton-lining', 'Extra Large (50x35x18 cm)', 'Jute with Cotton Lining', ARRAY['Natural/Blue', 'Natural/Red', 'Natural/Green'], '500g'
),

-- ────────────── Pouches Products ──────────────
(
  'a0000017-0000-0000-0000-000000000017',
  'Cotton Canvas Makeup Pouch',
  'c0000006-0000-0000-0000-000000000006',
  'A chic cotton canvas makeup pouch with a waterproof lining. Features a durable brass zipper and a flat base for easy access. Compact yet spacious enough for all your cosmetics.',
  true, true,
  'https://images.unsplash.com/photo-1606522754091-a3bbf9ad4cb3?w=600&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1606522754091-a3bbf9ad4cb3?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&h=600&fit=crop'],
  299.00, 90, 'cotton-canvas-makeup-pouch', 'Small (20x12x6 cm)', 'Cotton Canvas with Waterproof Lining', ARRAY['White', 'Pink', 'Black', 'Sage'], '120g'
),
(
  'a0000018-0000-0000-0000-000000000018',
  'Jute Pencil Case / Stationery Pouch',
  'c0000006-0000-0000-0000-000000000006',
  'A minimalist jute stationery pouch with a wooden button closure. Fits pens, pencils, markers, and small rulers. Eco-friendly school and office supply organizer for the conscious consumer.',
  false, true,
  'https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&h=600&fit=crop'],
  199.00, 110, 'jute-pencil-case-stationery-pouch', 'Standard (22x8x5 cm)', 'Natural Jute', ARRAY['Natural', 'Natural with Print'], '80g'
),
(
  'a0000019-0000-0000-0000-000000000019',
  'Travel Toiletry Pouch Set (Pack of 3)',
  'c0000006-0000-0000-0000-000000000006',
  'A set of 3 nesting travel pouches in small, medium, and large sizes. Made from water-resistant cotton canvas with YKK zippers. Keeps your toiletries organized on the go. Machine washable.',
  true, true,
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop', 'https://images.unsplash.com/photo-1606522754091-a3bbf9ad4cb3?w=600&h=600&fit=crop'],
  549.00, 55, 'travel-toiletry-pouch-set-3', 'S/M/L (15x10, 22x14, 28x18 cm)', 'Water-Resistant Cotton Canvas', ARRAY['Grey', 'Navy', 'Beige'], '200g'
),
(
  'a0000020-0000-0000-0000-000000000020',
  'Hand-Embroidered Coin Pouch',
  'c0000006-0000-0000-0000-000000000006',
  'A delicate hand-embroidered coin pouch with a kiss-lock metal frame. Crafted by skilled artisans using traditional embroidery techniques. Makes for a perfect small gift or personal accessory.',
  false, true,
  'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=600&h=600&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=600&h=600&fit=crop'],
  349.00, 65, 'hand-embroidered-coin-pouch', 'Mini (12x10 cm)', 'Embroidered Cotton', ARRAY['Multicolor', 'Blue Floral', 'Red Floral'], '60g'
);
