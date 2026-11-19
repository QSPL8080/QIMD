-- ============================================================================
-- QIMD — central Bin
-- Creates the table that records who moved an item to the Bin and when.
-- Safe to run more than once. Run it in Supabase → SQL Editor BEFORE
-- deploying the code that uses the Bin.
-- ============================================================================

CREATE TABLE IF NOT EXISTS trash_entries (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type      VARCHAR(50)  NOT NULL,
  entity_id        UUID         NOT NULL,
  deleted_by_id    UUID,
  deleted_by_name  VARCHAR(150),
  deleted_by_role  VARCHAR(50),
  deleted_at       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS trash_entries_entity_type_entity_id_key ON trash_entries (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS trash_entries_deleted_at_idx ON trash_entries (deleted_at);
