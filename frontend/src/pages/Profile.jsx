import React, { useState, useEffect, useCallback } from 'react';
import { profileService } from '../services/profileService';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';

const Profile = () => {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form edit states
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
  });

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await profileService.getProfile();
      setProfile(data);
      setFormData({
        fullName: data.fullName || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.petOwner?.address || '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    // Reset form data back to current profile
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        email: profile.email || '',
        address: profile.petOwner?.address || '',
      });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Client-side validations
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.email.trim()) {
      setError('Full name, phone number, and email are mandatory.');
      return;
    }

    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      setError('Please provide a valid Vietnamese phone number format.');
      return;
    }

    try {
      setSaving(true);
      const updated = await profileService.updateProfile({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
      });

      setProfile(updated);
      updateUser({
        fullName: updated.fullName,
        phone: updated.phone,
        email: updated.email,
      });

      setSuccessMsg('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            View and manage your personal details and account settings
          </p>
        </div>
        {!isEditing && (
          <div className="mt-4 sm:mt-0">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsEditing(true);
                setSuccessMsg('');
                setError('');
              }}
            >
              ✏️ Edit / Update Profile
            </Button>
          </div>
        )}
      </div>

      {error && <Alert type="error" message={error} className="mb-6" onClose={() => setError('')} />}
      {successMsg && <Alert type="success" message={successMsg} className="mb-6" onClose={() => setSuccessMsg('')} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Account Meta */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-4xl uppercase mb-4 shadow-md">
            {profile?.fullName ? profile.fullName.charAt(0) : 'U'}
          </div>
          <h2 className="text-lg font-bold text-slate-800">{profile?.fullName}</h2>
          <span className="mt-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            {profile?.role}
          </span>
          <p className="text-xs text-slate-400 mt-3 font-mono">@{profile?.userName}</p>

          <div className="w-full mt-6 pt-6 border-t border-slate-100 text-left text-xs text-slate-500 space-y-2">
            <div className="flex justify-between">
              <span>Account Status:</span>
              <span className="font-semibold text-emerald-600">
                {profile?.isActive ? 'Active' : 'Locked'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Member Since:</span>
              <span>{new Date(profile?.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Details & Specific Roles */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100">
              Personal Information
            </h3>

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <Input
                  id="fullName"
                  label="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="phone"
                    label="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    helperText="Must be unique Vietnamese number"
                  />

                  <Input
                    id="email"
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    helperText="Must be unique email"
                  />
                </div>

                {profile?.role === 'PET_OWNER' && (
                  <Input
                    id="address"
                    label="Residential Address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your address"
                  />
                )}

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                  <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" isLoading={saving}>
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <span className="block text-xs font-medium text-slate-400">Full Name</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{profile?.fullName}</p>
                </div>

                <div>
                  <span className="block text-xs font-medium text-slate-400">Username</span>
                  <p className="font-semibold text-slate-800 mt-0.5 font-mono">@{profile?.userName}</p>
                </div>

                <div>
                  <span className="block text-xs font-medium text-slate-400">Phone Number</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{profile?.phone}</p>
                </div>

                <div>
                  <span className="block text-xs font-medium text-slate-400">Email Address</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{profile?.email}</p>
                </div>

                {profile?.petOwner && (
                  <div className="sm:col-span-2">
                    <span className="block text-xs font-medium text-slate-400">Residential Address</span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {profile.petOwner.address || 'No address provided'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Clinical Staff Section (Read-only as per specification) */}
          {profile?.employee && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Hospital Staff Details</span>
                <span className="text-[11px] font-normal text-slate-400">
                  🔒 Managed by Clinic Admin (Read-Only)
                </span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-xs text-slate-400">Employee Code</span>
                  <p className="font-mono font-semibold text-slate-800 mt-0.5">
                    {profile.employee.empCode}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-xs text-slate-400">Department</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {profile.employee.department || 'N/A'}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-xs text-slate-400">Base Salary</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {profile.employee.salary ? `${profile.employee.salary.toLocaleString()} VND` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Registered Pets list for Pet Owner */}
          {profile?.petOwner && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-semibold text-slate-800 mb-3 pb-2 border-b border-slate-100">
                Registered Pets ({profile.petOwner.pets?.length || 0})
              </h3>
              {profile.petOwner.pets && profile.petOwner.pets.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profile.petOwner.pets.map((pet) => (
                    <div
                      key={pet.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center space-x-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg">
                        🐕
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm">{pet.name}</h4>
                        <p className="text-xs text-slate-500">
                          {pet.species} • {pet.breed || 'Standard'} • {pet.weight || '?'} kg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">No pets registered under this profile yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
