-- ============================================================
-- TIBA v2 — Content Management Seed Data
-- Run: psql -h localhost -U postgres -d tiba_db -f seed_content.sql
-- ============================================================

DO $$
DECLARE
  admin_id UUID;
BEGIN

-- Get first admin user id
SELECT id INTO admin_id FROM users WHERE role = 'admin' OR role = 'superadmin' LIMIT 1;
IF admin_id IS NULL THEN
  RAISE NOTICE 'No admin user found. Inserting default admin...';
  INSERT INTO users(email, password_hash, role, is_active)
  VALUES ('admin@tiba.or.th', '$2a$10$dummy_hash_for_seed_only', 'superadmin', true)
  ON CONFLICT DO NOTHING
  RETURNING id INTO admin_id;
  SELECT id INTO admin_id FROM users WHERE email = 'admin@tiba.or.th' LIMIT 1;
END IF;

RAISE NOTICE 'Using admin_id: %', admin_id;

-- ============================================================
-- CONTACT INFO
-- ============================================================
INSERT INTO contact_info(id, address, phone, email, map_embed_url, line_id, facebook_url)
VALUES (
  1,
  '1/2 ถนนจันทร์ แขวงทุ่งมหาเมฆ เขตสาทร กรุงเทพฯ 10120',
  '02-285-7126',
  'info@tiba.or.th',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3876.2!2d100.52!3d13.72!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDQzJzEyLjAiTiAxMDDCsDMxJzEyLjAiRQ!5e0!3m2!1sth!2sth!4v1',
  '@tiba_official',
  'https://www.facebook.com/tibaassociation'
)
ON CONFLICT (id) DO UPDATE SET
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  map_embed_url = EXCLUDED.map_embed_url,
  line_id = EXCLUDED.line_id,
  facebook_url = EXCLUDED.facebook_url,
  updated_at = now();

