-- ============================================================================
-- QIMD — Super Admin notifications
-- Creates the table that holds notifications such as "a user changed their
-- password". Safe to run more than once. Run it in Supabase → SQL Editor.
-- (The site keeps working if it hasn't been run yet; notifications just won't
-- be saved until it is.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type         VARCHAR(50)  NOT NULL,
  title        VARCHAR(255) NOT NULL,
  actor_id     UUID,
  actor_name   VARCHAR(150),
  actor_email  VARCHAR(255),
  actor_role   VARCHAR(50),
  is_read      BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS admin_notifications_is_read_created_at_idx ON admin_notifications (is_read, created_at);
