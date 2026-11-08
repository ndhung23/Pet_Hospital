const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

/* =========================================================================
   Date helpers — all roster dates are stored as @db.Date (UTC midnight).
   ========================================================================= */

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDayUTC = (date) => {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

/**
 * Today's calendar date in the clinic's local timezone, expressed as UTC midnight.
 * Using `new Date()` raw would roll back a day for anyone east of UTC after
 * midnight (e.g. 03:00 in Vietnam is still the previous day in UTC).
 */
const todayLocal = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
};

const addDays = (date, days) => new Date(date.getTime() + days * DAY_MS);

/** Monday 00:00 UTC of the week containing `date`. */
const getWeekStart = (date) => {
  const d = startOfDayUTC(date || todayLocal());
  const day = d.getUTCDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(d, diff);
};

/** Inclusive list of calendar dates between two dates. */
const enumerateDates = (start, end) => {
  const dates = [];
  let cursor = startOfDayUTC(start);
  const last = startOfDayUTC(end);
  while (cursor <= last) {
    dates.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return dates;
};

const formatDate = (date) => startOfDayUTC(date).toISOString().slice(0, 10);

/* =========================================================================
   UC-HR-01: Manage Weekly Shift Rosters
   ========================================================================= */

const STAFF_ROLES = ['VETERINARIAN', 'NURSE', 'RECEPTIONIST'];

/**
 * Ensure the RosterWeek row exists for a given week start.
 */
const ensureRosterWeek = async (weekStart, tx = prisma) => {
  const existing = await tx.rosterWeek.findUnique({ where: { weekStart } });
  if (existing) return existing;
  return tx.rosterWeek.create({ data: { weekStart } });
};

/**
 * List assignable clinical personnel (Vets, Nurses, Receptionists).
 */
const getAssignableStaff = async () => {
  return prisma.user.findMany({
    where: { role: { in: STAFF_ROLES }, isActive: true },
    select: {
      id: true,
      fullName: true,
      role: true,
      phone: true,
      employee: { select: { empCode: true, department: true } },
    },
    orderBy: [{ role: 'asc' }, { fullName: 'asc' }],
  });
};

/**
 * UC-HR-01 step 2: the calendar grid for a target week.
 * Returns the week meta, every assignment in it, and the approved leave that
 * overlaps it so the Manager can see who is unavailable before assigning.
 */
const getWeeklyRoster = async (weekStartInput) => {
  const weekStart = weekStartInput ? startOfDayUTC(weekStartInput) : getWeekStart();
  const weekEnd = addDays(weekStart, 6);

  const [week, shifts, approvedLeaves, staff] = await Promise.all([
    prisma.rosterWeek.findUnique({ where: { weekStart } }),
    prisma.workShift.findMany({
      where: { date: { gte: weekStart, lte: weekEnd } },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            role: true,
            employee: { select: { empCode: true, department: true } },
          },
        },
      },
      orderBy: [{ date: 'asc' }, { shiftType: 'asc' }],
    }),
    prisma.leaveRequest.findMany({
      where: {
        status: 'APPROVED',
        startDate: { lte: weekEnd },
        endDate: { gte: weekStart },
      },
      include: { user: { select: { id: true, fullName: true, role: true } } },
    }),
    getAssignableStaff(),
  ]);

  return {
    weekStart: formatDate(weekStart),
    weekEnd: formatDate(weekEnd),
    isPublished: week?.isPublished ?? false,
    publishedAt: week?.publishedAt ?? null,
    shifts,
    approvedLeaves,
    staff,
  };
};

/**
 * UC-HR-01 step 4-5: assign a staff member to a day/shift slot.
 * Step 5 validation is the core of this use case:
 *   - the slot must belong to the current week
 *   - the staff member must not already hold that exact slot (DB unique index)
 *   - the staff member must not be on approved leave that day
 *   - a published roster is locked for structural edits
 */
