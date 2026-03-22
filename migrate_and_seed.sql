-- =============================================================================
-- TIBA v2 — Migration & Mockup Seed
-- Database : tiba_db  |  User : postgres  |  Port : 5432
-- Run      : psql -h localhost -U postgres -d tiba_db -f migrate_and_seed.sql
-- Idempotent: safe to run multiple times (DELETE + INSERT pattern)
-- =============================================================================

SET client_encoding = 'UTF8';
SET client_min_messages = warning;

-- ─────────────────────────────────────────────────────────────────────────────
-- 0. FIXED UUIDs  (used across sections so FK links stay consistent)
-- ─────────────────────────────────────────────────────────────────────────────
-- users
-- admin            : 'aaaaaaaa-0000-0000-0000-000000000001'
-- general_member 1 : 'bbbbbbbb-0000-0000-0000-000000000001'
-- general_member 2 : 'bbbbbbbb-0000-0000-0000-000000000002'
-- assoc_main 1     : 'cccccccc-0000-0000-0000-000000000001'
-- assoc_main 2     : 'cccccccc-0000-0000-0000-000000000002'
-- assoc_sub 1      : 'dddddddd-0000-0000-0000-000000000001'
-- courses
-- course 1         : 'eeeeeeee-0000-0000-0000-000000000001'
-- course 2         : 'eeeeeeee-0000-0000-0000-000000000002'
-- course 3         : 'eeeeeeee-0000-0000-0000-000000000003'
-- sessions
-- session 1-1      : 'ffffffff-0000-0000-0000-000000000001'
-- session 1-2      : 'ffffffff-0000-0000-0000-000000000002'
-- session 2-1      : 'ffffffff-0000-0000-0000-000000000003'
-- session 3-1      : 'ffffffff-0000-0000-0000-000000000004'
-- registrations
-- reg 1            : '11111111-aaaa-0000-0000-000000000001'
-- reg 2            : '11111111-aaaa-0000-0000-000000000002'
-- enrollments
-- enroll 1         : '22222222-bbbb-0000-0000-000000000001'
-- enroll 2         : '22222222-bbbb-0000-0000-000000000002'
-- price_benefit_plans
-- plan general     : '33333333-cccc-0000-0000-000000000001'
-- plan assoc_co    : '33333333-cccc-0000-0000-000000000002'
-- plan assoc_indv  : '33333333-cccc-0000-0000-000000000003'

-- =============================================================================
-- SECTION 1 : USERS
-- =============================================================================
DELETE FROM public.users WHERE id IN (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'bbbbbbbb-0000-0000-0000-000000000001',
  'bbbbbbbb-0000-0000-0000-000000000002',
  'cccccccc-0000-0000-0000-000000000001',
  'cccccccc-0000-0000-0000-000000000002',
  'dddddddd-0000-0000-0000-000000000001'
);

INSERT INTO public.users (id, email, password_hash, role, is_active, email_verified_at)
VALUES
  -- Admin  (password: Admin1234!)
  ('aaaaaaaa-0000-0000-0000-000000000001',
   'admin@tiba.co.th',
   crypt('Admin1234!', gen_salt('bf')),
   'admin', true, now()),

  -- General members  (password: Member1234!)
  ('bbbbbbbb-0000-0000-0000-000000000001',
   'somchai.k@gmail.com',
   crypt('Member1234!', gen_salt('bf')),
   'general_member', true, now()),

  ('bbbbbbbb-0000-0000-0000-000000000002',
   'wanida.s@hotmail.com',
   crypt('Member1234!', gen_salt('bf')),
   'general_member', true, now()),

  -- Association main users  (password: Assoc1234!)
  ('cccccccc-0000-0000-0000-000000000001',
   'contact@abibroker.co.th',
   crypt('Assoc1234!', gen_salt('bf')),
   'association_main', true, now()),

  ('cccccccc-0000-0000-0000-000000000002',
   'info@thaibroker.com',
   crypt('Assoc1234!', gen_salt('bf')),
   'association_main', true, now()),

  -- Association sub user  (password: Sub1234!)
  ('dddddddd-0000-0000-0000-000000000001',
   'staff01@abibroker.co.th',
   crypt('Sub1234!', gen_salt('bf')),
   'association_sub', true, now());

-- =============================================================================
-- SECTION 2 : GENERAL MEMBER PROFILES
-- =============================================================================
DELETE FROM public.general_member_profiles
WHERE user_id IN (
  'bbbbbbbb-0000-0000-0000-000000000001',
  'bbbbbbbb-0000-0000-0000-000000000002'
);

