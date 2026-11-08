const express = require('express');
const triageController = require('../controllers/triage.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { emergencyTriageSchema } = require('../validators/triage.validator');

const router = express.Router();

router.use(authenticate);

// Search owner / pet for emergency registration
router.get('/search', triageController.searchOwnerOrPet);

// List on-duty veterinarians
router.get('/vets', triageController.getVets);

// UC-EMG-01: Submit emergency triage (Receptionist, Clinic Manager)
router.post(
  '/intake',
  authorize('RECEPTIONIST', 'CLINIC_MANAGER'),
  validate(emergencyTriageSchema),
  triageController.createTriage
);

// Priority Emergency Queue view (All clinical staff)
router.get(
  '/queue',
  authorize('VETERINARIAN', 'RECEPTIONIST', 'NURSE', 'CLINIC_MANAGER'),
  triageController.getEmergencyQueue
);

// Accept Emergency Case / Start Examination (Veterinarian, Clinic Manager)
router.patch(
  '/:appointmentId/accept',
  authorize('VETERINARIAN', 'CLINIC_MANAGER'),
  triageController.acceptEmergencyCase
);

module.exports = router;
