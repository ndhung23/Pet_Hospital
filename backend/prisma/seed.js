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

  // 3. Veterinarians (vet1 & vet2)
  const vet1User = await prisma.user.upsert({
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

  const vet2User = await prisma.user.upsert({
    where: { userName: 'vet2' },
    update: {},
    create: {
      userName: 'vet2',
      email: 'vet2@phms.local',
      fullName: 'Dr. Nguyen Thi Mai (Dentistry & Surgery)',
      phone: '0901234571',
      passwordHash,
      role: 'VETERINARIAN',
      isActive: true,
      employee: {
        create: {
          empCode: 'EMP-VET-002',
          department: 'Surgical & Dental Care',
          salary: 29000000,
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

  // 5. Sample Pet Owner with Pets
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
                dob: new Date('2022-04-15'),
                gender: 'MALE',
                weight: 28.5,
                history: 'Allergic to specific penicillin antibiotic; completed rabies vaccination in Jan 2026',
                isDeleted: false,
                medicalRecords: {
                  create: [
                    {
                      diagnosis: 'Acute Gastroenteritis (Mild dehydration)',
                      treatmentPlan: 'Hydration fluid 500ml, Probiotic paste, special gastrointestinal canned diet for 5 days',
                    },
                  ],
                },
              },
              {
                name: 'Mimi',
                species: 'Cat',
                breed: 'British Shorthair',
                dob: new Date('2023-08-20'),
                gender: 'FEMALE',
                weight: 4.2,
                history: 'Routine health checks normal, no known drug allergies',
                isDeleted: false,
              },
            ],
          },
        },
      },
    },
    include: {
      petOwner: {
        include: {
          pets: true,
        },
      },
    },
  });

  // 6. Care & Medical Service Catalog
  const serviceRecords = [
    {
      name: 'General Health Examination',
      species: 'All',
      size: 'All',
      price: 150000,
      description: 'Comprehensive physical examination of eyes, ears, teeth, heart, and coat.',
    },
    {
      name: '5-in-1 Canine Vaccination',
      species: 'Dog',
      size: 'All',
      price: 250000,
      description: 'Protects against Distemper, Parvovirus, Hepatitis, Parainfluenza, and Adenovirus.',
    },
    {
      name: '4-in-1 Feline Vaccination',
      species: 'Cat',
      size: 'All',
      price: 220000,
      description: 'Essential core vaccine for kittens and adult cats.',
    },
    {
      name: 'Abdominal Ultrasound',
      species: 'All',
      size: 'All',
      price: 350000,
      description: 'High-resolution imaging to evaluate internal organs.',
    },
    {
      name: 'Dental Scaling & Polishing',
      species: 'All',
      size: 'All',
      price: 450000,
      description: 'Ultrasonic removal of dental plaque and tartar.',
    },
  ];

  const createdServices = [];
  for (const s of serviceRecords) {
    let service = await prisma.service.findFirst({ where: { name: s.name } });
    if (!service) {
      service = await prisma.service.create({ data: s });
    }
    createdServices.push(service);
  }

  // 7. Duty Rosters for the next 14 days
  const now = new Date();
  const vets = [vet1User, vet2User];

  for (let d = 0; d < 14; d++) {
    const rosterDate = new Date(now);
    rosterDate.setDate(now.getDate() + d);
    const dateStr = rosterDate.toISOString().split('T')[0];

    for (const v of vets) {
      await prisma.dutyRoster.upsert({
        where: {
          vetId_date: {
            vetId: v.id,
            date: dateStr,
          },
        },
        update: {},
        create: {
          vetId: v.id,
          date: dateStr,
          shiftStart: '08:00',
          shiftEnd: '17:00',
        },
      });
    }
  }

  // 8. Sample Appointments for testing
  const luckyPet = ownerUser.petOwner?.pets?.find((p) => p.name === 'Lucky');
  if (luckyPet && createdServices.length > 0) {
    // Appointment 1: In 2 days at 09:00 (Valid for Cancel & Reschedule tests)
    const futureDate1 = new Date(now);
    futureDate1.setDate(now.getDate() + 2);
    futureDate1.setHours(9, 0, 0, 0);

    const existingApt1 = await prisma.appointment.findFirst({
      where: { appointmentCode: 'APT-TEST-001' },
    });

    if (!existingApt1) {
      await prisma.appointment.create({
        data: {
          appointmentCode: 'APT-TEST-001',
          petId: luckyPet.id,
          ownerId: ownerUser.id,
          serviceId: createdServices[0].id,
          vetId: vet1User.id,
          startTime: futureDate1,
          status: 'PENDING_APPROVAL',
          type: 'ROUTINE',
          visitNote: 'Annual routine health checkup for Lucky.',
        },
      });
    }

    // Appointment 2: In 45 minutes (Violates BR-06 - tests 2-hour restriction!)
    const nearDate = new Date(now.getTime() + 45 * 60 * 1000);
    const existingApt2 = await prisma.appointment.findFirst({
      where: { appointmentCode: 'APT-TEST-NEAR' },
    });

    if (!existingApt2) {
      await prisma.appointment.create({
        data: {
          appointmentCode: 'APT-TEST-NEAR',
          petId: luckyPet.id,
          ownerId: ownerUser.id,
          serviceId: createdServices[1].id,
          vetId: vet1User.id,
          startTime: nearDate,
          status: 'CONFIRMED',
          type: 'ROUTINE',
          visitNote: 'Vaccination dose 2 (urgent follow-up).',
        },
      });
    }
  }

  console.log('[Seed] Database seeded successfully:');
  console.log(' - Manager: manager / Password123!');
  console.log(' - Receptionist: receptionist1 / Password123!');
  console.log(' - Vet 1: vet1 / Password123!');
  console.log(' - Vet 2: vet2 / Password123!');
  console.log(' - Pet Owner: petowner1 / Password123! (Pets: Lucky, Mimi)');
  console.log(' - Duty Rosters: 14 days generated (08:00 - 17:00)');
  console.log(' - Test Appointments: APT-TEST-001 (>2h), APT-TEST-NEAR (<2h BR-06 limit)');
}

main()
  .catch((e) => {
    console.error('[Seed] Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
