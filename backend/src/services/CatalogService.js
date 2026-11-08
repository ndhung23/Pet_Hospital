const catalogRepository = require('../repositories/CatalogRepository');

class CatalogService {
  /**
   * Get care services tailored to species and size
   * Corresponds to Sequence Diagram: getServices(species, size) -> findServices(species, size)
   */
  async getServices(species, size) {
    return catalogRepository.findServices(species, size);
  }

  /**
   * Get service by ID
   */
  async getServiceById(serviceId) {
    return catalogRepository.findServiceById(serviceId);
  }
}

module.exports = new CatalogService();

