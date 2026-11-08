const express = require('express');
const scheduleController = require('../controllers/schedule.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

const router = express.Router();

// All schedule endpoints require staff authentication
router.use(authenticate, authorize('CLINIC_MANAGER', 'VETERINARIAN', 'NURSE', 'RECEPTIONIST'));

// View endpoints
router.get('/staff', scheduleController.getStaff);
router.get('/week', scheduleController.getWeekSchedule);
router.get('/my', scheduleController.getMyShifts);

// Manager-only AI Generation & Publishing
router.post('/ai-generate', authorize('CLINIC_MANAGER'), scheduleController.generateAi);
router.post('/publish', authorize('CLINIC_MANAGER'), scheduleController.saveSchedule);

module.exports = router;
