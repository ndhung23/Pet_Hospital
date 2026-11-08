import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import petService from '../services/petService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';

const AddPetView = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    species: 'Dog',
    breed: '',
    dob: '',
    gender: 'MALE',
    weight: '',
    history: '',
  });

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear specific field error on edit
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    // Client-side quick check
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Pet name is required';
    if (!formData.species.trim()) errors.species = 'Species is required';
    if (formData.weight !== '' && Number(formData.weight) <= 0) {
      errors.weight = 'Weight must be a positive number greater than 0';
    }
    if (formData.dob && new Date(formData.dob) > new Date()) {
      errors.dob = 'Date of birth cannot be in the future';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setGeneralError('Exception 4.0.E1: Invalid Pet Data. Please review the highlighted fields.');
      return;
    }

    try {
      setLoading(true);
      await petService.addPet({
        ...formData,
        weight: formData.weight !== '' ? Number(formData.weight) : undefined,
      });
      navigate('/pets', { state: { successMessage: 'Pet profile registered successfully (UC-PET-01)!' } });
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.details && Array.isArray(errData.details)) {
        const errorMap = {};
        errData.details.forEach((item) => {
          if (item.field) errorMap[item.field] = item.message;
        });
        setFieldErrors(errorMap);
        setGeneralError(`Exception 4.0.E1: ${errData.message}`);
      } else {
        setGeneralError(errData?.message || 'Failed to register pet profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-200 my-8">
      <div className="border-b border-slate-200 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Add Pet Profile <span className="text-sm font-normal text-slate-500">(UC-PET-01)</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Register your companion into PHMS to book appointments and track medical history.
        </p>
      </div>

      {generalError && (
        <div className="mb-5">
          <Alert variant="danger">{generalError}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <Input
          label="Pet Name *"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={fieldErrors.name}
          placeholder="e.g. Lucky, Milo, Bella"
          required
        />

        {/* Species & Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Species *</label>
            <select
              name="species"
              value={formData.species}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 bg-white ${
                fieldErrors.species ? 'border-rose-500 focus:ring-rose-200' : 'border-slate-300 focus:ring-blue-500/20'
              }`}
            >
              <option value="Dog">Dog (Chó)</option>
              <option value="Cat">Cat (Mèo)</option>
              <option value="Bird">Bird (Chim)</option>
              <option value="Rabbit">Rabbit (Thỏ)</option>
              <option value="Other">Other (Khác)</option>
            </select>
            {fieldErrors.species && <p className="mt-1 text-xs text-rose-500">{fieldErrors.species}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
            >
              <option value="MALE">Male (Đực)</option>
              <option value="FEMALE">Female (Cái)</option>
              <option value="UNKNOWN">Unknown (Không rõ)</option>
            </select>
          </div>
        </div>

        {/* Breed & Weight */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Breed"
            name="breed"
            value={formData.breed}
            onChange={handleChange}
            error={fieldErrors.breed}
            placeholder="e.g. Golden Retriever, Poodle, British Shorthair"
          />

          <Input
            label="Weight (kg)"
            name="weight"
            type="number"
            step="0.1"
            min="0.1"
            value={formData.weight}
            onChange={handleChange}
            error={fieldErrors.weight}
            placeholder="e.g. 12.5"
          />
        </div>

        {/* Date of birth */}
        <Input
          label="Date of Birth"
          name="dob"
          type="date"
          value={formData.dob}
          onChange={handleChange}
          error={fieldErrors.dob}
        />

        {/* Medical History */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Medical History & Allergies</label>
          <textarea
            name="history"
            rows="3"
            value={formData.history}
            onChange={handleChange}
            placeholder="Note any drug allergies, prior surgeries, chronic conditions or vaccinations..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          ></textarea>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={() => navigate('/pets')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            Save Pet Profile (UC-PET-01)
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddPetView;

