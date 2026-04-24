-- Migration: Redesign contact form fields
-- Replaces contact (Telegram/WhatsApp) and interest (dropdown) 
-- with email, subject, message for a standard contact form.

ALTER TABLE applications ADD COLUMN IF NOT EXISTS email text NOT NULL DEFAULT '';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS subject text NOT NULL DEFAULT '';
ALTER TABLE applications ADD COLUMN IF NOT EXISTS message text NOT NULL DEFAULT '';
ALTER TABLE applications DROP COLUMN IF EXISTS contact;
ALTER TABLE applications DROP COLUMN IF EXISTS interest;
