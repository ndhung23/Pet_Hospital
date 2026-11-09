/**
 * File: appointment.routes.js
 * Module: Appointment Route Definitions (UC-BOOK-01, 03, 04, 05)
 * Author: he194418-NhacTuanAnh
 * Date: 09/11/2026
 * Version: 1.0.0
 * Description: Express routes connecting appointment HTTP endpoints to AppointmentController methods.
 */

const express = require('express');
const appointmentController = require('../controllers/AppointmentController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

// All appointment routes require authentication
router.use(authenticate);

// POST /api/appointments - UC-BOOK-01: Book Appointment Online
router.post('/', (req, res, next) => appointmentController.createAppointment(req, res, next));

// GET /api/appointments - UC-BOOK-05: View Appointment List
router.get('/', (req, res, next) => appointmentController.getAppointments(req, res, next));

// GET /api/appointments/:id/reschedule-options - UC-BOOK-04 step 1: Query reschedule options
router.get('/:id/reschedule-options', (req, res, next) =>
  appointmentController.getRescheduleOptions(req, res, next)
);

// PATCH /api/appointments/:id/reschedule - UC-BOOK-04 step 2: Reschedule Appointment
router.patch('/:id/reschedule', (req, res, next) =>
  appointmentController.rescheduleAppointment(req, res, next)
);

// PATCH /api/appointments/:id/cancel - UC-BOOK-03: Cancel Appointment
router.patch('/:id/cancel', (req, res, next) =>
  appointmentController.cancelAppointment(req, res, next)
);

module.exports = router;

