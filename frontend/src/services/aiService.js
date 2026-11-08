import apiClient from './apiClient';

export const aiService = {
  // UC-AI-01: Load Chat History
  getHistory: async (limit = 50) => {
    const { data } = await apiClient.get(`/ai/chat?limit=${limit}`);
    return data.data;
  },

  // UC-AI-01: Consult Gemini AI Advisor
  askAi: async ({ message, petId }) => {
    const { data } = await apiClient.post('/ai/chat', { message, petId });
    return data.data;
  },
};
