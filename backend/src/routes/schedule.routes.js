const express = require('express');
const scheduleController = require('../controllers/ScheduleController');

const router = express.Router();

// GET /api/schedule/veterinarians
router.get('/veterinarians', (req, res, next) =>
  scheduleController.getVeterinariansAndDates(req, res, next)
);

// GET /api/schedule/slots
router.get('/slots', (req, res, next) => scheduleController.getAvailableSlots(req, res, next));

module.exports = router;

