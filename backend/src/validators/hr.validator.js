const { z } = require('zod');

const SHIFT_TYPES = ['MORNING', 'AFTERNOON', 'EVENING'];
const LEAVE_TYPES = ['SICK', 'PERSONAL', 'VACATION'];

// Accepts YYYY-MM-DD and normalises to a Date at UTC midnight so @db.Date
// round-trips without a timezone shift.
const isoDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .transform((value) => new Date(`${value}T00:00:00.000Z`));

const weekStartQuerySchema = z.object({
  weekStart: isoDate.optional(),
});

// Path params must be validated too, otherwise a malformed id reaches Prisma
// and surfaces as a 500 instead of a clean 400/404.
const leaveIdParamSchema = z.object({
  leaveId: z.string().uuid('Invalid leave request id'),
});

const shiftIdParamSchema = z.object({
  shiftId: z.string().uuid('Invalid shift id'),
});

// UC-HR-01: assign one staff member to one shift slot
const assignShiftSchema = z.object({
  userId: z.string().uuid('A valid staff account is required'),
  date: isoDate,
  shiftType: z.enum(SHIFT_TYPES),
  roomOrDesk: z.string().trim().max(50).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
});

const cloneRosterSchema = z.object({
  weekStart: isoDate,
});

// UC-HR-02: submit a leave request
const createLeaveSchema = z
  .object({
    startDate: isoDate,
    endDate: isoDate,
    leaveType: z.enum(LEAVE_TYPES),
    reason: z
      .string()
      .trim()
      .min(5, 'Please describe the reason for leave (at least 5 characters)')
      .max(1000, 'Reason cannot exceed 1000 characters'),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date cannot be earlier than start date',
    path: ['endDate'],
  });

// UC-HR-03: reject requires a reason
const rejectLeaveSchema = z.object({
  rejectionReason: z
    .string()
    .trim()
    .min(3, 'A rejection reason is required')
    .max(500, 'Rejection reason cannot exceed 500 characters'),
});

module.exports = {
  SHIFT_TYPES,
  LEAVE_TYPES,
  weekStartQuerySchema,
  leaveIdParamSchema,
  shiftIdParamSchema,
  assignShiftSchema,
  cloneRosterSchema,
  createLeaveSchema,
  rejectLeaveSchema,
};
