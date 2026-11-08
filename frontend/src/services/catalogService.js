import apiClient from './apiClient';

export const catalogService = {
  getServices: async (species, size) => {
    const params = {};
    if (species) params.species = species;
    if (size) params.size = size;
    const res = await apiClient.get('/catalog/services', { params });
    return res.data.data;
  },
};

export default catalogService;

