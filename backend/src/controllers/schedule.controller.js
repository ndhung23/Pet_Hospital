const scheduleService = require('../services/schedule.service');
const { successResponse } = require('../utils/response');

/**
 * Get active hospital staff members
 */
const getStaff = async (req, res, next) => {
  try {
    const staff = await scheduleService.getStaffMembers();
    return successResponse(res, 200, 'Hospital staff loaded successfully', staff);
  } catch (error) {
    next(error);
  }
};

/**
 * AI-powered weekly roster generator
 */
const generateAi = async (req, res, next) => {
  try {
    const { startDate, customInstructions } = req.body;
    const result = await scheduleService.generateAiWeeklySchedule({
      startDate,
      customInstructions,
    });
    return successResponse(res, 200, 'AI schedule generated successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Save & publish weekly work shifts
 */
const saveSchedule = async (req, res, next) => {
  try {
    const { shifts, replaceExisting } = req.body;
    const saved = await scheduleService.saveWeeklySchedule({
      shifts,
      replaceExisting,
    });
    return successResponse(res, 201, 'Work schedule published successfully', saved);
  } catch (error) {
    next(error);
  }
};

/**
 * Get weekly schedule for staff roster
 */
const getWeekSchedule = async (req, res, next) => {
  try {
    const { startDate, endDate, role } = req.query;
    const shifts = await scheduleService.getWeeklySchedule({
      startDate,
      endDate,
      role,
    });
    return successResponse(res, 200, 'Weekly schedule loaded', shifts);
  } catch (error) {
    next(error);
  }
};

/**
 * Get authenticated employee's personal schedule
 */
const getMyShifts = async (req, res, next) => {
  try {
    const shifts = await scheduleService.getMySchedule(req.user.id);
    return successResponse(res, 200, 'Personal work shifts loaded', shifts);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStaff,
  generateAi,
  saveSchedule,
  getWeekSchedule,
  getMyShifts,
};
