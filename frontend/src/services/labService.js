// MSSV:HE191405-Họ và tên: Nguyễn Hoàng Nam
import apiClient from './apiClient';

/**
 * Paraclinical Laboratory Frontend Service
 * Supporting UC-LAB-01, UC-LAB-02
 */

// Get hospital diagnostic laboratory test catalog
export const getLabCatalog = async () => {
  const response = await apiClient.get('/lab/catalog');
  return response.data;
};

// LAB-02: Get Laboratory Work Queue orders
export const getLabOrders = async (params = {}) => {
  const response = await apiClient.get('/lab/orders', { params });
  return response.data;
};

// Get single lab order detail
export const getLabOrderById = async (id) => {
  const response = await apiClient.get(`/lab/orders/${id}`);
  return response.data;
};

// LAB-01: Issue Paraclinical Lab Order
export const issueLabOrder = async (orderData) => {
  const response = await apiClient.post('/lab/orders', orderData);
  return response.data;
};

// LAB-02: Process Lab Order & Submit Measured Results
export const processLabOrder = async (id, payload) => {
  const response = await apiClient.patch(`/lab/orders/${id}`, payload);
  return response.data;
};

const labService = {
  getLabCatalog,
  getLabOrders,
  getLabOrderById,
  issueLabOrder,
  processLabOrder,
};

export default labService;
