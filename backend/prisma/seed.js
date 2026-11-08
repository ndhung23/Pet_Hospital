const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Seeding initial database records...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Clinic Manager
  const managerUser = await prisma.user.upsert({
    where: { userName: 'manager' },
    update: {},
    create: {
      userName: 'manager',
      email: 'manager@phms.local',
      fullName: 'Dr. Sarah Connor (Clinic Manager)',
      phone: '0901234567',
      passwordHash,
      role: 'CLINIC_MANAGER',
      isActive: true,
      employee: {
        create: {
          empCode: 'EMP-MGR-001',
          department: 'Executive Administration',
          salary: 35000000,
        },
      },
    },
  });

  // 2. Receptionist
  await prisma.user.upsert({
    where: { userName: 'receptionist1' },
    update: {},
    create: {
      userName: 'receptionist1',
      email: 'receptionist@phms.local',
      fullName: 'Emily Clark (Front Desk)',
      phone: '0901234568',
      passwordHash,
      role: 'RECEPTIONIST',
      isActive: true,
      employee: {
        create: {
          empCode: 'EMP-REC-001',
          department: 'Customer Service & Triage',
          salary: 12000000,
        },
      },
    },
  });

  // 3. Veterinarian
  await prisma.user.upsert({
    where: { userName: 'vet1' },
    update: {},
    create: {
      userName: 'vet1',
      email: 'vet@phms.local',
      fullName: 'Dr. John Watson (Senior Vet)',
      phone: '0901234569',
      passwordHash,
      role: 'VETERINARIAN',
      isActive: true,
      employee: {
        create: {
          empCode: 'EMP-VET-001',
          department: 'Clinical Medicine',
          salary: 28000000,
        },
      },
    },
  });

  // 4. Nurse
  await prisma.user.upsert({
    where: { userName: 'nurse1' },
    update: {},
    create: {
      userName: 'nurse1',
      email: 'nurse@phms.local',
      fullName: 'David Miller (Vet Technician)',
      phone: '0901234570',
      passwordHash,
      role: 'NURSE',
      isActive: true,
      employee: {
        create: {
          empCode: 'EMP-NUR-001',
          department: 'Inpatient & Lab Care',
          salary: 14000000,
        },
      },
    },
  });

  // 5. Sample Pet Owner with Pet and Medical Record
  const ownerUser = await prisma.user.upsert({
    where: { userName: 'petowner1' },
    update: {},
    create: {
      userName: 'petowner1',
      email: 'petowner1@phms.local',
      fullName: 'Alice Johnson',
      phone: '0912345678',
      passwordHash,
      role: 'PET_OWNER',
      isActive: true,
      petOwner: {
        create: {
          address: '123 Nguyen Hue Blvd, District 1, HCMC',
          pets: {
            create: [
              {
                name: 'Lucky',
                species: 'Dog',
                breed: 'Golden Retriever',
                gender: 'Male',
                weight: 28.5,
                history: 'Allergic to specific penicillin antibiotic; completed rabies vaccination in Jan 2026',
                medicalRecords: {
                  create: [
                    {
                      diagnosis: 'Acute Gastroenteritis (Mild dehydration)',
                      treatmentPlan: 'Hydration fluid 500ml, Probiotic paste, special gastrointestinal canned diet for 5 days',
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  });

  console.log('[Seed] Database seeded successfully with default roles and test accounts:');
  console.log(' - Manager: manager / Password123!');
  console.log(' - Receptionist: receptionist1 / Password123!');
  console.log(' - Vet: vet1 / Password123!');
  console.log(' - Nurse: nurse1 / Password123!');
  console.log(' - Pet Owner: petowner1 / Password123! (Pet: Lucky)');
}

main()
  .catch((e) => {
    console.error('[Seed] Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
