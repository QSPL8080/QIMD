-- ============================================================================
-- QIMD — Institute Management CRM setup (roles, leads, admissions, fees,
-- receipts, reminders, expenses, files, settings, audit log)
-- Run this ONCE in Supabase → SQL Editor BEFORE deploying the CRM code.
-- Safe to run more than once (everything uses IF NOT EXISTS / ON CONFLICT).
-- Includes create_admin_notifications.sql, so that file is no longer needed.
-- ============================================================================

-- ── 0. Earlier CRM tables (24 Nov build) are kept under *_v1 names ─────────
-- Their rows are copied into the new tables in step 9. Nothing is deleted.
DO $$
DECLARE r record; t text; newname text;
BEGIN
  FOREACH t IN ARRAY ARRAY['admissions:admission_number', 'expenses:expense_number', 'lead_follow_ups:enquiry_id'] LOOP
    newname := split_part(t, ':', 1) || '_v1';
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public'
               AND table_name = split_part(t, ':', 1) AND column_name = split_part(t, ':', 2))
       AND to_regclass('public.' || newname) IS NULL THEN
      EXECUTE format('ALTER TABLE %I RENAME TO %I', split_part(t, ':', 1), newname);
      -- rename its indexes/constraints too, so the new table can reuse the names
      FOR r IN SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND tablename = newname LOOP
        EXECUTE format('ALTER INDEX %I RENAME TO %I', r.indexname, r.indexname || '_v1');
      END LOOP;
      FOR r IN SELECT conname FROM pg_constraint WHERE conrelid = ('public.' || newname)::regclass AND contype = 'f' LOOP
        EXECUTE format('ALTER TABLE %I RENAME CONSTRAINT %I TO %I', newname, r.conname, r.conname || '_v1');
      END LOOP;
    END IF;
  END LOOP;
END $$;

-- ── 1. Users: login security, Viewer module access, password reset ─────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_count     INTEGER      NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until           TIMESTAMP(3);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_failed_login      TIMESTAMP(3);
ALTER TABLE users ADD COLUMN IF NOT EXISTS module_access          TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_hash    VARCHAR(128);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP(3);
ALTER TABLE users ADD COLUMN IF NOT EXISTS username               VARCHAR(60);
CREATE UNIQUE INDEX IF NOT EXISTS users_username_key ON users (username);

-- "Lead Manager" is now called "Sales Manager"
UPDATE users SET role = 'SALES_MANAGER' WHERE role = 'LEAD_MANAGER';

-- ── 2. Notifications (per user) ─────────────────────────────────────────────
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
ALTER TABLE admin_notifications ADD COLUMN IF NOT EXISTS recipient_id UUID;
ALTER TABLE admin_notifications ADD COLUMN IF NOT EXISTS link VARCHAR(500);
CREATE INDEX IF NOT EXISTS admin_notifications_is_read_created_at_idx ON admin_notifications (is_read, created_at);
CREATE INDEX IF NOT EXISTS admin_notifications_recipient_id_is_read_idx ON admin_notifications (recipient_id, is_read);

-- ── 3. Leads ────────────────────────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS lead_code_seq START 1;

CREATE TABLE IF NOT EXISTS leads (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_code          VARCHAR(20)  NOT NULL DEFAULT ('LD-' || lpad(nextval('lead_code_seq')::text, 6, '0')),
  source             VARCHAR(20)  NOT NULL DEFAULT 'WEBSITE',
  enquiry_type       VARCHAR(20)  NOT NULL DEFAULT 'ADMISSION',
  full_name          VARCHAR(150) NOT NULL,
  phone              VARCHAR(30),
  phone_normalized   VARCHAR(20),
  email              VARCHAR(255),
  course             VARCHAR(200),
  city               VARCHAR(120),
  qualification      VARCHAR(150),
  subject            VARCHAR(255),
  message            TEXT,
  status             VARCHAR(30)  NOT NULL DEFAULT 'NEW',
  status_reason      VARCHAR(255),
  assigned_to_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_at        TIMESTAMP(3),
  next_follow_up_at  TIMESTAMP(3),
  last_contacted_at  TIMESTAMP(3),
  duplicate_of_id    UUID,
  campaign           VARCHAR(255),
  ad_id              VARCHAR(100),
  form_id            VARCHAR(100),
  source_ref         VARCHAR(150),
  raw_payload        JSONB,
  created_by_id      UUID,
  created_by_name    VARCHAR(150),
  updated_by_id      UUID,
  updated_by_name    VARCHAR(150),
  is_deleted         BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS leads_lead_code_key ON leads (lead_code);
CREATE UNIQUE INDEX IF NOT EXISTS leads_source_ref_key ON leads (source_ref);
CREATE INDEX IF NOT EXISTS leads_assigned_to_id_is_deleted_idx ON leads (assigned_to_id, is_deleted);
CREATE INDEX IF NOT EXISTS leads_status_is_deleted_idx ON leads (status, is_deleted);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at);
CREATE INDEX IF NOT EXISTS leads_phone_normalized_idx ON leads (phone_normalized);
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads (email);

