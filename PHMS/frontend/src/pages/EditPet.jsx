
import { useEffect, useState } from "react";
import { updatePet } from "../services/petService";

function EditPet({ pet, onCancel, onUpdated }) {
    const [formData, setFormData] = useState({
        pet_name: "",
        species: "",
        breed: "",
        age: "",
        gender: "",
        weight: ""
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (pet) {
            setFormData({
                pet_name: pet.pet_name || "",
                species: pet.species || "",
                breed: pet.breed || "",
                age: pet.age ?? "",
                gender: pet.gender || "",
                weight: pet.weight ?? ""
            });
        }
    }, [pet]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const data = {
                ...formData,
                age: formData.age === "" ? null : Number(formData.age),
                weight: formData.weight === ""
                    ? null
                    : Number(formData.weight)
            };

            await updatePet(pet.pet_id, data);

            alert("Pet profile updated successfully!");
            onUpdated();
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Failed to update pet profile."
            );
        } finally {
            setLoading(false);
        }
    };

    if (!pet) return null;

    return (
        <div className="edit-container">
            <h2>Update Pet Profile</h2>

            <form onSubmit={handleSubmit}>
                <label>Pet Name</label>
                <input
                    name="pet_name"
                    value={formData.pet_name}
                    onChange={handleChange}
                    required
                />

                <label>Species</label>
                <input
                    name="species"
                    value={formData.species}
                    onChange={handleChange}
                    required
                />

                <label>Breed</label>
                <input
                    name="breed"
                    value={formData.breed}
                    onChange={handleChange}
                />

                <label>Age</label>
                <input
                    type="number"
                    name="age"
                    min="0"
                    value={formData.age}
                    onChange={handleChange}
                />

                <label>Gender</label>
                <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>

                <label>Weight (kg)</label>
                <input
                    type="number"
                    step="0.1"
                    min="0"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                />

                <div className="form-actions">
                    <button type="submit" disabled={loading}>
                        {loading ? "Updating..." : "Update Pet"}
                    </button>

                    <button
                        type="button"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditPet;
