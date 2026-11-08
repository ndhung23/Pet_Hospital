const express = require("express");
const router = express.Router();

const petController = require("../controllers/petController");

router.get("/", petController.getAllPets);

router.put("/:id", petController.updatePet);

router.patch("/:id/soft-delete", petController.softDeletePet);

module.exports = router;