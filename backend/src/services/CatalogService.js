/**
 * File: CatalogService.js
 * Module: Service Catalog Logic (Supporting UC-BOOK-01 Step 2)
 * Author: he194418-NhacTuanAnh
 * Date: 09/11/2026
 * Version: 1.0.0
 * Description: Service for filtering and retrieving care services tailored to pet species and size.
 */

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

