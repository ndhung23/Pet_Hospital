
import { useEffect, useState } from "react";
import { getAllPets, softDeletePet } from "../services/petService";

function PetList({ onEdit, refresh }) {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadPets = async () => {
        try {
            setLoading(true);
            const result = await getAllPets();
            setPets(result.data || []);
            setError("");
        } catch (err) {
            setError("Cannot load pet list. Please check Backend.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPets();
    }, [refresh]);

    const handleDelete = async (petId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this pet profile?"
        );

        if (!confirmed) return;

        try {
            await softDeletePet(petId);
            alert("Pet profile deleted successfully!");
            loadPets();
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Failed to delete pet profile."
            );
        }
    };

    if (loading) return <p>Loading pets...</p>;

    return (
        <div className="pet-container">
            <h2>Pet Management</h2>

            {error && <p className="error">{error}</p>}

            {pets.length === 0 ? (
                <p>No active pets found.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Pet Name</th>
                            <th>Species</th>
                            <th>Breed</th>
                            <th>Age</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {pets.map((pet) => (
                            <tr key={pet.pet_id}>
                                <td>{pet.pet_id}</td>
                                <td>{pet.pet_name}</td>
                                <td>{pet.species}</td>
                                <td>{pet.breed}</td>
                                <td>{pet.age}</td>
                                <td>
                                    <button
                                        onClick={() => onEdit(pet)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="delete-btn"
                                        onClick={() =>
                                            handleDelete(pet.pet_id)
                                        }
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default PetList;
