import apiClient from './apiClient';

export const appointmentService = {
  // UC-BOOK-01: Book Appointment Online
  createAppointment: async (appointmentData) => {
    const res = await apiClient.post('/appointments', appointmentData);
    return res.data;
  },

  // UC-BOOK-05: View Appointment List
  getAppointments: async (ownerId) => {
    const params = ownerId ? { ownerId } : {};
    const res = await apiClient.get('/appointments', { params });
    return res.data.data;
  },

  // UC-BOOK-04 step 1: Query reschedule options
  getRescheduleOptions: async (appointmentId) => {
    const res = await apiClient.get(`/appointments/${appointmentId}/reschedule-options`);
    return res.data.data;
  },

  // UC-BOOK-04 step 2: Reschedule appointment
  rescheduleAppointment: async (appointmentId, newSlot) => {
    const res = await apiClient.patch(`/appointments/${appointmentId}/reschedule`, { newSlot });
    return res.data;
  },

  // UC-BOOK-03: Cancel Appointment
  cancelAppointment: async (appointmentId) => {
    const res = await apiClient.patch(`/appointments/${appointmentId}/cancel`);
    return res.data;
  },
};

export default appointmentService;

