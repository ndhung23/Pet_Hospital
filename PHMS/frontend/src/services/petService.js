import axios from "axios";

const API_URL = "http://localhost:5000/api/pets";

export const getAllPets = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const updatePet = async (id, petData) => {
    const response = await axios.put(
        `${API_URL}/${id}`,
        petData
    );

    return response.data;
};

export const softDeletePet = async (id) => {
    const response = await axios.patch(
        `${API_URL}/${id}/soft-delete`
    );

    return response.data;
};