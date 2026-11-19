-- ============================================================================
-- QIMD — admin users
--   * removes the EMPLOYEE and CONTENT_MANAGER accounts (those roles no longer exist)
--   * adds the SEO account seo@qimd.com (role SEO: can only see and manage Blogs)
--
-- The password is stored as a bcrypt hash only. Sign in with the password you
-- chose for this account.
--
-- HOW TO RUN: Supabase → SQL Editor → paste this whole file → Run.
-- (Run drop_removed_admin_tables.sql first if you have not already.)
-- ============================================================================

BEGIN;

-- 1. Detach anything linked to the accounts being removed (content and leads stay).
UPDATE blogs                       SET author_id     = NULL WHERE author_id     IN (SELECT id FROM users WHERE role IN ('EMPLOYEE', 'CONTENT_MANAGER'));
UPDATE gallery                     SET created_by_id = NULL WHERE created_by_id IN (SELECT id FROM users WHERE role IN ('EMPLOYEE', 'CONTENT_MANAGER'));
UPDATE testimonials                SET created_by_id = NULL WHERE created_by_id IN (SELECT id FROM users WHERE role IN ('EMPLOYEE', 'CONTENT_MANAGER'));
UPDATE faqs                        SET created_by_id = NULL WHERE created_by_id IN (SELECT id FROM users WHERE role IN ('EMPLOYEE', 'CONTENT_MANAGER'));
UPDATE contact_enquiries           SET assigned_to   = NULL WHERE assigned_to   IN (SELECT id FROM users WHERE role IN ('EMPLOYEE', 'CONTENT_MANAGER'));
UPDATE admission_enquiries         SET assigned_to   = NULL WHERE assigned_to   IN (SELECT id FROM users WHERE role IN ('EMPLOYEE', 'CONTENT_MANAGER'));
UPDATE franchise_partner_enquiries SET assigned_to   = NULL WHERE assigned_to   IN (SELECT id FROM users WHERE role IN ('EMPLOYEE', 'CONTENT_MANAGER'));
UPDATE company_placement_enquiries SET assigned_to   = NULL WHERE assigned_to   IN (SELECT id FROM users WHERE role IN ('EMPLOYEE', 'CONTENT_MANAGER'));

-- Old log tables (only if they still exist)
DO $$
BEGIN
  IF to_regclass('public.audit_logs') IS NOT NULL THEN
    DELETE FROM audit_logs WHERE user_id IN (SELECT id FROM users WHERE role IN ('EMPLOYEE', 'CONTENT_MANAGER'));
  END IF;
  IF to_regclass('public.reports') IS NOT NULL THEN
    DELETE FROM reports WHERE generated_by IN (SELECT id FROM users WHERE role IN ('EMPLOYEE', 'CONTENT_MANAGER'));
  END IF;
END $$;

-- 2. Remove the Employee and Content Manager accounts.
DELETE FROM users WHERE role IN ('EMPLOYEE', 'CONTENT_MANAGER');

-- 3. Add (or reset) the SEO blog editor account.
DO $$
DECLARE
  has_role_id boolean;
BEGIN
  -- Older databases still carry a role_id column; reuse the Admin account's value there.
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role_id'
  ) INTO has_role_id;

  IF EXISTS (SELECT 1 FROM users WHERE email = 'seo@qimd.com') THEN
    UPDATE users
    SET password_hash = '$2b$10$yl4Zh4jI7gUTrxnZ4IW8YeOZkBgWI.oV4uoaeJqbLKuvSsVrW4SC2',
        role = 'SEO', status = true, is_deleted = false, updated_at = now()
    WHERE email = 'seo@qimd.com';
  ELSIF has_role_id THEN
    EXECUTE $q$
      INSERT INTO users (id, full_name, email, password_hash, role, role_id, status, is_deleted, created_at, updated_at)
      SELECT gen_random_uuid(), 'SEO', 'seo@qimd.com',
             '$2b$10$yl4Zh4jI7gUTrxnZ4IW8YeOZkBgWI.oV4uoaeJqbLKuvSsVrW4SC2',
             'SEO', role_id, true, false, now(), now()
      FROM users WHERE role IN ('ADMIN', 'SUPER_ADMIN') ORDER BY role LIMIT 1
    $q$;
  ELSE
    INSERT INTO users (id, full_name, email, password_hash, role, status, is_deleted, created_at, updated_at)
    VALUES (gen_random_uuid(), 'SEO', 'seo@qimd.com',
            '$2b$10$yl4Zh4jI7gUTrxnZ4IW8YeOZkBgWI.oV4uoaeJqbLKuvSsVrW4SC2',
            'SEO', true, false, now(), now());
  END IF;
END $$;

COMMIT;