CREATE TABLE IF NOT EXISTS lead_assignments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id           UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  from_user_id      UUID,
  from_user_name    VARCHAR(150),
  to_user_id        UUID,
  to_user_name      VARCHAR(150),
  assigned_by_id    UUID,
  assigned_by_name  VARCHAR(150),
  created_at        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS lead_assignments_lead_id_created_at_idx ON lead_assignments (lead_id, created_at);

CREATE TABLE IF NOT EXISTS lead_follow_ups (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id            UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  followed_at        TIMESTAMP(3) NOT NULL,
  remarks            TEXT NOT NULL,
  status_after       VARCHAR(30),
  next_follow_up_at  TIMESTAMP(3),
  created_by_id      UUID,
  created_by_name    VARCHAR(150),
  created_at         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS lead_follow_ups_lead_id_created_at_idx ON lead_follow_ups (lead_id, created_at);

-- ── 4. Audit log ────────────────────────────────────────────────────────────
-- An older audit_logs table (with a user_id column) is kept as audit_logs_legacy.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'user_id')
     AND to_regclass('public.audit_logs_legacy') IS NULL THEN
    ALTER TABLE audit_logs RENAME TO audit_logs_legacy;
  END IF;
END $$;
CREATE TABLE IF NOT EXISTS audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id     UUID,
  actor_name   VARCHAR(150),
  actor_role   VARCHAR(50),
  action       VARCHAR(60) NOT NULL,
  entity_type  VARCHAR(50),
  entity_id    VARCHAR(100),
  summary      VARCHAR(500),
  before       JSONB,
  after        JSONB,
  ip           VARCHAR(64),
  created_at   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs (created_at);
CREATE INDEX IF NOT EXISTS audit_logs_entity_type_entity_id_idx ON audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS audit_logs_actor_id_idx ON audit_logs (actor_id);

