import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import appointmentService from '../services/appointmentService';
import scheduleService from '../services/scheduleService';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';

const AppointmentListView = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Reschedule Modal State
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedNewSlot, setSelectedNewSlot] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState(null);

  // Cancel Confirmation Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await appointmentService.getAppointments();
      setAppointments(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  // UC-BOOK-03: Cancel Appointment
  const handleOpenCancelModal = (appt) => {
    setError(null);
    setSuccessMsg(null);

    // Client-side quick check for BR-06
    const startTime = new Date(appt.startTime);
    const diffHours = (startTime.getTime() - Date.now()) / (1000 * 60 * 60);

    if (diffHours < 2) {
      setError(
        'Exception 2.0.E1: Appointments scheduled to start in less than 2 hours cannot be cancelled online. Please contact the front desk staff (BR-06).'
      );
      return;
    }

    setAppointmentToCancel(appt);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!appointmentToCancel) return;
    try {
      setCancelLoading(true);
      setError(null);
      const res = await appointmentService.cancelAppointment(appointmentToCancel.id);
      setSuccessMsg(res.message || 'Appointment cancelled successfully (UC-BOOK-03).');
      setCancelModalOpen(false);
      setAppointmentToCancel(null);
      loadAppointments();
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.code === 'BR06_CANCELLATION_TIME_LIMIT') {
        setError(`Exception 2.0.E1: ${errData.message}`);
      } else {
        setError(errData?.message || 'Failed to cancel appointment.');
      }
      setCancelModalOpen(false);
    } finally {
      setCancelLoading(false);
    }
  };

  // UC-BOOK-04: Reschedule Appointment
  const handleOpenRescheduleModal = async (appt) => {
    setError(null);
    setSuccessMsg(null);
    setRescheduleError(null);

    // Check BR-06 constraint first
    const startTime = new Date(appt.startTime);
    const diffHours = (startTime.getTime() - Date.now()) / (1000 * 60 * 60);

    if (diffHours < 2) {
      setError(
        'Exception 3.0.E1: Appointments scheduled to start in less than 2 hours cannot be rescheduled online. Please contact the front desk staff (BR-06).'
      );
      return;
    }

    setSelectedAppointment(appt);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    setRescheduleDate(dateStr);
    setRescheduleModalOpen(true);

    // Fetch initial slots for tomorrow
    fetchRescheduleSlots(appt.vetId || 'any', dateStr);
  };

  const fetchRescheduleSlots = async (vetId, date) => {
    try {
      setRescheduleLoading(true);
      setRescheduleError(null);
      const slots = await scheduleService.getAvailableSlots(vetId, date);
      setAvailableSlots(slots || []);
      if (slots && slots.length > 0) {
        setSelectedNewSlot(slots[0].dateTime);
      } else {
        setSelectedNewSlot('');
      }
    } catch (err) {
      setRescheduleError(err.response?.data?.message || 'Failed to fetch slots for this date.');
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setRescheduleDate(newDate);
    fetchRescheduleSlots(selectedAppointment?.vetId || 'any', newDate);
  };

  const handleConfirmReschedule = async () => {
    if (!selectedNewSlot) {
      setRescheduleError('Please select a new time slot.');
      return;
    }
    try {
      setRescheduleLoading(true);
      setRescheduleError(null);
      const res = await appointmentService.rescheduleAppointment(
        selectedAppointment.id,
        selectedNewSlot
      );
      setSuccessMsg(res.message || 'Appointment rescheduled successfully (UC-BOOK-04).');
      setRescheduleModalOpen(false);
      setSelectedAppointment(null);
      loadAppointments();
    } catch (err) {
      const errData = err.response?.data;
      const errorCode = errData?.code;
      if (errorCode === 'SLOT_CONFLICT') {
        // Exception 3.0.E3: Slot booked concurrently
        setRescheduleError(`Exception 3.0.E3 (Slot Conflict): ${errData.message}`);
        if (errData?.details?.availableSlots) {
          setAvailableSlots(errData.details.availableSlots);
        }
      } else if (errorCode === 'BR02_MIN_ADVANCE_TIME' || errorCode === 'BR02_MAX_ADVANCE_TIME') {
        // Exception 3.0.E2: BR-02 violation
        setRescheduleError(`Exception 3.0.E2 (BR-02 Violation): ${errData.message}`);
      } else if (errorCode === 'BR06_RESCHEDULE_TIME_LIMIT') {
        // Exception 3.0.E1: BR-06 limit
        setRescheduleError(`Exception 3.0.E1: ${errData.message}`);
      } else {
        setRescheduleError(errData?.message || 'Failed to reschedule appointment.');
      }
    } finally {
      setRescheduleLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING_APPROVAL: 'bg-amber-100 text-amber-800 border-amber-200',
      CONFIRMED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      CANCELLED: 'bg-rose-100 text-rose-800 border-rose-200',
      REJECTED: 'bg-slate-100 text-slate-800 border-slate-200',
      CHECKED_IN: 'bg-blue-100 text-blue-800 border-blue-200',
      COMPLETED: 'bg-purple-100 text-purple-800 border-purple-200',
      NO_SHOW: 'bg-zinc-200 text-zinc-700 border-zinc-300',
    };
    return (
      <span
        className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
          styles[status] || 'bg-slate-100 text-slate-700'
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-200 my-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Appointments List <span className="text-sm font-normal text-slate-500">(UC-BOOK-05)</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage your clinic reservations, reschedule slots (UC-BOOK-04), or cancel visits (UC-BOOK-03).
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/appointments/book')}>
          + Book New Appointment (UC-BOOK-01)
        </Button>
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
      ) : appointments.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
          <p className="text-slate-500 mb-3">No appointment records found.</p>
          <Button variant="primary" onClick={() => navigate('/appointments/book')}>
            Book Your First Appointment
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-3">Code</th>
                <th className="py-3 px-3">Pet</th>
                <th className="py-3 px-3">Service</th>
                <th className="py-3 px-3">Doctor</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map((appt) => {
                const canModify = ['PENDING_APPROVAL', 'CONFIRMED'].includes(appt.status);
                const startTime = new Date(appt.startTime);
                const isUnder2Hours = (startTime.getTime() - Date.now()) / (1000 * 60 * 60) < 2;

                return (
                  <tr key={appt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-blue-600">
                      {appt.appointmentCode}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800">
                      {appt.pet?.name || 'Unknown Pet'}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {appt.service?.name || 'General Care'}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {appt.vet?.fullName || 'Assigned by clinic'}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{startTime.toLocaleDateString()}</div>
                      <div className="text-xs text-slate-500">{startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="py-3 px-3">{getStatusBadge(appt.status)}</td>
                    <td className="py-3 px-3 text-right space-x-2 whitespace-nowrap">
                      {canModify ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            title={isUnder2Hours ? 'BR-06: Changes locked within 2h' : 'Change time slot'}
                            onClick={() => handleOpenRescheduleModal(appt)}
                          >
                            Reschedule
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            title={isUnder2Hours ? 'BR-06: Cancellation locked within 2h' : 'Cancel appointment'}
                            onClick={() => handleOpenCancelModal(appt)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No action</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in duration-150">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Cancel Appointment (UC-BOOK-03)</h3>
            <p className="text-sm text-slate-600 mb-4">
              Are you sure you want to cancel appointment{' '}
              <span className="font-mono font-semibold text-rose-600">
                {appointmentToCancel?.appointmentCode}
              </span>
              ? The status will be marked as <span className="font-semibold">CANCELLED</span>.
            </p>
            <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200 mb-5">
              Rule BR-06: Cancellations are permitted up to 2 hours before the scheduled start time.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                disabled={cancelLoading}
                onClick={() => {
                  setCancelModalOpen(false);
                  setAppointmentToCancel(null);
                }}
              >
                No, Keep
              </Button>
              <Button variant="danger" isLoading={cancelLoading} onClick={handleConfirmCancel}>
                Yes, Cancel Appointment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                Reschedule Appointment (UC-BOOK-04)
              </h3>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 font-bold"
                onClick={() => setRescheduleModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {rescheduleError && (
              <div className="mb-3">
                <Alert variant="danger">{rescheduleError}</Alert>
              </div>
            )}

            <div className="mb-3 text-xs bg-blue-50 p-3 rounded text-blue-800 border border-blue-200">
              Current schedule: <span className="font-semibold">{new Date(selectedAppointment?.startTime).toLocaleString()}</span>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select New Calendar Date (BR-02: up to 30 days):
              </label>
              <input
                type="date"
                value={rescheduleDate}
                onChange={handleDateChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Available 30-min Slot:
              </label>
              {rescheduleLoading ? (
                <div className="py-6 flex justify-center">
                  <Spinner size="md" />
                </div>
              ) : availableSlots.length === 0 ? (
                <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded border border-amber-200">
                  No available slots found on this date meeting the 2-hour minimum window.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 rounded-lg">
                  {availableSlots.map((s) => (
                    <button
                      key={s.dateTime}
                      type="button"
                      onClick={() => setSelectedNewSlot(s.dateTime)}
                      className={`p-2 rounded text-xs font-medium border text-center transition-all ${
                        selectedNewSlot === s.dateTime
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {s.time}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                disabled={rescheduleLoading}
                onClick={() => setRescheduleModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={!selectedNewSlot || rescheduleLoading}
                isLoading={rescheduleLoading}
                onClick={handleConfirmReschedule}
              >
                Confirm Reschedule (Update Slot)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentListView;

