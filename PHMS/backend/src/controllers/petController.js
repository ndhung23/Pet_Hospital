const petModel = require("../models/petModel");

const getAllPets = async (req, res) => {
    try {
        const pets = await petModel.getAllPets();

        res.status(200).json({
            success: true,
            data: pets
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to get pets"
        });
    }
};

const updatePet = async (req, res) => {
    try {
        const petId = parseInt(req.params.id);

        if (!Number.isInteger(petId) || petId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid pet ID"
            });
        }

        const petData = req.body;

        if (!petData || Object.keys(petData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No data provided"
            });
        }

        const updatedPet = await petModel.updatePet(
            petId,
            petData
        );

        if (!updatedPet) {
            return res.status(404).json({
                success: false,
                message: "Pet not found or no valid fields provided"
            });
        }

        res.status(200).json({
            success: true,
            message: "Pet profile updated successfully",
            data: updatedPet
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update pet profile"
        });
    }
};

const softDeletePet = async (req, res) => {
    try {
        const petId = parseInt(req.params.id);

        if (!Number.isInteger(petId) || petId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid pet ID"
            });
        }

        const deletedPet = await petModel.softDeletePet(petId);

        if (!deletedPet) {
            return res.status(404).json({
                success: false,
                message: "Pet not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Pet profile deleted successfully",
            data: deletedPet
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete pet profile"
        });
    }
};

module.exports = {
    getAllPets,
    updatePet,
    softDeletePet
};