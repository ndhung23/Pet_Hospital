const triageService = require('../services/triage.service');
const { successResponse } = require('../utils/response');

/**
 * Get on-duty Vets & on-call Managers
 */
const getVets = async (req, res, next) => {
  try {
    const data = await triageService.getOnDutyVets();
    return successResponse(res, 200, 'On-duty clinical personnel retrieved', data);
  } catch (error) {
    next(error);
  }
};

/**
 * Search registered owner or pet
 */
const searchOwnerOrPet = async (req, res, next) => {
  try {
    const query = req.query.q || '';
    const results = await triageService.searchOwnerOrPet(query);
    return successResponse(res, 200, 'Search completed', results);
  } catch (error) {
    next(error);
  }
};

/**
 * UC-EMG-01: Emergency Triage Intake
 */
const createTriage = async (req, res, next) => {
  try {
    const result = await triageService.createEmergencyTriage(req.user, req.body);
    return successResponse(res, 201, 'Emergency case admitted and routed to priority queue', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get active Priority Emergency Queue (BR-04)
 */
const getEmergencyQueue = async (req, res, next) => {
  try {
    // If vet requests queue, can filter by vetId or see whole clinic emergency queue
    const vetId = req.query.vetId || (req.user.role === 'VETERINARIAN' ? req.user.id : null);
    const queue = await triageService.getEmergencyQueue(vetId);
    return successResponse(res, 200, 'Priority emergency queue loaded', queue);
  } catch (error) {
    next(error);
  }
};

/**
 * Veterinarian accepts emergency case
 */
const acceptEmergencyCase = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const updated = await triageService.acceptEmergencyCase(req.user, appointmentId);
    return successResponse(res, 200, 'Emergency case accepted. Proceeding to clinical examination.', updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVets,
  searchOwnerOrPet,
  createTriage,
  getEmergencyQueue,
  acceptEmergencyCase,
};
