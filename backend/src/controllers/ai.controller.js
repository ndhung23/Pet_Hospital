const aiService = require('../services/ai.service');
const { successResponse } = require('../utils/response');

/**
 * UC-AI-01: Get user's AI Chat History
 */
const getHistory = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const history = await aiService.getChatHistory(req.user.id, limit);
    return successResponse(res, 200, 'Chat history loaded successfully', history);
  } catch (error) {
    next(error);
  }
};

/**
 * UC-AI-01: Consult Gemini AI Advisor
 */
const askAi = async (req, res, next) => {
  try {
    const { message, petId } = req.body;
    const result = await aiService.consultAi({
      userId: req.user.id,
      message,
      petId,
    });
    return successResponse(res, 200, 'AI consultation completed', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Public AI consultation for visitors
 */
const publicAskAi = async (req, res, next) => {
  try {
    const { message, petType } = req.body;
    const result = await aiService.consultAiGuest({
      message,
      petType,
    });
    return successResponse(res, 200, 'AI consultation completed', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHistory,
  askAi,
  publicAskAi,
};
