const express = require('express');
const petController = require('../controllers/PetController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

// All pet routes require authentication
router.use(authenticate);

// GET /api/pets - UC-PET-04: View Pet List
router.get('/', (req, res, next) => petController.getPets(req, res, next));

// POST /api/pets - UC-PET-01: Add Pet Profile
router.post('/', (req, res, next) => petController.addPet(req, res, next));

// PATCH /api/pets/:id - UC-PET-02: Update Pet Profile
router.patch('/:id', (req, res, next) => petController.updatePet(req, res, next));

// DELETE /api/pets/:id - UC-PET-03: Soft-Delete Pet Profile
router.delete('/:id', (req, res, next) => petController.deletePet(req, res, next));

module.exports = router;

