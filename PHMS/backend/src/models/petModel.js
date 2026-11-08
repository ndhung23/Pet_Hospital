const pool = require("../config/db");

const getAllPets = async () => {
    const result = await pool.query(
            `SELECT * FROM pet_profile
         WHERE status = 'ACTIVE'
         ORDER BY pet_id DESC`
            );

    return result.rows;
};

const getPetById = async (petId) => {
    const result = await pool.query(
            `SELECT * FROM pet_profile
         WHERE pet_id = $1 AND status = 'ACTIVE'`,
            [petId]
            );

    return result.rows[0];
};

const updatePet = async (petId, petData) => {
    const allowedFields = [
        "pet_name",
        "species",
        "breed",
        "date_of_birth",
        "age",
        "gender",
        "weight",
        "allergies",
        "medical_history"
    ];

    const fields = Object.keys(petData)
            .filter(key => allowedFields.includes(key));

    if (fields.length === 0) {
        return null;
    }

    const values = fields.map(key => petData[key]);

    const setClause = fields
            .map((field, index) => `${field} = $${index + 1}`)
            .join(", ");

    values.push(petId);

    const result = await pool.query(
            `UPDATE pet_profile
         SET ${setClause}, updated_at = CURRENT_TIMESTAMP
         WHERE pet_id = $${values.length}
         AND status = 'ACTIVE'
         RETURNING *`,
            values
            );

    return result.rows[0];
};

const softDeletePet = async (petId) => {
    const result = await pool.query(
            `UPDATE pet_profile
         SET status = 'DELETED',
             updated_at = CURRENT_TIMESTAMP
         WHERE pet_id = $1
         AND status = 'ACTIVE'
         RETURNING *`,
            [petId]
            );

    return result.rows[0];
};

module.exports = {
    getAllPets,
    getPetById,
    updatePet,
    softDeletePet
};