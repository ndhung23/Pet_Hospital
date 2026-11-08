const express = require('express');
const profileController = require('../controllers/profile.controller');
const authenticate = require('../middlewares/authenticate');
const validate = require('../middlewares/validate');
const { updateProfileSchema } = require('../validators/profile.validator');

const router = express.Router();

// Apply authentication to all profile routes
router.use(authenticate);

// UC-AUTH-04: View Profile
router.get('/me', profileController.getProfile);

// UC-AUTH-05: Update Profile
router.patch('/me', validate(updateProfileSchema), profileController.updateProfile);

module.exports = router;
