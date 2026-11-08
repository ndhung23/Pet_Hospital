const express = require('express');
const hrController = require('../controllers/hr.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const {
  weekStartQuerySchema,
  leaveIdParamSchema,
  shiftIdParamSchema,
  assignShiftSchema,
  cloneRosterSchema,
  createLeaveSchema,
  rejectLeaveSchema,
} = require('../validators/hr.validator');

const router = express.Router();

router.use(authenticate);

/* ---------------------------------------------------------------- UC-HR-01 */
// Staff directory for the roster grid (Clinic Manager)
router.get('/staff', authorize('CLINIC_MANAGER'), hrController.getAssignableStaff);

// Weekly roster grid (Clinic Manager)
router.get(
  '/roster',
  authorize('CLINIC_MANAGER'),
  validate(weekStartQuerySchema, 'query'),
  hrController.getWeeklyRoster
);

// Assign one staff member to one shift slot
router.post(
  '/roster/shifts',
  authorize('CLINIC_MANAGER'),
  validate(assignShiftSchema),
  hrController.assignShift
);

// Remove an assignment
router.delete(
  '/roster/shifts/:shiftId',
  authorize('CLINIC_MANAGER'),
  validate(shiftIdParamSchema, 'params'),
  hrController.removeShift
);

// Alternative flow 1.1: clone last week's roster
router.post(
  '/roster/clone',
  authorize('CLINIC_MANAGER'),
  validate(cloneRosterSchema),
  hrController.clonePreviousWeek
);

// Publish / reopen the roster
router.post(
  '/roster/publish',
  authorize('CLINIC_MANAGER'),
  validate(cloneRosterSchema),
  hrController.publishRoster
);

router.post(
  '/roster/unpublish',
  authorize('CLINIC_MANAGER'),
  validate(cloneRosterSchema),
  hrController.unpublishRoster
);

// Staff view of their own shifts (all clinical roles)
router.get(
  '/my-shifts',
  authorize('VETERINARIAN', 'NURSE', 'RECEPTIONIST', 'CLINIC_MANAGER'),
  hrController.getMyShifts
);

/* ---------------------------------------------------------------- UC-HR-02 */
// Submit a leave request (any staff member)
router.post(
  '/leave-requests',
  authorize('VETERINARIAN', 'NURSE', 'RECEPTIONIST', 'CLINIC_MANAGER'),
  validate(createLeaveSchema),
  hrController.submitLeaveRequest
);

// My own leave history
router.get(
  '/leave-requests/mine',
  authorize('VETERINARIAN', 'NURSE', 'RECEPTIONIST', 'CLINIC_MANAGER'),
  hrController.getMyLeaveRequests
);

// Cancel my own pending request
router.patch(
  '/leave-requests/:leaveId/cancel',
  authorize('VETERINARIAN', 'NURSE', 'RECEPTIONIST', 'CLINIC_MANAGER'),
  validate(leaveIdParamSchema, 'params'),
  hrController.cancelLeaveRequest
);

/* ---------------------------------------------------------------- UC-HR-03 */
// Manager review queue with shift + appointment impact
router.get(
  '/leave-requests',
  authorize('CLINIC_MANAGER'),
  hrController.getPendingLeaveRequests
);

router.patch(
  '/leave-requests/:leaveId/approve',
  authorize('CLINIC_MANAGER'),
  validate(leaveIdParamSchema, 'params'),
  hrController.approveLeaveRequest
);

router.patch(
  '/leave-requests/:leaveId/reject',
  authorize('CLINIC_MANAGER'),
  validate(leaveIdParamSchema, 'params'),
  validate(rejectLeaveSchema),
  hrController.rejectLeaveRequest
);

module.exports = router;
