DO $$
DECLARE
  admin_id UUID := '289f62ef-7ab3-4367-b7c8-ea7cb21b4379';
  now_ts TIMESTAMPTZ := NOW();
BEGIN

-- ============================================================
-- COURSES
-- ============================================================

-- Upcoming x4
WITH c1 AS (
  INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
  VALUES ('หลักสูตรนายหน้าประกันวินาศภัย ภาคทฤษฎี (รุ่น 1/2568)', 'อบรมความรู้พื้นฐานการประกันวินาศภัย', 'onsite', 'dual', 2300, 2000, '/assets/course-thumb-1.png', true, admin_id)
  ON CONFLICT DO NOTHING RETURNING id
)
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
SELECT id, 'รอบที่ 1', 'กรุงเทพฯ', 60,
  now_ts + INTERVAL '35 days', now_ts + INTERVAL '65 days',
  (now_ts + INTERVAL '95 days')::date, (now_ts + INTERVAL '97 days')::date
FROM c1;

WITH c2 AS (
  INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
  VALUES ('หลักสูตรพัฒนาความรู้ต่อเนื่อง CDC ประจำปี 2568', 'พัฒนาทักษะนายหน้าต่ออายุใบอนุญาต', 'online', 'dual', 1600, 1400, '/assets/course-thumb-2.png', true, admin_id)
  ON CONFLICT DO NOTHING RETURNING id
)
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
SELECT id, 'รอบที่ 1', 'ออนไลน์', 100,
  now_ts + INTERVAL '30 days', now_ts + INTERVAL '60 days',
  (now_ts + INTERVAL '90 days')::date, (now_ts + INTERVAL '90 days')::date
FROM c2;

WITH c3 AS (
  INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
  VALUES ('หลักสูตร AMTB และ MLTB รุ่นที่ 15', 'หลักสูตรระดับสูงสำหรับผู้บริหาร', 'onsite', 'dual', 5000, 4500, '/assets/course-thumb-3.png', true, admin_id)
  ON CONFLICT DO NOTHING RETURNING id
)
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
SELECT id, 'รุ่นที่ 15', 'โรงแรมเซ็นทารา', 40,
  now_ts + INTERVAL '45 days', now_ts + INTERVAL '75 days',
  (now_ts + INTERVAL '100 days')::date, (now_ts + INTERVAL '103 days')::date
FROM c3;

WITH c4 AS (
  INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
  VALUES ('กฎหมายประกันภัยและจรรยาบรรณนายหน้า', 'เรียนรู้กฎหมายและจรรยาบรรณวิชาชีพ', 'online', 'dual', 900, 800, '/assets/course-thumb-4.png', true, admin_id)
  ON CONFLICT DO NOTHING RETURNING id
)
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
SELECT id, 'รอบที่ 1', 'ออนไลน์', 200,
  now_ts + INTERVAL '32 days', now_ts + INTERVAL '62 days',
  (now_ts + INTERVAL '92 days')::date, (now_ts + INTERVAL '92 days')::date
FROM c4;

-- Closing soon x4
WITH c5 AS (
  INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
  VALUES ('นายหน้าประกันชีวิต ภาคปฏิบัติ รุ่น 3/2567', 'เตรียมสอบนายหน้าประกันชีวิต เน้นปฏิบัติ', 'onsite', 'dual', 2500, 2200, '/assets/course-thumb-1.png', true, admin_id)
  ON CONFLICT DO NOTHING RETURNING id
)
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
SELECT id, 'รอบที่ 3', 'กรุงเทพฯ', 50,
  now_ts - INTERVAL '20 days', now_ts + INTERVAL '2 days',
  (now_ts + INTERVAL '15 days')::date, (now_ts + INTERVAL '17 days')::date
FROM c5;

WITH c6 AS (
  INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
  VALUES ('การตลาดประกันภัยยุคดิจิทัล', 'กลยุทธ์การขายประกันภัยในยุค Digital', 'online', 'dual', 1200, 1000, '/assets/course-thumb-2.png', true, admin_id)
  ON CONFLICT DO NOTHING RETURNING id
)
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
SELECT id, 'รอบที่ 2', 'ออนไลน์', 150,
  now_ts - INTERVAL '15 days', now_ts + INTERVAL '1 day',
  (now_ts + INTERVAL '10 days')::date, (now_ts + INTERVAL '10 days')::date
FROM c6;

