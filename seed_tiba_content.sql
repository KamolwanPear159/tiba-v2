-- =============================================================================
-- TIBA v2 — Realistic Seed Data (Thai)
-- Modules: articles, ads, partners, executives
-- Images: /assets/* served by Next.js (public/assets/)
-- Note: tutors table does not exist in the DB schema (no backend support yet)
-- Run: psql -d <db_name> -f seed_tiba_content.sql
-- =============================================================================

-- ── Helpers ──────────────────────────────────────────────────────────────────
-- Using DO block to avoid duplicate-run errors
DO $$
DECLARE
  admin_id UUID;
BEGIN
  SELECT id INTO admin_id FROM users WHERE email = 'admin@tiba.co.th' LIMIT 1;
  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'Admin user not found. Run 001_init_schema.sql first.';
  END IF;
END $$;

-- ── Clear previous seed data (safe to re-run) ────────────────────────────────
DELETE FROM articles    WHERE slug LIKE 'seed-%';
DELETE FROM ads         WHERE link_url LIKE '%tiba.or.th%' AND link_url NOT LIKE '%external%';
DELETE FROM partners    WHERE website_url LIKE '%seed-partner%' OR name LIKE 'บริษัท %ประกันภัย%';
DELETE FROM executives  WHERE position_title IN (
  'นายกสมาคม','อุปนายก','เลขาธิการ','เหรัญญิก','นายทะเบียน','กรรมการ'
);

-- =============================================================================
-- 0. TUTORS / ผู้สอน — 5 items  (requires migration 002_add_tutors.sql first)
-- =============================================================================
INSERT INTO tutors (name, position, photo_path, display_order, is_active)
VALUES
  ('ดร.สมชาย  วิริยะกุล',
   'วิทยากรด้านกฎหมายประกันภัย',
   '/assets/teacher-1.png', 1, true),

  ('อาจารย์วิภาวดี  ศรีสุวรรณ',
   'ผู้เชี่ยวชาญด้านประกันชีวิต',
   '/assets/teacher-2.png', 2, true),

  ('คุณปิยะ  มหาสวัสดิ์',
   'ที่ปรึกษาด้าน InsurTech',
   '/assets/teacher-3.png', 3, true),

  ('รศ.ดร.กมลรัตน์  อนันต์ธนา',
   'นักวิชาการด้านการประกันภัย',
   '/assets/teacher-4.png', 4, true),

  ('คุณอภิชัย  ตันติพงศ์',
   'ผู้บริหารสมาคมนายหน้าประกันภัย',
   '/assets/teacher-5.png', 5, true);

-- =============================================================================
-- 1. ARTICLES (ข่าวสารและบทความ) — 4 news, 2 blog
-- =============================================================================
INSERT INTO articles
  (article_type, title, slug, body, thumbnail_path, is_published, published_at, author_id)
SELECT
  article_type, title, slug, body, thumbnail_path, is_published, published_at,
  (SELECT id FROM users WHERE email = 'admin@tiba.co.th' LIMIT 1)
FROM (VALUES
  (
    'news'::article_type,
    'TIBA จัดกิจกรรมปลูกป่าชายเลน ร่วมอนุรักษ์ธรรมชาติ ปี 2568',
    'seed-tiba-mangrove-2025',
    '<p>สมาคมนายหน้าประกันภัยไทย (TIBA) ร่วมกับสมาชิกกว่า 120 ท่าน จัดกิจกรรมปลูกป่าชายเลน บริเวณอ่าวไทย จ.ชลบุรี เพื่ออนุรักษ์ระบบนิเวศชายฝั่งและลดการปล่อยก๊าซคาร์บอนไดออกไซด์ ประจำปี 2568</p><p>กิจกรรมครั้งนี้นับเป็นส่วนหนึ่งของโครงการ "TIBA Green Future" ที่สมาคมดำเนินการต่อเนื่องมาเป็นปีที่ 3 โดยมีเป้าหมายปลูกต้นกล้าชายเลนให้ได้ 10,000 ต้นภายในปี 2570</p>',
    '/assets/news-thumb-1.png',
    true,
    NOW() - INTERVAL '5 days'
  ),
  (
    'news'::article_type,
    'TIBA ประชุมใหญ่สามัญประจำปี 2568 พร้อมเลือกตั้งคณะกรรมการชุดใหม่',
    'seed-tiba-agm-2025',
    '<p>สมาคมนายหน้าประกันภัยไทย จัดการประชุมใหญ่สามัญประจำปี 2568 ณ โรงแรมแกรนด์ไฮแอท เอราวัณ กรุงเทพฯ มีสมาชิกเข้าร่วมกว่า 300 ท่าน</p><p>ที่ประชุมมีมติเลือกตั้งคณะกรรมการบริหารชุดใหม่ วาระปี 2568–2570 พร้อมทั้งรายงานผลการดำเนินงานและงบประมาณประจำปีที่ผ่านมา</p>',
    '/assets/news-thumb-2.png',
    true,
    NOW() - INTERVAL '12 days'
  ),
  (
    'news'::article_type,
    'TIBA ร่วมงาน Thailand Insurance Symposium 2025 นำเสนอนวัตกรรมด้านประกันภัย',
    'seed-tiba-insurance-symposium-2025',
    '<p>สมาคมนายหน้าประกันภัยไทย เข้าร่วมงาน Thailand Insurance Symposium 2025 ซึ่งจัดขึ้น ณ ศูนย์นิทรรศการและการประชุมไบเทค บางนา กรุงเทพฯ</p><p>TIBA นำเสนอบทบาทของนายหน้าประกันภัยในยุคดิจิทัล และแนวทางการให้บริการลูกค้าด้วยเทคโนโลยี InsurTech เพื่อยกระดับมาตรฐานวิชาชีพนายหน้าประกันภัยไทย</p>',
    '/assets/news-thumb-3.png',
    true,
    NOW() - INTERVAL '20 days'
  ),
  (
    'news'::article_type,
    'TIBA เปิดอบรมหลักสูตร "กฎหมายประกันภัยสำหรับนายหน้า" รุ่นที่ 15',
    'seed-tiba-training-law-r15',
    '<p>สมาคมนายหน้าประกันภัยไทย เปิดรับสมัครผู้เข้าอบรมหลักสูตร "กฎหมายประกันภัยสำหรับนายหน้าประกันภัย" รุ่นที่ 15 ประจำปี 2568</p><p>หลักสูตรนี้เหมาะสำหรับนายหน้าประกันภัยที่ต้องการเพิ่มพูนความรู้ด้านกฎหมาย และต่ออายุใบอนุญาตนายหน้าประกันภัย ผ่านการอบรมแบบ Online ผ่านระบบ Zoom</p>',
    '/assets/news-thumb-4.png',
    true,
    NOW() - INTERVAL '30 days'
  ),
  (
    'blog'::article_type,
    '5 เทคนิคเพิ่มยอดขายประกันภัยในยุคดิจิทัล ที่นายหน้ามืออาชีพต้องรู้',
    'seed-blog-5-tips-digital-sales',
    '<p>ในยุคที่ผู้บริโภคค้นหาข้อมูลผ่านออนไลน์มากขึ้น นายหน้าประกันภัยที่ต้องการเติบโตต้องปรับตัวให้ทันความเปลี่ยนแปลง บทความนี้รวบรวม 5 เทคนิคสำคัญที่จะช่วยเพิ่มยอดขายและขยายฐานลูกค้า</p><h3>1. สร้างตัวตนในโลกออนไลน์</h3><p>การมี Facebook Page, LINE OA หรือเว็บไซต์ส่วนตัว ช่วยให้ลูกค้าค้นหาเราเจอได้ง่ายขึ้น</p><h3>2. ใช้ Content Marketing</h3><p>แชร์ความรู้เรื่องประกันภัยที่เป็นประโยชน์ผ่านโซเชียลมีเดียเพื่อสร้างความน่าเชื่อถือ</p>',
    '/assets/news-featured.png',
    true,
    NOW() - INTERVAL '8 days'
  ),
  (
    'blog'::article_type,
    'ความแตกต่างระหว่าง "นายหน้าประกันภัย" กับ "ตัวแทนประกันภัย" ที่คุณควรรู้',
    'seed-blog-broker-vs-agent',
    '<p>หลายคนยังสับสนระหว่างนายหน้าประกันภัย (Insurance Broker) กับตัวแทนประกันภัย (Insurance Agent) ทั้งที่ทั้งสองอาชีพนี้มีบทบาทและความรับผิดชอบที่แตกต่างกันอย่างมีนัยสำคัญ</p><p><strong>นายหน้าประกันภัย</strong> ทำหน้าที่เป็นตัวแทนของผู้เอาประกัน ค้นหาผลิตภัณฑ์ที่เหมาะสมจากหลายบริษัท โดยยึดประโยชน์ของลูกค้าเป็นหลัก</p><p><strong>ตัวแทนประกันภัย</strong> ทำหน้าที่เป็นตัวแทนของบริษัทประกันภัย นำเสนอผลิตภัณฑ์ของบริษัทนั้น ๆ เท่านั้น</p>',
    '/assets/news-thumb-2.png',
    true,
    NOW() - INTERVAL '15 days'
  )
) AS v(article_type, title, slug, body, thumbnail_path, is_published, published_at)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- 2. ADS (โฆษณา) — 4 items
-- =============================================================================
INSERT INTO ads (image_path, link_url, position, active_from, active_until, is_active)
VALUES
  ('/assets/partner-ad-large.png', 'https://www.tiba.or.th/membership', 'top',
   CURRENT_DATE - 5, CURRENT_DATE + 60, true),

  ('/assets/partner-ad-1.png', 'https://www.tiba.or.th/courses', 'sidebar',
   CURRENT_DATE - 3, CURRENT_DATE + 90, true),

  ('/assets/partner-ad-2.png', 'https://www.tiba.or.th/news', 'bottom',
   CURRENT_DATE, CURRENT_DATE + 45, true),

  ('/assets/partner-ad-3.png', 'https://www.tiba.or.th/partners', 'popup',
   CURRENT_DATE, CURRENT_DATE + 30, false);

-- =============================================================================
-- 3. PARTNERS / ผู้สนับสนุน — 5 items
-- =============================================================================
INSERT INTO partners (name, logo_path, website_url, display_order, is_active)
VALUES
  ('บริษัท ทิพยประกันภัย จำกัด (มหาชน)',
   '/assets/sponsor-1.png', 'https://www.dhipaya.co.th', 1, true),

  ('บริษัท กรุงเทพประกันภัย จำกัด (มหาชน)',
   '/assets/sponsor-2.png', 'https://www.bki.co.th', 2, true),

  ('บริษัท วิริยะประกันภัย จำกัด (มหาชน)',
   '/assets/sponsor-3.png', 'https://www.viriyah.co.th', 3, true),

  ('บริษัท เมืองไทยประกันภัย จำกัด (มหาชน)',
   '/assets/sponsor-4.png', 'https://www.muangthai.co.th', 4, true),

  ('บริษัท สินมั่นคงประกันภัย จำกัด (มหาชน)',
   '/assets/sponsor-5.png', 'https://www.smk.co.th', 5, true);

-- =============================================================================
-- 4. EXECUTIVES / กรรมการบริหาร — 6 items
-- =============================================================================
INSERT INTO executives (full_name, position_title, photo_path, display_order, is_active)
VALUES
  ('ดร.วิฑูรย์  คติมุขตานนท์',
   'นายกสมาคม',
   '/assets/teacher-1.png', 1, true),

  ('คุณสัมฤทธิ์  พรรณโภ',
   'อุปนายก คนที่ 1',
   '/assets/teacher-2.png', 2, true),

  ('คุณวัฒนวงศ์  พัฒนวิบูลย์',
   'อุปนายก คนที่ 2',
   '/assets/teacher-3.png', 3, true),

  ('คุณกมลา  ศิริพรหม',
   'เลขาธิการ',
   '/assets/teacher-4.png', 4, true),

  ('คุณปรีชา  ทรัพย์สมบัติ',
   'เหรัญญิก',
   '/assets/teacher-5.png', 5, true),

  ('คุณอาทิตย์  สุวรรณโณ',
   'นายทะเบียน',
   '/assets/teacher-1.png', 6, true);

-- =============================================================================
-- 5. TUTORS — skipped (no tutors table in database schema)
--    The admin service frontend has CRUD for tutors but the backend has no
--    corresponding table or controller. Implement via a new migration if needed.
-- =============================================================================

-- ── Summary ──────────────────────────────────────────────────────────────────
DO $$
BEGIN
  RAISE NOTICE 'Seed complete:';
  RAISE NOTICE '  tutors    = %', (SELECT COUNT(*) FROM tutors);
  RAISE NOTICE '  articles  = %', (SELECT COUNT(*) FROM articles WHERE slug LIKE 'seed-%');
  RAISE NOTICE '  ads       = %', (SELECT COUNT(*) FROM ads);
  RAISE NOTICE '  partners  = %', (SELECT COUNT(*) FROM partners);
  RAISE NOTICE '  executives= %', (SELECT COUNT(*) FROM executives);
END $$;
