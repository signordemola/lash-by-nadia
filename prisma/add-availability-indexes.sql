-- Availability performance indexes
-- Safe to run multiple times (CREATE INDEX IF NOT EXISTS)

CREATE INDEX IF NOT EXISTS "Appointment_startsAt_idx"
  ON "Appointment" ("startsAt");

CREATE INDEX IF NOT EXISTS "Appointment_status_startsAt_idx"
  ON "Appointment" ("status", "startsAt");

CREATE INDEX IF NOT EXISTS "SlotHold_startsAt_idx"
  ON "SlotHold" ("startsAt");

CREATE INDEX IF NOT EXISTS "SlotHold_expiresAt_idx"
  ON "SlotHold" ("expiresAt");