INSERT INTO public.general_member_profiles (user_id, first_name, last_name, phone, address)
VALUES
  ('bbbbbbbb-0000-0000-0000-000000000001',
   'สมชาย', 'กิจเจริญ', '081-234-5678',
   '123 ถ.รัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400'),

  ('bbbbbbbb-0000-0000-0000-000000000002',
   'วนิดา', 'สุขสวัสดิ์', '089-876-5432',
   '456 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110');

-- =============================================================================
-- SECTION 3 : ASSOCIATION REGISTRATIONS
-- =============================================================================
DELETE FROM public.association_registrations WHERE id IN (
  '11111111-aaaa-0000-0000-000000000001',
  '11111111-aaaa-0000-0000-000000000002'
);

INSERT INTO public.association_registrations
  (id, user_id, entity_type, status,
   org_name, tax_id, phone, address,
   first_name, last_name,
   doc_registration_cert, doc_id_card,
   first_reviewed_by, first_reviewed_at, first_review_note,
   second_reviewed_by, second_reviewed_at, second_review_note,
   payment_confirmed_by, payment_confirmed_at)
VALUES
  -- Accepted company registration
  ('11111111-aaaa-0000-0000-000000000001',
   'cccccccc-0000-0000-0000-000000000001',
   'company', 'accepted',
   'บริษัท เอบีไอ โบรกเกอร์ จำกัด', '0105560123456',
   '02-123-4567',
   '99 ถ.สีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500',
   NULL, NULL,
   '/uploads/docs/reg-cert-001.pdf',
   '/uploads/docs/id-card-001.pdf',
   'aaaaaaaa-0000-0000-0000-000000000001', now() - interval '30 days',
   'เอกสารครบถ้วน ผ่านการตรวจสอบ',
   'aaaaaaaa-0000-0000-0000-000000000001', now() - interval '25 days',
   'ผ่านการอนุมัติรอบสอง',
   'aaaaaaaa-0000-0000-0000-000000000001', now() - interval '20 days'),

  -- In-progress individual registration
  ('11111111-aaaa-0000-0000-000000000002',
   'cccccccc-0000-0000-0000-000000000002',
   'individual', 'in_progress_second_payment',
   NULL, NULL,
   '085-999-1234',
   '78 ถ.พระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310',
   'ธีรพงศ์', 'ไทยโบรกเกอร์',
   '/uploads/docs/reg-cert-002.pdf',
   '/uploads/docs/id-card-002.pdf',
   'aaaaaaaa-0000-0000-0000-000000000001', now() - interval '5 days',
   'ผ่านการตรวจสอบรอบแรก รอชำระค่าสมัคร',
   NULL, NULL, NULL,
   NULL, NULL);

-- =============================================================================
-- SECTION 4 : ASSOCIATION PROFILES  (only for accepted registrations)
-- =============================================================================
DELETE FROM public.association_profiles
WHERE user_id = 'cccccccc-0000-0000-0000-000000000001';

INSERT INTO public.association_profiles
  (user_id, registration_id, entity_type, display_name,
   tax_id, phone, address, membership_number, membership_expiry_date)
VALUES
  ('cccccccc-0000-0000-0000-000000000001',
   '11111111-aaaa-0000-0000-000000000001',
   'company',
   'บริษัท เอบีไอ โบรกเกอร์ จำกัด',
   '0105560123456',
   '02-123-4567',
   '99 ถ.สีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500',
   'MEM-2025-0001',
   CURRENT_DATE + interval '1 year');

-- =============================================================================
-- SECTION 5 : ASSOCIATION SUB USERS
-- =============================================================================
DELETE FROM public.association_sub_users
WHERE main_user_id = 'cccccccc-0000-0000-0000-000000000001';

INSERT INTO public.association_sub_users
  (main_user_id, sub_user_id, invited_email, permission,
   invite_status, reviewed_by, reviewed_at)
VALUES
  ('cccccccc-0000-0000-0000-000000000001',
   'dddddddd-0000-0000-0000-000000000001',
   'staff01@abibroker.co.th',
   'full',
   'approved',
   'aaaaaaaa-0000-0000-0000-000000000001',
   now() - interval '15 days');

-- =============================================================================
-- SECTION 6 : BANNERS
-- =============================================================================
DELETE FROM public.banners WHERE display_order IN (1, 2, 3);

