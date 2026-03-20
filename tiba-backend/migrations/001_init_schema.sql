CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('admin','general_member','association_main','association_sub');
CREATE TYPE sub_user_permission AS ENUM ('full','view_only');
CREATE TYPE entity_type AS ENUM ('company','individual');
CREATE TYPE registration_status AS ENUM ('in_progress_first','in_progress_second_review','in_progress_second_payment','accepted','rejected');
CREATE TYPE sub_invite_status AS ENUM ('pending','approved','rejected');
CREATE TYPE course_format AS ENUM ('onsite','online');
CREATE TYPE course_price_type AS ENUM ('single','dual');
CREATE TYPE enrollment_status AS ENUM ('pending_payment','slip_uploaded','payment_confirmed','cancelled','rejected');
CREATE TYPE payment_category AS ENUM ('membership_fee','course_fee');
CREATE TYPE payment_status AS ENUM ('pending','slip_uploaded','confirmed','rejected');
CREATE TYPE member_plan_type AS ENUM ('general','association_company','association_individual');
CREATE TYPE ad_position AS ENUM ('top','sidebar','bottom','popup');
CREATE TYPE article_type AS ENUM ('news','blog');
CREATE TYPE admin_action_category AS ENUM ('user_management','registration_review','payment_confirm','course_management','enrollment_management','content_management','system');

CREATE OR REPLACE FUNCTION trigger_set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email VARCHAR(320) NOT NULL, password_hash TEXT NOT NULL, role user_role NOT NULL, is_active BOOLEAN NOT NULL DEFAULT true, email_verified_at TIMESTAMPTZ, last_login_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ, CONSTRAINT uq_users_email UNIQUE (email));
CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE general_member_profiles (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE, first_name VARCHAR(150) NOT NULL, last_name VARCHAR(150) NOT NULL, phone VARCHAR(20), address TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TRIGGER trg_gmp_updated_at BEFORE UPDATE ON general_member_profiles FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE association_registrations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id), entity_type entity_type NOT NULL, status registration_status NOT NULL DEFAULT 'in_progress_first', org_name VARCHAR(300), tax_id VARCHAR(50), first_name VARCHAR(150), last_name VARCHAR(150), id_card_number VARCHAR(20), phone VARCHAR(20), address TEXT, doc_registration_cert TEXT, doc_id_card TEXT, doc_other TEXT, first_reviewed_by UUID REFERENCES users(id), first_reviewed_at TIMESTAMPTZ, first_review_note TEXT, second_reviewed_by UUID REFERENCES users(id), second_reviewed_at TIMESTAMPTZ, second_review_note TEXT, payment_confirmed_by UUID REFERENCES users(id), payment_confirmed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TRIGGER trg_ar_updated_at BEFORE UPDATE ON association_registrations FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE association_profiles (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID UNIQUE NOT NULL REFERENCES users(id), registration_id UUID UNIQUE NOT NULL REFERENCES association_registrations(id), entity_type entity_type NOT NULL, display_name VARCHAR(300) NOT NULL, tax_id VARCHAR(50), phone VARCHAR(20), address TEXT, membership_number VARCHAR(50) UNIQUE, membership_expiry_date DATE, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TRIGGER trg_ap_updated_at BEFORE UPDATE ON association_profiles FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE association_sub_users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), main_user_id UUID NOT NULL REFERENCES users(id), sub_user_id UUID REFERENCES users(id), invited_email VARCHAR(320) NOT NULL, permission sub_user_permission NOT NULL, invite_status sub_invite_status NOT NULL DEFAULT 'pending', reviewed_by UUID REFERENCES users(id), reviewed_at TIMESTAMPTZ, review_note TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TRIGGER trg_asu_updated_at BEFORE UPDATE ON association_sub_users FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE courses (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title VARCHAR(400) NOT NULL, description TEXT, format course_format NOT NULL, online_meeting_link TEXT, price_type course_price_type NOT NULL DEFAULT 'single', price_general NUMERIC(12,2), price_association NUMERIC(12,2), thumbnail_path TEXT, is_published BOOLEAN NOT NULL DEFAULT false, created_by UUID NOT NULL REFERENCES users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX idx_courses_published ON courses(is_published) WHERE deleted_at IS NULL;
CREATE TRIGGER trg_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE course_sessions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE, session_label VARCHAR(100), location TEXT, seat_capacity SMALLINT, enrollment_start TIMESTAMPTZ NOT NULL, enrollment_end TIMESTAMPTZ NOT NULL, training_start DATE NOT NULL, training_end DATE NOT NULL, is_cancelled BOOLEAN NOT NULL DEFAULT false, cancel_reason TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX idx_cs_course_id ON course_sessions(course_id);
CREATE INDEX idx_cs_training ON course_sessions(training_start);
CREATE TRIGGER trg_cs_updated_at BEFORE UPDATE ON course_sessions FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE enrollments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), session_id UUID NOT NULL REFERENCES course_sessions(id), user_id UUID NOT NULL REFERENCES users(id), status enrollment_status NOT NULL DEFAULT 'pending_payment', certificate_path TEXT, certificate_issued_at TIMESTAMPTZ, issued_by UUID REFERENCES users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), CONSTRAINT uq_enrollment UNIQUE(session_id, user_id));
CREATE TRIGGER trg_enrollments_updated_at BEFORE UPDATE ON enrollments FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE payments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id), category payment_category NOT NULL, status payment_status NOT NULL DEFAULT 'pending', amount NUMERIC(12,2) NOT NULL, registration_id UUID REFERENCES association_registrations(id), enrollment_id UUID REFERENCES enrollments(id), slip_file_path TEXT, slip_uploaded_at TIMESTAMPTZ, confirmed_by UUID REFERENCES users(id), confirmed_at TIMESTAMPTZ, rejection_note TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE articles (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), article_type article_type NOT NULL, title VARCHAR(500) NOT NULL, slug VARCHAR(550) NOT NULL UNIQUE, body TEXT NOT NULL, thumbnail_path TEXT, is_published BOOLEAN NOT NULL DEFAULT false, published_at TIMESTAMPTZ, author_id UUID NOT NULL REFERENCES users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX idx_articles_published ON articles(published_at DESC) WHERE is_published=true AND deleted_at IS NULL;
CREATE TRIGGER trg_articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE banners (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), image_path TEXT NOT NULL, link_url TEXT, display_order SMALLINT NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE TRIGGER trg_banners_updated_at BEFORE UPDATE ON banners FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE ads (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), image_path TEXT NOT NULL, link_url TEXT NOT NULL, position ad_position NOT NULL, active_from DATE NOT NULL, active_until DATE NOT NULL, is_active BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE TRIGGER trg_ads_updated_at BEFORE UPDATE ON ads FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE partners (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(300) NOT NULL, logo_path TEXT NOT NULL, website_url TEXT, display_order SMALLINT NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE TRIGGER trg_partners_updated_at BEFORE UPDATE ON partners FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE executives (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), full_name VARCHAR(300) NOT NULL, position_title VARCHAR(200) NOT NULL, photo_path TEXT, display_order SMALLINT NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE TRIGGER trg_executives_updated_at BEFORE UPDATE ON executives FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE statistics_files (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title VARCHAR(400) NOT NULL, description TEXT, file_path TEXT NOT NULL, published_year SMALLINT, display_order SMALLINT NOT NULL DEFAULT 0, is_published BOOLEAN NOT NULL DEFAULT false, uploaded_by UUID NOT NULL REFERENCES users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE TRIGGER trg_sf_updated_at BEFORE UPDATE ON statistics_files FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE price_benefit_plans (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), plan_type member_plan_type NOT NULL UNIQUE, label VARCHAR(200) NOT NULL, annual_fee NUMERIC(12,2) NOT NULL DEFAULT 0, display_order SMALLINT NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TRIGGER trg_pbp_updated_at BEFORE UPDATE ON price_benefit_plans FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE price_benefit_conditions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), plan_id UUID NOT NULL REFERENCES price_benefit_plans(id) ON DELETE CASCADE, condition_text TEXT NOT NULL, display_order SMALLINT NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TRIGGER trg_pbc_updated_at BEFORE UPDATE ON price_benefit_conditions FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE contact_info (id SMALLINT PRIMARY KEY DEFAULT 1, address TEXT, phone VARCHAR(50), email VARCHAR(320), map_embed_url TEXT, line_id VARCHAR(100), facebook_url TEXT, updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), CONSTRAINT chk_contact_singleton CHECK (id=1));
INSERT INTO contact_info (id) VALUES (1) ON CONFLICT DO NOTHING;