const assignShift = async (managerUser, payload) => {
  const { userId, date, shiftType, roomOrDesk, notes } = payload;
  const shiftDate = startOfDayUTC(date);
  const weekStart = getWeekStart(shiftDate);

  if (shiftDate < weekStart || shiftDate > addDays(weekStart, 6)) {
    throw new AppError('Shift date falls outside its roster week.', 400);
  }

  const staff = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, fullName: true, role: true, isActive: true },
  });

  if (!staff) {
    throw new AppError('Staff member not found.', 404);
  }
  if (!STAFF_ROLES.includes(staff.role)) {
    throw new AppError(`${staff.fullName} is not clinical personnel and cannot be rostered.`, 400);
  }
  if (!staff.isActive) {
    throw new AppError(`${staff.fullName}'s account is deactivated and cannot be rostered.`, 400);
  }

  const week = await ensureRosterWeek(weekStart);
  if (week.isPublished) {
    throw new AppError(
      'This roster is already published. Unpublish it before changing assignments.',
      409
    );
  }

  // Exception 1.0.E1: approved leave blocks the assignment (BR-03)
  const blockingLeave = await prisma.leaveRequest.findFirst({
    where: {
      userId,
      status: 'APPROVED',
      startDate: { lte: shiftDate },
      endDate: { gte: shiftDate },
    },
  });

  if (blockingLeave) {
    throw new AppError(
      `${staff.fullName} is on approved leave from ${formatDate(blockingLeave.startDate)} to ${formatDate(
        blockingLeave.endDate
      )} and is unavailable for this shift.`,
      409
    );
  }

  // Exception 1.0.E1: same person, same day, same shift
  const duplicate = await prisma.workShift.findUnique({
    where: { userId_date_shiftType: { userId, date: shiftDate, shiftType } },
  });

  if (duplicate) {
    throw new AppError(
      `${staff.fullName} is already assigned to the ${shiftType} shift on ${formatDate(shiftDate)}.`,
      409
    );
  }

  return prisma.workShift.create({
    data: {
      userId,
      weekId: week.id,
      date: shiftDate,
      shiftType,
      roomOrDesk: roomOrDesk || null,
      notes: notes || null,
      createdBy: managerUser.id,
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          role: true,
          employee: { select: { empCode: true } },
        },
      },
    },
  });
};

/**
 * Remove an assignment from an unpublished roster.
 */
const removeShift = async (shiftId) => {
  const shift = await prisma.workShift.findUnique({
    where: { id: shiftId },
    include: { week: true },
  });

  if (!shift) {
    throw new AppError('Shift assignment not found.', 404);
  }
  if (shift.week?.isPublished) {
    throw new AppError('This roster is already published. Unpublish it before removing shifts.', 409);
  }
  if (shift.status === 'COMPLETED') {
    throw new AppError('A completed shift cannot be removed from the roster.', 409);
  }

  await prisma.workShift.delete({ where: { id: shiftId } });
  return { id: shiftId };
};

/**
 * Alternative Flow 1.1: clone the previous week's assignments into this week.
 * Skips anyone on approved leave in the target week and any slot that already
 * exists, so re-running it is safe.
 */
