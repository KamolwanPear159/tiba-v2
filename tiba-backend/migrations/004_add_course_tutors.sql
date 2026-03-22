-- Migration 004: link tutors to courses
CREATE TABLE IF NOT EXISTS course_tutors (
  course_id     UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  tutor_id      UUID NOT NULL REFERENCES tutors(id)  ON DELETE CASCADE,
  display_order SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (course_id, tutor_id)
);
CREATE INDEX IF NOT EXISTS idx_course_tutors_course_id ON course_tutors(course_id);