INSERT INTO public.banners (image_path, link_url, display_order, is_active)
VALUES
  ('/assets/hero-bg.png',      '/courses',    1, true),
  ('/assets/membership-bg.png','/membership', 2, true),
  ('/assets/news-featured.png','/news',       3, true);

-- =============================================================================
-- SECTION 7 : ARTICLES
-- =============================================================================
DELETE FROM public.articles WHERE slug LIKE 'mock-%';

INSERT INTO public.articles
  (article_type, title, slug, body, thumbnail_path, is_published, published_at, author_id)
VALUES
  ('news',
   'TIBA จัดกิจกรรมปลูกป่าชายเลน ร่วมอนุรักษ์ธรรมชาติ ปี 2568',
   'mock-tiba-mangrove-2568',
   '<p>สมาคมนายหน้าประกันภัยไทย (TIBA) ร่วมกับสมาชิกกว่า 120 ท่าน จัดกิจกรรมปลูกป่าชายเลน บริเวณอ่าวไทย จ.ชลบุรี เพื่ออนุรักษ์ระบบนิเวศชายฝั่งและลดการปล่อยก๊าซคาร์บอนไดออกไซด์ ประจำปี 2568</p><p>กิจกรรมครั้งนี้นับเป็นส่วนหนึ่งของโครงการ "TIBA Green Future" ที่สมาคมดำเนินการต่อเนื่องมาเป็นปีที่ 3 โดยมีเป้าหมายปลูกต้นกล้าชายเลนให้ได้ 10,000 ต้นภายในปี 2570</p>',
   '/assets/news-thumb-1.png', true, now() - interval '5 days',
   'aaaaaaaa-0000-0000-0000-000000000001'),

  ('news',
   'TIBA ประชุมใหญ่สามัญประจำปี 2568 พร้อมเลือกตั้งคณะกรรมการชุดใหม่',
   'mock-tiba-agm-2568',
   '<p>สมาคมนายหน้าประกันภัยไทย จัดการประชุมใหญ่สามัญประจำปี 2568 ณ โรงแรมแกรนด์ไฮแอท เอราวัณ กรุงเทพฯ มีสมาชิกเข้าร่วมกว่า 300 ท่าน</p><p>ที่ประชุมมีมติเลือกตั้งคณะกรรมการบริหารชุดใหม่ วาระปี 2568–2570</p>',
   '/assets/news-thumb-2.png', true, now() - interval '12 days',
   'aaaaaaaa-0000-0000-0000-000000000001'),

  ('news',
   'TIBA ร่วมงาน Thailand Insurance Symposium 2025 นำเสนอนวัตกรรมด้านประกันภัย',
   'mock-tiba-symposium-2025',
   '<p>สมาคมนายหน้าประกันภัยไทย เข้าร่วมงาน Thailand Insurance Symposium 2025 ณ ศูนย์นิทรรศการและการประชุมไบเทค บางนา กรุงเทพฯ</p><p>TIBA นำเสนอบทบาทของนายหน้าประกันภัยในยุคดิจิทัล และแนวทางการให้บริการลูกค้าด้วยเทคโนโลยี InsurTech</p>',
   '/assets/news-thumb-3.png', true, now() - interval '20 days',
   'aaaaaaaa-0000-0000-0000-000000000001'),

  ('news',
   'TIBA เปิดอบรมหลักสูตร "กฎหมายประกันภัยสำหรับนายหน้า" รุ่นที่ 15',
   'mock-tiba-training-law-r15',
   '<p>สมาคมนายหน้าประกันภัยไทย เปิดรับสมัครผู้เข้าอบรมหลักสูตร "กฎหมายประกันภัยสำหรับนายหน้าประกันภัย" รุ่นที่ 15</p><p>หลักสูตรนี้เหมาะสำหรับนายหน้าประกันภัยที่ต้องการเพิ่มพูนความรู้ด้านกฎหมาย และต่ออายุใบอนุญาตนายหน้าประกันภัย</p>',
   '/assets/news-thumb-4.png', true, now() - interval '30 days',
   'aaaaaaaa-0000-0000-0000-000000000001'),

  ('blog',
   '5 เทคนิคเพิ่มยอดขายประกันภัยในยุคดิจิทัล ที่นายหน้ามืออาชีพต้องรู้',
   'mock-blog-5-tips-digital-sales',
   '<p>ในยุคที่ผู้บริโภคค้นหาข้อมูลผ่านออนไลน์มากขึ้น นายหน้าประกันภัยที่ต้องการเติบโตต้องปรับตัวให้ทันความเปลี่ยนแปลง</p><h3>1. สร้างตัวตนในโลกออนไลน์</h3><p>การมี Facebook Page, LINE OA หรือเว็บไซต์ส่วนตัว ช่วยให้ลูกค้าค้นหาเราเจอได้ง่ายขึ้น</p><h3>2. ใช้ Content Marketing</h3><p>แชร์ความรู้เรื่องประกันภัยที่เป็นประโยชน์ผ่านโซเชียลมีเดียเพื่อสร้างความน่าเชื่อถือ</p>',
   '/assets/news-featured.png', true, now() - interval '8 days',
   'aaaaaaaa-0000-0000-0000-000000000001'),

  ('blog',
   'ความแตกต่างระหว่าง "นายหน้าประกันภัย" กับ "ตัวแทนประกันภัย" ที่คุณควรรู้',
   'mock-blog-broker-vs-agent',
   '<p>หลายคนยังสับสนระหว่างนายหน้าประกันภัย (Insurance Broker) กับตัวแทนประกันภัย (Insurance Agent)</p><p><strong>นายหน้าประกันภัย</strong> ทำหน้าที่เป็นตัวแทนของผู้เอาประกัน ค้นหาผลิตภัณฑ์ที่เหมาะสมจากหลายบริษัท</p><p><strong>ตัวแทนประกันภัย</strong> ทำหน้าที่เป็นตัวแทนของบริษัทประกันภัย นำเสนอผลิตภัณฑ์ของบริษัทนั้นๆ เท่านั้น</p>',
   '/assets/news-thumb-2.png', true, now() - interval '15 days',
   'aaaaaaaa-0000-0000-0000-000000000001');