const clonePreviousWeek = async (managerUser, weekStartInput) => {
  const weekStart = startOfDayUTC(weekStartInput);
  const previousWeekStart = addDays(weekStart, -7);
  const weekEnd = addDays(weekStart, 6);

  const week = await ensureRosterWeek(weekStart);
  if (week.isPublished) {
    throw new AppError('This roster is already published and cannot be re-cloned.', 409);
  }

  const previousShifts = await prisma.workShift.findMany({
    where: {
      date: { gte: previousWeekStart, lte: addDays(previousWeekStart, 6) },
      status: { not: 'CANCELLED' },
    },
  });

  if (previousShifts.length === 0) {
    throw new AppError('The previous week has no assignments to clone.', 404);
  }

  const [existingShifts, approvedLeaves] = await Promise.all([
    prisma.workShift.findMany({
      where: { date: { gte: weekStart, lte: weekEnd } },
      select: { userId: true, date: true, shiftType: true },
    }),
    prisma.leaveRequest.findMany({
      where: { status: 'APPROVED', startDate: { lte: weekEnd }, endDate: { gte: weekStart } },
      select: { userId: true, startDate: true, endDate: true },
    }),
  ]);

  const takenSlots = new Set(
    existingShifts.map((s) => `${s.userId}|${formatDate(s.date)}|${s.shiftType}`)
  );

  const isOnLeave = (userId, date) =>
    approvedLeaves.some(
      (l) => l.userId === userId && startOfDayUTC(l.startDate) <= date && startOfDayUTC(l.endDate) >= date
    );

  const toCreate = [];
  const skipped = [];

  for (const shift of previousShifts) {
    const targetDate = addDays(startOfDayUTC(shift.date), 7);
    const key = `${shift.userId}|${formatDate(targetDate)}|${shift.shiftType}`;

    if (takenSlots.has(key)) {
      skipped.push({ userId: shift.userId, date: formatDate(targetDate), shiftType: shift.shiftType, reason: 'ALREADY_ASSIGNED' });
      continue;
    }
    if (isOnLeave(shift.userId, targetDate)) {
      skipped.push({ userId: shift.userId, date: formatDate(targetDate), shiftType: shift.shiftType, reason: 'ON_APPROVED_LEAVE' });
      continue;
    }

    takenSlots.add(key);
    toCreate.push({
      userId: shift.userId,
      weekId: week.id,
      date: targetDate,
      shiftType: shift.shiftType,
      roomOrDesk: shift.roomOrDesk,
      notes: shift.notes,
      createdBy: managerUser.id,
    });
  }

  if (toCreate.length > 0) {
    await prisma.workShift.createMany({ data: toCreate, skipDuplicates: true });
  }

  return { created: toCreate.length, skipped };
};

/**
 * UC-HR-01 step 6-7: publish the roster.
 * POST-2: publishing opens booking slots for Pet Owners and notifies staff.
 * A roster with no assignments is not publishable.
 */
const publishRoster = async (managerUser, weekStartInput) => {
  const weekStart = startOfDayUTC(weekStartInput);
  const weekEnd = addDays(weekStart, 6);

  const week = await prisma.rosterWeek.findUnique({ where: { weekStart } });
  if (!week) {
    throw new AppError('No roster exists for that week yet.', 404);
  }
  if (week.isPublished) {
    throw new AppError('This roster is already published.', 409);
  }

  const shiftCount = await prisma.workShift.count({
    where: { date: { gte: weekStart, lte: weekEnd }, status: 'SCHEDULED' },
  });

  if (shiftCount === 0) {
    throw new AppError('Cannot publish a roster with no shift assignments.', 400);
  }

  const updated = await prisma.rosterWeek.update({
    where: { id: week.id },
    data: { isPublished: true, publishedAt: new Date(), publishedBy: managerUser.id },
  });

  return { ...updated, shiftCount };
};

/**
 * Reopen a published roster for edits.
 */
const unpublishRoster = async (weekStartInput) => {
  const weekStart = startOfDayUTC(weekStartInput);
  const week = await prisma.rosterWeek.findUnique({ where: { weekStart } });

  if (!week) {
    throw new AppError('No roster exists for that week yet.', 404);
  }
  if (!week.isPublished) {
    throw new AppError('This roster is not published.', 409);
  }

  return prisma.rosterWeek.update({
    where: { id: week.id },
    data: { isPublished: false, publishedAt: null, publishedBy: null },
  });
};

/**
 * Staff-facing view (secondary actor in UC-HR-01): my own shifts.
 */
