/**
 * File: schedule.routes.js
 * Module: Schedule Route Definitions
 * Author: he194418-NhacTuanAnh
 * Date: 09/11/2026
 * Version: 1.0.0
 * Description: Express routes for querying duty veterinarians and open 30-min time slots.
 */

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

