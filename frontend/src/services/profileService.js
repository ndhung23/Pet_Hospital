import apiClient from './apiClient';

export const profileService = {
  // UC-AUTH-04: View Profile
  getProfile: async () => {
    const { data } = await apiClient.get('/profile/me');
    return data.data;
  },

  // UC-AUTH-05: Update Profile
  updateProfile: async (updatePayload) => {
    const { data } = await apiClient.patch('/profile/me', updatePayload);
    return data.data;
  },
};
