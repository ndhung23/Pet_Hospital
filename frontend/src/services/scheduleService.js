import apiClient from './apiClient';

export const scheduleService = {
  // Get active hospital staff
  getStaff: async () => {
    const { data } = await apiClient.get('/schedules/staff');
    return data.data;
  },

  // Get weekly schedule
  getWeeklySchedule: async ({ startDate, endDate, role } = {}) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (role) params.append('role', role);

    const { data } = await apiClient.get(`/schedules/week?${params.toString()}`);
    return data.data;
  },

  // AI-powered schedule generator
  generateAiSchedule: async ({ startDate, customInstructions }) => {
    const { data } = await apiClient.post('/schedules/ai-generate', {
      startDate,
      customInstructions,
    });
    return data.data;
  },

  // Publish / save shifts
  publishSchedule: async ({ shifts, replaceExisting = true }) => {
    const { data } = await apiClient.post('/schedules/publish', {
      shifts,
      replaceExisting,
    });
    return data.data;
  },

  // Get personal shifts for logged in employee
  getMyShifts: async () => {
    const { data } = await apiClient.get('/schedules/my');
    return data.data;
  },
};
