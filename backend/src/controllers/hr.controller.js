const hrService = require('../services/hr.service');
const { successResponse } = require('../utils/response');

/* =========================================================================
   UC-HR-01: Manage Weekly Shift Rosters
   ========================================================================= */

const getAssignableStaff = async (req, res, next) => {
  try {
    const staff = await hrService.getAssignableStaff();
    return successResponse(res, 200, 'Assignable clinical personnel retrieved', staff);
  } catch (error) {
    next(error);
  }
};

const getWeeklyRoster = async (req, res, next) => {
  try {
    const roster = await hrService.getWeeklyRoster(req.query.weekStart);
    return successResponse(res, 200, 'Weekly roster loaded', roster);
  } catch (error) {
    next(error);
  }
};

const assignShift = async (req, res, next) => {
  try {
    const shift = await hrService.assignShift(req.user, req.body);
    return successResponse(res, 201, 'Shift assigned to roster', shift);
  } catch (error) {
    next(error);
  }
};

const removeShift = async (req, res, next) => {
  try {
    const result = await hrService.removeShift(req.params.shiftId);
    return successResponse(res, 200, 'Shift removed from roster', result);
  } catch (error) {
    next(error);
  }
};

const clonePreviousWeek = async (req, res, next) => {
  try {
    const result = await hrService.clonePreviousWeek(req.user, req.body.weekStart);
    return successResponse(res, 200, 'Previous week roster cloned', result);
  } catch (error) {
    next(error);
  }
};

const publishRoster = async (req, res, next) => {
  try {
    const result = await hrService.publishRoster(req.user, req.body.weekStart);
    return successResponse(res, 200, 'Roster published. Booking slots are now open.', result);
  } catch (error) {
    next(error);
  }
};

const unpublishRoster = async (req, res, next) => {
  try {
    const result = await hrService.unpublishRoster(req.body.weekStart);
    return successResponse(res, 200, 'Roster reopened for editing', result);
  } catch (error) {
    next(error);
  }
};

const getMyShifts = async (req, res, next) => {
  try {
    const shifts = await hrService.getMyShifts(req.user.id, {
      from: req.query.from,
      to: req.query.to,
    });
    return successResponse(res, 200, 'Your duty shifts retrieved', shifts);
  } catch (error) {
    next(error);
  }
};

/* =========================================================================
   UC-HR-02: Submit Staff Leave Request
   ========================================================================= */

const submitLeaveRequest = async (req, res, next) => {
  try {
    const leave = await hrService.submitLeaveRequest(req.user, req.body);
    return successResponse(res, 201, 'Leave request submitted for Manager review', leave);
  } catch (error) {
    next(error);
  }
};

const getMyLeaveRequests = async (req, res, next) => {
  try {
    const leaves = await hrService.getMyLeaveRequests(req.user.id);
    return successResponse(res, 200, 'Your leave requests retrieved', leaves);
  } catch (error) {
    next(error);
  }
};

const cancelLeaveRequest = async (req, res, next) => {
  try {
    const leave = await hrService.cancelLeaveRequest(req.user, req.params.leaveId);
    return successResponse(res, 200, 'Leave request cancelled', leave);
  } catch (error) {
    next(error);
  }
};

/* =========================================================================
   UC-HR-03: Approve / Reject Leave Request
   ========================================================================= */

const getPendingLeaveRequests = async (req, res, next) => {
  try {
    const status = req.query.status || 'PENDING';
    const requests = await hrService.getPendingLeaveRequests(status);
    return successResponse(res, 200, 'Leave requests retrieved', requests);
  } catch (error) {
    next(error);
  }
};

const approveLeaveRequest = async (req, res, next) => {
  try {
    const result = await hrService.approveLeaveRequest(req.user, req.params.leaveId);
    return successResponse(res, 200, 'Leave request approved. Conflicting shifts have been locked.', result);
  } catch (error) {
    next(error);
  }
};

const rejectLeaveRequest = async (req, res, next) => {
  try {
    const result = await hrService.rejectLeaveRequest(
      req.user,
      req.params.leaveId,
      req.body.rejectionReason
    );
    return successResponse(res, 200, 'Leave request rejected', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssignableStaff,
  getWeeklyRoster,
  assignShift,
  removeShift,
  clonePreviousWeek,
  publishRoster,
  unpublishRoster,
  getMyShifts,
  submitLeaveRequest,
  getMyLeaveRequests,
  cancelLeaveRequest,
  getPendingLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
};
