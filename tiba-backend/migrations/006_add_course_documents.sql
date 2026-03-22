-- Migration 006: Add course_documents table
CREATE TABLE IF NOT EXISTS course_documents (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id    UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name         VARCHAR(255) NOT NULL,
    file_path    TEXT        NOT NULL,
    display_order INT        NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_course_documents_course_id ON course_documents(course_id);
