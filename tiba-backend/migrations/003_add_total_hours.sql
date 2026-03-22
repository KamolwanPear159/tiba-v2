-- Migration 003: add total_hours to courses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS total_hours INTEGER;