const getMyShifts = async (userId, { from, to } = {}) => {
  const fromDate = from ? startOfDayUTC(from) : getWeekStart();
  const toDate = to ? startOfDayUTC(to) : addDays(fromDate, 27);

  return prisma.workShift.findMany({
    where: { userId, date: { gte: fromDate, lte: toDate } },
    include: { week: { select: { isPublished: true } } },
    orderBy: [{ date: 'asc' }, { shiftType: 'asc' }],
  });
};

/* =========================================================================
   UC-HR-02: Submit Staff Leave Request
   ========================================================================= */

/**
 * UC-HR-02 step 5-6:
 *   - dates must be in the future
 *   - must not overlap an existing PENDING or APPROVED request
 *   - creates the record as PENDING and surfaces it to the Manager queue
 */
const submitLeaveRequest = async (staffUser, payload) => {
  const { startDate, endDate, leaveType, reason } = payload;
  const start = startOfDayUTC(startDate);
  const end = startOfDayUTC(endDate);
  const today = todayLocal();

  // Exception 1.0.E1: past dates
  if (start < today) {
    throw new AppError('Leave cannot start on a past date.', 400);
  }

  // Exception 1.0.E1: overlapping request
  const overlap = await prisma.leaveRequest.findFirst({
    where: {
      userId: staffUser.id,
      status: { in: ['PENDING', 'APPROVED'] },
      startDate: { lte: end },
      endDate: { gte: start },
    },
  });

  if (overlap) {
    throw new AppError(
      `Invalid date range or overlapping leave exists (${formatDate(overlap.startDate)} to ${formatDate(
        overlap.endDate
      )}, status ${overlap.status}).`,
      409
    );
  }

  const leave = await prisma.leaveRequest.create({
    data: {
      userId: staffUser.id,
      startDate: start,
      endDate: end,
      leaveType,
      reason,
      status: 'PENDING',
    },
    include: { user: { select: { id: true, fullName: true, role: true } } },
  });

  // POST-2: show the Manager which shifts this request would affect
  const affectedShifts = await prisma.workShift.findMany({
    where: {
      userId: staffUser.id,
      date: { gte: start, lte: end },
      status: { not: 'CANCELLED' },
    },
    orderBy: [{ date: 'asc' }, { shiftType: 'asc' }],
  });

  return { ...leave, affectedShifts };
};

/**
 * Staff's own leave history.
 */
