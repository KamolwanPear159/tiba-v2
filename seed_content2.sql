-- Ads
INSERT INTO ads(image_path, link_url, position, active_from, active_until, is_active) VALUES
  ('/assets/ad-tip-1.jpg', 'https://www.tiba.or.th/', 'top',     CURRENT_DATE - 10, CURRENT_DATE + 60, true),
  ('/assets/ad-tip-2.jpg', 'https://www.tiba.or.th/', 'top',     CURRENT_DATE - 5,  CURRENT_DATE + 90, true),
  ('/assets/ad-happy.jpg', 'https://www.tiba.or.th/', 'sidebar', CURRENT_DATE,      CURRENT_DATE + 30, true),
  ('/assets/ad-promo-1.jpg','https://www.tiba.or.th/','bottom',  CURRENT_DATE,      CURRENT_DATE + 45, true),
  ('/assets/ad-promo-2.jpg','https://www.tiba.or.th/','bottom',  CURRENT_DATE - 3,  CURRENT_DATE + 20, false),
  ('/assets/ad-promo-3.jpg','https://www.tiba.or.th/','popup',   CURRENT_DATE - 1,  CURRENT_DATE + 7,  false),
  ('/assets/ad-promo-4.jpg','https://www.tiba.or.th/','sidebar', CURRENT_DATE - 2,  CURRENT_DATE + 14, false),
  ('/assets/ad-promo-5.jpg','https://www.tiba.or.th/','top',     CURRENT_DATE - 4,  CURRENT_DATE + 10, false);

-- Partners
INSERT INTO partners(name, logo_path, website_url, display_order, is_active) VALUES
  ('TIBA Dhipaya Insurance', '/assets/partner-tpi.png', 'https://www.dhipaya.co.th', 1, true),
  ('Bangkok Insurance', '/assets/partner-bki.png', 'https://www.bki.co.th', 2, true),
  ('Viriyah Insurance', '/assets/partner-viriyah.png', 'https://www.viriyah.co.th', 3, true),
  ('Muang Thai Insurance', '/assets/partner-mti.png', 'https://www.muangthai.co.th', 4, true),
  ('Southeast Insurance', '/assets/partner-sec.png', 'https://www.southeastins.co.th', 5, true),
  ('SMK Insurance', '/assets/partner-smk.png', 'https://www.smk.co.th', 6, true),
  ('Chubb Insurance', '/assets/partner-chubb.png', 'https://www.chubb.com', 7, false),
  ('LMG Insurance', '/assets/partner-lmg.png', 'https://www.lmginsurance.co.th', 8, true);

-- Executives
INSERT INTO executives(full_name, position_title, photo_path, display_order, is_active) VALUES
  ('Wituun Katimukhtanon', 'President', '/assets/exec-1.jpg', 1, true),
  ('Samrit Phannabho', 'Vice President', '/assets/exec-2.jpg', 2, true),
  ('Watthanawong Katimukhtanon', 'Secretary General', '/assets/exec-3.jpg', 3, true),
  ('Thatcharat Sriratanawisut', 'Treasurer', '/assets/exec-4.jpg', 4, true),
  ('Nuanchat Phrattaphet', 'Director', '/assets/exec-5.jpg', 5, true),
  ('Woraphong Arunsawat', 'Director', '/assets/exec-6.jpg', 6, true),
  ('Naphakon Chiyongkham', 'Director', '/assets/exec-7.jpg', 7, true),
  ('Thaloengsak Boonnaai', 'Director', '/assets/exec-8.jpg', 8, true),
  ('Sakranchaban Boonnaai', 'Director', '/assets/exec-9.jpg', 9, true),
  ('Malabhutti Suphamolang', 'Director', '/assets/exec-10.jpg', 10, true),
  ('Drong Doaeng', 'Director', '/assets/exec-11.jpg', 11, true),
  ('Thajthet Sakulsilaohang', 'Director', '/assets/exec-12.jpg', 12, true);