-- =============================================================================
-- SECTION 8 : ADS
-- =============================================================================
DELETE FROM public.ads WHERE link_url LIKE '%tiba%';

INSERT INTO public.ads (image_path, link_url, position, active_from, active_until, is_active)
VALUES
  ('/assets/partner-ad-large.png',
   'https://www.tiba.or.th/membership', 'top',
   CURRENT_DATE - 5, CURRENT_DATE + 60, true),

  ('/assets/partner-ad-1.png',
   'https://www.tiba.or.th/courses', 'sidebar',
   CURRENT_DATE - 3, CURRENT_DATE + 90, true),

  ('/assets/partner-ad-2.png',
   'https://www.tiba.or.th/news', 'bottom',
   CURRENT_DATE, CURRENT_DATE + 45, true),

  ('/assets/partner-ad-3.png',
   'https://www.tiba.or.th/partners', 'popup',
   CURRENT_DATE, CURRENT_DATE + 30, false);

-- =============================================================================
-- SECTION 9 : PARTNERS
-- =============================================================================
DELETE FROM public.partners WHERE website_url LIKE '%seed-partner%'
  OR name LIKE 'บริษัท %ประกัน%';

INSERT INTO public.partners (name, logo_path, website_url, display_order, is_active)
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
-- SECTION 10 : EXECUTIVES
-- =============================================================================
DELETE FROM public.executives WHERE is_active = true;

INSERT INTO public.executives (full_name, position_title, photo_path, display_order, is_active)
VALUES
  ('ดร.วิฑูรย์  คติมุขตานนท์',  'นายกสมาคม',      '/assets/teacher-1.png', 1, true),
  ('คุณสัมฤทธิ์  พรรณโภ',        'อุปนายก คนที่ 1', '/assets/teacher-2.png', 2, true),
  ('คุณวัฒนวงศ์  พัฒนวิบูลย์',   'อุปนายก คนที่ 2', '/assets/teacher-3.png', 3, true),
  ('คุณกมลา  ศิริพรหม',          'เลขาธิการ',       '/assets/teacher-4.png', 4, true),
  ('คุณปรีชา  ทรัพย์สมบัติ',     'เหรัญญิก',        '/assets/teacher-5.png', 5, true),
  ('คุณอาทิตย์  สุวรรณโณ',       'นายทะเบียน',      '/assets/teacher-1.png', 6, true),
  ('คุณมานะ  ประสิทธิผล',        'กรรมการ',         '/assets/teacher-2.png', 7, true),
  ('คุณสุนีย์  รัตนพงศ์',        'กรรมการ',         '/assets/teacher-3.png', 8, true);

-- =============================================================================
-- SECTION 11 : TUTORS
-- =============================================================================
DELETE FROM public.tutors WHERE is_active = true;

