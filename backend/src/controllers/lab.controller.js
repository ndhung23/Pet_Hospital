const labService = require('../services/lab.service');
const { successResponse } = require('../utils/response');

/**
 * Get laboratory test catalog
 */
const getCatalog = (req, res) => {
  const catalog = labService.getCatalog();
  return successResponse(res, 200, 'Lab catalog retrieved successfully', catalog);
};

/**
 * LAB-02: Get lab orders queue
 */
const getOrders = async (req, res, next) => {
  try {
    const orders = await labService.getLabOrders(req.user, {
      status: req.query.status,
      urgency: req.query.urgency,
      search: req.query.search,
      petId: req.query.petId,
      recordId: req.query.recordId,
    });
    return successResponse(res, 200, 'Laboratory orders retrieved successfully', orders);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single lab order details
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await labService.getLabOrderById(req.params.id, req.user);
    return successResponse(res, 200, 'Lab order details retrieved successfully', order);
  } catch (error) {
    next(error);
  }
};

/**
 * LAB-01: Issue Paraclinical Lab Order
 */
const createOrder = async (req, res, next) => {
  try {
    const order = await labService.issueLabOrder(req.user.id, req.body);
    return successResponse(res, 201, 'Paraclinical lab order issued successfully', order);
  } catch (error) {
    next(error);
  }
};

/**
 * LAB-02: Process Lab Order & Results
 */
const processOrder = async (req, res, next) => {
  try {
    const order = await labService.processLabOrder(req.user.id, req.params.id, req.body);
    return successResponse(res, 200, 'Lab order processed and saved successfully', order);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCatalog,
  getOrders,
  getOrderById,
  createOrder,
  processOrder,
};