CREATE TABLE public_companies (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(400) NOT NULL, logo_path TEXT, website_url TEXT, description TEXT, display_order SMALLINT NOT NULL DEFAULT 0, is_active BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE TRIGGER trg_pc_updated_at BEFORE UPDATE ON public_companies FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TABLE admin_activity_logs (id BIGSERIAL PRIMARY KEY, admin_id UUID NOT NULL REFERENCES users(id), action_category admin_action_category NOT NULL, action_verb VARCHAR(100) NOT NULL, target_table VARCHAR(100), target_id TEXT, description TEXT, ip_address INET, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX idx_aal_admin ON admin_activity_logs(admin_id);
CREATE INDEX idx_aal_created ON admin_activity_logs(created_at DESC);

CREATE TABLE refresh_tokens (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, token_hash TEXT NOT NULL UNIQUE, expires_at TIMESTAMPTZ NOT NULL, revoked_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE INDEX idx_rt_user ON refresh_tokens(user_id);

CREATE TABLE password_reset_tokens (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, token_hash TEXT NOT NULL UNIQUE, expires_at TIMESTAMPTZ NOT NULL, used_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now());

-- Seed default admin user (password: Admin@1234)
INSERT INTO users (email, password_hash, role) VALUES ('admin@tiba.co.th', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Seed price benefit plans
INSERT INTO price_benefit_plans (plan_type, label, annual_fee, display_order) VALUES
  ('general','สมาชิกทั่วไป',2000,1),
  ('association_company','สมาชิกสมาคม (นิติบุคคล)',5000,2),
  ('association_individual','สมาชิกสมาคม (บุคคล)',3000,3);
