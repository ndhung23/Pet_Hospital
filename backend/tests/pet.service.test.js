/**
 * File: pet.service.test.js
 * Module: PetService Unit Tests
 * Author: he194418-NhacTuanAnh
 * Date: 09/11/2026
 * Version: 1.0.0
 * Description: Jest automated tests verifying UC-PET-01, 02, 03, 04 and validation exceptions (Exception 4.0.E1).
 */

const petService = require('../src/services/PetService');
const petRepository = require('../src/repositories/PetRepository');

jest.mock('../src/repositories/PetRepository');

describe('PetService Unit Tests (UC-PET-01, 02, 03, 04)', () => {
  const mockOwnerId = 'owner-uuid-1234';
  const mockUser = { id: mockOwnerId, role: 'PET_OWNER' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('UC-PET-01: Add Pet Profile', () => {
    test('Normal Flow: creates pet profile when valid data is provided', async () => {
      const petDetails = {
        name: 'Milo',
        species: 'Dog',
        breed: 'Poodle',
        dob: '2023-01-01',
        gender: 'MALE',
        weight: 6.5,
        history: 'Healthy',
      };

      const createdRecord = { id: 'pet-1', ownerId: mockOwnerId, ...petDetails, isDeleted: false };
      petRepository.insertPet.mockResolvedValue(createdRecord);

      const result = await petService.addPet(mockOwnerId, petDetails, mockUser);

      expect(petRepository.insertPet).toHaveBeenCalledWith(mockOwnerId, petDetails);
      expect(result).toEqual(createdRecord);
    });

    test('Exception 4.0.E1: throws validation error when name is missing', async () => {
      const petDetails = {
        name: '',
        species: 'Dog',
        weight: 5,
      };

      await expect(petService.addPet(mockOwnerId, petDetails, mockUser)).rejects.toMatchObject({
        statusCode: 400,
        code: 'INVALID_PET_DATA',
        details: expect.arrayContaining([expect.objectContaining({ field: 'name' })]),
      });
    });

    test('Exception 4.0.E1: throws validation error when species is missing', async () => {
      const petDetails = {
        name: 'Fluffy',
        species: '',
      };

      await expect(petService.addPet(mockOwnerId, petDetails, mockUser)).rejects.toMatchObject({
        statusCode: 400,
        code: 'INVALID_PET_DATA',
        details: expect.arrayContaining([expect.objectContaining({ field: 'species' })]),
      });
    });

    test('Exception 4.0.E1: throws validation error when weight is <= 0', async () => {
      const petDetails = {
        name: 'Fluffy',
        species: 'Cat',
        weight: -2,
      };

      await expect(petService.addPet(mockOwnerId, petDetails, mockUser)).rejects.toMatchObject({
        statusCode: 400,
        code: 'INVALID_PET_DATA',
        details: expect.arrayContaining([expect.objectContaining({ field: 'weight' })]),
      });
    });

    test('Exception 4.0.E1: throws validation error when dob is in the future', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 2);

      const petDetails = {
        name: 'Fluffy',
        species: 'Cat',
        dob: futureDate.toISOString(),
      };

      await expect(petService.addPet(mockOwnerId, petDetails, mockUser)).rejects.toMatchObject({
        statusCode: 400,
        code: 'INVALID_PET_DATA',
        details: expect.arrayContaining([expect.objectContaining({ field: 'dob' })]),
      });
    });
  });

  describe('UC-PET-04: View Pet List', () => {
    test('Normal Flow: returns pet list for the owner', async () => {
      const mockPets = [
        { id: 'pet-1', name: 'Lucky', species: 'Dog', isDeleted: false },
        { id: 'pet-2', name: 'Mimi', species: 'Cat', isDeleted: false },
      ];
      petRepository.findPetsByOwner.mockResolvedValue(mockPets);

      const result = await petService.getPets(mockOwnerId, mockUser);

      expect(petRepository.findPetsByOwner).toHaveBeenCalledWith(mockOwnerId);
      expect(result).toHaveLength(2);
    });
  });

  describe('UC-PET-02: Update Pet Profile', () => {
    test('Normal Flow: updates pet details when valid', async () => {
      const petId = 'pet-1';
      const existing = { id: petId, ownerId: mockOwnerId, name: 'Lucky', species: 'Dog' };
      petRepository.findPetById.mockResolvedValue(existing);

      const updated = { ...existing, name: 'Lucky Boy', weight: 29 };
      petRepository.updatePet.mockResolvedValue(updated);

      const result = await petService.updatePetProfile(
        petId,
        { name: 'Lucky Boy', species: 'Dog', weight: 29 },
        mockUser
      );

      expect(result.name).toBe('Lucky Boy');
      expect(petRepository.updatePet).toHaveBeenCalled();
    });

    test('RBAC: Pet Owner cannot update pets belonging to another user', async () => {
      const petId = 'pet-1';
      const existing = { id: petId, ownerId: 'other-user-uuid', name: 'Other Pet', species: 'Dog' };
      petRepository.findPetById.mockResolvedValue(existing);

      await expect(
        petService.updatePetProfile(petId, { name: 'Hacked', species: 'Dog' }, mockUser)
      ).rejects.toMatchObject({
        statusCode: 403,
      });
    });
  });

  describe('UC-PET-03: Soft-Delete Pet Profile', () => {
    test('Normal Flow: sets isDeleted = true', async () => {
      const petId = 'pet-1';
      const existing = { id: petId, ownerId: mockOwnerId, name: 'Lucky', isDeleted: false };
      petRepository.findPetById.mockResolvedValue(existing);
      petRepository.softDeletePet.mockResolvedValue({ ...existing, isDeleted: true });

      const result = await petService.softDeletePetProfile(petId, mockUser);

      expect(result.isDeleted).toBe(true);
      expect(petRepository.softDeletePet).toHaveBeenCalledWith(petId);
    });
  });
});

