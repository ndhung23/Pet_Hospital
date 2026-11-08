const prisma = require('../config/prisma');
const geminiClient = require('./gemini.client');
const AppError = require('../utils/AppError');

/**
 * Get active staff members available for roster scheduling
 */
const getStaffMembers = async () => {
  return prisma.user.findMany({
    where: {
      role: { in: ['VETERINARIAN', 'NURSE', 'RECEPTIONIST'] },
      isActive: true,
    },
    select: {
      id: true,
      fullName: true,
      userName: true,
      role: true,
      phone: true,
      employee: {
        select: {
          empCode: true,
          department: true,
        },
      },
    },
    orderBy: [{ role: 'asc' }, { fullName: 'asc' }],
  });
};

/**
 * Generate AI-optimized weekly roster using Gemini AI
 */
const generateAiWeeklySchedule = async ({ startDate, customInstructions = '' }) => {
  const staff = await getStaffMembers();

  if (staff.length === 0) {
    throw new AppError('No active hospital staff members found to schedule shifts.', 400);
  }

  // Calculate 7 days of the target week starting from startDate (or next Monday)
  let baseDate = startDate ? new Date(startDate) : new Date();
  // Ensure we start at 00:00:00
  baseDate.setHours(0, 0, 0, 0);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }

  const staffRosterContext = staff.map((s) => ({
    userId: s.id,
    name: s.fullName,
    role: s.role,
    empCode: s.employee?.empCode || 'STAFF',
  }));

  const systemInstruction = `You are the Chief Hospital Operations Director & AI Scheduling Engine for PHMS Veterinary Hospital.
Your responsibility is to generate an optimal, fair, and legally compliant 7-day staff roster for veterinarians, nurses, and receptionists.
Shift Requirements for each day:
1. MORNING (07:00 - 15:00)
2. AFTERNOON (15:00 - 23:00)
3. NIGHT (23:00 - 07:00): Emergency Triage & ICU coverage (Must have at least 1 Veterinarian).

Fairness & Health Rules:
- Distribute shifts evenly among available staff.
- An employee should not work more than 5 shifts in a week.
- Do NOT schedule an employee for a MORNING shift immediately after working a NIGHT shift.
- Every shift must have at least one on-duty staff member assigned.

OUTPUT FORMAT:
You MUST output ONLY a valid JSON array of objects. Do not wrap with explanation.
Format:
[
  {
    "date": "YYYY-MM-DD",
    "shiftType": "MORNING" | "AFTERNOON" | "NIGHT",
    "userId": "exact user id string from roster",
    "roomOrDesk": "Room 101" | "ER Room" | "Front Desk" | "Triage Desk" | "ICU Ward",
    "notes": "Short note"
  }
]`;

  const prompt = `TARGET DAYS FOR THIS WEEK:
${days.join(', ')}

HOSPITAL STAFF AVAILABLE:
${JSON.stringify(staffRosterContext, null, 2)}

${customInstructions ? `SPECIAL MANAGER INSTRUCTIONS:\n${customInstructions}\n` : ''}

Generate the complete JSON schedule for all 7 days covering MORNING, AFTERNOON, and NIGHT shifts.`;

  const aiResult = await geminiClient.generateGeminiContent({
    prompt,
    systemInstruction,
  });

  let rawText = aiResult.text.trim();
  // Strip Markdown JSON codeblocks if present
  if (rawText.startsWith('```json')) {
    rawText = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (rawText.startsWith('```')) {
    rawText = rawText.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  let generatedShifts = [];
  try {
    generatedShifts = JSON.parse(rawText);
  } catch (err) {
    console.warn('[Schedule AI] Failed to parse raw AI JSON, generating balanced algorithmic fallback:', err.message);
    // Deterministic fallback generator if LLM JSON format was malformed
    generatedShifts = generateDeterministicRoster(staff, days);
  }

  // Validate and enrich with staff info
  const staffMap = new Map(staff.map((s) => [s.id, s]));
  const validShifts = [];

  for (const shift of generatedShifts) {
    const assignedStaff = staffMap.get(shift.userId);
    if (assignedStaff && shift.date && ['MORNING', 'AFTERNOON', 'NIGHT'].includes(shift.shiftType)) {
      validShifts.push({
        date: shift.date,
        shiftType: shift.shiftType,
        userId: shift.userId,
        staffName: assignedStaff.fullName,
        role: assignedStaff.role,
        roomOrDesk: shift.roomOrDesk || (shift.shiftType === 'NIGHT' ? 'ER Triage Room' : 'Consultation Room'),
        notes: shift.notes || 'AI Generated Schedule',
      });
    }
  }

  return {
    weekStartDate: days[0],
    weekEndDate: days[6],
    totalShifts: validShifts.length,
    shifts: validShifts,
    staffCount: staff.length,
  };
};

/**
 * Fallback deterministic roster generator in case of LLM parse failure
 */
const generateDeterministicRoster = (staff, days) => {
  const shifts = [];
  const vets = staff.filter((s) => s.role === 'VETERINARIAN');
  const nurses = staff.filter((s) => s.role === 'NURSE');
  const receps = staff.filter((s) => s.role === 'RECEPTIONIST');

  let vetIdx = 0;
  let recepIdx = 0;
  let nurseIdx = 0;

  days.forEach((date) => {
    ['MORNING', 'AFTERNOON', 'NIGHT'].forEach((shiftType) => {
      // Assign Vet
      if (vets.length > 0) {
        shifts.push({
          date,
          shiftType,
          userId: vets[vetIdx % vets.length].id,
          roomOrDesk: shiftType === 'NIGHT' ? 'ER Triage Unit' : 'Clinic Room 1',
          notes: 'Standard shift rotation',
        });
        vetIdx++;
      }

      // Assign Receptionist
      if (receps.length > 0) {
        shifts.push({
          date,
          shiftType,
          userId: receps[recepIdx % receps.length].id,
          roomOrDesk: 'Front Desk',
          notes: 'Reception & Triage check-in',
        });
        recepIdx++;
      }

      // Assign Nurse for Day Shifts
      if (nurses.length > 0 && shiftType !== 'NIGHT') {
        shifts.push({
          date,
          shiftType,
          userId: nurses[nurseIdx % nurses.length].id,
          roomOrDesk: 'Treatment & Lab',
          notes: 'Inpatient & prep care',
        });
        nurseIdx++;
      }
    });
  });

  return shifts;
};

/**
 * Save and publish shifts to database
 */
const saveWeeklySchedule = async ({ shifts, replaceExisting = true }) => {
  if (!Array.isArray(shifts) || shifts.length === 0) {
    throw new AppError('No shifts provided to save.', 400);
  }

  // Extract unique dates from the shifts
  const shiftDates = [...new Set(shifts.map((s) => s.date))];

  return prisma.$transaction(async (tx) => {
    if (replaceExisting && shiftDates.length > 0) {
      // Delete existing shifts for those dates
      for (const d of shiftDates) {
        const dateObj = new Date(d);
        await tx.workShift.deleteMany({
          where: { date: dateObj },
        });
      }
    }

    // Insert new shifts
    const created = [];
    for (const s of shifts) {
      const record = await tx.workShift.create({
        data: {
          userId: s.userId,
          date: new Date(s.date),
          shiftType: s.shiftType,
          roomOrDesk: s.roomOrDesk || null,
          notes: s.notes || null,
          status: 'SCHEDULED',
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              role: true,
              phone: true,
            },
          },
        },
      });
      created.push(record);
    }

    return created;
  });
};

/**
 * Get weekly schedule for all or filtered by role/date
 */
const getWeeklySchedule = async ({ startDate, endDate, role }) => {
  const where = {};

  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  } else if (startDate) {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    where.date = { gte: start, lte: end };
  }

  if (role) {
    where.user = { role };
  }

  const shifts = await prisma.workShift.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          role: true,
          phone: true,
          email: true,
          employee: {
            select: {
              empCode: true,
            },
          },
        },
      },
    },
    orderBy: [{ date: 'asc' }, { shiftType: 'asc' }],
  });

  return shifts;
};

/**
 * Get assigned shifts for logged in staff member
 */
const getMySchedule = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return prisma.workShift.findMany({
    where: {
      userId,
      date: { gte: today },
    },
    orderBy: [{ date: 'asc' }, { shiftType: 'asc' }],
    take: 30,
  });
};

module.exports = {
  getStaffMembers,
  generateAiWeeklySchedule,
  saveWeeklySchedule,
  getWeeklySchedule,
  getMySchedule,
};