-- ============================================================
-- BANNERS
-- ============================================================
INSERT INTO banners(image_path, link_url, display_order, is_active) VALUES
  ('/assets/banner-1.jpg', 'https://www.tiba.or.th/courses', 1, true),
  ('/assets/banner-2.jpg', 'https://www.tiba.or.th/membership', 2, true),
  ('/assets/banner-3.jpg', 'https://www.tiba.or.th/news', 3, true),
  ('/assets/banner-4.jpg', NULL, 4, false),
  ('/assets/banner-5.jpg', 'https://www.tiba.or.th', 5, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- ADS
-- ============================================================
INSERT INTO ads(image_path, link_url, position, active_from, active_until, is_active) VALUES
  ('/assets/ad-tip-1.jpg', 'https://www.tiba.or.th/', 'top',    CURRENT_DATE - 10, CURRENT_DATE + 60, true),
  ('/assets/ad-tip-2.jpg', 'https://www.tiba.or.th/', 'top',    CURRENT_DATE - 5,  CURRENT_DATE + 90, true),
  ('/assets/ad-happy-1.jpg','https://www.tiba.or.th/', 'sidebar', CURRENT_DATE,     CURRENT_DATE + 30, true),
  ('/assets/ad-promo-1.jpg','https://www.tiba.or.th/', 'bottom',  CURRENT_DATE,     CURRENT_DATE + 45, true),
  ('/assets/ad-promo-2.jpg','https://www.tiba.or.th/', 'bottom',  CURRENT_DATE - 3, CURRENT_DATE + 20, false),
  ('/assets/ad-promo-3.jpg','https://www.tiba.or.th/', 'popup',   CURRENT_DATE - 1, CURRENT_DATE + 7,  false),
  ('/assets/ad-promo-4.jpg','https://www.tiba.or.th/', 'sidebar', CURRENT_DATE - 2, CURRENT_DATE + 14, false),
  ('/assets/ad-promo-5.jpg','https://www.tiba.or.th/', 'top',     CURRENT_DATE - 4, CURRENT_DATE + 10, false)
ON CONFLICT DO NOTHING;

-- ============================================================
-- PARTNERS (ผู้สนับสนุน)
-- ============================================================
INSERT INTO partners(name, logo_path, website_url, display_order, is_active) VALUES
  ('บริษัท ทิพยประกันภัย จำกัด (มหาชน)',  '/assets/partner-tpi.png',   'https://www.dhipaya.co.th',    1, true),
  ('บริษัท กรุงเทพประกันภัย จำกัด (มหาชน)','/assets/partner-bki.png',   'https://www.bki.co.th',        2, true),
  ('บริษัท วิริยะประกันภัย จำกัด (มหาชน)', '/assets/partner-viriyah.png','https://www.viriyah.co.th',    3, true),
  ('บริษัท เมืองไทยประกันภัย จำกัด (มหาชน)','/assets/partner-mti.png',  'https://www.muangthai.co.th',  4, true),
  ('บริษัท อาคเนย์ประกันภัย จำกัด (มหาชน)','/assets/partner-sec.png',   'https://www.southeastins.co.th',5, true),
  ('บริษัท สินมั่นคงประกันภัย จำกัด (มหาชน)','/assets/partner-smk.png', 'https://www.smk.co.th',        6, true),
  ('บริษัท ชับบ์ สามัคคีประกันภัย จำกัด (มหาชน)','/assets/partner-chubb.png','https://www.chubb.com',   7, false),
  ('บริษัท แอลเอ็มจี ประกันภัย จำกัด (มหาชน)','/assets/partner-lmg.png','https://www.lmginsurance.co.th',8, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- EXECUTIVES (กรรมการบริหาร)
-- ============================================================
INSERT INTO executives(full_name, position_title, photo_path, display_order, is_active) VALUES
  ('คุณวิฑูรย์  คติมุขตานนท์', 'นายกสมาคม',                '/assets/exec-president.jpg',  1, true),
  ('คุณสัมฤทธิ์  พรรณโภ',      'อุปนายก',                   '/assets/exec-2.jpg',          2, true),
  ('คุณวัฒนวงศ์  คติมุขตานนท์','เลขาธิการ',                  '/assets/exec-3.jpg',          3, true),
  ('คุณธัชรัตน์  ศรีรัตนวิเศษ', 'เหรัญญิก',                   '/assets/exec-4.jpg',          4, true),
  ('คุณนวลจิตร  พรัตน์เพ็ชร',   'ปฏิคม',                     '/assets/exec-5.jpg',          5, true),
  ('คุณวรพงศ์  อรุณสวัสดิ์',    'กรรมการ',                   '/assets/exec-6.jpg',          6, true),
  ('คุณนภกร  ชิยงค์คำ',         'กรรมการ',                   '/assets/exec-7.jpg',          7, true),
  ('คุณเถลิงศักดิ์  บุญนาย',    'กรรมการ',                   '/assets/exec-8.jpg',          8, true),
  ('คุณสักรัญจ์บัญญ์  บุญนาย',  'กรรมการ',                   '/assets/exec-9.jpg',          9, true),
  ('คุณมาลาภูฒิ  สุภมลัง',       'กรรมการ',                   '/assets/exec-10.jpg',        10, true),
  ('คุณดร้อง  ดอเอง',            'กรรมการ',                   '/assets/exec-11.jpg',        11, true),
  ('คุณธัฒเจ็ต  สกุลสีเลาหาง',  'กรรมการ',                   '/assets/exec-12.jpg',        12, true),
  ('คุณรัฏฐา  ฝิเอียยยรยาสพอณิ', 'กรรมการ',                  '/assets/exec-13.jpg',        13, true),
  ('คุณธนะกร  สิ้นเดียงลาย',    'กรรมการ',                   '/assets/exec-14.jpg',        14, true),
  ('คุณมัญชลี  อาคินดรวส',      'กรรมการ',                   '/assets/exec-15.jpg',        15, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- STATISTICS FILES (สถิติประกันภัย)
-- ============================================================
INSERT INTO statistics_files(title, description, file_path, published_year, display_order, is_published, uploaded_by) VALUES
  ('สถิติประกันภัย ประจำปี 2567', 'รายงานสถิติธุรกิจประกันวินาศภัยประจำปี 2567', '/uploads/stats/stat-2567.pdf', 2567, 1, true,  admin_id),
  ('สถิติประกันภัย ประจำปี 2566', 'รายงานสถิติธุรกิจประกันวินาศภัยประจำปี 2566', '/uploads/stats/stat-2566.pdf', 2566, 2, true,  admin_id),
  ('สถิติประกันภัย ประจำปี 2565', 'รายงานสถิติธุรกิจประกันวินาศภัยประจำปี 2565', '/uploads/stats/stat-2565.pdf', 2565, 3, true,  admin_id),
  ('สถิติประกันภัย ประจำปี 2564', 'รายงานสถิติธุรกิจประกันวินาศภัยประจำปี 2564', '/uploads/stats/stat-2564.pdf', 2564, 4, true,  admin_id),
  ('สถิติประกันภัย ประจำปี 2563', 'รายงานสถิติธุรกิจประกันวินาศภัยประจำปี 2563', '/uploads/stats/stat-2563.pdf', 2563, 5, false, admin_id),
  ('อัตราเบี้ยประกันภัย Q1/2568',  'สรุปอัตราเบี้ยประกันภัยไตรมาส 1 ปี 2568',    '/uploads/stats/rate-q1-2568.pdf', 2568, 6, true, admin_id)
ON CONFLICT DO NOTHING;

-- ============================================================
-- PUBLIC COMPANIES (บริษัทสมาชิก)
-- ============================================================
INSERT INTO public_companies(name, logo_path, website_url, description, display_order, is_active) VALUES
  ('บริษัท ทิพยประกันภัย จำกัด (มหาชน)',    '/assets/company-tpi.png',   'https://www.dhipaya.co.th',   'ประกันภัยชั้นนำของไทย',              1, true),
  ('บริษัท กรุงเทพประกันภัย จำกัด (มหาชน)', '/assets/company-bki.png',   'https://www.bki.co.th',       'ให้บริการประกันภัยครบวงจร',           2, true),
  ('บริษัท วิริยะประกันภัย จำกัด (มหาชน)',  '/assets/company-viriyah.png','https://www.viriyah.co.th',   'ประกันภัยรถยนต์และประกันภัยทั่วไป',   3, true),
  ('บริษัท เมืองไทยประกันภัย จำกัด (มหาชน)','/assets/company-mti.png',   'https://www.muangthai.co.th', 'บริการประกันภัยครอบคลุมทุกความต้องการ',4, true),
  ('บริษัท อาคเนย์ประกันภัย จำกัด (มหาชน)', '/assets/company-sec.png',   'https://www.southeastins.co.th','ประกันภัยบ้านและทรัพย์สิน',          5, true),
  ('บริษัท สินมั่นคงประกันภัย จำกัด (มหาชน)','/assets/company-smk.png',  'https://www.smk.co.th',       'ประกันภัยยานยนต์และอุบัติเหตุ',       6, true),
  ('บริษัท แอลเอ็มจี ประกันภัย จำกัด (มหาชน)','/assets/company-lmg.png', 'https://www.lmginsurance.co.th','ประกันภัยพาณิชย์และอุตสาหกรรม',     7, true),
  ('บริษัท ชับบ์ สามัคคีประกันภัย จำกัด (มหาชน)','/assets/company-chubb.png','https://www.chubb.com',   'ประกันภัยระดับนานาชาติ',              8, false)
ON CONFLICT DO NOTHING;

-- ============================================================
-- ARTICLES (ข่าวสาร/บทความ)
-- ============================================================
INSERT INTO articles(article_type, title, slug, body, thumbnail_path, is_published, published_at, author_id) VALUES
  ('news', 'TIBA Mangroves Forest Planting 2025',
   'tiba-mangroves-2025',
   '<p>สมาคมนายหน้าประกันภัยไทย ร่วมกิจกรรมปลูกป่าชายเลน เพื่ออนุรักษ์สิ่งแวดล้อม ประจำปี 2568</p>',
   '/assets/news-1.jpg', true, now() - INTERVAL '1 day', admin_id),

  ('news', 'กิจกรรมอบรมนักศึกษาความปลอดภัยทางถนนและส่งเสริมการประกันภัย ประจำปี 2568',
   'road-safety-training-2568',
   '<p>สมาคมฯ จัดอบรมนักศึกษาเรื่องความปลอดภัยทางถนนและการประกันภัยรถยนต์</p>',
   '/assets/news-2.jpg', true, now() - INTERVAL '3 days', admin_id),

  ('news', 'TIBA ร่วมเสวนาในงาน "คปภ.เพื่อ สังคม" จังหวัดสงขลาและภูเก็ต',
   'tiba-oic-social-songkhla',
   '<p>ผู้แทนสมาคมฯ ร่วมเสวนาในงาน คปภ.เพื่อสังคม เพื่อเผยแพร่ความรู้ด้านการประกันภัย</p>',
   '/assets/news-3.jpg', true, now() - INTERVAL '5 days', admin_id),

  ('news', 'TIBA ร่วมสัมมนาออนไลน์ด้านบริการการจัดการสินไหมใหม่ๆ',
   'tiba-claims-seminar-online',
   '<p>สมาคมฯ จัดสัมมนาออนไลน์เรื่องนวัตกรรมการจัดการสินไหมในยุคดิจิทัล</p>',
   '/assets/news-4.jpg', false, NULL, admin_id),

  ('blog', 'กิจกรรมอบรมนักศึกษาความปลอดภัยทางถนนและส่งเสริมการประกันภัย ประจำปี 2568 (ครั้งที่ 2)',
   'road-safety-training-2568-2',
   '<p>สมาคมฯ จัดอบรมรอบที่ 2 สำหรับนักศึกษาในภาคเหนือ</p>',
   '/assets/news-5.jpg', false, NULL, admin_id),

  ('blog', 'กิจกรรมอบรมนักศึกษาความปลอดภัยทางถนนและส่งเสริมการประกันภัย ประจำปี 2568 (ครั้งที่ 3)',
   'road-safety-training-2568-3',
   '<p>สมาคมฯ จัดอบรมรอบที่ 3 สำหรับนักศึกษาในภาคใต้</p>',
   '/assets/news-6.jpg', true, now() - INTERVAL '7 days', admin_id),

  ('news', 'กิจกรรมอบรมนักศึกษาความปลอดภัยทางถนนและส่งเสริมการประกันภัย ประจำปี 2568 (ครั้งที่ 4)',
   'road-safety-training-2568-4',
   '<p>สมาคมฯ จัดอบรมรอบที่ 4 สำหรับนักศึกษาในภาคตะวันออกเฉียงเหนือ</p>',
   '/assets/news-7.jpg', true, now() - INTERVAL '10 days', admin_id),

  ('news', 'กิจกรรมอบรมนักศึกษาความปลอดภัยทางถนนและส่งเสริมการประกันภัย ประจำปี 2568 (ครั้งที่ 5)',
   'road-safety-training-2568-5',
   '<p>สมาคมฯ จัดอบรมรอบที่ 5 สำหรับนักศึกษาในภาคกลาง</p>',
   '/assets/news-8.jpg', true, now() - INTERVAL '14 days', admin_id)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- MEMBER USERS (สมาชิกทั่วไป สำหรับทดสอบ)
-- ============================================================
INSERT INTO users(email, password_hash, role, is_active, last_login_at) VALUES
  ('chayawan@example.com',   '$2a$10$dummy', 'general_member', true,  now() - INTERVAL '2 hours'),
  ('somchai@example.com',    '$2a$10$dummy', 'general_member', true,  now() - INTERVAL '1 day'),
  ('malee@example.com',      '$2a$10$dummy', 'general_member', false, now() - INTERVAL '30 days'),
  ('wanchai@example.com',    '$2a$10$dummy', 'general_member', true,  now() - INTERVAL '3 hours'),
  ('pranee@example.com',     '$2a$10$dummy', 'general_member', true,  now() - INTERVAL '5 days'),
  ('suparerk@example.com',   '$2a$10$dummy', 'general_member', true,  now() - INTERVAL '1 hour'),
  ('patcharee@example.com',  '$2a$10$dummy', 'general_member', false, now() - INTERVAL '60 days'),
  ('kittipong@example.com',  '$2a$10$dummy', 'general_member', true,  now() - INTERVAL '12 hours'),
  ('napaporn@example.com',   '$2a$10$dummy', 'general_member', true,  now() - INTERVAL '2 days'),
  ('thanakorn@example.com',  '$2a$10$dummy', 'general_member', true,  now() - INTERVAL '4 hours')
ON CONFLICT (email) DO NOTHING;

-- Add profiles for member users
DO $$
DECLARE r RECORD;
  names TEXT[][] := ARRAY[
    ARRAY['Chayawan','Phutchana','085-3425516'],
    ARRAY['Somchai','Jaidee','081-2345678'],
    ARRAY['Malee','Srithong','089-3456789'],
    ARRAY['Wanchai','Boonmee','082-4567890'],
    ARRAY['Pranee','Khamchan','083-5678901'],
    ARRAY['Suparerk','Wongsiri','084-6789012'],
    ARRAY['Patcharee','Thongdee','085-7890123'],
    ARRAY['Kittipong','Rattana','086-8901234'],
    ARRAY['Napaporn','Chaimongkol','087-9012345'],
    ARRAY['Thanakorn','Saengkaew','088-0123456']
  ];
  emails TEXT[] := ARRAY['chayawan@example.com','somchai@example.com','malee@example.com','wanchai@example.com','pranee@example.com','suparerk@example.com','patcharee@example.com','kittipong@example.com','napaporn@example.com','thanakorn@example.com'];
  i INT;
  uid UUID;
BEGIN
  FOR i IN 1..10 LOOP
    SELECT id INTO uid FROM users WHERE email = emails[i];
    IF uid IS NOT NULL THEN
      INSERT INTO general_member_profiles(user_id, first_name, last_name, phone)
      VALUES (uid, names[i][1], names[i][2], names[i][3])
      ON CONFLICT (user_id) DO NOTHING;
    END IF;
  END LOOP;
END $$;

END $$;

SELECT 'Seed complete!' AS status;