INSERT INTO public.tutors (name, position, photo_path, display_order, is_active)
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
-- SECTION 12 : PUBLIC COMPANIES
-- =============================================================================
DELETE FROM public.public_companies WHERE is_active = true;

INSERT INTO public.public_companies
  (name, logo_path, website_url, description, display_order, is_active)
VALUES
  ('บริษัท ทิพยประกันภัย จำกัด (มหาชน)',
   '/assets/sponsor-1.png', 'https://www.dhipaya.co.th',
   'ผู้นำด้านประกันวินาศภัยของไทย', 1, true),
  ('บริษัท กรุงเทพประกันภัย จำกัด (มหาชน)',
   '/assets/sponsor-2.png', 'https://www.bki.co.th',
   'ประกันภัยครบวงจรสำหรับบุคคลและธุรกิจ', 2, true),
  ('บริษัท วิริยะประกันภัย จำกัด (มหาชน)',
   '/assets/sponsor-3.png', 'https://www.viriyah.co.th',
   'ประกันภัยรถยนต์และทรัพย์สินชั้นนำ', 3, true),
  ('บริษัท เมืองไทยประกันภัย จำกัด (มหาชน)',
   '/assets/sponsor-4.png', 'https://www.muangthai.co.th',
   'ประกันภัยสุขภาพและอุบัติเหตุ', 4, true),
  ('บริษัท สินมั่นคงประกันภัย จำกัด (มหาชน)',
   '/assets/sponsor-5.png', 'https://www.smk.co.th',
   'ประกันภัยทางทะเลและขนส่ง', 5, true),
  ('บริษัท ไทยประกันภัย จำกัด (มหาชน)',
   '/assets/sponsor-1.png', 'https://www.thaiins.com',
   'ประกันวินาศภัยทุกประเภท', 6, true),
  ('บริษัท อลิอันซ์ อยุธยา ประกันภัย จำกัด (มหาชน)',
   '/assets/sponsor-2.png', 'https://www.allianz.co.th',
   'ประกันภัยระดับสากลจากเยอรมนี', 7, true),
  ('บริษัท แอกซ่าประกันภัย จำกัด (มหาชน)',
   '/assets/sponsor-3.png', 'https://www.axa.co.th',
   'ประกันภัยสากลครบวงจร', 8, true);

-- =============================================================================
-- SECTION 13 : COURSES
-- =============================================================================
DELETE FROM public.courses WHERE id IN (
  'eeeeeeee-0000-0000-0000-000000000001',
  'eeeeeeee-0000-0000-0000-000000000002',
  'eeeeeeee-0000-0000-0000-000000000003'
);

INSERT INTO public.courses
  (id, title, description, format, price_type,
   price_general, price_association, thumbnail_path, is_published, created_by)
VALUES
  ('eeeeeeee-0000-0000-0000-000000000001',
   'หลักสูตรกฎหมายประกันภัยสำหรับนายหน้าประกันภัย รุ่นที่ 15',
   'เรียนรู้กฎหมายประกันภัยฉบับปรับปรุงล่าสุด พระราชบัญญัติประกันวินาศภัย พ.ศ. 2535 และที่แก้ไขเพิ่มเติม เหมาะสำหรับนายหน้าที่ต้องการต่ออายุใบอนุญาต ครบ 15 ชั่วโมง',
   'online', 'dual',
   3500.00, 2500.00,
   '/assets/course-thumb-1.png', true,
   'aaaaaaaa-0000-0000-0000-000000000001'),

  ('eeeeeeee-0000-0000-0000-000000000002',
   'หลักสูตรการประกันภัยรถยนต์ชั้น 1–3 ภาคปฏิบัติ',
   'เจาะลึกเงื่อนไขกรมธรรม์รถยนต์ การเรียกร้องค่าสินไหมทดแทน และเทคนิคการขายประกันรถยนต์ให้ได้ผล',
   'onsite', 'dual',
   4500.00, 3200.00,
   '/assets/course-thumb-2.png', true,
   'aaaaaaaa-0000-0000-0000-000000000001'),

  ('eeeeeeee-0000-0000-0000-000000000003',
   'InsurTech สำหรับนายหน้าประกันภัยยุคใหม่',
   'ทำความเข้าใจเทคโนโลยีที่เปลี่ยนแปลงวงการประกันภัย ตั้งแต่ AI, Big Data ไปจนถึง Digital Distribution',
   'online', 'single',
   2500.00, NULL,
   '/assets/course-thumb-3.png', true,
   'aaaaaaaa-0000-0000-0000-000000000001');

