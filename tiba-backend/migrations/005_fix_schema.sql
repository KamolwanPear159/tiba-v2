-- ============================================================
-- Migration 005 — Fix schema to match spec
-- ============================================================

-- 1. Fix course_sessions: DATE → TIMESTAMPTZ for training dates
ALTER TABLE course_sessions
  ALTER COLUMN training_start TYPE TIMESTAMPTZ USING training_start::TIMESTAMPTZ,
  ALTER COLUMN training_end   TYPE TIMESTAMPTZ USING training_end::TIMESTAMPTZ;

-- 2. Add missing columns to courses table (About Course page)
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS expectations      JSONB,          -- ["สิ่งที่จะได้รับ 1", ...]
  ADD COLUMN IF NOT EXISTS about_content     TEXT,           -- rich text เกี่ยวกับคอร์สนี้
  ADD COLUMN IF NOT EXISTS location_name     VARCHAR(300),   -- สถานที่จัดอบรม
  ADD COLUMN IF NOT EXISTS location_map_url  TEXT,           -- external map URL
  ADD COLUMN IF NOT EXISTS contact_phone     VARCHAR(50),    -- เบอร์ติดต่อ
  ADD COLUMN IF NOT EXISTS contact_email     VARCHAR(320),   -- อีเมลติดต่อ
  ADD COLUMN IF NOT EXISTS contact_line      VARCHAR(100),   -- Line ID
  ADD COLUMN IF NOT EXISTS contact_facebook  TEXT,           -- Facebook URL
  ADD COLUMN IF NOT EXISTS brochure_path     TEXT;           -- ดาวน์โหลดโบชัวร์ (file path)

-- 3. Add course_banners table (auto-scroll banner images)
CREATE TABLE IF NOT EXISTS course_banners (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id     UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  image_path    TEXT NOT NULL,
  display_order SMALLINT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_course_banners_course ON course_banners(course_id);

-- 4. Add OTP codes table (for register + forgot password)
CREATE TABLE IF NOT EXISTS otp_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(320) NOT NULL,
  code        VARCHAR(6)   NOT NULL,
  purpose     VARCHAR(50)  NOT NULL,  -- 'register' | 'forgot_password' | 'sub_member'
  expires_at  TIMESTAMPTZ  NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes(email, purpose);

-- 5. Add notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(300) NOT NULL,
  body        TEXT,
  type        VARCHAR(50),           -- 'course_approved' | 'payment_confirmed' etc.
  is_read     BOOLEAN NOT NULL DEFAULT false,
  related_id  TEXT,                  -- UUID of related entity
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- 6. Add news tags tables
CREATE TABLE IF NOT EXISTS news_tags (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name  VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS article_news_tags (
  article_id  UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id      UUID NOT NULL REFERENCES news_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- 7. Add pinned flag to articles
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT false;

-- 8. Add member_products and member_awards for company profiles
CREATE TABLE IF NOT EXISTS company_products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES public_companies(id) ON DELETE CASCADE,
  name        VARCHAR(300) NOT NULL,
  description TEXT,
  image_path  TEXT,
  display_order SMALLINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS company_awards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES public_companies(id) ON DELETE CASCADE,
  title       VARCHAR(300) NOT NULL,
  year        SMALLINT,
  description TEXT,
  image_path  TEXT,
  display_order SMALLINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Fix price_benefit_plans seed data (wrong amounts)
UPDATE price_benefit_plans SET annual_fee = 0     WHERE plan_type = 'general';
UPDATE price_benefit_plans SET annual_fee = 20000 WHERE plan_type = 'association_company';
UPDATE price_benefit_plans SET annual_fee = 20000 WHERE plan_type = 'association_individual';

-- 10. Add display_name column to articles (for news listing)
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS view_count    INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS download_count INTEGER NOT NULL DEFAULT 0;

-- 11. Add view/download count to statistics_files
ALTER TABLE statistics_files
  ADD COLUMN IF NOT EXISTS view_count     INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS download_count INTEGER NOT NULL DEFAULT 0;

-- 12. Add username to users (for admin_chayawan)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE;