const getMyLeaveRequests = async (userId) => {
  return prisma.leaveRequest.findMany({
    where: { userId },
    include: { reviewer: { select: { id: true, fullName: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Staff cancels a request that has not been decided yet.
 */
const cancelLeaveRequest = async (staffUser, leaveId) => {
  const leave = await prisma.leaveRequest.findUnique({ where: { id: leaveId } });

  if (!leave) {
    throw new AppError('Leave request not found.', 404);
  }
  if (leave.userId !== staffUser.id) {
    throw new AppError('You can only cancel your own leave requests.', 403);
  }
  if (leave.status !== 'PENDING') {
    throw new AppError(`Only pending requests can be cancelled (current status: ${leave.status}).`, 409);
  }

  return prisma.leaveRequest.update({
    where: { id: leaveId },
    data: { status: 'CANCELLED' },
  });
};

/* =========================================================================
   UC-HR-03: Approve / Reject Leave Request
   ========================================================================= */

/**
 * Manager approval queue, with the shifts and pre-booked appointments each
 * request would disrupt (step 2 of the normal flow).
 */
const getPendingLeaveRequests = async (status = 'PENDING') => {
  const requests = await prisma.leaveRequest.findMany({
    where: status === 'ALL' ? {} : { status },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          role: true,
          employee: { select: { empCode: true, department: true } },
        },
      },
      reviewer: { select: { id: true, fullName: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Enrich with impact so the Manager can judge coverage before deciding
  const enriched = await Promise.all(
    requests.map(async (request) => {
      const [affectedShifts, affectedAppointments] = await Promise.all([
        prisma.workShift.findMany({
          where: {
            userId: request.userId,
            date: { gte: request.startDate, lte: request.endDate },
            status: { not: 'CANCELLED' },
          },
          orderBy: [{ date: 'asc' }, { shiftType: 'asc' }],
        }),
        prisma.appointment.findMany({
          where: {
            vetId: request.userId,
            startTime: { gte: request.startDate, lte: addDays(request.endDate, 1) },
            status: { in: ['DRAFT', 'CHECKED_IN', 'EMERGENCY_WAITING'] },
          },
          select: {
            id: true,
            startTime: true,
            status: true,
            pet: { select: { id: true, name: true, species: true } },
          },
          orderBy: { startTime: 'asc' },
        }),
      ]);

      return { ...request, affectedShifts, affectedAppointments };
    })
  );

  return enriched;
};

/**
 * UC-HR-03 normal flow step 4-8.
 * Approving locks every shift in the range (BR-03) and flags pre-booked
 * appointments for receptionist reassignment (step 7).
 */
const approveLeaveRequest = async (managerUser, leaveId) => {
  const leave = await prisma.leaveRequest.findUnique({
    where: { id: leaveId },
    include: { user: { select: { id: true, fullName: true, role: true } } },
  });

  if (!leave) {
    throw new AppError('Leave request not found.', 404);
  }
  if (leave.status !== 'PENDING') {
    throw new AppError(`This request has already been ${leave.status.toLowerCase()}.`, 409);
  }
  if (leave.userId === managerUser.id) {
    throw new AppError('You cannot approve your own leave request.', 403);
  }

  return prisma.$transaction(async (tx) => {
    // Step 5: status -> APPROVED
    const approved = await tx.leaveRequest.update({
      where: { id: leaveId },
      data: { status: 'APPROVED', reviewedBy: managerUser.id, reviewedAt: new Date() },
    });

    // Step 6: BR-03 — lock every shift in the range
    const lockedShifts = await tx.workShift.updateMany({
      where: {
        userId: leave.userId,
        date: { gte: leave.startDate, lte: leave.endDate },
        status: 'SCHEDULED',
      },
      data: { status: 'CANCELLED' },
    });

    // Step 7: flag pre-booked appointments that now have no vet
    const affectedAppointments = await tx.appointment.findMany({
      where: {
        vetId: leave.userId,
        startTime: { gte: leave.startDate, lte: addDays(leave.endDate, 1) },
        status: { in: ['DRAFT', 'CHECKED_IN', 'EMERGENCY_WAITING'] },
      },
      select: {
        id: true,
        startTime: true,
        status: true,
        pet: { select: { id: true, name: true, species: true } },
      },
    });

    return {
      leaveRequest: approved,
      lockedShiftCount: lockedShifts.count,
      appointmentsNeedingReassignment: affectedAppointments,
    };
  });
};

/**
 * UC-HR-03 Alternative Flow 1.1: reject with a reason. Shifts stay untouched.
 */
const rejectLeaveRequest = async (managerUser, leaveId, rejectionReason) => {
  const leave = await prisma.leaveRequest.findUnique({ where: { id: leaveId } });

  if (!leave) {
    throw new AppError('Leave request not found.', 404);
  }
  if (leave.status !== 'PENDING') {
    throw new AppError(`This request has already been ${leave.status.toLowerCase()}.`, 409);
  }

  return prisma.leaveRequest.update({
    where: { id: leaveId },
    data: {
      status: 'REJECTED',
      reviewedBy: managerUser.id,
      reviewedAt: new Date(),
      rejectionReason,
    },
  });
};

module.exports = {
  // shared helpers
  getWeekStart,
  formatDate,
  enumerateDates,
  // UC-HR-01
  getAssignableStaff,
  getWeeklyRoster,
  assignShift,
  removeShift,
  clonePreviousWeek,
  publishRoster,
  unpublishRoster,
  getMyShifts,
  // UC-HR-02
  submitLeaveRequest,
  getMyLeaveRequests,
  cancelLeaveRequest,
  // UC-HR-03
  getPendingLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
};