-- =============================================================================
-- SECTION 14 : COURSE SESSIONS
-- =============================================================================
DELETE FROM public.course_sessions WHERE id IN (
  'ffffffff-0000-0000-0000-000000000001',
  'ffffffff-0000-0000-0000-000000000002',
  'ffffffff-0000-0000-0000-000000000003',
  'ffffffff-0000-0000-0000-000000000004'
);

INSERT INTO public.course_sessions
  (id, course_id, session_label, location, seat_capacity,
   enrollment_start, enrollment_end,
   training_start, training_end, is_cancelled)
VALUES
  -- Course 1: รุ่นที่ 15 รอบที่ 1 (upcoming)
  ('ffffffff-0000-0000-0000-000000000001',
   'eeeeeeee-0000-0000-0000-000000000001',
   'รอบที่ 1/2568', 'Zoom Online', 60,
   now(), now() + interval '20 days',
   CURRENT_DATE + 25, CURRENT_DATE + 26, false),

  -- Course 1: รุ่นที่ 15 รอบที่ 2 (future)
  ('ffffffff-0000-0000-0000-000000000002',
   'eeeeeeee-0000-0000-0000-000000000001',
   'รอบที่ 2/2568', 'Zoom Online', 60,
   now() + interval '25 days', now() + interval '55 days',
   CURRENT_DATE + 60, CURRENT_DATE + 61, false),

  -- Course 2: ประกันภัยรถยนต์ รอบที่ 1
  ('ffffffff-0000-0000-0000-000000000003',
   'eeeeeeee-0000-0000-0000-000000000002',
   'รอบที่ 1/2568',
   'ห้องอบรม TIBA ชั้น 5 อาคารสมาคม ถ.สีลม', 30,
   now(), now() + interval '15 days',
   CURRENT_DATE + 20, CURRENT_DATE + 21, false),

  -- Course 3: InsurTech
  ('ffffffff-0000-0000-0000-000000000004',
   'eeeeeeee-0000-0000-0000-000000000003',
   'รอบที่ 1/2568', 'Zoom Online', 100,
   now(), now() + interval '10 days',
   CURRENT_DATE + 15, CURRENT_DATE + 15, false);

-- =============================================================================
-- SECTION 15 : ENROLLMENTS
-- =============================================================================
DELETE FROM public.enrollments WHERE id IN (
  '22222222-bbbb-0000-0000-000000000001',
  '22222222-bbbb-0000-0000-000000000002'
);

INSERT INTO public.enrollments
  (id, session_id, user_id, status, certificate_path, certificate_issued_at, issued_by)
VALUES
  -- General member enrolled, payment confirmed
  ('22222222-bbbb-0000-0000-000000000001',
   'ffffffff-0000-0000-0000-000000000001',
   'bbbbbbbb-0000-0000-0000-000000000001',
   'payment_confirmed', NULL, NULL, NULL),

  -- Association member enrolled, slip uploaded
  ('22222222-bbbb-0000-0000-000000000002',
   'ffffffff-0000-0000-0000-000000000003',
   'cccccccc-0000-0000-0000-000000000001',
   'slip_uploaded', NULL, NULL, NULL);

-- =============================================================================
-- SECTION 16 : PAYMENTS
-- =============================================================================
DELETE FROM public.payments
WHERE user_id IN (
  'bbbbbbbb-0000-0000-0000-000000000001',
  'cccccccc-0000-0000-0000-000000000001',
  'cccccccc-0000-0000-0000-000000000002'
);

INSERT INTO public.payments
  (user_id, category, status, amount,
   enrollment_id, registration_id,
   slip_file_path, slip_uploaded_at,
   confirmed_by, confirmed_at)
VALUES
  -- Course fee: general member, confirmed
  ('bbbbbbbb-0000-0000-0000-000000000001',
   'course_fee', 'confirmed', 3500.00,
   '22222222-bbbb-0000-0000-000000000001', NULL,
   '/uploads/slips/slip-001.jpg', now() - interval '3 days',
   'aaaaaaaa-0000-0000-0000-000000000001', now() - interval '2 days'),

  -- Course fee: assoc member (slip uploaded, not confirmed yet)
  ('cccccccc-0000-0000-0000-000000000001',
   'course_fee', 'slip_uploaded', 3200.00,
   '22222222-bbbb-0000-0000-000000000002', NULL,
   '/uploads/slips/slip-002.jpg', now() - interval '1 day',
   NULL, NULL),

  -- Membership fee: assoc member 2 (pending)
  ('cccccccc-0000-0000-0000-000000000002',
   'membership_fee', 'pending', 5000.00,
   NULL, '11111111-aaaa-0000-0000-000000000002',
   NULL, NULL, NULL, NULL);

