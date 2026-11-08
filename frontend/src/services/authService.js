import apiClient, { setAccessToken } from './apiClient';

export const authService = {
  // UC-AUTH-01: Initiate registration
  register: async (payload) => {
    const { data } = await apiClient.post('/auth/register', payload);
    return data;
  },

  // UC-AUTH-01: Verify registration OTP
  verifyRegisterOtp: async ({ email, otp }) => {
    const { data } = await apiClient.post('/auth/register/verify-otp', { email, otp });
    return data;
  },

  // Resend OTP
  resendOtp: async ({ email, purpose }) => {
    const { data } = await apiClient.post('/auth/resend-otp', { email, purpose });
    return data;
  },

  // UC-AUTH-02: Login
  login: async ({ identifier, password }) => {
    const { data } = await apiClient.post('/auth/login', { identifier, password });
    if (data.data?.accessToken) {
      setAccessToken(data.data.accessToken);
    }
    return data.data;
  },

  // UC-AUTH-02: Refresh session
  refresh: async () => {
    const { data } = await apiClient.post('/auth/refresh');
    if (data.data?.accessToken) {
      setAccessToken(data.data.accessToken);
    }
    return data.data;
  },

  // UC-AUTH-02: Logout
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      setAccessToken(null);
    }
  },

  // UC-AUTH-03: Forgot password
  forgotPassword: async ({ email }) => {
    const { data } = await apiClient.post('/auth/forgot-password', { email });
    return data;
  },

  // UC-AUTH-03: Reset password via OTP
  resetPassword: async ({ email, otp, newPassword, confirmPassword }) => {
    const { data } = await apiClient.post('/auth/reset-password', {
      email,
      otp,
      newPassword,
      confirmPassword,
    });
    return data;
  },
};
