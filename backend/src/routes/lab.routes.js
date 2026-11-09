const express = require('express');
const labController = require('../controllers/lab.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { createLabOrderSchema, processLabOrderSchema } = require('../validators/lab.validator');

const router = express.Router();

// All lab routes require authentication
router.use(authenticate);

// Laboratory diagnostic catalog lookup
router.get('/catalog', labController.getCatalog);

// LAB-02: Laboratory Work Queue
router.get('/orders', labController.getOrders);

// Get single lab order detail
router.get('/orders/:id', labController.getOrderById);

// LAB-01: Issue Paraclinical Lab Order
router.post(
  '/orders',
  authorize('VETERINARIAN', 'CLINIC_MANAGER'),
  validate(createLabOrderSchema),
  labController.createOrder
);

// LAB-02: Process Lab Order & Submit Results
router.patch(
  '/orders/:id',
  authorize('NURSE', 'VETERINARIAN', 'CLINIC_MANAGER'),
  validate(processLabOrderSchema),
  labController.processOrder
);

module.exports = router;

