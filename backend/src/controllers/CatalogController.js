const catalogService = require('../services/CatalogService');

class CatalogController {
  /**
   * GET /api/catalog/services
   * Sequence Diagram 1: 2.1: getServices(petId) -> 2.1.1: getServices(species, size)
   */
  async getServices(req, res, next) {
    try {
      const { species, size } = req.query;
      const services = await catalogService.getServices(species, size);
      res.status(200).json({
        success: true,
        data: services,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CatalogController();

