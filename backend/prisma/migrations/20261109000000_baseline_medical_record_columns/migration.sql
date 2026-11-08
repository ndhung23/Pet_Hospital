-- Baseline migration: reconcile migration history with the live database.
--
-- The columns below were added to `medical_records` outside of Prisma Migrate
-- (schema editor / db push), so the migration history did not describe the real
-- table. This migration records them. Every statement is idempotent so it is
-- safe to run against a database that already has them, and it correctly
-- creates them on a fresh database.

-- AlterTable
ALTER TABLE "medical_records" ADD COLUMN IF NOT EXISTS "appId" UUID;
ALTER TABLE "medical_records" ADD COLUMN IF NOT EXISTS "clinicalFindings" TEXT;
ALTER TABLE "medical_records" ADD COLUMN IF NOT EXISTS "heartRate" INTEGER;
ALTER TABLE "medical_records" ADD COLUMN IF NOT EXISTS "isLocked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "medical_records" ADD COLUMN IF NOT EXISTS "lockedAt" TIMESTAMP(3);
ALTER TABLE "medical_records" ADD COLUMN IF NOT EXISTS "temperature" DOUBLE PRECISION;
ALTER TABLE "medical_records" ADD COLUMN IF NOT EXISTS "vetId" UUID;
ALTER TABLE "medical_records" ADD COLUMN IF NOT EXISTS "weight" DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "medical_records_appId_key" ON "medical_records"("appId");
CREATE INDEX IF NOT EXISTS "medical_records_appId_idx" ON "medical_records"("appId");
CREATE INDEX IF NOT EXISTS "medical_records_vetId_idx" ON "medical_records"("vetId");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'medical_records_appId_fkey'
  ) THEN
    ALTER TABLE "medical_records"
      ADD CONSTRAINT "medical_records_appId_fkey"
      FOREIGN KEY ("appId") REFERENCES "appointments"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'medical_records_vetId_fkey'
  ) THEN
    ALTER TABLE "medical_records"
      ADD CONSTRAINT "medical_records_vetId_fkey"
      FOREIGN KEY ("vetId") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
