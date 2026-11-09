/**
 * File: PetService.js
 * Module: Pet Business Logic (UC-PET-01, UC-PET-02, UC-PET-03, UC-PET-04)
 * Author: he194418-NhacTuanAnh
 * Date: 09/11/2026
 * Version: 1.0.0
 * Description: Implements pet validations (Exception 4.0.E1), ownership verification, and pet profile management.
 */

const petRepository = require('../repositories/PetRepository');
const AppError = require('../utils/AppError');

class PetService {
  /**
   * UC-PET-04: View Pet List
   * Corresponds to Sequence Diagram: getPets(ownerId) -> findPetsByOwner(ownerId)
   */
  async getPets(ownerId, user = null) {
    // If user is a Pet Owner, enforce querying their own pets
    const targetOwnerId = user && user.role === 'PET_OWNER' ? user.id : ownerId;
    if (!targetOwnerId) {
      throw new AppError('ownerId is required to retrieve pets', 400, null, 'MISSING_OWNER_ID');
    }
    return petRepository.findPetsByOwner(targetOwnerId);
  }

  /**
   * UC-PET-01: Add Pet Profile
   * Corresponds to Sequence Diagram: addPet(ownerId, petDetails)
   */
  async addPet(ownerId, petDetails, user = null) {
    const targetOwnerId = user && user.role === 'PET_OWNER' ? user.id : ownerId;
    if (!targetOwnerId) {
      throw new AppError('ownerId is required', 400, null, 'MISSING_OWNER_ID');
    }

    // 2.1.1.1: validatePetData(petDetails)
    this.validatePetData(petDetails);

    // 2.1.1.2: savePetProfile(ownerId, petDetails)
    return this.savePetProfile(targetOwnerId, petDetails);
  }

  /**
   * Exception 4.0.E1: Validation rules for Pet Profile data
   * name & species mandatory, weight > 0, dob cannot be in the future
   */
  validatePetData(petDetails) {
    const errors = [];

    if (!petDetails) {
      throw new AppError('Pet details are required', 400, [{ field: 'general', message: 'Payload is empty' }], 'INVALID_PET_DATA');
    }

    if (!petDetails.name || typeof petDetails.name !== 'string' || !petDetails.name.trim()) {
      errors.push({ field: 'name', message: 'Pet name is required' });
    }

    if (!petDetails.species || typeof petDetails.species !== 'string' || !petDetails.species.trim()) {
      errors.push({ field: 'species', message: 'Species is required' });
    }

    if (petDetails.weight !== undefined && petDetails.weight !== null && petDetails.weight !== '') {
      const weightNum = Number(petDetails.weight);
      if (isNaN(weightNum) || weightNum <= 0) {
        errors.push({ field: 'weight', message: 'Weight must be a positive number greater than 0' });
      }
    }

    if (petDetails.dob) {
      const dobDate = new Date(petDetails.dob);
      if (isNaN(dobDate.getTime())) {
        errors.push({ field: 'dob', message: 'Date of birth is invalid' });
      } else if (dobDate > new Date()) {
        errors.push({ field: 'dob', message: 'Date of birth cannot be in the future' });
      }
    }

    if (errors.length > 0) {
      // Exception 4.0.E1: Return validation errors
      throw new AppError('Invalid pet profile data provided', 400, errors, 'INVALID_PET_DATA');
    }
  }

  /**
   * Sequence Diagram: savePetProfile(ownerId, petDetails) -> insertPet(ownerId, petDetails)
   */
  async savePetProfile(ownerId, petDetails) {
    return petRepository.insertPet(ownerId, petDetails);
  }

  /**
   * UC-PET-02: Update Pet Profile
   */
  async updatePetProfile(petId, petDetails, user = null) {
    const pet = await petRepository.findPetById(petId);
    if (!pet) {
      throw new AppError('Pet profile not found', 404, null, 'PET_NOT_FOUND');
    }

    // RBAC: Pet Owner can only update their own pets
    if (user && user.role === 'PET_OWNER' && pet.ownerId !== user.id) {
      throw new AppError('Access denied: You cannot modify pet profiles owned by another user', 403, null, 'FORBIDDEN');
    }

    this.validatePetData(petDetails);

    const updatePayload = {
      name: petDetails.name.trim(),
      species: petDetails.species.trim(),
      breed: petDetails.breed !== undefined ? petDetails.breed.trim() : pet.breed,
      dob: petDetails.dob !== undefined ? petDetails.dob : pet.dob,
      gender: petDetails.gender !== undefined ? petDetails.gender : pet.gender,
      weight: petDetails.weight !== undefined && petDetails.weight !== '' ? Number(petDetails.weight) : pet.weight,
      history: petDetails.history !== undefined ? petDetails.history.trim() : pet.history,
    };

    return petRepository.updatePet(petId, updatePayload);
  }

  /**
   * UC-PET-03: Soft-Delete Pet Profile (isDeleted = true)
   */
  async softDeletePetProfile(petId, user = null) {
    const pet = await petRepository.findPetById(petId);
    if (!pet) {
      throw new AppError('Pet profile not found', 404, null, 'PET_NOT_FOUND');
    }

    // RBAC: Pet Owner can only delete their own pets
    if (user && user.role === 'PET_OWNER' && pet.ownerId !== user.id) {
      throw new AppError('Access denied: You cannot delete pet profiles owned by another user', 403, null, 'FORBIDDEN');
    }

    return petRepository.softDeletePet(petId);
  }
}

module.exports = new PetService();

