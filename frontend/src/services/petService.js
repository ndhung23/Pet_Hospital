/**
 * File: petService.js
 * Module: Pet API Client Service
 * Author: he194418-NhacTuanAnh
 * Date: 09/11/2026
 * Version: 1.0.0
 * Description: Frontend HTTP client functions for pet CRUD endpoints.
 */

import apiClient from './apiClient';

export const petService = {
  // UC-PET-04: View Pet List
  getPets: async (ownerId) => {
    const params = ownerId ? { ownerId } : {};
    const res = await apiClient.get('/pets', { params });
    return res.data.data;
  },

  // UC-PET-01: Add Pet Profile
  addPet: async (petData) => {
    const res = await apiClient.post('/pets', petData);
    return res.data;
  },

  // UC-PET-02: Update Pet Profile
  updatePet: async (id, petData) => {
    const res = await apiClient.patch(`/pets/${id}`, petData);
    return res.data;
  },

  // UC-PET-03: Soft-Delete Pet Profile
  deletePet: async (id) => {
    const res = await apiClient.delete(`/pets/${id}`);
    return res.data;
  },
};

export default petService;

