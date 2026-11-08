import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import petService from '../services/petService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';

const PetListView = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(location.state?.successMessage || null);

  // Edit Modal State (UC-PET-02)
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    species: '',
    breed: '',
    gender: 'UNKNOWN',
    weight: '',
    dob: '',
    history: '',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  // Delete Modal State (UC-PET-03 Soft-Delete)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await petService.getPets();
      setPets(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve pets list.');
    } finally {
      setLoading(false);
    }
  };

  // Open Edit Modal (UC-PET-02)
  const handleOpenEdit = (pet) => {
    setEditingPet(pet);
    setEditForm({
      name: pet.name || '',
      species: pet.species || '',
      breed: pet.breed || '',
      gender: pet.gender || 'UNKNOWN',
      weight: pet.weight ? String(pet.weight) : '',
      dob: pet.dob ? new Date(pet.dob).toISOString().split('T')[0] : '',
      history: pet.history || '',
    });
    setEditError(null);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.species.trim()) {
      setEditError('Exception 4.0.E1: Name and Species are mandatory.');
      return;
    }
    if (editForm.weight && Number(editForm.weight) <= 0) {
      setEditError('Exception 4.0.E1: Weight must be a positive number greater than 0.');
      return;
    }

    try {
      setEditLoading(true);
      setEditError(null);
      await petService.updatePet(editingPet.id, {
        ...editForm,
        weight: editForm.weight !== '' ? Number(editForm.weight) : undefined,
      });
      setSuccessMsg('Pet profile updated successfully (UC-PET-02).');
      setEditModalOpen(false);
      loadPets();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update pet profile.');
    } finally {
      setEditLoading(false);
    }
  };

  // Open Delete Modal (UC-PET-03 Soft-Delete)
  const handleOpenDelete = (pet) => {
    setPetToDelete(pet);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!petToDelete) return;
    try {
      setDeleteLoading(true);
      await petService.deletePet(petToDelete.id);
      setSuccessMsg(`Pet "${petToDelete.name}" deleted successfully (UC-PET-03 soft-delete).`);
      setDeleteModalOpen(false);
      setPetToDelete(null);
      loadPets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete pet profile.');
      setDeleteModalOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-200 my-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Registered Pets <span className="text-sm font-normal text-slate-500">(UC-PET-04)</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage your companion profiles, update information (UC-PET-02), or delete records (UC-PET-03).
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => navigate('/pets/add')}>
            + Add Pet Profile (UC-PET-01)
          </Button>
          <Button variant="outline" onClick={() => navigate('/appointments/book')}>
            Book Appointment
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <Alert variant="danger">{error}</Alert>
        </div>
      )}

      {successMsg && (
        <div className="mb-4">
          <Alert variant="success">{successMsg}</Alert>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : pets.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
          <p className="text-slate-500 mb-3">No pet profiles found.</p>
          <Button variant="primary" onClick={() => navigate('/pets/add')}>
            Add Your First Pet
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pets.map((pet) => (
            <div
              key={pet.id}
              className="p-5 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-slate-800">{pet.name}</h3>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {pet.species}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600 mb-4">
                  <p>
                    <span className="text-slate-400">Breed:</span> {pet.breed || 'Not specified'}
                  </p>
                  <p>
                    <span className="text-slate-400">Gender:</span> {pet.gender || 'UNKNOWN'}
                  </p>
                  <p>
                    <span className="text-slate-400">Weight:</span>{' '}
                    {pet.weight ? `${pet.weight} kg` : 'Not recorded'}
                  </p>
                  <p>
                    <span className="text-slate-400">DOB:</span>{' '}
                    {pet.dob ? new Date(pet.dob).toLocaleDateString() : 'N/A'}
                  </p>
                  {pet.history && (
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <span className="text-slate-400 block mb-0.5">Medical History:</span>
                      <p className="text-slate-700 line-clamp-2 italic">{pet.history}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleOpenEdit(pet)}
                >
                  Edit (UC-PET-02)
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleOpenDelete(pet)}
                >
                  Delete (UC-PET-03)
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Pet Modal (UC-PET-02) */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                Update Pet Profile <span className="text-sm font-normal text-slate-500">(UC-PET-02)</span>
              </h3>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 font-bold"
                onClick={() => setEditModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {editError && (
              <div className="mb-3">
                <Alert variant="danger">{editError}</Alert>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <Input
                label="Pet Name *"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Species *</label>
                  <select
                    value={editForm.species}
                    onChange={(e) => setEditForm({ ...editForm, species: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Rabbit">Rabbit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="UNKNOWN">Unknown</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Breed"
                  value={editForm.breed}
                  onChange={(e) => setEditForm({ ...editForm, breed: e.target.value })}
                />
                <Input
                  label="Weight (kg)"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={editForm.weight}
                  onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                />
              </div>

              <Input
                label="Date of Birth"
                type="date"
                value={editForm.dob}
                onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Medical History</label>
                <textarea
                  rows="2"
                  value={editForm.history}
                  onChange={(e) => setEditForm({ ...editForm, history: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  disabled={editLoading}
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={editLoading}>
                  Save Changes (UC-PET-02)
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Soft-Delete Pet Modal (UC-PET-03) */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in duration-150">
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              Soft-Delete Pet Profile (UC-PET-03)
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Are you sure you want to soft-delete <span className="font-bold text-rose-600">{petToDelete?.name}</span>?
              The record will be marked as <span className="font-mono font-semibold">isDeleted = true</span> and hidden from active lists, while preserving historical medical associations.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                disabled={deleteLoading}
                onClick={() => {
                  setDeleteModalOpen(false);
                  setPetToDelete(null);
                }}
              >
                No, Keep
              </Button>
              <Button variant="danger" isLoading={deleteLoading} onClick={handleConfirmDelete}>
                Yes, Soft-Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetListView;