-- ── 5. Settings ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS app_settings (
  key              VARCHAR(100) PRIMARY KEY,
  value            JSONB        NOT NULL,
  updated_by_id    UUID,
  updated_by_name  VARCHAR(150),
  updated_at       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── 6. Admissions, fee schedule, payments, reminders ────────────────────────
CREATE SEQUENCE IF NOT EXISTS admission_code_seq START 1;
CREATE SEQUENCE IF NOT EXISTS payment_code_seq   START 1;
CREATE SEQUENCE IF NOT EXISTS receipt_no_seq     START 1;
CREATE SEQUENCE IF NOT EXISTS expense_code_seq   START 1;

CREATE TABLE IF NOT EXISTS admissions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_code          VARCHAR(20)  NOT NULL DEFAULT ('ADM-' || lpad(nextval('admission_code_seq')::text, 6, '0')),
  lead_id                 UUID REFERENCES leads(id) ON DELETE SET NULL,
  counsellor_id           UUID REFERENCES users(id) ON DELETE SET NULL,
  counsellor_name         VARCHAR(150),
  status                  VARCHAR(30)  NOT NULL DEFAULT 'VERIFICATION_PENDING',
  status_reason           VARCHAR(255),
  course_name             VARCHAR(200) NOT NULL,
  course_duration_months  INTEGER,
  batch_timing            VARCHAR(120),
  practical_batch_timing  VARCHAR(120),
  admission_date          DATE         NOT NULL,
  expected_completion     DATE,
  student_name            VARCHAR(150) NOT NULL,
  guardian_name           VARCHAR(150),
  gender                  VARCHAR(20),
  date_of_birth           DATE,
  mobile                  VARCHAR(30)  NOT NULL,
  mobile_normalized       VARCHAR(20),
  whatsapp                VARCHAR(30),
  email                   VARCHAR(255),
  current_address         TEXT,
  permanent_address       TEXT,
  highest_qualification   VARCHAR(60),
  qualification_other     VARCHAR(150),
  college_school          VARCHAR(200),
  year_of_passing         VARCHAR(10),
  current_status          VARCHAR(60),
  college_company         VARCHAR(200),
  total_fee               DECIMAL(12,2) NOT NULL,
  registration_fee        DECIMAL(12,2),
  fee_note                TEXT,
  documents_submitted     JSONB,
  emergency_name          VARCHAR(150),
  emergency_relation      VARCHAR(80),
  emergency_mobile        VARCHAR(30),
  declaration_accepted    BOOLEAN      NOT NULL DEFAULT FALSE,
  verified_by_id          UUID,
  verified_by_name        VARCHAR(150),
  verified_at             TIMESTAMP(3),
  created_by_id           UUID,
  created_by_name         VARCHAR(150),
  updated_by_id           UUID,
  updated_by_name         VARCHAR(150),
  is_deleted              BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS admissions_admission_code_key ON admissions (admission_code);
CREATE INDEX IF NOT EXISTS admissions_status_is_deleted_idx ON admissions (status, is_deleted);
CREATE INDEX IF NOT EXISTS admissions_admission_date_idx ON admissions (admission_date);
CREATE INDEX IF NOT EXISTS admissions_mobile_normalized_idx ON admissions (mobile_normalized);
CREATE INDEX IF NOT EXISTS admissions_counsellor_id_idx ON admissions (counsellor_id);

CREATE TABLE IF NOT EXISTS fee_installments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_id  UUID NOT NULL REFERENCES admissions(id) ON DELETE CASCADE,
  label         VARCHAR(100)  NOT NULL,
  due_date      DATE          NOT NULL,
  amount        DECIMAL(12,2) NOT NULL,
  sort_order    INTEGER       NOT NULL DEFAULT 0,
  created_at    TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS fee_installments_admission_id_idx ON fee_installments (admission_id);
CREATE INDEX IF NOT EXISTS fee_installments_due_date_idx ON fee_installments (due_date);

CREATE TABLE IF NOT EXISTS payments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_code          VARCHAR(20)  NOT NULL DEFAULT ('PAY-' || lpad(nextval('payment_code_seq')::text, 6, '0')),
  receipt_no            VARCHAR(20),
  receipt_token         VARCHAR(64),
  admission_id          UUID NOT NULL REFERENCES admissions(id) ON DELETE RESTRICT,
  kind                  VARCHAR(20)   NOT NULL DEFAULT 'PAYMENT',
  status                VARCHAR(20)   NOT NULL DEFAULT 'SUCCESSFUL',
  amount                DECIMAL(12,2) NOT NULL,
  paid_at               TIMESTAMP(3)  NOT NULL,
  mode                  VARCHAR(30)   NOT NULL,
  loan_bank             VARCHAR(150),
  reference             VARCHAR(150),
  notes                 TEXT,
  related_payment_id    UUID,
  source                VARCHAR(20)   NOT NULL DEFAULT 'MANUAL',
  gateway_txn_id        VARCHAR(150),
  receipt_email_status  VARCHAR(20),
  receipt_email_error   VARCHAR(500),
  receipt_emailed_at    TIMESTAMP(3),
  recorded_by_id        UUID,
  recorded_by_name      VARCHAR(150),
  created_at            TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS payments_payment_code_key ON payments (payment_code);
CREATE UNIQUE INDEX IF NOT EXISTS payments_receipt_no_key ON payments (receipt_no);
CREATE UNIQUE INDEX IF NOT EXISTS payments_receipt_token_key ON payments (receipt_token);
CREATE UNIQUE INDEX IF NOT EXISTS payments_gateway_txn_id_key ON payments (gateway_txn_id);
CREATE INDEX IF NOT EXISTS payments_admission_id_created_at_idx ON payments (admission_id, created_at);
CREATE INDEX IF NOT EXISTS payments_paid_at_idx ON payments (paid_at);
CREATE INDEX IF NOT EXISTS payments_status_kind_idx ON payments (status, kind);

CREATE TABLE IF NOT EXISTS reminder_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_id    UUID NOT NULL REFERENCES admissions(id) ON DELETE CASCADE,
  installment_id  UUID,
  audience        VARCHAR(20)  NOT NULL,
  stage           VARCHAR(20)  NOT NULL,
  channel         VARCHAR(20)  NOT NULL,
  due_date        DATE,
  amount          DECIMAL(12,2),
  unique_key      VARCHAR(255) NOT NULL,
  status          VARCHAR(20)  NOT NULL,
  error           VARCHAR(500),
  sent_by_id      UUID,
  sent_by_name    VARCHAR(150),
  created_at      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS reminder_logs_unique_key_key ON reminder_logs (unique_key);
CREATE INDEX IF NOT EXISTS reminder_logs_admission_id_created_at_idx ON reminder_logs (admission_id, created_at);

-- ── 7. Expenses and private files ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_code        VARCHAR(20)   NOT NULL DEFAULT ('EXP-' || lpad(nextval('expense_code_seq')::text, 6, '0')),
  expense_at          TIMESTAMP(3)  NOT NULL,
  category            VARCHAR(100),
  description         VARCHAR(500)  NOT NULL,
  amount              DECIMAL(12,2) NOT NULL,
  payment_mode        VARCHAR(30)   NOT NULL,
  reference           VARCHAR(150),
  attachment_file_id  UUID,
  created_by_id       UUID,
  created_by_name     VARCHAR(150),
  updated_by_id       UUID,
  updated_by_name     VARCHAR(150),
  is_deleted          BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS expenses_expense_code_key ON expenses (expense_code);
CREATE INDEX IF NOT EXISTS expenses_expense_at_is_deleted_idx ON expenses (expense_at, is_deleted);

CREATE TABLE IF NOT EXISTS stored_files (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type        VARCHAR(30)  NOT NULL,
  owner_id          UUID,
  label             VARCHAR(120),
  original_name     VARCHAR(255) NOT NULL,
  mime_type         VARCHAR(100) NOT NULL,
  size              INTEGER      NOT NULL,
  data              BYTEA        NOT NULL,
  uploaded_by_id    UUID,
  uploaded_by_name  VARCHAR(150),
  is_deleted        BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS stored_files_owner_type_owner_id_idx ON stored_files (owner_type, owner_id);

-- ── 8. Copy existing website enquiries into Leads (kept in date order) ─────
-- Old status "Closed" becomes "Contacted" (with a note), because it did not
-- say whether the student joined; update those leads after review.
INSERT INTO leads (source, enquiry_type, full_name, phone, phone_normalized, email, course, city, qualification,
                   message, status, status_reason, assigned_to_id, source_ref, is_deleted, created_at, updated_at)
SELECT 'WEBSITE', 'ADMISSION', a.student_name, a.phone,
       NULLIF(right(regexp_replace(COALESCE(a.phone, ''), '\D', '', 'g'), 10), ''),
       a.email,
       substring(a.message from 'Program: ([^\n]+)'),
       a.city, a.qualification, a.message,
       CASE a.status::text WHEN 'CLOSED' THEN 'CONTACTED' WHEN 'FOLLOW_UP_REQUIRED' THEN 'FOLLOW_UP' WHEN 'INVALID_DUPLICATE' THEN 'INVALID'
         WHEN 'PENDING' THEN 'NEW' ELSE a.status::text END,
       CASE WHEN a.status::text = 'CLOSED' THEN 'Imported: was marked Closed' END,
       a.assigned_to, 'admission:' || a.id::text, a.is_deleted, a.created_at, a.updated_at
FROM admission_enquiries a
ORDER BY a.created_at
ON CONFLICT (source_ref) DO NOTHING;

INSERT INTO leads (source, enquiry_type, full_name, phone, phone_normalized, email, subject, message,
                   status, status_reason, assigned_to_id, source_ref, is_deleted, created_at, updated_at)
SELECT 'WEBSITE', 'CONTACT', c.full_name, c.phone,
       NULLIF(right(regexp_replace(COALESCE(c.phone, ''), '\D', '', 'g'), 10), ''),
       c.email, c.subject, c.message,
       CASE c.status::text WHEN 'CLOSED' THEN 'CONTACTED' WHEN 'FOLLOW_UP_REQUIRED' THEN 'FOLLOW_UP' WHEN 'INVALID_DUPLICATE' THEN 'INVALID'
         WHEN 'PENDING' THEN 'NEW' ELSE c.status::text END,
       CASE WHEN c.status::text = 'CLOSED' THEN 'Imported: was marked Closed' END,
       c.assigned_to, 'contact:' || c.id::text, c.is_deleted, c.created_at, c.updated_at
FROM contact_enquiries c
ORDER BY c.created_at
ON CONFLICT (source_ref) DO NOTHING;

-- Imported leads that sat in the Bin stay in the Bin
INSERT INTO trash_entries (entity_type, entity_id, deleted_by_name, deleted_at)
SELECT 'lead', l.id, 'Imported', l.updated_at FROM leads l
WHERE l.is_deleted = TRUE
ON CONFLICT (entity_type, entity_id) DO NOTHING;

-- ── 9. Copy data from the earlier CRM tables (*_v1), if they exist ─────────
DO $$
BEGIN
  IF to_regclass('public.lead_follow_ups_v1') IS NOT NULL THEN
    INSERT INTO lead_follow_ups (id, lead_id, followed_at, remarks, status_after, next_follow_up_at, created_by_id, created_by_name, created_at)
    SELECT f.id, l.id, COALESCE(f.follow_up_date, f.created_at), f.remarks,
           CASE f.status WHEN 'FOLLOW_UP_REQUIRED' THEN 'FOLLOW_UP' WHEN 'INVALID_DUPLICATE' THEN 'INVALID' WHEN 'CLOSED' THEN 'CONTACTED' ELSE f.status END,
           f.next_follow_up_date, f.created_by_id, f.created_by_name, f.created_at
    FROM lead_follow_ups_v1 f
    JOIN leads l ON l.source_ref = f.enquiry_type || ':' || f.enquiry_id::text
    ON CONFLICT (id) DO NOTHING;

    UPDATE leads l SET next_follow_up_at = x.nxt, last_contacted_at = COALESCE(l.last_contacted_at, x.last)
    FROM (SELECT lead_id, max(next_follow_up_at) AS nxt, max(followed_at) AS last FROM lead_follow_ups GROUP BY lead_id) x
    WHERE x.lead_id = l.id AND l.next_follow_up_at IS NULL;
  END IF;

  IF to_regclass('public.lead_assignment_histories') IS NOT NULL THEN
    INSERT INTO lead_assignments (id, lead_id, from_user_id, from_user_name, to_user_id, to_user_name, assigned_by_id, assigned_by_name, created_at)
    SELECT h.id, l.id, h.from_user_id, h.from_user_name, h.to_user_id, h.to_user_name, h.assigned_by_id, h.assigned_by_name, h.created_at
    FROM lead_assignment_histories h
    JOIN leads l ON l.source_ref = h.enquiry_type || ':' || h.enquiry_id::text
    ON CONFLICT (id) DO NOTHING;
  END IF;

  IF to_regclass('public.admissions_v1') IS NOT NULL THEN
    INSERT INTO admissions (id, lead_id, counsellor_id, counsellor_name, status, course_name, batch_timing, admission_date,
                            student_name, mobile, mobile_normalized, email, highest_qualification, total_fee, fee_note,
                            declaration_accepted, verified_by_id, verified_at, is_deleted, created_at, updated_at, created_by_name)
    SELECT a.id, l.id, a.counsellor_id, u.full_name,
           CASE a.status::text WHEN 'VERIFIED_ACTIVE' THEN 'ACTIVE' WHEN 'CANCELLED' THEN 'CANCELLED' ELSE 'VERIFICATION_PENDING' END,
           a.course_name, a.batch_timing, (a.admission_date AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::date,
           a.student_name, a.phone, NULLIF(right(regexp_replace(COALESCE(a.phone, ''), '\D', '', 'g'), 10), ''),
           a.email, a.qualification, 0,
           trim(both ' ' from 'Imported from the earlier CRM — enter the course fee. ' || COALESCE(a.remarks, '')),
           TRUE, a.verified_by_id, a.verified_at, a.is_deleted, a.created_at, a.updated_at, 'Imported'
    FROM admissions_v1 a
    LEFT JOIN leads l ON l.source_ref = 'admission:' || a.lead_id::text
    LEFT JOIN users u ON u.id = a.counsellor_id
    ON CONFLICT (id) DO NOTHING;
  END IF;

  IF to_regclass('public.expenses_v1') IS NOT NULL THEN
    INSERT INTO expenses (id, expense_at, category, description, amount, payment_mode, created_by_id, created_by_name, is_deleted, created_at, updated_at)
    SELECT e.id, e.expense_date, e.category,
           left(e.title || COALESCE(' — ' || NULLIF(e.description, ''), '') || COALESCE(' (bill: ' || NULLIF(e.receipt_url, '') || ')', ''), 500),
           e.amount, CASE upper(regexp_replace(COALESCE(NULLIF(trim(e.payment_mode), ''), 'CASH'), '[^A-Za-z]+', '_', 'g'))
             WHEN 'CASH' THEN 'CASH' WHEN 'UPI' THEN 'UPI' WHEN 'BANK_TRANSFER' THEN 'BANK_TRANSFER' WHEN 'NEFT' THEN 'BANK_TRANSFER'
             WHEN 'CHEQUE' THEN 'CHEQUE' WHEN 'CARD' THEN 'CARD' WHEN 'DEBIT_CREDIT_CARD' THEN 'CARD' ELSE 'OTHER' END, e.created_by_id, e.created_by_name, e.is_deleted, e.created_at, e.updated_at
    FROM expenses_v1 e
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
