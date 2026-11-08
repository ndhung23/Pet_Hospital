import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import petService from '../services/petService';
import catalogService from '../services/catalogService';
import scheduleService from '../services/scheduleService';
import appointmentService from '../services/appointmentService';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';

const BookAppointmentView = () => {
  const navigate = useNavigate();

  // Wizard state: Step 1 to 5
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successResult, setSuccessResult] = useState(null);

  // Step 1: Pets
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);

  // Step 2: Services
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  // Step 3: Veterinarians & Dates
  const [veterinarians, setVeterinarians] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedVetId, setSelectedVetId] = useState('any'); // 'any' = Alt Flow 1.1
  const [selectedDate, setSelectedDate] = useState('');

  // Step 4: Slots & Notes
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [visitNote, setVisitNote] = useState('');

  // Load registered pets on mount (Step 1)
  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await petService.getPets();
      setPets(data || []);
      if (data && data.length > 0) {
        setSelectedPet(data[0]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve registered pets.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1 -> Step 2: Fetch tailored services
  const handleNextToStep2 = async () => {
    if (!selectedPet) {
      setError('Please select a pet to proceed.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await catalogService.getServices(selectedPet.species, 'All');
      setServices(data || []);
      if (data && data.length > 0) {
        setSelectedService(data[0]);
      }
      setCurrentStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load service categories.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 -> Step 3: Fetch doctors and dates
  const handleNextToStep3 = async () => {
    if (!selectedService) {
      setError('Please select a service category.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await scheduleService.getVeterinariansAndDates();
      setVeterinarians(data.veterinarians || []);
      setAvailableDates(data.dates || []);
      if (data.dates && data.dates.length > 0) {
        setSelectedDate(data.dates[0]);
      }
      setCurrentStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load duty veterinarians and dates.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3 -> Step 4: Fetch available 30-min slots
  const handleNextToStep4 = async () => {
    if (!selectedDate) {
      setError('Please select a date.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const slots = await scheduleService.getAvailableSlots(selectedVetId, selectedDate);
      setAvailableSlots(slots || []);
      if (slots && slots.length > 0) {
        setSelectedSlot(slots[0].dateTime);
      } else {
        setSelectedSlot(null);
      }
      setCurrentStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve available slots.');
    } finally {
      setLoading(false);
    }
  };

  // Step 4 -> Step 5: Review & Confirmation
  const handleNextToStep5 = () => {
    if (!selectedSlot) {
      setError('Please select an open time slot.');
      return;
    }
    setError(null);
    setCurrentStep(5);
  };

  // Step 5: Submit booking
  const handleConfirmBooking = async () => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        petId: selectedPet.id,
        serviceId: selectedService.id,
        slot: selectedSlot,
        visitNote: visitNote.trim(),
        vetId: selectedVetId === 'any' ? null : selectedVetId,
      };

      const res = await appointmentService.createAppointment(payload);
      setSuccessResult({
        appointmentCode: res.appointmentCode,
        appointment: res.data,
      });
    } catch (err) {
      const errData = err.response?.data;
      const errorCode = errData?.code;
      const errorMsg = errData?.message || 'An error occurred while booking appointment.';

      // Handle specific exceptions from diagram
      if (errorCode === 'SLOT_CONFLICT') {
        // Exception 1.0.E3: Slot conflict - return to Step 4 to re-select
        setError(`Exception 1.0.E3 (Slot Conflict): ${errorMsg}`);
        handleNextToStep4(); // refresh slots and stay at step 4
      } else if (errorCode === 'BR02_MIN_ADVANCE_TIME') {
        // Exception 1.0.E1: < 2 hours violation
        setError(`Exception 1.0.E1 (BR-02 Advance Booking): ${errorMsg}`);
      } else if (errorCode === 'BR02_MAX_ADVANCE_TIME') {
        // Exception 1.0.E2: > 30 days violation
        setError(`Exception 1.0.E2 (BR-02 30-Day Window): ${errorMsg}`);
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Booking completed screen
  if (successResult) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-200 my-8">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Booking Confirmation</h2>
          <p className="text-slate-600 mb-6">
            Your appointment has been registered with status{' '}
            <span className="font-semibold text-amber-600">PENDING_APPROVAL</span>. An automated
            confirmation notification has been queued via Email Service.
          </p>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 inline-block mb-6 text-left w-full max-w-md">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Appointment Code:</span>
              <span className="font-mono font-bold text-blue-600">{successResult.appointmentCode}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Pet Name:</span>
              <span className="font-medium text-slate-800">{selectedPet?.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Service:</span>
              <span className="font-medium text-slate-800">{selectedService?.name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Start Time:</span>
              <span className="font-medium text-slate-800">
                {new Date(selectedSlot).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Assigned Doctor:</span>
              <span className="font-medium text-slate-800">
                {successResult.appointment?.vet?.fullName || 'Assigned by Clinic'}
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <Button variant="primary" onClick={() => navigate('/appointments')}>
              View My Appointments (UC-BOOK-05)
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSuccessResult(null);
                setCurrentStep(1);
                loadPets();
              }}
            >
              Book Another Appointment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-200 my-8">
      {/* Wizard Header */}
      <div className="border-b border-slate-200 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Book Appointment Online <span className="text-sm font-normal text-slate-500">(UC-BOOK-01)</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Select pet, tailored service, duty doctor, date, and 30-minute consultation slot.
        </p>

        {/* Wizard Stepper indicator */}
        <div className="flex items-center justify-between mt-6 max-w-xl mx-auto">
          {[
            { step: 1, label: 'Select Pet' },
            { step: 2, label: 'Service' },
            { step: 3, label: 'Doctor & Date' },
            { step: 4, label: 'Time Slot' },
            { step: 5, label: 'Confirm' },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  currentStep === item.step
                    ? 'bg-blue-600 text-white shadow-md'
                    : currentStep > item.step
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {currentStep > item.step ? '✓' : item.step}
              </div>
              <span className="text-xs text-slate-500 mt-1 font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <Alert variant="danger">{error}</Alert>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {/* STEP 1: Select Registered Pet */}
      {!loading && currentStep === 1 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">1. Select Target Pet Profile</h2>
          {pets.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
              <p className="text-slate-500 mb-3">No active pet registered under your account.</p>
              <Button variant="primary" onClick={() => navigate('/pets/add')}>
                + Register New Pet (UC-PET-01)
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {pets.map((pet) => (
                <div
                  key={pet.id}
                  onClick={() => setSelectedPet(pet)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedPet?.id === pet.id
                      ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-800">{pet.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {pet.species}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Breed: {pet.breed || 'N/A'}</p>
                  <p className="text-xs text-slate-500">Weight: {pet.weight ? `${pet.weight} kg` : 'N/A'}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => navigate('/pets/add')}>
              + Add Another Pet
            </Button>
            <Button
              variant="primary"
              disabled={pets.length === 0 || !selectedPet}
              onClick={handleNextToStep2}
            >
              Next: Select Service →
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Select Care Service */}
      {!loading && currentStep === 2 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-slate-800">
              2. Select Service Category for {selectedPet?.name} ({selectedPet?.species})
            </h2>
          </div>
          {services.length === 0 ? (
            <p className="text-slate-500 py-6 text-center">No care services available for this species.</p>
          ) : (
            <div className="space-y-2 mb-6">
              {services.map((svc) => (
                <div
                  key={svc.id}
                  onClick={() => setSelectedService(svc)}
                  className={`p-4 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${
                    selectedService?.id === svc.id
                      ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-slate-800">{svc.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{svc.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-blue-600">
                      {svc.price ? `${svc.price.toLocaleString()} VND` : 'Standard'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setCurrentStep(1)}>
              ← Back to Pet Selection
            </Button>
            <Button
              variant="primary"
              disabled={services.length === 0 || !selectedService}
              onClick={handleNextToStep3}
            >
              Next: Select Doctor & Date →
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Select Doctor and Date */}
      {!loading && currentStep === 3 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            3. Select Preferred Veterinarian & Date
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Veterinarian:</label>
            <select
              value={selectedVetId}
              onChange={(e) => setSelectedVetId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="any">⭐ Any Available Veterinarian (Alternative Flow 1.1)</option>
              {veterinarians.map((vet) => (
                <option key={vet.id} value={vet.id}>
                  {vet.name} - {vet.specialty}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Calendar Date:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {availableDates.slice(0, 10).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDate(d)}
                  className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                    selectedDate === d
                      ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setCurrentStep(2)}>
              ← Back to Service
            </Button>
            <Button
              variant="primary"
              disabled={!selectedDate}
              onClick={handleNextToStep4}
            >
              Next: Retrieve Open Slots →
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Select 30-min Slot & Notes */}
      {!loading && currentStep === 4 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            4. Select Time Slot on {selectedDate} (30-min Intervals)
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Rules: Must be at least 2 hours in advance and within 30 calendar days (BR-02).
          </p>

          {availableSlots.length === 0 ? (
            <div className="p-6 bg-amber-50 rounded-lg text-amber-800 border border-amber-200 mb-6 text-center">
              No open slots available for this doctor/date meeting the 2-hour advance requirement.
              Please choose another date or select "Any Available Veterinarian".
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-6 max-h-60 overflow-y-auto p-1">
              {availableSlots.map((slot) => (
                <button
                  key={slot.dateTime}
                  type="button"
                  onClick={() => setSelectedSlot(slot.dateTime)}
                  className={`py-2 px-2 rounded-lg border text-sm font-medium transition-all text-center ${
                    selectedSlot === slot.dateTime
                      ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {slot.time}
                  {slot.vetName && <div className="text-[10px] opacity-80 truncate">{slot.vetName}</div>}
                </button>
              ))}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Visit Notes & Symptoms:
            </label>
            <textarea
              rows="3"
              value={visitNote}
              onChange={(e) => setVisitNote(e.target.value)}
              placeholder="e.g. Pet has cough, loss of appetite since yesterday..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            ></textarea>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setCurrentStep(3)}>
              ← Back to Doctor & Date
            </Button>
            <Button
              variant="primary"
              disabled={!selectedSlot}
              onClick={handleNextToStep5}
            >
              Next: Review & Confirm →
            </Button>
          </div>
        </div>
      )}

      {/* STEP 5: Confirm Booking */}
      {!loading && currentStep === 5 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            5. Confirm Appointment Details
          </h2>

          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Pet:</span>
              <span className="font-semibold text-slate-800">
                {selectedPet?.name} ({selectedPet?.species} - {selectedPet?.breed || 'N/A'})
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Care Service:</span>
              <span className="font-semibold text-slate-800">{selectedService?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Preferred Doctor:</span>
              <span className="font-semibold text-slate-800">
                {selectedVetId === 'any'
                  ? 'Any Available Doctor on Duty'
                  : veterinarians.find((v) => v.id === selectedVetId)?.name || 'Doctor'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Scheduled Time Slot:</span>
              <span className="font-semibold text-blue-600">
                {selectedSlot ? new Date(selectedSlot).toLocaleString() : ''}
              </span>
            </div>
            {visitNote && (
              <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                <span className="text-slate-500">Visit Notes:</span>
                <span className="text-slate-800 italic">{visitNote}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setCurrentStep(4)}>
              ← Modify Slot
            </Button>
            <Button variant="primary" onClick={handleConfirmBooking}>
              Confirm Booking (Create Appointment)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookAppointmentView;

