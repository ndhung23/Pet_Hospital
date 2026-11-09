/**
 * File: catalogService.js
 * Module: Catalog API Client Service
 * Author: he194418-NhacTuanAnh
 * Date: 09/11/2026
 * Version: 1.0.0
 * Description: Frontend HTTP client functions for retrieving care services.
 */

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

