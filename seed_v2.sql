-- =============================================================================
-- TIBA v2 — Master Seed Data (ใช้ไฟล์นี้ไฟล์เดียว)
-- Images: /assets/* ทุกไฟล์ที่ใช้ต้องมีอยู่จริงใน tiba-frontend/public/assets/
-- Run: psql -h localhost -U postgres -d tiba_db -f seed_v2.sql
-- =============================================================================

DO $$
DECLARE
  admin_id UUID;
  now_ts   TIMESTAMPTZ := NOW();

  -- course ids
  c1  UUID; c2  UUID; c3  UUID; c4  UUID;
  c5  UUID; c6  UUID; c7  UUID; c8  UUID;
  c9  UUID; c10 UUID; c11 UUID; c12 UUID;
  c13 UUID; c14 UUID; c15 UUID; c16 UUID;

  -- price plan ids
  pp_general UUID; pp_assoc UUID;
BEGIN

-- ── Get admin ──────────────────────────────────────────────────────────────
SELECT id INTO admin_id FROM users
  WHERE role IN ('admin','superadmin') LIMIT 1;

IF admin_id IS NULL THEN
  INSERT INTO users(email, password_hash, role, is_active)
  VALUES ('admin@tiba.or.th', '$2a$10$seed_placeholder_hash_only', 'superadmin', true)
  ON CONFLICT (email) DO NOTHING;
  SELECT id INTO admin_id FROM users WHERE email = 'admin@tiba.or.th';
END IF;

RAISE NOTICE 'admin_id = %', admin_id;

-- =============================================================================
-- CLEAR (safe re-run)
-- =============================================================================
DELETE FROM price_benefit_conditions;
DELETE FROM price_benefit_plans;
DELETE FROM statistics_files;
DELETE FROM public_companies;
DELETE FROM executives;
DELETE FROM partners;
DELETE FROM ads;
DELETE FROM banners   WHERE deleted_at IS NULL;
DELETE FROM articles  WHERE deleted_at IS NULL;
DELETE FROM enrollments;
DELETE FROM course_sessions;
DELETE FROM courses   WHERE deleted_at IS NULL;
DELETE FROM contact_info;

-- =============================================================================
-- 1. BANNERS — หน้า Home (hero slider)
-- =============================================================================
INSERT INTO banners (image_path, link_url, display_order, is_active) VALUES
  ('/assets/hero-bg.png',       '/courses',    1, true),
  ('/assets/membership-bg.png', '/register',   2, true);

-- =============================================================================
-- 2. COURSES + SESSIONS (16 คอร์ส, ครบ 4 สถานะ)
-- =============================================================================

-- ── Upcoming (เร็วๆ นี้) ──────────────────────────────────────────────────
INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
VALUES ('หลักสูตรนายหน้าประกันวินาศภัย ภาคทฤษฎี (รุ่น 1/2568)',
        '<p>อบรมความรู้พื้นฐานการประกันวินาศภัยสำหรับผู้เข้าสอบใบอนุญาตนายหน้า ครอบคลุมหลักการประกันภัย กฎหมาย และจรรยาบรรณวิชาชีพ</p>',
        'onsite', 'dual', 2300, 2000, '/assets/course-thumb-1.png', true, admin_id)
RETURNING id INTO c1;
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
VALUES (c1, 'รอบที่ 1', 'ห้องประชุม TIBA กรุงเทพฯ', 60,
  now_ts + INTERVAL '35 days', now_ts + INTERVAL '65 days',
  (now_ts + INTERVAL '95 days')::date, (now_ts + INTERVAL '97 days')::date);

INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
VALUES ('หลักสูตรพัฒนาความรู้ต่อเนื่อง CDC ประจำปี 2568',
        '<p>หลักสูตรสำหรับนายหน้าประกันภัยที่ต้องการต่ออายุใบอนุญาต ครอบคลุมกฎหมาย เทคนิค และแนวปฏิบัติใหม่</p>',
        'online', 'dual', 1600, 1400, '/assets/course-thumb-2.png', true, admin_id)
RETURNING id INTO c2;
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
VALUES (c2, 'รอบที่ 1', 'ออนไลน์ (Zoom)', 100,
  now_ts + INTERVAL '30 days', now_ts + INTERVAL '60 days',
  (now_ts + INTERVAL '90 days')::date, (now_ts + INTERVAL '90 days')::date);

INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
VALUES ('หลักสูตร AMTB และ MLTB รุ่นที่ 15',
        '<p>หลักสูตรระดับสูงสำหรับผู้บริหารและผู้เชี่ยวชาญด้านการประกันภัย เน้นกลยุทธ์ธุรกิจและการบริหารความเสี่ยงในระดับองค์กร</p>',
        'onsite', 'dual', 5000, 4500, '/assets/course-thumb-3.png', true, admin_id)
RETURNING id INTO c3;
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
VALUES (c3, 'รุ่นที่ 15', 'โรงแรมเซ็นทารา แกรนด์ กรุงเทพฯ', 40,
  now_ts + INTERVAL '45 days', now_ts + INTERVAL '75 days',
  (now_ts + INTERVAL '100 days')::date, (now_ts + INTERVAL '103 days')::date);

INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
VALUES ('กฎหมายประกันภัยและจรรยาบรรณนายหน้า',
        '<p>เรียนรู้กฎหมายประกันภัยฉบับล่าสุด จรรยาบรรณวิชาชีพ และแนวปฏิบัติที่ถูกต้องตามกฎหมาย</p>',
        'online', 'single', 900, NULL, '/assets/course-thumb-4.png', true, admin_id)
RETURNING id INTO c4;
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
VALUES (c4, 'รอบที่ 1', 'ออนไลน์ (Zoom)', 200,
  now_ts + INTERVAL '32 days', now_ts + INTERVAL '62 days',
  (now_ts + INTERVAL '92 days')::date, (now_ts + INTERVAL '92 days')::date);

-- ── Closing Soon (ใกล้ปิดรับ) ─────────────────────────────────────────────
INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
VALUES ('นายหน้าประกันชีวิต ภาคปฏิบัติ รุ่น 3/2567',
        '<p>เตรียมความพร้อมสำหรับการสอบใบอนุญาตนายหน้าประกันชีวิต เน้นปฏิบัติจริง กรณีศึกษา และการนำเสนอ</p>',
        'onsite', 'dual', 2500, 2200, '/assets/course-thumb-1.png', true, admin_id)
RETURNING id INTO c5;
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
VALUES (c5, 'รอบที่ 3', 'ห้องประชุม TIBA กรุงเทพฯ', 50,
  now_ts - INTERVAL '20 days', now_ts + INTERVAL '2 days',
  (now_ts + INTERVAL '15 days')::date, (now_ts + INTERVAL '17 days')::date);

INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
VALUES ('การตลาดประกันภัยยุคดิจิทัล',
        '<p>กลยุทธ์การขายและการตลาดประกันภัยในยุค Digital เรียนรู้การใช้ Social Media, LINE OA และ Digital Tools เพื่อขยายฐานลูกค้า</p>',
        'online', 'dual', 1200, 1000, '/assets/course-thumb-2.png', true, admin_id)
RETURNING id INTO c6;
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
VALUES (c6, 'รอบที่ 2', 'ออนไลน์ (Zoom)', 150,
  now_ts - INTERVAL '15 days', now_ts + INTERVAL '1 day',
  (now_ts + INTERVAL '10 days')::date, (now_ts + INTERVAL '10 days')::date);

INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
VALUES ('ทักษะการวิเคราะห์ความเสี่ยงขั้นสูง',
        '<p>เรียนรู้การประเมินและบริหารความเสี่ยงในระดับสูง เหมาะสำหรับนายหน้าที่ต้องการเพิ่มพูนความเชี่ยวชาญ</p>',
        'onsite', 'dual', 3200, 2800, '/assets/course-thumb-3.png', true, admin_id)
RETURNING id INTO c7;
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
VALUES (c7, 'รอบที่ 1', 'โรงแรม Centara เชียงใหม่', 30,
  now_ts - INTERVAL '25 days', now_ts + INTERVAL '3 days',
  (now_ts + INTERVAL '20 days')::date, (now_ts + INTERVAL '22 days')::date);

INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
VALUES ('ประกันภัยรถยนต์และสินค้า ภาคทฤษฎี',
        '<p>ความรู้เฉพาะทางด้านประกันภัยรถยนต์ ประกันภัยสินค้า และการเรียกร้องค่าสินไหม</p>',
        'online', 'dual', 1500, 1300, '/assets/course-thumb-4.png', true, admin_id)
RETURNING id INTO c8;
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
VALUES (c8, 'รอบที่ 1', 'ออนไลน์ (Zoom)', 100,
  now_ts - INTERVAL '10 days', now_ts + INTERVAL '2 days',
  (now_ts + INTERVAL '14 days')::date, (now_ts + INTERVAL '14 days')::date);

-- ── Open (เปิดรับสมัคร) ───────────────────────────────────────────────────
INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
VALUES ('หลักสูตรนายหน้าประกันวินาศภัย รุ่น 2/2568',
        '<p>อบรมความรู้พื้นฐานด้านประกันวินาศภัยสำหรับผู้เริ่มต้น ครอบคลุมหลักการ กฎหมาย และกระบวนการประกันภัย</p>',
        'onsite', 'dual', 2300, 2000, '/assets/course-thumb-1.png', true, admin_id)
RETURNING id INTO c9;
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
VALUES (c9, 'รอบที่ 2', 'ห้องประชุม TIBA กรุงเทพฯ', 60,
  now_ts - INTERVAL '7 days', now_ts + INTERVAL '21 days',
  (now_ts + INTERVAL '35 days')::date, (now_ts + INTERVAL '37 days')::date);

INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
VALUES ('ประกันสุขภาพและอุบัติเหตุ สำหรับนายหน้า',
        '<p>ความรู้ด้านประกันสุขภาพ ประกันอุบัติเหตุ และการคุ้มครองที่นายหน้าประกันภัยต้องรู้</p>',
        'online', 'dual', 1800, 1600, '/assets/course-thumb-2.png', true, admin_id)
RETURNING id INTO c10;
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
VALUES (c10, 'รอบที่ 1', 'ออนไลน์ (Zoom)', 120,
  now_ts - INTERVAL '5 days', now_ts + INTERVAL '25 days',
  (now_ts + INTERVAL '40 days')::date, (now_ts + INTERVAL '40 days')::date);

INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
VALUES ('CDC เพิ่มพูนความรู้นายหน้าประกันชีวิต',
        '<p>หลักสูตรพัฒนาความรู้ต่อเนื่องสำหรับนายหน้าประกันชีวิต ตามหลักเกณฑ์ที่ คปภ. กำหนด</p>',
        'online', 'dual', 1400, 1200, '/assets/course-thumb-3.png', true, admin_id)
RETURNING id INTO c11;
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
VALUES (c11, 'รอบที่ 1', 'ออนไลน์ (Zoom)', 200,
  now_ts - INTERVAL '3 days', now_ts + INTERVAL '28 days',
  (now_ts + INTERVAL '45 days')::date, (now_ts + INTERVAL '45 days')::date);

INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
VALUES ('กลยุทธ์การบริหารพอร์ตประกันภัย',
        '<p>เทคนิคการบริหารพอร์ตลูกค้า การรักษาฐานลูกค้าเดิม และการขยายธุรกิจสำหรับนายหน้าประกันภัย</p>',
        'onsite', 'dual', 3500, 3000, '/assets/course-thumb-4.png', true, admin_id)
RETURNING id INTO c12;
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
VALUES (c12, 'รอบที่ 1', 'ห้องประชุม TIBA กรุงเทพฯ', 35,
  now_ts - INTERVAL '10 days', now_ts + INTERVAL '18 days',
  (now_ts + INTERVAL '30 days')::date, (now_ts + INTERVAL '32 days')::date);

-- ── Closed (ปิดรับสมัครแล้ว) ──────────────────────────────────────────────
INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
VALUES ('หลักสูตรนายหน้าประกันวินาศภัย รุ่น 4/2567',
        '<p>หลักสูตรอบรมความรู้พื้นฐานประกันวินาศภัย รุ่นที่ 4 ประจำปี 2567</p>',
        'onsite', 'dual', 2300, 2000, '/assets/course-thumb-1.png', true, admin_id)
RETURNING id INTO c13;
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
VALUES (c13, 'รอบที่ 4', 'ห้องประชุม TIBA กรุงเทพฯ', 60,
  now_ts - INTERVAL '60 days', now_ts - INTERVAL '5 days',
  (now_ts - INTERVAL '2 days')::date, now_ts::date);

INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
VALUES ('ประกันภัยพืชผลและปศุสัตว์',
        '<p>ความรู้เฉพาะทางด้านประกันภัยภาคเกษตร สำหรับนายหน้าที่ต้องการขยายตลาดสู่กลุ่มลูกค้าเกษตรกร</p>',
        'online', 'dual', 1000, 900, '/assets/course-thumb-2.png', true, admin_id)
RETURNING id INTO c14;
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
VALUES (c14, 'รอบที่ 1', 'ออนไลน์ (Zoom)', 80,
  now_ts - INTERVAL '55 days', now_ts - INTERVAL '8 days',
  (now_ts - INTERVAL '3 days')::date, now_ts::date);

INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
VALUES ('กฎหมายแรงงานและประกันสังคม',
        '<p>เชื่อมโยงกฎหมายแรงงาน ประกันสังคม และประกันภัยกลุ่ม เพื่อให้นายหน้าให้คำปรึกษาลูกค้าได้อย่างครอบคลุม</p>',
        'onsite', 'dual', 2000, 1800, '/assets/course-thumb-3.png', true, admin_id)
RETURNING id INTO c15;
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
VALUES (c15, 'รอบที่ 1', 'ห้องประชุม TIBA กรุงเทพฯ', 45,
  now_ts - INTERVAL '50 days', now_ts - INTERVAL '10 days',
  (now_ts - INTERVAL '5 days')::date, (now_ts - INTERVAL '3 days')::date);

INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
VALUES ('เทคโนโลยี InsurTech สำหรับนายหน้า',
        '<p>การนำเทคโนโลยี InsurTech มาประยุกต์ใช้ในธุรกิจนายหน้าประกันภัย ตั้งแต่การขายไปจนถึงการบริการหลังการขาย</p>',
        'online', 'dual', 2500, 2200, '/assets/course-thumb-4.png', true, admin_id)
RETURNING id INTO c16;
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
VALUES (c16, 'รอบที่ 1', 'ออนไลน์ (Zoom)', 150,
  now_ts - INTERVAL '45 days', now_ts - INTERVAL '6 days',
  (now_ts - INTERVAL '1 day')::date, now_ts::date);

-- =============================================================================
-- 3. ARTICLES — ข่าวสาร + บทความ (8 items)
-- =============================================================================
INSERT INTO articles(article_type, title, slug, body, thumbnail_path, is_published, published_at, author_id) VALUES

  ('news', 'TIBA จัดกิจกรรมปลูกป่าชายเลน ร่วมอนุรักษ์ธรรมชาติ ปี 2568',
   'tiba-mangrove-2568',
   '<p>สมาคมนายหน้าประกันภัยไทย (TIBA) ร่วมกับสมาชิกกว่า 120 ท่าน จัดกิจกรรมปลูกป่าชายเลน บริเวณอ่าวไทย จ.ชลบุรี เพื่ออนุรักษ์ระบบนิเวศชายฝั่งและลดการปล่อยก๊าซคาร์บอนไดออกไซด์ ประจำปี 2568</p><p>กิจกรรมครั้งนี้นับเป็นส่วนหนึ่งของโครงการ "TIBA Green Future" ที่สมาคมดำเนินการต่อเนื่องมาเป็นปีที่ 3 โดยมีเป้าหมายปลูกต้นกล้าชายเลนให้ได้ 10,000 ต้นภายในปี 2570</p>',
   '/assets/news-thumb-1.png', true, now_ts - INTERVAL '5 days', admin_id),

  ('news', 'TIBA ประชุมใหญ่สามัญประจำปี 2568 พร้อมเลือกตั้งคณะกรรมการชุดใหม่',
   'tiba-agm-2568',
   '<p>สมาคมนายหน้าประกันภัยไทย จัดการประชุมใหญ่สามัญประจำปี 2568 ณ โรงแรมแกรนด์ไฮแอท เอราวัณ กรุงเทพฯ มีสมาชิกเข้าร่วมกว่า 300 ท่าน</p><p>ที่ประชุมมีมติเลือกตั้งคณะกรรมการบริหารชุดใหม่ วาระปี 2568–2570 พร้อมทั้งรายงานผลการดำเนินงานและงบประมาณประจำปีที่ผ่านมา</p>',
   '/assets/news-thumb-2.png', true, now_ts - INTERVAL '12 days', admin_id),

  ('news', 'TIBA ร่วมงาน Thailand Insurance Symposium 2025 นำเสนอนวัตกรรมด้านประกันภัย',
   'tiba-insurance-symposium-2568',
   '<p>สมาคมนายหน้าประกันภัยไทย เข้าร่วมงาน Thailand Insurance Symposium 2025 ซึ่งจัดขึ้น ณ ศูนย์นิทรรศการและการประชุมไบเทค บางนา กรุงเทพฯ</p><p>TIBA นำเสนอบทบาทของนายหน้าประกันภัยในยุคดิจิทัล และแนวทางการให้บริการลูกค้าด้วยเทคโนโลยี InsurTech เพื่อยกระดับมาตรฐานวิชาชีพนายหน้าประกันภัยไทย</p>',
   '/assets/news-thumb-3.png', true, now_ts - INTERVAL '20 days', admin_id),

  ('news', 'TIBA เปิดอบรมหลักสูตร "กฎหมายประกันภัยสำหรับนายหน้า" รุ่นที่ 15',
   'tiba-training-law-r15',
   '<p>สมาคมนายหน้าประกันภัยไทย เปิดรับสมัครผู้เข้าอบรมหลักสูตร "กฎหมายประกันภัยสำหรับนายหน้าประกันภัย" รุ่นที่ 15 ประจำปี 2568</p><p>หลักสูตรนี้เหมาะสำหรับนายหน้าประกันภัยที่ต้องการเพิ่มพูนความรู้ด้านกฎหมาย และต่ออายุใบอนุญาตนายหน้าประกันภัย ผ่านการอบรมแบบ Online ผ่านระบบ Zoom</p>',
   '/assets/news-thumb-4.png', true, now_ts - INTERVAL '30 days', admin_id),

  ('news', 'TIBA ร่วมเสวนา "คปภ.เพื่อสังคม" จังหวัดสงขลาและภูเก็ต',
   'tiba-oic-social-2568',
   '<p>ผู้แทนสมาคมนายหน้าประกันภัยไทย ร่วมเสวนาในงาน "คปภ.เพื่อสังคม" ซึ่งจัดขึ้นที่จังหวัดสงขลาและภูเก็ต เพื่อเผยแพร่ความรู้ด้านการประกันภัยแก่ประชาชนในภาคใต้</p>',
   '/assets/news-featured.png', true, now_ts - INTERVAL '8 days', admin_id),

  ('blog', '5 เทคนิคเพิ่มยอดขายประกันภัยในยุคดิจิทัล ที่นายหน้ามืออาชีพต้องรู้',
   'blog-5-tips-digital-sales',
   '<p>ในยุคที่ผู้บริโภคค้นหาข้อมูลผ่านออนไลน์มากขึ้น นายหน้าประกันภัยที่ต้องการเติบโตต้องปรับตัวให้ทันความเปลี่ยนแปลง</p><h3>1. สร้างตัวตนในโลกออนไลน์</h3><p>การมี Facebook Page, LINE OA หรือเว็บไซต์ส่วนตัว ช่วยให้ลูกค้าค้นหาเราเจอได้ง่ายขึ้น</p><h3>2. ใช้ Content Marketing</h3><p>แชร์ความรู้เรื่องประกันภัยที่เป็นประโยชน์ผ่านโซเชียลมีเดียเพื่อสร้างความน่าเชื่อถือ</p><h3>3. ตอบสนองลูกค้าอย่างรวดเร็ว</h3><p>ใช้ LINE OA และ chatbot ช่วยตอบคำถามเบื้องต้นได้ตลอด 24 ชั่วโมง</p>',
   '/assets/news-thumb-1.png', true, now_ts - INTERVAL '15 days', admin_id),

  ('blog', 'ความแตกต่างระหว่าง "นายหน้าประกันภัย" กับ "ตัวแทนประกันภัย" ที่คุณควรรู้',
   'blog-broker-vs-agent',
   '<p>หลายคนยังสับสนระหว่างนายหน้าประกันภัย (Insurance Broker) กับตัวแทนประกันภัย (Insurance Agent) ทั้งที่ทั้งสองอาชีพนี้มีบทบาทและความรับผิดชอบที่แตกต่างกันอย่างมีนัยสำคัญ</p><p><strong>นายหน้าประกันภัย</strong> ทำหน้าที่เป็นตัวแทนของผู้เอาประกัน ค้นหาผลิตภัณฑ์ที่เหมาะสมจากหลายบริษัท โดยยึดประโยชน์ของลูกค้าเป็นหลัก</p><p><strong>ตัวแทนประกันภัย</strong> ทำหน้าที่เป็นตัวแทนของบริษัทประกันภัย นำเสนอผลิตภัณฑ์ของบริษัทนั้นๆ เท่านั้น</p>',
   '/assets/news-thumb-2.png', true, now_ts - INTERVAL '25 days', admin_id),

  ('blog', 'สถิติประกันวินาศภัยไทย ไตรมาสที่ 1/2568',
   'blog-stats-q1-2568',
   '<p>รายงานสถิติธุรกิจประกันวินาศภัยไทย ไตรมาสที่ 1 ปี 2568 จากสำนักงาน คปภ. เบี้ยประกันรับรวมกว่า 138,500 ล้านบาท เพิ่มขึ้น 6.2% จากช่วงเดียวกันของปีก่อน</p>',
   '/assets/news-thumb-3.png', true, now_ts - INTERVAL '35 days', admin_id)

ON CONFLICT (slug) DO UPDATE SET
  title          = EXCLUDED.title,
  body           = EXCLUDED.body,
  thumbnail_path = EXCLUDED.thumbnail_path,
  is_published   = EXCLUDED.is_published,
  published_at   = EXCLUDED.published_at;

-- =============================================================================
-- 4. EXECUTIVES — กรรมการบริหาร (หน้า Executive)
-- =============================================================================
INSERT INTO executives (full_name, position_title, photo_path, display_order, is_active) VALUES
  ('นายจิตวุฒิ ศศิบุตร',       'นายกสมาคม',               '/assets/teacher-1.png', 1, true),
  ('นายสัมฤทธิ์ พรรณโภ',       'อุปนายก คนที่ 1',          '/assets/teacher-2.png', 2, true),
  ('นายวัฒนวงศ์ พัฒนวิบูลย์',  'อุปนายก คนที่ 2',          '/assets/teacher-3.png', 3, true),
  ('นางกมลา ศิริพรหม',         'เลขาธิการ',                '/assets/teacher-4.png', 4, true),
  ('นายปรีชา ทรัพย์สมบัติ',    'เหรัญญิก',                 '/assets/teacher-5.png', 5, true),
  ('นายอาทิตย์ สุวรรณโณ',      'นายทะเบียน',               '/assets/teacher-1.png', 6, true),
  ('นายวรพงศ์ อรุณสวัสดิ์',    'ปฏิคม',                    '/assets/teacher-2.png', 7, true),
  ('นางสาวนภกร ชิยงค์คำ',      'กรรมการ',                  '/assets/teacher-3.png', 8, true),
  ('นายเถลิงศักดิ์ บุญนาย',    'กรรมการ',                  '/assets/teacher-4.png', 9, true),
  ('นายธนะกร สิ้นเดียงลาย',    'กรรมการ',                  '/assets/teacher-5.png', 10, true),
  ('นายมานิต โพธิ์ทอง',        'กรรมการ',                  '/assets/teacher-1.png', 11, true),
  ('นางสาวสุภาพร รักษ์ดี',     'กรรมการ',                  '/assets/teacher-2.png', 12, true),
  ('นายชัชวาล วงษ์สุวรรณ',     'กรรมการ',                  '/assets/teacher-3.png', 13, true);

-- =============================================================================
-- 5. PUBLIC COMPANIES — บริษัทสมาชิก (หน้า Companies)
-- =============================================================================
INSERT INTO public_companies (name, logo_path, website_url, description, display_order, is_active) VALUES
  ('บริษัท ทิพยประกันภัย จำกัด (มหาชน)',
   '/assets/sponsor-1.png', 'https://www.dhipaya.co.th',
   'บริษัทประกันวินาศภัยชั้นนำของประเทศไทย ให้บริการครอบคลุมทั้งประกันอัคคีภัย ประกันภัยรถยนต์ ประกันอุบัติเหตุ และประกันภัยทางทะเล', 1, true),

  ('บริษัท กรุงเทพประกันภัย จำกัด (มหาชน)',
   '/assets/sponsor-2.png', 'https://www.bki.co.th',
   'ผู้นำด้านประกันวินาศภัย ให้บริการด้วยความมั่นคงและมาตรฐานระดับสากล ครอบคลุมประกันภัยทุกประเภท', 2, true),

  ('บริษัท วิริยะประกันภัย จำกัด (มหาชน)',
   '/assets/sponsor-3.png', 'https://www.viriyah.co.th',
   'ผู้เชี่ยวชาญด้านประกันภัยรถยนต์และประกันภัยทั่วไป ให้บริการลูกค้าทั่วประเทศมากว่า 60 ปี', 3, true),

  ('บริษัท เมืองไทยประกันภัย จำกัด (มหาชน)',
   '/assets/sponsor-4.png', 'https://www.muangthai.co.th',
   'บริการประกันภัยครอบคลุมทุกความต้องการ ทั้งประกันภัยบุคคล ธุรกิจ และอุตสาหกรรม', 4, true),

  ('บริษัท สินมั่นคงประกันภัย จำกัด (มหาชน)',
   '/assets/sponsor-5.png', 'https://www.smk.co.th',
   'ประกันภัยยานยนต์และอุบัติเหตุ ด้วยบริการที่รวดเร็วและเชื่อถือได้', 5, true),

  ('บริษัท อาคเนย์ประกันภัย จำกัด (มหาชน)',
   '/assets/sponsor-1.png', 'https://www.southeastins.co.th',
   'ประกันภัยบ้านและทรัพย์สิน ประกันอัคคีภัย และประกันภัยเบ็ดเตล็ด', 6, true),

  ('บริษัท แอลเอ็มจี ประกันภัย จำกัด (มหาชน)',
   '/assets/sponsor-2.png', 'https://www.lmginsurance.co.th',
   'ประกันภัยพาณิชย์และอุตสาหกรรม รองรับความต้องการของธุรกิจขนาดใหญ่', 7, true),

  ('บริษัท ชับบ์ สามัคคีประกันภัย จำกัด (มหาชน)',
   '/assets/sponsor-3.png', 'https://www.chubb.com',
   'ประกันภัยระดับนานาชาติ ให้บริการลูกค้าองค์กรและบุคคลด้วยมาตรฐานระดับโลก', 8, true),

  ('บริษัท ไทยพาณิชย์สามัคคีประกันภัย จำกัด (มหาชน)',
   '/assets/sponsor-4.png', 'https://www.scbinsurance.co.th',
   'ประกันภัยผ่านเครือข่ายธนาคารไทยพาณิชย์ทั่วประเทศ', 9, true),

  ('บริษัท ไทยประกันภัย จำกัด (มหาชน)',
   '/assets/sponsor-5.png', 'https://www.thaiins.com',
   'ประกันภัยครอบคลุมทุกมิติ ทั้งประกันชีวิต ประกันสุขภาพ และประกันวินาศภัย', 10, true);

-- =============================================================================
-- 6. PARTNERS — ผู้สนับสนุน (หน้า Home)
-- =============================================================================
INSERT INTO partners (name, logo_path, website_url, display_order, is_active) VALUES
  ('บริษัท ทิพยประกันภัย จำกัด (มหาชน)',          '/assets/sponsor-1.png', 'https://www.dhipaya.co.th',    1, true),
  ('บริษัท กรุงเทพประกันภัย จำกัด (มหาชน)',        '/assets/sponsor-2.png', 'https://www.bki.co.th',        2, true),
  ('บริษัท วิริยะประกันภัย จำกัด (มหาชน)',         '/assets/sponsor-3.png', 'https://www.viriyah.co.th',    3, true),
  ('บริษัท เมืองไทยประกันภัย จำกัด (มหาชน)',       '/assets/sponsor-4.png', 'https://www.muangthai.co.th',  4, true),
  ('บริษัท สินมั่นคงประกันภัย จำกัด (มหาชน)',      '/assets/sponsor-5.png', 'https://www.smk.co.th',        5, true);

-- =============================================================================
-- 7. ADS — โฆษณา (หน้า Home / sidebar)
-- =============================================================================
INSERT INTO ads (image_path, link_url, position, active_from, active_until, is_active) VALUES
  ('/assets/partner-ad-large.png', 'https://www.tiba.or.th/membership', 'top',     CURRENT_DATE - 5,  CURRENT_DATE + 60, true),
  ('/assets/partner-ad-1.png',     'https://www.tiba.or.th/courses',    'sidebar', CURRENT_DATE - 3,  CURRENT_DATE + 90, true),
  ('/assets/partner-ad-2.png',     'https://www.tiba.or.th/news',       'bottom',  CURRENT_DATE,      CURRENT_DATE + 45, true),
  ('/assets/partner-ad-3.png',     'https://www.tiba.or.th/partners',   'popup',   CURRENT_DATE,      CURRENT_DATE + 30, false);

-- =============================================================================
-- 8. CONTACT INFO — ข้อมูลติดต่อ (หน้า Contact)
-- =============================================================================
INSERT INTO contact_info (id, address, phone, email, map_embed_url, line_id, facebook_url)
VALUES (
  1,
  '1/2 ถนนจันทร์ แขวงทุ่งมหาเมฆ เขตสาทร กรุงเทพมหานคร 10120',
  '02-285-7126',
  'info@tiba.or.th',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3876.2451!2d100.5208!3d13.7217!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29ef8b2c30029%3A0x2ccf7c5f73e9c0ac!2z4Liq4Li04LiX4LiZ4Lij4Liw4Lia4LiI4LiK4Li14LiH!5e0!3m2!1sth!2sth!4v1700000000000!5m2!1sth!2sth',
  '@tiba_official',
  'https://www.facebook.com/tibaassociation'
)
ON CONFLICT (id) DO UPDATE SET
  address       = EXCLUDED.address,
  phone         = EXCLUDED.phone,
  email         = EXCLUDED.email,
  map_embed_url = EXCLUDED.map_embed_url,
  line_id       = EXCLUDED.line_id,
  facebook_url  = EXCLUDED.facebook_url,
  updated_at    = now();

-- =============================================================================
-- 9. STATISTICS FILES — ไฟล์สถิติประกันภัย (หน้า Statistics)
-- =============================================================================
INSERT INTO statistics_files (title, description, file_path, published_year, display_order, is_published, uploaded_by) VALUES
  ('สถิติประกันภัย ประจำปี 2567',
   'รายงานสถิติธุรกิจประกันวินาศภัยประจำปี 2567 จากสำนักงาน คปภ.',
   '/uploads/stats/stat-2567.pdf', 2567, 1, true,  admin_id),

  ('สถิติประกันภัย ประจำปี 2566',
   'รายงานสถิติธุรกิจประกันวินาศภัยประจำปี 2566 จากสำนักงาน คปภ.',
   '/uploads/stats/stat-2566.pdf', 2566, 2, true,  admin_id),

  ('สถิติประกันภัย ประจำปี 2565',
   'รายงานสถิติธุรกิจประกันวินาศภัยประจำปี 2565 จากสำนักงาน คปภ.',
   '/uploads/stats/stat-2565.pdf', 2565, 3, true,  admin_id),

  ('สถิติประกันภัย ประจำปี 2564',
   'รายงานสถิติธุรกิจประกันวินาศภัยประจำปี 2564 จากสำนักงาน คปภ.',
   '/uploads/stats/stat-2564.pdf', 2564, 4, true,  admin_id),

  ('สถิติประกันภัย ประจำปี 2563',
   'รายงานสถิติธุรกิจประกันวินาศภัยประจำปี 2563 จากสำนักงาน คปภ.',
   '/uploads/stats/stat-2563.pdf', 2563, 5, true,  admin_id),

  ('อัตราเบี้ยประกันภัย Q1/2568',
   'สรุปอัตราเบี้ยประกันภัยเฉลี่ยรายประเภท ไตรมาส 1 ปี 2568',
   '/uploads/stats/rate-q1-2568.pdf', 2568, 6, true,  admin_id),

  ('รายงานธุรกิจนายหน้าประกันภัย 2567',
   'รายงานสถานการณ์ธุรกิจนายหน้าประกันภัยประจำปี 2567',
   '/uploads/stats/broker-report-2567.pdf', 2567, 7, true,  admin_id),

  ('สถิติประกันภัย ประจำปี 2562',
   'รายงานสถิติธุรกิจประกันวินาศภัยประจำปี 2562 จากสำนักงาน คปภ.',
   '/uploads/stats/stat-2562.pdf', 2562, 8, false, admin_id);

-- =============================================================================
-- 10. PRICE BENEFIT PLANS — แผนสมาชิก (หน้า Home section membership)
-- =============================================================================
INSERT INTO price_benefit_plans (plan_type, label, annual_fee, display_order, is_active) VALUES
  ('general_member',      'สมาชิกทั่วไป',     0,       1, true),
  ('association_member',  'สมาชิกสมาคม',   5000,       2, true)
RETURNING id INTO pp_general;

SELECT id INTO pp_general FROM price_benefit_plans WHERE plan_type = 'general_member';
SELECT id INTO pp_assoc   FROM price_benefit_plans WHERE plan_type = 'association_member';

INSERT INTO price_benefit_conditions (plan_id, condition_text, display_order) VALUES
  -- สมาชิกทั่วไป
  (pp_general, 'เข้าถึงข้อมูลข่าวสารและบทความของสมาคม',         1),
  (pp_general, 'ลงทะเบียนเรียนหลักสูตรในราคาบุคคลทั่วไป',       2),
  (pp_general, 'ดาวน์โหลดสถิติประกันภัยประจำปี',               3),
  (pp_general, 'รับข่าวสารและกิจกรรมของสมาคมทางอีเมล',          4),

  -- สมาชิกสมาคม
  (pp_assoc, 'สิทธิประโยชน์ทุกอย่างของสมาชิกทั่วไป',            1),
  (pp_assoc, 'ส่วนลดพิเศษสำหรับหลักสูตรอบรมทุกหลักสูตร',       2),
  (pp_assoc, 'สิทธิ์เข้าร่วมประชุมใหญ่สามัญประจำปี',           3),
  (pp_assoc, 'ได้รับหนังสือ TIBA Journal รายไตรมาส',            4),
  (pp_assoc, 'ใช้สิ่งอำนวยความสะดวกของสมาคม',                 5),
  (pp_assoc, 'เข้าร่วมกิจกรรม Networking ของสมาคม',            6),
  (pp_assoc, 'รับใบรับรองสมาชิกสมาคมนายหน้าประกันภัยไทย',      7);

-- =============================================================================
-- SUMMARY
-- =============================================================================
RAISE NOTICE '=== Seed v2 Complete ===';
RAISE NOTICE 'banners          = %', (SELECT COUNT(*) FROM banners WHERE deleted_at IS NULL);
RAISE NOTICE 'courses          = %', (SELECT COUNT(*) FROM courses WHERE deleted_at IS NULL);
RAISE NOTICE 'course_sessions  = %', (SELECT COUNT(*) FROM course_sessions);
RAISE NOTICE 'articles         = %', (SELECT COUNT(*) FROM articles WHERE deleted_at IS NULL);
RAISE NOTICE 'executives       = %', (SELECT COUNT(*) FROM executives);
RAISE NOTICE 'public_companies = %', (SELECT COUNT(*) FROM public_companies);
RAISE NOTICE 'partners         = %', (SELECT COUNT(*) FROM partners);
RAISE NOTICE 'ads              = %', (SELECT COUNT(*) FROM ads);
RAISE NOTICE 'statistics_files = %', (SELECT COUNT(*) FROM statistics_files);
RAISE NOTICE 'price_plans      = %', (SELECT COUNT(*) FROM price_benefit_plans);

END $$;
