import apiClient from './apiClient';

export const triageService = {
  // Get active on-duty veterinarians
  getOnDutyVets: async () => {
    const { data } = await apiClient.get('/triage/vets');
    return data.data;
  },

  // Search existing owner or pet by query
  searchOwnerOrPet: async (query) => {
    const { data } = await apiClient.get(`/triage/search?q=${encodeURIComponent(query)}`);
    return data.data;
  },

  // UC-EMG-01: Submit Emergency Walk-In Intake
  createEmergencyTriage: async (payload) => {
    const { data } = await apiClient.post('/triage/intake', payload);
    return data.data;
  },

  // Get Priority Emergency Queue (BR-04)
  getEmergencyQueue: async (vetId = null) => {
    const url = vetId ? `/triage/queue?vetId=${vetId}` : '/triage/queue';
    const { data } = await apiClient.get(url);
    return data.data;
  },

  // Veterinarian accepts case and starts examination
  acceptEmergencyCase: async (appointmentId) => {
    const { data } = await apiClient.patch(`/triage/${appointmentId}/accept`);
    return data.data;
  },
};
