const emrService = require('../services/emr.service');
const { successResponse } = require('../utils/response');

/**
 * Get diagnosis catalog
 */
const getCatalog = (req, res) => {
  const catalog = emrService.getDiagnosisCatalog();
  return successResponse(res, 200, 'Diagnoses catalog retrieved', catalog);
};

/**
 * Get available patients for examination
 */
const getPatients = async (req, res, next) => {
  try {
    const patients = await emrService.getPatients(req.query.search);
    return successResponse(res, 200, 'Patient list retrieved successfully', patients);
  } catch (error) {
    next(error);
  }
};

/**
 * EMR-02: View Medical Record List
 */
const getRecords = async (req, res, next) => {
  try {
    const records = await emrService.getMedicalRecords(req.user, {
      petId: req.query.petId,
      search: req.query.search,
      status: req.query.status,
    });
    return successResponse(res, 200, 'Medical records retrieved successfully', records);
  } catch (error) {
    next(error);
  }
};

/**
 * EMR-03: View Medical Record Detail
 */
const getRecordById = async (req, res, next) => {
  try {
    const record = await emrService.getMedicalRecordById(req.params.id, req.user);
    return successResponse(res, 200, 'Medical record detail retrieved successfully', record);
  } catch (error) {
    next(error);
  }
};

/**
 * EMR-01: Conduct Examination & EMR
 */
const createRecord = async (req, res, next) => {
  try {
    const record = await emrService.conductExamination(req.user.id, req.body);
    return successResponse(res, 201, 'EMR Examination completed and persisted successfully', record);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Medical Record (with 24h immutability enforcement)
 */
const updateRecord = async (req, res, next) => {
  try {
    const updated = await emrService.updateMedicalRecord(req.params.id, req.user.id, req.body);
    return successResponse(res, 200, 'Medical record updated successfully', updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCatalog,
  getPatients,
  getRecords,
  getRecordById,
  createRecord,
  updateRecord,
};

