const profileService = require('../services/profile.service');
const { successResponse } = require('../utils/response');

/**
 * UC-AUTH-04: View Profile
 */
const getProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getUserProfile(req.user.id);
    return successResponse(res, 200, 'Profile retrieved successfully', profile);
  } catch (error) {
    next(error);
  }
};

/**
 * UC-AUTH-05: Update Profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const updated = await profileService.updateUserProfile(req.user.id, req.body);
    return successResponse(res, 200, 'Profile updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
