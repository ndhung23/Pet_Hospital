/**
 * File: CatalogRepository.js
 * Module: Catalog Data Access (Repository Pattern)
 * Author: he194418-NhacTuanAnh
 * Date: 09/11/2026
 * Version: 1.0.0
 * Description: Sole database access layer for Service catalog queries via Prisma ORM.
 */

const prisma = require('../config/prisma');

class CatalogRepository {
  /**
   * Find services filtered by species and size
   * Corresponds to Sequence Diagram: findServices(species, size) -> queryServices(species, size)
   */
  async findServices(species, size) {
    const where = { active: true };

    if (species && species !== 'All') {
      where.species = { in: [species, 'All'] };
    }

    if (size && size !== 'All') {
      where.size = { in: [size, 'All'] };
    }

    return prisma.service.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Find a service by its ID
   */
  async findServiceById(serviceId) {
    return prisma.service.findUnique({
      where: { id: serviceId },
    });
  }
}

module.exports = new CatalogRepository();
