import apiClient from './apiClient';

export const scheduleService = {
  getVeterinariansAndDates: async () => {
    const res = await apiClient.get('/schedule/veterinarians');
    return res.data.data;
  },

  getAvailableSlots: async (vetId, date) => {
    const params = {};
    if (vetId) params.vetId = vetId;
    if (date) params.date = date;
    const res = await apiClient.get('/schedule/slots', { params });
    return res.data.data;
  },
};

export default scheduleService;

