const express = require('express');
const aiController = require('../controllers/ai.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { askAiSchema } = require('../validators/ai.validator');

const router = express.Router();

// Public endpoint for Landing Page / Guest quick triage
router.post('/public', validate(askAiSchema), aiController.publicAskAi);

// UC-AI-01: Authenticated AI Consultation with Pet Clinical History
router.use(authenticate, authorize('PET_OWNER', 'VETERINARIAN', 'RECEPTIONIST', 'CLINIC_MANAGER', 'NURSE'));

router.get('/chat', aiController.getHistory);
router.post('/chat', validate(askAiSchema), aiController.askAi);

module.exports = router;