WITH c7 AS (
  INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
  VALUES ('ทักษะการวิเคราะห์ความเสี่ยงขั้นสูง', 'ประเมินและบริหารความเสี่ยงระดับสูง', 'onsite', 'dual', 3200, 2800, '/assets/course-thumb-3.png', true, admin_id)
  ON CONFLICT DO NOTHING RETURNING id
)
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
SELECT id, 'รอบที่ 1', 'เชียงใหม่', 30,
  now_ts - INTERVAL '25 days', now_ts + INTERVAL '3 days',
  (now_ts + INTERVAL '20 days')::date, (now_ts + INTERVAL '22 days')::date
FROM c7;

WITH c8 AS (
  INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
  VALUES ('ประกันภัยรถยนต์และสินค้า ภาคทฤษฎี', 'ความรู้เฉพาะทางประกันภัยรถยนต์', 'online', 'dual', 1500, 1300, '/assets/course-thumb-4.png', true, admin_id)
  ON CONFLICT DO NOTHING RETURNING id
)
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
SELECT id, 'รอบที่ 1', 'ออนไลน์', 100,
  now_ts - INTERVAL '10 days', now_ts + INTERVAL '2 days',
  (now_ts + INTERVAL '14 days')::date, (now_ts + INTERVAL '14 days')::date
FROM c8;

-- Open x4
WITH c9 AS (
  INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
  VALUES ('หลักสูตรนายหน้าประกันวินาศภัย รุ่น 2/2568', 'อบรมความรู้พื้นฐานสำหรับมือใหม่', 'onsite', 'dual', 2300, 2000, '/assets/course-thumb-1.png', true, admin_id)
  ON CONFLICT DO NOTHING RETURNING id
)
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
SELECT id, 'รอบที่ 2', 'กรุงเทพฯ', 60,
  now_ts - INTERVAL '7 days', now_ts + INTERVAL '21 days',
  (now_ts + INTERVAL '35 days')::date, (now_ts + INTERVAL '37 days')::date
FROM c9;

WITH c10 AS (
  INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
  VALUES ('ประกันสุขภาพและอุบัติเหตุ สำหรับนายหน้า', 'ความรู้ประกันสุขภาพที่นายหน้าต้องรู้', 'online', 'dual', 1800, 1600, '/assets/course-thumb-2.png', true, admin_id)
  ON CONFLICT DO NOTHING RETURNING id
)
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
SELECT id, 'รอบที่ 1', 'ออนไลน์', 120,
  now_ts - INTERVAL '5 days', now_ts + INTERVAL '25 days',
  (now_ts + INTERVAL '40 days')::date, (now_ts + INTERVAL '40 days')::date
FROM c10;

WITH c11 AS (
  INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
  VALUES ('CDC เพิ่มพูนความรู้นายหน้าประกันชีวิต', 'พัฒนาความรู้ต่อเนื่องสำหรับนายหน้าชีวิต', 'online', 'dual', 1400, 1200, '/assets/course-thumb-3.png', true, admin_id)
  ON CONFLICT DO NOTHING RETURNING id
)
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
SELECT id, 'รอบที่ 1', 'ออนไลน์', 200,
  now_ts - INTERVAL '3 days', now_ts + INTERVAL '28 days',
  (now_ts + INTERVAL '45 days')::date, (now_ts + INTERVAL '45 days')::date
FROM c11;

WITH c12 AS (
  INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
  VALUES ('กลยุทธ์การบริหารพอร์ตประกันภัย', 'เทคนิคบริหารและพัฒนาฐานลูกค้า', 'onsite', 'dual', 3500, 3000, '/assets/course-thumb-4.png', true, admin_id)
  ON CONFLICT DO NOTHING RETURNING id
)
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
SELECT id, 'รอบที่ 1', 'กรุงเทพฯ', 35,
  now_ts - INTERVAL '10 days', now_ts + INTERVAL '18 days',
  (now_ts + INTERVAL '30 days')::date, (now_ts + INTERVAL '32 days')::date
FROM c12;

-- Closed x4
WITH c13 AS (
  INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
  VALUES ('หลักสูตรนายหน้าประกันวินาศภัย รุ่น 4/2567', 'ปิดรับสมัครแล้ว', 'onsite', 'dual', 2300, 2000, '/assets/course-thumb-1.png', true, admin_id)
  ON CONFLICT DO NOTHING RETURNING id
)
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
SELECT id, 'รอบที่ 4', 'กรุงเทพฯ', 60,
  now_ts - INTERVAL '60 days', now_ts - INTERVAL '5 days',
  (now_ts - INTERVAL '2 days')::date, now_ts::date
FROM c13;

WITH c14 AS (
  INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
  VALUES ('ประกันภัยพืชผลและปศุสัตว์', 'ประกันภัยภาคเกษตรสำหรับนายหน้า', 'online', 'dual', 1000, 900, '/assets/course-thumb-2.png', true, admin_id)
  ON CONFLICT DO NOTHING RETURNING id
)
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
SELECT id, 'รอบที่ 1', 'ออนไลน์', 80,
  now_ts - INTERVAL '55 days', now_ts - INTERVAL '8 days',
  (now_ts - INTERVAL '3 days')::date, now_ts::date