-- =============================================================================
-- SECTION 17 : PRICE BENEFIT PLANS
-- =============================================================================
DELETE FROM public.price_benefit_conditions
WHERE plan_id IN (
  '33333333-cccc-0000-0000-000000000001',
  '33333333-cccc-0000-0000-000000000002',
  '33333333-cccc-0000-0000-000000000003'
);
DELETE FROM public.price_benefit_plans WHERE id IN (
  '33333333-cccc-0000-0000-000000000001',
  '33333333-cccc-0000-0000-000000000002',
  '33333333-cccc-0000-0000-000000000003'
);

INSERT INTO public.price_benefit_plans
  (id, plan_type, label, annual_fee, display_order, is_active)
VALUES
  ('33333333-cccc-0000-0000-000000000001',
   'general', 'สมาชิกสามัญ (บุคคลทั่วไป)', 2000.00, 1, true),
  ('33333333-cccc-0000-0000-000000000002',
   'association_company', 'สมาชิกสมทบ (นิติบุคคล)', 5000.00, 2, true),
  ('33333333-cccc-0000-0000-000000000003',
   'association_individual', 'สมาชิกสมทบ (บุคคลธรรมดา)', 3000.00, 3, true);

INSERT INTO public.price_benefit_conditions
  (plan_id, condition_text, display_order)
VALUES
  -- General plan
  ('33333333-cccc-0000-0000-000000000001', 'ส่วนลดค่าอบรมหลักสูตรของสมาคมฯ 10%', 1),
  ('33333333-cccc-0000-0000-000000000001', 'รับข่าวสารและสิทธิประโยชน์จากสมาคมฯ', 2),
  ('33333333-cccc-0000-0000-000000000001', 'เข้าร่วมกิจกรรม Networking ของสมาคมฯ', 3),
  ('33333333-cccc-0000-0000-000000000001', 'ได้รับใบรับรองสมาชิก TIBA', 4),

  -- Association company plan
  ('33333333-cccc-0000-0000-000000000002', 'ส่วนลดค่าอบรมหลักสูตรของสมาคมฯ 20%', 1),
  ('33333333-cccc-0000-0000-000000000002', 'สิทธิ์เพิ่ม Sub User ได้สูงสุด 5 คน', 2),
  ('33333333-cccc-0000-0000-000000000002', 'รับข่าวสารและสิทธิประโยชน์จากสมาคมฯ', 3),
  ('33333333-cccc-0000-0000-000000000002', 'เข้าร่วมกิจกรรม Networking และ Seminar พิเศษ', 4),
  ('33333333-cccc-0000-0000-000000000002', 'ได้รับใบรับรองสมาชิก TIBA นิติบุคคล', 5),
  ('33333333-cccc-0000-0000-000000000002', 'สิทธิ์โหวตในการประชุมใหญ่สามัญประจำปี', 6),

  -- Association individual plan
  ('33333333-cccc-0000-0000-000000000003', 'ส่วนลดค่าอบรมหลักสูตรของสมาคมฯ 15%', 1),
  ('33333333-cccc-0000-0000-000000000003', 'สิทธิ์เพิ่ม Sub User ได้สูงสุด 2 คน', 2),
  ('33333333-cccc-0000-0000-000000000003', 'รับข่าวสารและสิทธิประโยชน์จากสมาคมฯ', 3),
  ('33333333-cccc-0000-0000-000000000003', 'เข้าร่วมกิจกรรม Networking ของสมาคมฯ', 4),
  ('33333333-cccc-0000-0000-000000000003', 'ได้รับใบรับรองสมาชิก TIBA บุคคล', 5);

-- =============================================================================
-- SECTION 18 : CONTACT INFO  (singleton row id=1)
-- =============================================================================
INSERT INTO public.contact_info
  (id, address, phone, email, map_embed_url, line_id, facebook_url)
VALUES
  (1,
   '2032/61-63 อาคารอิตัลไทย ทาวเวอร์ ชั้น 17 ถนนเพชรบุรีตัดใหม่ แขวงบางกะปิ เขตห้วยขวาง กรุงเทพฯ 10310',
   '02-318-3120',
   'info@tiba.or.th',
   'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.7!2d100.5697!3d13.7563!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDQ1JzI2LjciTiAxMDDCsDM0JzExLjEiRQ!5e0!3m2!1sth!2sth!4v1234567890',
   '@tiba_official',
   'https://www.facebook.com/TIBAThaiInsuranceBrokersAssociation')
