-- CreateEnum
CREATE TYPE "ShiftType" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING');

-- CreateEnum
CREATE TYPE "ShiftStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('SICK', 'PERSONAL', 'VACATION');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('UNPAID', 'PAID', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvoiceItemType" AS ENUM ('CONSULTATION', 'LAB', 'DRUG');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'VNPAY');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "roster_weeks" (
    "id" UUID NOT NULL,
    "weekStart" DATE NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "publishedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roster_weeks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_shifts" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "weekId" UUID,
    "date" DATE NOT NULL,
    "shiftType" "ShiftType" NOT NULL,
    "status" "ShiftStatus" NOT NULL DEFAULT 'SCHEDULED',
    "roomOrDesk" VARCHAR(50),
    "notes" TEXT,
    "createdBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "leaveType" "LeaveType" NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" UUID,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" UUID NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "category" VARCHAR(50),
    "unitPrice" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drugs" (
    "id" UUID NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "unit" VARCHAR(30) NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "stockQty" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drugs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_tests" (
    "id" UUID NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" UUID NOT NULL,
    "recordId" UUID NOT NULL,
    "vetId" UUID,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescription_items" (
    "id" UUID NOT NULL,
    "prescriptionId" UUID NOT NULL,
    "drugId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "dosage" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prescription_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_orders" (
    "id" UUID NOT NULL,
    "recordId" UUID NOT NULL,
    "vetId" UUID,
    "status" VARCHAR(30) NOT NULL DEFAULT 'ORDERED',
    "urgency" VARCHAR(20) NOT NULL DEFAULT 'ROUTINE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_order_items" (
    "id" UUID NOT NULL,
    "labOrderId" UUID NOT NULL,
    "labTestId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "resultText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lab_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" UUID NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "recordId" UUID NOT NULL,
    "petId" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "createdBy" UUID,
    "subtotal" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'UNPAID',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" UUID NOT NULL,
    "invoiceId" UUID NOT NULL,
    "type" "InvoiceItemType" NOT NULL,
    "refId" UUID,
    "description" VARCHAR(200) NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "invoiceId" UUID NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "txnRef" VARCHAR(64) NOT NULL,
    "amount" INTEGER NOT NULL,
    "receivedAmount" INTEGER,
    "changeAmount" INTEGER,
    "vnpTransactionNo" VARCHAR(50),
    "vnpResponseCode" VARCHAR(10),
    "collectedBy" UUID,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roster_weeks_weekStart_key" ON "roster_weeks"("weekStart");

-- CreateIndex
CREATE INDEX "roster_weeks_weekStart_idx" ON "roster_weeks"("weekStart");

-- CreateIndex
CREATE INDEX "work_shifts_date_idx" ON "work_shifts"("date");

-- CreateIndex
CREATE INDEX "work_shifts_shiftType_idx" ON "work_shifts"("shiftType");

-- CreateIndex
CREATE INDEX "work_shifts_userId_idx" ON "work_shifts"("userId");

-- CreateIndex
CREATE INDEX "work_shifts_weekId_idx" ON "work_shifts"("weekId");

-- CreateIndex
CREATE UNIQUE INDEX "work_shifts_userId_date_shiftType_key" ON "work_shifts"("userId", "date", "shiftType");

-- CreateIndex
CREATE INDEX "leave_requests_userId_idx" ON "leave_requests"("userId");

-- CreateIndex
CREATE INDEX "leave_requests_status_idx" ON "leave_requests"("status");

-- CreateIndex
CREATE INDEX "leave_requests_startDate_endDate_idx" ON "leave_requests"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "services_code_key" ON "services"("code");

-- CreateIndex
CREATE INDEX "services_isActive_idx" ON "services"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "drugs_code_key" ON "drugs"("code");

-- CreateIndex
CREATE INDEX "drugs_isActive_idx" ON "drugs"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "lab_tests_code_key" ON "lab_tests"("code");

-- CreateIndex
CREATE INDEX "lab_tests_isActive_idx" ON "lab_tests"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "prescriptions_recordId_key" ON "prescriptions"("recordId");

-- CreateIndex
CREATE INDEX "prescription_items_prescriptionId_idx" ON "prescription_items"("prescriptionId");

-- CreateIndex
CREATE INDEX "prescription_items_drugId_idx" ON "prescription_items"("drugId");

-- CreateIndex
CREATE INDEX "lab_orders_recordId_idx" ON "lab_orders"("recordId");

-- CreateIndex
CREATE INDEX "lab_order_items_labOrderId_idx" ON "lab_order_items"("labOrderId");

-- CreateIndex
CREATE INDEX "lab_order_items_labTestId_idx" ON "lab_order_items"("labTestId");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_code_key" ON "invoices"("code");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_recordId_key" ON "invoices"("recordId");

-- CreateIndex
CREATE INDEX "invoices_status_idx" ON "invoices"("status");

-- CreateIndex
CREATE INDEX "invoices_ownerId_idx" ON "invoices"("ownerId");

-- CreateIndex
CREATE INDEX "invoices_petId_idx" ON "invoices"("petId");

-- CreateIndex
CREATE INDEX "invoices_createdAt_idx" ON "invoices"("createdAt");

-- CreateIndex
CREATE INDEX "invoice_items_invoiceId_idx" ON "invoice_items"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_txnRef_key" ON "payments"("txnRef");

-- CreateIndex
CREATE INDEX "payments_invoiceId_idx" ON "payments"("invoiceId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- AddForeignKey
ALTER TABLE "roster_weeks" ADD CONSTRAINT "roster_weeks_publishedBy_fkey" FOREIGN KEY ("publishedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_shifts" ADD CONSTRAINT "work_shifts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_shifts" ADD CONSTRAINT "work_shifts_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_shifts" ADD CONSTRAINT "work_shifts_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "roster_weeks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "medical_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "prescriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "drugs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "medical_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_order_items" ADD CONSTRAINT "lab_order_items_labOrderId_fkey" FOREIGN KEY ("labOrderId") REFERENCES "lab_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_order_items" ADD CONSTRAINT "lab_order_items_labTestId_fkey" FOREIGN KEY ("labTestId") REFERENCES "lab_tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "medical_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_collectedBy_fkey" FOREIGN KEY ("collectedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

