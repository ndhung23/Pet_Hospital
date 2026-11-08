/**
 * Seed the billing catalogue (UC-BILL-01) with the clinic's price list.
 *
 * Idempotent: every row is upserted by `code`, so re-running never duplicates.
 * Run with: npm run seed:billing
 */
const prisma = require('../src/config/prisma');

const SERVICES = [
  { code: 'SRV-CONS-GEN', name: 'General Consultation', category: 'CONSULTATION', unitPrice: 200000 },
  { code: 'SRV-CONS-EMG', name: 'Emergency Consultation', category: 'CONSULTATION', unitPrice: 350000 },
  { code: 'SRV-CONS-VAC', name: 'Vaccination Visit', category: 'CONSULTATION', unitPrice: 150000 },
  { code: 'SRV-GROOM-BAS', name: 'Basic Grooming', category: 'GROOMING', unitPrice: 180000 },
  { code: 'SRV-BOARD-DAY', name: 'Boarding (per day)', category: 'BOARDING', unitPrice: 250000 },
];

const DRUGS = [
  { code: 'DRG-AMOX-250', name: 'Amoxicillin 250mg', unit: 'tablet', unitPrice: 5000, stockQty: 500 },
  { code: 'DRG-METRO-250', name: 'Metronidazole 250mg', unit: 'tablet', unitPrice: 4000, stockQty: 400 },
  { code: 'DRG-PRED-5', name: 'Prednisolone 5mg', unit: 'tablet', unitPrice: 3000, stockQty: 300 },
  { code: 'DRG-OMEP-20', name: 'Omeprazole 20mg', unit: 'capsule', unitPrice: 6000, stockQty: 250 },
  { code: 'DRG-RINGER-500', name: 'Ringer Lactate 500ml', unit: 'bag', unitPrice: 45000, stockQty: 120 },
  { code: 'DRG-IVER-1', name: 'Ivermectin 1%', unit: 'vial', unitPrice: 65000, stockQty: 80 },
  { code: 'DRG-MELOX-0.5', name: 'Meloxicam 0.5mg/ml', unit: 'vial', unitPrice: 85000, stockQty: 60 },
];

const LAB_TESTS = [
  { code: 'LAB-CBC', name: 'Complete Blood Count', unitPrice: 180000 },
  { code: 'LAB-BIOCHEM', name: 'Biochemistry Panel (8 params)', unitPrice: 420000 },
  { code: 'LAB-URINE', name: 'Urinalysis', unitPrice: 120000 },
  { code: 'LAB-XRAY', name: 'X-Ray (single view)', unitPrice: 350000 },
  { code: 'LAB-USOUND', name: 'Abdominal Ultrasound', unitPrice: 500000 },
  { code: 'LAB-PARA', name: 'Parvovirus Rapid Test', unitPrice: 220000 },
  { code: 'LAB-FELV', name: 'FIV/FeLV Combo Test', unitPrice: 280000 },
];

const main = async () => {
  console.log('Seeding billing catalogue...');

  for (const service of SERVICES) {
    await prisma.service.upsert({
      where: { code: service.code },
      update: { name: service.name, category: service.category, unitPrice: service.unitPrice },
      create: service,
    });
  }
  console.log(`  services: ${SERVICES.length}`);

  for (const drug of DRUGS) {
    await prisma.drug.upsert({
      where: { code: drug.code },
      update: { name: drug.name, unit: drug.unit, unitPrice: drug.unitPrice },
      create: drug,
    });
  }
  console.log(`  drugs: ${DRUGS.length}`);

  for (const test of LAB_TESTS) {
    await prisma.labTest.upsert({
      where: { code: test.code },
      update: { name: test.name, unitPrice: test.unitPrice },
      create: test,
    });
  }
  console.log(`  lab tests: ${LAB_TESTS.length}`);

  console.log('Billing catalogue seeded.');
};

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