-- Statistics
INSERT INTO statistics_files(title, description, file_path, published_year, display_order, is_published, uploaded_by)
SELECT t.title, t.desc_, t.path_, t.yr, t.ord, t.pub, u.id
FROM (VALUES
  ('Statistics Report 2567', 'Insurance statistics 2567', '/uploads/stats/stat-2567.pdf', 2567, 1, true),
  ('Statistics Report 2566', 'Insurance statistics 2566', '/uploads/stats/stat-2566.pdf', 2566, 2, true),
  ('Statistics Report 2565', 'Insurance statistics 2565', '/uploads/stats/stat-2565.pdf', 2565, 3, true),
  ('Statistics Report 2564', 'Insurance statistics 2564', '/uploads/stats/stat-2564.pdf', 2564, 4, true),
  ('Statistics Report 2563', 'Insurance statistics 2563', '/uploads/stats/stat-2563.pdf', 2563, 5, false),
  ('Premium Rate Q1/2568', 'Premium rate summary Q1 2568', '/uploads/stats/rate-q1-2568.pdf', 2568, 6, true)
) AS t(title, desc_, path_, yr, ord, pub)
CROSS JOIN (SELECT id FROM users WHERE role IN ('admin','superadmin') LIMIT 1) AS u;

-- Public companies
INSERT INTO public_companies(name, logo_path, website_url, description, display_order, is_active) VALUES
  ('Dhipaya Insurance', '/assets/co-tpi.png', 'https://www.dhipaya.co.th', 'Leading Thai insurer', 1, true),
  ('Bangkok Insurance', '/assets/co-bki.png', 'https://www.bki.co.th', 'Full-service insurer', 2, true),
  ('Viriyah Insurance', '/assets/co-vir.png', 'https://www.viriyah.co.th', 'Auto and general insurance', 3, true),
  ('Muang Thai Insurance', '/assets/co-mti.png', 'https://www.muangthai.co.th', 'Comprehensive insurance', 4, true),
  ('Southeast Insurance', '/assets/co-sec.png', 'https://www.southeastins.co.th', 'Home and property insurance', 5, true),
  ('SMK Insurance', '/assets/co-smk.png', 'https://www.smk.co.th', 'Vehicle and accident insurance', 6, true),
  ('LMG Insurance', '/assets/co-lmg.png', 'https://www.lmginsurance.co.th', 'Commercial insurance', 7, true),
  ('Chubb Insurance', '/assets/co-chubb.png', 'https://www.chubb.com', 'International insurance', 8, false);

-- Member users
INSERT INTO users(email, password_hash, role, is_active) VALUES
  ('chayawan@example.com', '$2a$10$X', 'general_member', true),
  ('somchai@example.com', '$2a$10$X', 'general_member', true),
  ('malee@example.com', '$2a$10$X', 'general_member', false),
  ('wanchai@example.com', '$2a$10$X', 'general_member', true),
  ('pranee@example.com', '$2a$10$X', 'general_member', true),
  ('suparerk@example.com', '$2a$10$X', 'general_member', true),
  ('patcharee@example.com', '$2a$10$X', 'general_member', false),
  ('kittipong@example.com', '$2a$10$X', 'general_member', true),
  ('napaporn@example.com', '$2a$10$X', 'general_member', true),
  ('thanakorn@example.com', '$2a$10$X', 'general_member', true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO general_member_profiles(user_id, first_name, last_name, phone)
SELECT u.id, v.fn, v.ln, v.ph FROM (VALUES
  ('chayawan@example.com', 'Chayawan', 'Phutchana', '085-3425516'),
  ('somchai@example.com', 'Somchai', 'Jaidee', '081-2345678'),
  ('malee@example.com', 'Malee', 'Srithong', '089-3456789'),
  ('wanchai@example.com', 'Wanchai', 'Boonmee', '082-4567890'),
  ('pranee@example.com', 'Pranee', 'Khamchan', '083-5678901'),
  ('suparerk@example.com', 'Suparerk', 'Wongsiri', '084-6789012'),
  ('patcharee@example.com', 'Patcharee', 'Thongdee', '085-7890123'),
  ('kittipong@example.com', 'Kittipong', 'Rattana', '086-8901234'),
  ('napaporn@example.com', 'Napaporn', 'Chaimongkol', '087-9012345'),
  ('thanakorn@example.com', 'Thanakorn', 'Saengkaew', '088-0123456')
) AS v(em, fn, ln, ph) JOIN users u ON u.email = v.em
ON CONFLICT (user_id) DO NOTHING;

SELECT 'Ads: ' || count(*) AS result FROM ads
UNION ALL SELECT 'Partners: ' || count(*) FROM partners
UNION ALL SELECT 'Executives: ' || count(*) FROM executives
UNION ALL SELECT 'Statistics: ' || count(*) FROM statistics_files
UNION ALL SELECT 'Companies: ' || count(*) FROM public_companies
UNION ALL SELECT 'Members: ' || count(*) FROM users WHERE role = 'general_member'
UNION ALL SELECT 'Profiles: ' || count(*) FROM general_member_profiles;