FROM c14;

WITH c15 AS (
  INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
  VALUES ('กฎหมายแรงงานและประกันสังคม', 'เชื่อมโยงกฎหมายแรงงานกับประกันภัย', 'onsite', 'dual', 2000, 1800, '/assets/course-thumb-3.png', true, admin_id)
  ON CONFLICT DO NOTHING RETURNING id
)
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
SELECT id, 'รอบที่ 1', 'กรุงเทพฯ', 45,
  now_ts - INTERVAL '50 days', now_ts - INTERVAL '10 days',
  (now_ts - INTERVAL '5 days')::date, (now_ts - INTERVAL '3 days')::date
FROM c15;

WITH c16 AS (
  INSERT INTO courses(title, description, format, price_type, price_general, price_association, thumbnail_path, is_published, created_by)
  VALUES ('เทคโนโลยี InsurTech สำหรับนายหน้า', 'การใช้เทคโนโลยียกระดับธุรกิจนายหน้า', 'online', 'dual', 2500, 2200, '/assets/course-thumb-4.png', true, admin_id)
  ON CONFLICT DO NOTHING RETURNING id
)
INSERT INTO course_sessions(course_id, session_label, location, seat_capacity, enrollment_start, enrollment_end, training_start, training_end)
SELECT id, 'รอบที่ 1', 'ออนไลน์', 150,
  now_ts - INTERVAL '45 days', now_ts - INTERVAL '6 days',
  (now_ts - INTERVAL '1 day')::date, now_ts::date
FROM c16;

-- ============================================================
-- NEWS & ARTICLES (6 items)
-- ============================================================

INSERT INTO articles(article_type, title, slug, body, thumbnail_path, is_published, published_at, author_id)
VALUES
  ('news', 'TIBA จัดงาน Mangrove Forest Planting เพื่ออนุรักษ์ธรรมชาติ',
   'tiba-mangrove-2568', '<p>TIBA ร่วมปลูกป่าชายเลน ณ จังหวัดระยอง เพื่อสิ่งแวดล้อม</p>',
   '/assets/news-featured.png', true, now_ts - INTERVAL '5 days', admin_id),
  ('news', 'TIBA ร่วมงานแม่น้ำ สัตว์ จัดโดยจังหวัดกาญจนบุรี',
   'tiba-kanchanaburi-2568', '<p>TIBA ร่วมงานอนุรักษ์สัตว์น้ำ จ.กาญจนบุรี</p>',
   '/assets/news-thumb-1.png', true, now_ts - INTERVAL '10 days', admin_id),
  ('news', 'TIBA ร่วมแสดงความอาลัยอดีตนายก TIBA ผู้ทรงคุณวุฒิ',
   'tiba-condolences-2568', '<p>คณะกรรมการ TIBA ร่วมแสดงความอาลัยแก่อดีตนายกสมาคม</p>',
   '/assets/news-thumb-2.png', true, now_ts - INTERVAL '15 days', admin_id),
  ('blog', 'สถิติประกันวินาศภัยไทย ไตรมาสที่ 3/2567',
   'stats-q3-2567', '<p>เบี้ยประกันรับรวม 135,000 ล้านบาท เพิ่มขึ้น 8.5% จากปีก่อน</p>',
   '/assets/news-thumb-3.png', true, now_ts - INTERVAL '20 days', admin_id),
  ('blog', 'บทบาทนายหน้าประกันภัยในยุค Digital Disruption',
   'broker-digital-disruption-2568', '<p>นายหน้าต้องปรับตัวอย่างไรในยุคดิจิทัล</p>',
   '/assets/news-thumb-4.png', true, now_ts - INTERVAL '25 days', admin_id),
  ('news', 'TIBA เปิดตัวระบบสมาชิกออนไลน์ใหม่',
   'tiba-member-portal-2568', '<p>ระบบสมาชิกออนไลน์ใหม่พร้อมให้บริการสมาชิกทั่วประเทศ</p>',
   '/assets/news-featured.png', true, now_ts - INTERVAL '3 days', admin_id)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- BANNERS (2 active)
-- ============================================================

INSERT INTO banners(image_url, link_url, display_order, is_active, created_by)
VALUES
  ('/assets/hero-bg.png', 'https://www.tiba.or.th/', 1, true, admin_id),
  ('/assets/membership-bg.png', 'https://www.tiba.or.th/register', 2, true, admin_id)
ON CONFLICT DO NOTHING;

END $$;
