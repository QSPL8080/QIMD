-- ============================================================================
-- QIMD — remove the database tables for the admin sections that were deleted
-- (programs, program categories, trainers, team, hiring & EMI partners,
--  website settings, header, footer, social links, pages/sections,
--  reports, audit logs, notification logs, brochures).
--
-- That content now lives in the website code (src/data/index.ts and
-- src/data/siteSettings.ts), so these tables are no longer needed.
--
-- HOW TO RUN
--   1. Take a backup first (Supabase → Database → Backups), because this
--      permanently deletes the tables and everything in them.
--   2. Open Supabase → SQL Editor, paste this whole file and click Run.
--   3. Deploy the matching code (schema without these models).
-- ============================================================================

BEGIN;

-- Keep the program name on existing admission leads before their link to
-- the programs table is removed (it is saved at the top of the message).
UPDATE admission_enquiries ae
SET    message = 'Program: ' || c.course_name || COALESCE(E'\n' || ae.message, '')
FROM   courses c
WHERE  ae.course_id = c.id
  AND  (ae.message IS NULL OR ae.message NOT LIKE 'Program:%');

-- Placed students already keep their program in placements.course_name.
ALTER TABLE admission_enquiries DROP COLUMN IF EXISTS course_id;
ALTER TABLE placements          DROP COLUMN IF EXISTS course_id;

DROP TABLE IF EXISTS
  brochures,
  footer_column_links,
  footer_columns,
  footer_contact_items,
  footer_settings,
  header_contact_items,
  header_settings,
  page_sections,
  web_pages,
  audit_logs,
  notification_logs,
  reports,
  website_settings,
  emi_partners,
  partners,
  courses,
  teams,
  trainers,
  course_categories
CASCADE;

COMMIT;
