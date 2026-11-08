const express = require('express');
const aiController = require('../controllers/ai.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { askAiSchema } = require('../validators/ai.validator');

const router = express.Router();

// UC-AI-01: Only Authenticated Pet Owners can consult the Gemini AI Advisor
router.use(authenticate, authorize('PET_OWNER'));

router.get('/chat', aiController.getHistory);
router.post('/chat', validate(askAiSchema), aiController.askAi);

module.exports = router;
