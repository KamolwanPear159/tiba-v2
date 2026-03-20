-- ============================================================
-- Migration 002 — Add tutors table
-- ============================================================

CREATE TABLE IF NOT EXISTS tutors (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(300)    NOT NULL,
  position       VARCHAR(200)    NOT NULL,
  photo_path     TEXT,
  display_order  SMALLINT        NOT NULL DEFAULT 0,
  is_active      BOOLEAN         NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ     NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ     NOT NULL DEFAULT now(),
  deleted_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tutors_display_order ON tutors(display_order);
