const scheduleService = require('../services/ScheduleService');

class ScheduleController {
  /**
   * GET /api/schedule/veterinarians
   * Sequence Diagram 1: 3.1: getVeterinariansAndDates()
   */
  async getVeterinariansAndDates(req, res, next) {
    try {
      const data = await scheduleService.getVeterinariansAndDates();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/schedule/slots
   * Sequence Diagram 1 & 3: 4.1: getAvailableSlots(vetId, date)
   */
  async getAvailableSlots(req, res, next) {
    try {
      const { vetId, date } = req.query;
      const slots = await scheduleService.getAvailableSlots(vetId, date);
      res.status(200).json({
        success: true,
        data: slots,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ScheduleController();

