import React, { useState, useEffect } from 'react';
import { triageService } from '../../services/triageService';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import Spinner from '../ui/Spinner';
import {
  Siren,
  AlertTriangle,
  Clock,
  UserCheck,
  UserX,
  X,
  Search,
} from 'lucide-react';

const EmergencyIntakeModal = ({ isOpen, onClose, onSuccess }) => {
  const [ownerMode, setOwnerMode] = useState('ANONYMOUS'); // 'ANONYMOUS' | 'REGISTERED'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);

  const [formData, setFormData] = useState({
    petId: null,
    petName: '',
    species: 'Canine',
    breed: '',
    weight: '',
    conditionLevel: 'LEVEL_1_CRITICAL',
    initialSymptoms: '',
    vetId: '',
  });

  const [vets, setVets] = useState([]);
  const [onCallManagers, setOnCallManagers] = useState([]);
  const [loadingVets, setLoadingVets] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const fetchVets = async () => {
      try {
        setLoadingVets(true);
        const data = await triageService.getOnDutyVets();
        setVets(data.vets || []);
        setOnCallManagers(data.onCallManagers || []);
        if (data.vets?.length > 0) {
          setFormData((prev) => ({ ...prev, vetId: data.vets[0].id }));
        } else if (data.onCallManagers?.length > 0) {
          setFormData((prev) => ({ ...prev, vetId: data.onCallManagers[0].id }));
        }
      } catch (err) {
        setError('Failed to fetch on-duty clinical personnel.');
      } finally {
        setLoadingVets(false);
      }
    };
    fetchVets();
  }, [isOpen]);

  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      setSearching(true);
      const res = await triageService.searchOwnerOrPet(q);
      setSearchResults(res || []);
    } catch (err) {
      // ignore
    } finally {
      setSearching(false);
    }
  };

  const handleSelectOwner = (owner) => {
    setSelectedOwner(owner);
    setSearchResults([]);
    setSearchQuery('');
    if (owner.petOwner?.pets?.length > 0) {
      const firstPet = owner.petOwner.pets[0];
      setFormData((prev) => ({
        ...prev,
        petId: firstPet.id,
        petName: firstPet.name,
        species: firstPet.species,
        breed: firstPet.breed || '',
        weight: firstPet.weight || '',
      }));
    } else {
      setFormData((prev) => ({ ...prev, petId: null, petName: '', species: 'Canine' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.petName.trim()) {
      setError('Patient pet name is required.');
      return;
    }

    if (!formData.initialSymptoms.trim()) {
      setError('Observed emergency symptoms are required for triage prioritization.');
      return;
    }

    if (!formData.vetId) {
      setError('An on-duty Veterinarian or on-call Manager must be assigned.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ownerMode,
        ownerPhone: selectedOwner ? selectedOwner.phone : undefined,
        ownerName: selectedOwner ? selectedOwner.fullName : 'Anonymous Emergency Owner',
        petId: formData.petId || undefined,
        petName: formData.petName.trim(),
        species: formData.species.trim(),
        breed: formData.breed ? formData.breed.trim() : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        conditionLevel: formData.conditionLevel,
        initialSymptoms: formData.initialSymptoms.trim(),
        vetId: formData.vetId,
      };

      const result = await triageService.createEmergencyTriage(payload);
      onSuccess(result);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Emergency triage intake failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Siren className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Emergency Triage Intake (UC-EMG-01)</h2>
              <p className="text-xs text-rose-100">
                Walk-in triage priority routing & clinical queue assignment (BR-04)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          {/* 1. SEVERITY LEVEL CARDS (BR-04) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Condition Severity Level (BR-04 Priority Overriding) *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Level 1 - Critical */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, conditionLevel: 'LEVEL_1_CRITICAL' })}
                className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                  formData.conditionLevel === 'LEVEL_1_CRITICAL'
                    ? 'border-rose-600 bg-rose-50/70 ring-2 ring-rose-500 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-rose-700 uppercase tracking-wider">
                    Level 1 - Critical
                  </span>
                  <Siren className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-[11px] font-bold text-rose-950 mt-1">Jump to Position #1</div>
                <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                  Cardiac arrest, severe hemorrhage, trauma, coma. Immediate vet interruption.
                </p>
              </button>

              {/* Level 2 - Urgent */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, conditionLevel: 'LEVEL_2_URGENT' })}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  formData.conditionLevel === 'LEVEL_2_URGENT'
                    ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
                    Level 2 - Urgent
                  </span>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-[11px] font-bold text-amber-950 mt-1">Position #2 (15-min SLA)</div>
                <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                  Severe pain, open fractures, poisoning, respiratory distress. Precedes routine slots.
                </p>
              </button>

              {/* Level 3 - Standard */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, conditionLevel: 'LEVEL_3_STANDARD' })}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  formData.conditionLevel === 'LEVEL_3_STANDARD'
                    ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-500 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-700 uppercase tracking-wider">
                    Level 3 - Standard
                  </span>
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-[11px] font-bold text-blue-950 mt-1">FIFO Queue (30m Check)</div>
                <p className="text-[10px] text-slate-500 mt-1 leading-snug">
                  Mild trauma, repeated vomiting, high fever. Nurse re-check reminder every 30 mins.
                </p>
              </button>
            </div>
          </div>

          {/* 2. OWNER INTAKE MODE */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Owner Identification (Alt Flow 2.1)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setOwnerMode('ANONYMOUS');
                  setSelectedOwner(null);
                  setFormData((prev) => ({ ...prev, petId: null, petName: '' }));
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  ownerMode === 'ANONYMOUS'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <UserX className="w-4 h-4" />
                <span>Anonymous Emergency Owner</span>
              </button>

              <button
                type="button"
                onClick={() => setOwnerMode('REGISTERED')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  ownerMode === 'REGISTERED'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Lookup Registered Client</span>
              </button>
            </div>

            {/* Registered Owner Search Box */}
            {ownerMode === 'REGISTERED' && (
              <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by owner phone number, email, or name..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  {searching && (
                    <div className="absolute right-3 top-2.5">
                      <Spinner size="sm" />
                    </div>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 max-h-40 overflow-y-auto">
                    {searchResults.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleSelectOwner(u)}
                        className="w-full text-left p-2.5 hover:bg-blue-50 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">{u.fullName}</p>
                          <span className="text-[11px] text-slate-500 font-mono">{u.phone}</span>
                        </div>
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                          {u.petOwner?.pets?.length || 0} Pets
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {selectedOwner && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                    <div>
                      <span className="font-bold">Client: {selectedOwner.fullName}</span> ({selectedOwner.phone})
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedOwner(null)}
                      className="text-emerald-700 hover:text-emerald-900 font-bold"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. PATIENT PET DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              id="petName"
              label="Patient Pet Name *"
              placeholder="e.g. Max or Lucky"
              value={formData.petName}
              onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Species *</label>
              <select
                value={formData.species}
                onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Canine (Dog)">Canine (Dog)</option>
                <option value="Feline (Cat)">Feline (Cat)</option>
                <option value="Avian (Bird)">Avian (Bird)</option>
                <option value="Exotic">Exotic</option>
              </select>
            </div>

            <Input
              id="breed"
              label="Breed (Optional)"
              placeholder="e.g. Golden Retriever"
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
            />

            <Input
              id="weight"
              label="Weight (kg - Optional)"
              type="number"
              step="0.1"
              placeholder="e.g. 15.5"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            />
          </div>

          {/* 4. OBSERVED SYMPTOMS */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Observed Acute Symptoms *
            </label>
            <textarea
              rows={3}
              value={formData.initialSymptoms}
              onChange={(e) => setFormData({ ...formData, initialSymptoms: e.target.value })}
              placeholder="Describe observable emergency signs (e.g., arterial bleeding, hypothermia, shallow breathing, seizure frequency)..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white"
              required
            />
          </div>

          {/* 5. ON-DUTY VETERINARIAN ASSIGNMENT */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center justify-between">
              <span>Assign On-Duty Emergency Veterinarian *</span>
              {vets.length === 0 && (
                <span className="text-[11px] font-bold text-amber-600">
                  ⚠️ No Vet on Duty! Manager fallback available (2.0.E1)
                </span>
              )}
            </label>

            {loadingVets ? (
              <div className="py-2 flex items-center gap-2 text-xs text-slate-500">
                <Spinner size="sm" /> Loading clinical roster...
              </div>
            ) : (
              <select
                value={formData.vetId}
                onChange={(e) => setFormData({ ...formData, vetId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                required
              >
                {vets.map((v) => (
                  <option key={v.id} value={v.id}>
                    🩺 {v.fullName} ({v.employee?.empCode || 'VET'} - {v.employee?.department || 'Clinical Medicine'})
                  </option>
                ))}
                {onCallManagers.map((m) => (
                  <option key={m.id} value={m.id}>
                    🛡️ On-Call Clinic Manager: {m.fullName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              isLoading={submitting}
              className="flex items-center gap-2"
            >
              <Siren className="w-4 h-4" />
              <span>Admit to Priority Queue</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmergencyIntakeModal;
