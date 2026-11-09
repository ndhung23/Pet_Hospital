// MSSV:HE191405-Họ và tên: Nguyễn Hoàng Nam
import apiClient from './apiClient';

/**
 * EMR (Electronic Medical Record) Frontend Service
 * Supporting UC-EMR-01, UC-EMR-02, UC-EMR-03
 */

// Get ICD-Vet Diagnoses Catalog
export const getDiagnosisCatalog = async () => {
  const response = await apiClient.get('/emr/catalog');
  return response.data;
};

// Get Patients list for examination intake
export const getPatients = async (search = '') => {
  const response = await apiClient.get('/emr/patients', {
    params: { search },
  });
  return response.data;
};

// EMR-02: View Medical Record List
export const getMedicalRecords = async (params = {}) => {
  const response = await apiClient.get('/emr', { params });
  return response.data;
};

// EMR-03: View Medical Record Detail
export const getMedicalRecordById = async (id) => {
  const response = await apiClient.get(`/emr/${id}`);
  return response.data;
};

// EMR-01: Conduct Examination & Create EMR Record
export const conductExamination = async (examData) => {
  const response = await apiClient.post('/emr', examData);
  return response.data;
};

// Update existing EMR record (within 24h)
export const updateMedicalRecord = async (id, updateData) => {
  const response = await apiClient.patch(`/emr/${id}`, updateData);
  return response.data;
};

const emrService = {
  getDiagnosisCatalog,
  getPatients,
  getMedicalRecords,
  getMedicalRecordById,
  conductExamination,
  updateMedicalRecord,
};

export default emrService;
