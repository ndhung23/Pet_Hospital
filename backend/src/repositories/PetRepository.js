const prisma = require('../config/prisma');

class PetRepository {
  /**
   * Find all active pets owned by an owner
   * Corresponds to Sequence Diagram: findPetsByOwner(ownerId) -> queryPets(ownerId)
   */
  async findPetsByOwner(ownerId) {
    return prisma.pet.findMany({
      where: {
        ownerId,
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find a single active pet by ID
   */
  async findPetById(petId) {
    return prisma.pet.findFirst({
      where: {
        id: petId,
        isDeleted: false,
      },
    });
  }

  /**
   * Insert a new pet profile
   * Corresponds to Sequence Diagram: savePetProfile -> insertPet(ownerId, petDetails)
   */
  async insertPet(ownerId, petDetails) {
    return prisma.pet.create({
      data: {
        ownerId,
        name: petDetails.name,
        species: petDetails.species,
        breed: petDetails.breed || null,
        dob: petDetails.dob ? new Date(petDetails.dob) : null,
        gender: petDetails.gender || 'UNKNOWN',
        weight: petDetails.weight ? Number(petDetails.weight) : null,
        history: petDetails.history || null,
        isDeleted: false,
      },
    });
  }

  /**
   * Update an existing pet profile
   */
  async updatePet(petId, updateData) {
    const data = { ...updateData };
    if (data.dob) data.dob = new Date(data.dob);
    if (data.weight !== undefined && data.weight !== null && data.weight !== '') {
      data.weight = Number(data.weight);
    }

    return prisma.pet.update({
      where: { id: petId },
      data,
    });
  }

  /**
   * Soft-delete pet profile (sets isDeleted = true)
   */
  async softDeletePet(petId) {
    return prisma.pet.update({
      where: { id: petId },
      data: { isDeleted: true },
    });
  }
}

module.exports = new PetRepository();
