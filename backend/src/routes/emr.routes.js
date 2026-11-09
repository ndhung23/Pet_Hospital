// MSSV:HE191405-Họ và tên: Nguyễn Hoàng Nam
const express = require('express');
const emrController = require('../controllers/emr.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { createEmrSchema, updateEmrSchema } = require('../validators/emr.validator');

const router = express.Router();

// All EMR routes require authentication
router.use(authenticate);

// Diagnosis catalog lookup
router.get('/catalog', emrController.getCatalog);

// Patient list for clinical examination intake
router.get(
  '/patients',
  authorize('VETERINARIAN', 'NURSE', 'CLINIC_MANAGER', 'RECEPTIONIST'),
  emrController.getPatients
);

// EMR-02: View Medical Record List
router.get('/', emrController.getRecords);

// EMR-03: View Medical Record Detail
router.get('/:id', emrController.getRecordById);

// EMR-01: Conduct Examination & EMR
router.post(
  '/',
  authorize('VETERINARIAN', 'CLINIC_MANAGER'),
  validate(createEmrSchema),
  emrController.createRecord
);

// Update Medical Record (subject to 24h immutability)
router.patch(
  '/:id',
  authorize('VETERINARIAN', 'CLINIC_MANAGER'),
  validate(updateEmrSchema),
  emrController.updateRecord
);

module.exports = router;

