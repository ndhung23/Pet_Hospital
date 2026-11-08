const petService = require('../services/PetService');

class PetController {
  /**
   * GET /api/pets
   * Sequence Diagram 1: 1.1: getPets(ownerId) -> 1.1.1: getPets(ownerId)
   * UC-PET-04: View Pet List
   */
  async getPets(req, res, next) {
    try {
      const ownerId = req.query.ownerId || req.user?.id;
      const pets = await petService.getPets(ownerId, req.user);
      res.status(200).json({
        success: true,
        data: pets,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/pets
   * Sequence Diagram 4: 2.1: addPet(ownerId, petDetails) -> 2.1.1: addPet(...)
   * UC-PET-01: Add Pet Profile
   */
  async addPet(req, res, next) {
    try {
      const ownerId = req.body.ownerId || req.user?.id;
      const petDetails = {
        name: req.body.name,
        species: req.body.species,
        breed: req.body.breed,
        dob: req.body.dob,
        gender: req.body.gender,
        weight: req.body.weight,
        history: req.body.history,
      };

      const newPet = await petService.addPet(ownerId, petDetails, req.user);
      res.status(201).json({
        success: true,
        message: 'Pet profile created successfully',
        data: newPet,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/pets/:id
   * UC-PET-02: Update Pet Profile
   */
  async updatePet(req, res, next) {
    try {
      const { id } = req.params;
      const updatedPet = await petService.updatePetProfile(id, req.body, req.user);
      res.status(200).json({
        success: true,
        message: 'Pet profile updated successfully',
        data: updatedPet,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/pets/:id
   * UC-PET-03: Soft-Delete Pet Profile
   */
  async deletePet(req, res, next) {
    try {
      const { id } = req.params;
      const deletedPet = await petService.softDeletePetProfile(id, req.user);
      res.status(200).json({
        success: true,
        message: 'Pet profile deleted successfully (soft-delete)',
        data: deletedPet,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PetController();

