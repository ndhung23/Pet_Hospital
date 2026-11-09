-- AlterTable: add vital signs, status, and attending vet to medical_records
ALTER TABLE "medical_records" 
ADD COLUMN "vetId" UUID,
ADD COLUMN "weight" DOUBLE PRECISION,
ADD COLUMN "temperature" DOUBLE PRECISION,
ADD COLUMN "heartRate" INTEGER,
ADD COLUMN "symptoms" TEXT,
ADD COLUMN "status" VARCHAR(50) NOT NULL DEFAULT 'COMPLETED';

-- CreateTable: lab_orders (UC-LAB-01, UC-LAB-02)
CREATE TABLE "lab_orders" (
    "id" UUID NOT NULL,
    "orderCode" VARCHAR(50) NOT NULL,
    "recordId" UUID NOT NULL,
    "petId" UUID NOT NULL,
    "vetId" UUID,
    "nurseId" UUID,
    "testType" VARCHAR(100) NOT NULL,
    "urgency" VARCHAR(20) NOT NULL DEFAULT 'ROUTINE',
    "requestNote" TEXT,
    "status" VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    "resultValues" JSONB,
    "resultSummary" TEXT,
    "resultImageUrl" TEXT,
    "sampleTakenAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable: prescriptions (UC-PRES-01 / EMR-01)
CREATE TABLE "prescriptions" (
    "id" UUID NOT NULL,
    "recordId" UUID NOT NULL,
    "medicineName" VARCHAR(150) NOT NULL,
    "dosage" VARCHAR(100) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit" VARCHAR(50),
    "duration" VARCHAR(50),
    "instructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE UNIQUE INDEX "lab_orders_orderCode_key" ON "lab_orders"("orderCode");
CREATE INDEX "lab_orders_recordId_idx" ON "lab_orders"("recordId");
CREATE INDEX "lab_orders_petId_idx" ON "lab_orders"("petId");
CREATE INDEX "lab_orders_status_urgency_idx" ON "lab_orders"("status", "urgency");

CREATE INDEX "medical_records_vetId_idx" ON "medical_records"("vetId");
CREATE INDEX "prescriptions_recordId_idx" ON "prescriptions"("recordId");

-- AddForeignKeys
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_vetId_fkey" FOREIGN KEY ("vetId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "medical_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_vetId_fkey" FOREIGN KEY ("vetId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "medical_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