ON CONFLICT (id) DO UPDATE SET
  address        = EXCLUDED.address,
  phone          = EXCLUDED.phone,
  email          = EXCLUDED.email,
  map_embed_url  = EXCLUDED.map_embed_url,
  line_id        = EXCLUDED.line_id,
  facebook_url   = EXCLUDED.facebook_url,
  updated_at     = now();

-- =============================================================================
-- SECTION 19 : STATISTICS FILES
-- =============================================================================
DELETE FROM public.statistics_files
WHERE uploaded_by = 'aaaaaaaa-0000-0000-0000-000000000001';

INSERT INTO public.statistics_files
  (title, description, file_path, published_year, display_order, is_published, uploaded_by)
VALUES
  ('รายงานสถิติธุรกิจประกันภัยไทย ปี 2567',
   'สถิติธุรกิจประกันชีวิตและวินาศภัยรวมทั้งประเทศ ประจำปี 2567',
   '/uploads/stats/stat-2567.pdf', 2024, 1, true,
   'aaaaaaaa-0000-0000-0000-000000000001'),

  ('รายงานสถิติธุรกิจประกันภัยไทย ปี 2566',
   'สถิติธุรกิจประกันชีวิตและวินาศภัยรวมทั้งประเทศ ประจำปี 2566',
   '/uploads/stats/stat-2566.pdf', 2023, 2, true,
   'aaaaaaaa-0000-0000-0000-000000000001'),

  ('รายงานสถิติธุรกิจประกันภัยไทย ปี 2565',
   'สถิติธุรกิจประกันชีวิตและวินาศภัยรวมทั้งประเทศ ประจำปี 2565',
   '/uploads/stats/stat-2565.pdf', 2022, 3, true,
   'aaaaaaaa-0000-0000-0000-000000000001'),

  ('รายงานจำนวนนายหน้าประกันภัยจดทะเบียน ปี 2567',
   'ข้อมูลสถิตินายหน้าประกันภัยบุคคลธรรมดาและนิติบุคคลที่ได้รับใบอนุญาต',
   '/uploads/stats/brokers-2567.pdf', 2024, 4, true,
   'aaaaaaaa-0000-0000-0000-000000000001'),

  ('รายงานเบี้ยประกันภัยรับรวม ปี 2567 (ไตรมาส 3)',
   'ยอดเบี้ยประกันภัยรับโดยตรงทั่วทั้งอุตสาหกรรม ไตรมาส 3/2567',
   '/uploads/stats/premium-q3-2567.pdf', 2024, 5, true,
   'aaaaaaaa-0000-0000-0000-000000000001');

-- =============================================================================
-- SUMMARY
-- =============================================================================
DO $$
BEGIN
  RAISE NOTICE '====== TIBA v2 Seed Summary ======';
  RAISE NOTICE 'users              : %', (SELECT COUNT(*) FROM users);
  RAISE NOTICE 'banners            : %', (SELECT COUNT(*) FROM banners);
  RAISE NOTICE 'articles           : %', (SELECT COUNT(*) FROM articles);
  RAISE NOTICE 'ads                : %', (SELECT COUNT(*) FROM ads);
  RAISE NOTICE 'partners           : %', (SELECT COUNT(*) FROM partners);
  RAISE NOTICE 'executives         : %', (SELECT COUNT(*) FROM executives);
  RAISE NOTICE 'tutors             : %', (SELECT COUNT(*) FROM tutors);
  RAISE NOTICE 'public_companies   : %', (SELECT COUNT(*) FROM public_companies);
  RAISE NOTICE 'courses            : %', (SELECT COUNT(*) FROM courses);
  RAISE NOTICE 'course_sessions    : %', (SELECT COUNT(*) FROM course_sessions);
  RAISE NOTICE 'enrollments        : %', (SELECT COUNT(*) FROM enrollments);
  RAISE NOTICE 'payments           : %', (SELECT COUNT(*) FROM payments);
  RAISE NOTICE 'price_benefit_plans: %', (SELECT COUNT(*) FROM price_benefit_plans);
  RAISE NOTICE 'statistics_files   : %', (SELECT COUNT(*) FROM statistics_files);
  RAISE NOTICE 'contact_info       : %', (SELECT COUNT(*) FROM contact_info);
  RAISE NOTICE '===================================';
END $$;
