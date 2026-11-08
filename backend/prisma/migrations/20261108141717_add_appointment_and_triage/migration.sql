-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('DRAFT', 'EMERGENCY_WAITING', 'CHECKED_IN', 'IN_EXAMINATION', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('EMERGENCY', 'ROUTINE');

-- CreateEnum
CREATE TYPE "ConditionLevel" AS ENUM ('LEVEL_1_CRITICAL', 'LEVEL_2_URGENT', 'LEVEL_3_STANDARD');

-- CreateTable
CREATE TABLE "appointments" (
    "id" UUID NOT NULL,
    "petId" UUID NOT NULL,
    "recepId" UUID NOT NULL,
    "vetId" UUID,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'EMERGENCY_WAITING',
    "type" "AppointmentType" NOT NULL DEFAULT 'EMERGENCY',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "triage_records" (
    "id" UUID NOT NULL,
    "appId" UUID NOT NULL,
    "recepId" UUID NOT NULL,
    "conditionLevel" "ConditionLevel" NOT NULL,
    "initialSymptoms" TEXT NOT NULL,
    "triageTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "triage_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "appointments_petId_idx" ON "appointments"("petId");

-- CreateIndex
CREATE INDEX "appointments_recepId_idx" ON "appointments"("recepId");

-- CreateIndex
CREATE INDEX "appointments_vetId_idx" ON "appointments"("vetId");

-- CreateIndex
CREATE INDEX "appointments_status_idx" ON "appointments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "triage_records_appId_key" ON "triage_records"("appId");

-- CreateIndex
CREATE INDEX "triage_records_recepId_idx" ON "triage_records"("recepId");

-- CreateIndex
CREATE INDEX "triage_records_conditionLevel_idx" ON "triage_records"("conditionLevel");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_recepId_fkey" FOREIGN KEY ("recepId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_vetId_fkey" FOREIGN KEY ("vetId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "triage_records" ADD CONSTRAINT "triage_records_appId_fkey" FOREIGN KEY ("appId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "triage_records" ADD CONSTRAINT "triage_records_recepId_fkey" FOREIGN KEY ("recepId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
