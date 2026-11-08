import React, { useState, useEffect, useCallback } from 'react';
import {
  FileSpreadsheet,
  Plus,
  X,
  CalendarDays,
  Clock,
  Send,
  Ban,
  AlertTriangle,
} from 'lucide-react';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import Spinner from '../ui/Spinner';
import { hrService } from '../../services/hrService';

const LEAVE_TYPES = [
  { value: 'SICK', label: 'Sick leave' },
  { value: 'PERSONAL', label: 'Personal leave' },
  { value: 'VACATION', label: 'Annual leave' },
];

const STATUS_STYLES = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-rose-100 text-rose-800',
  CANCELLED: 'bg-slate-100 text-slate-600',
};

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
};

const todayISO = () => {
  const d = new Date();
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
    .toISOString()
    .slice(0, 10);
};

/**
 * UC-HR-02: Staff submit and track their own leave requests.
 */
const MyLeaveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    startDate: todayISO(),
    endDate: todayISO(),
    leaveType: 'SICK',
    reason: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await hrService.getMyLeaveRequests();
      setRequests(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load your leave requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async () => {
    setError('');
    setNotice('');

    if (!form.reason || form.reason.trim().length < 5) {
      setError('Please describe the reason for leave (at least 5 characters).');
      return;
    }
    if (form.endDate < form.startDate) {
      setError('End date cannot be earlier than start date.');
      return;
    }

    setBusy(true);
    try {
      const created = await hrService.submitLeaveRequest({
        startDate: form.startDate,
        endDate: form.endDate,
        leaveType: form.leaveType,
        reason: form.reason.trim(),
      });

      const affected = created.affectedShifts?.length || 0;
      setNotice(
        affected > 0
          ? `Leave request submitted. ${affected} of your shifts would be affected if approved.`
          : 'Leave request submitted for Manager review.'
      );
      setShowForm(false);
      setForm({
        startDate: todayISO(),
        endDate: todayISO(),
        leaveType: 'SICK',
        reason: '',
      });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit the request.');
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async (leaveId) => {
    setBusy(true);
    setError('');
    try {
      await hrService.cancelLeaveRequest(leaveId);
      setNotice('Leave request cancelled.');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel the request.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              <span>My Leave Requests</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Submit a request and track its approval status.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New request
          </Button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {notice && <Alert type="success" message={notice} onClose={() => setNotice('')} />}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">No leave requests yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Use "New request" to ask the Clinic Manager for time off.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        STATUS_STYLES[request.status]
                      }`}
                    >
                      {request.status}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {LEAVE_TYPES.find((t) => t.value === request.leaveType)?.label ||
                        request.leaveType}
                    </span>
                    <span className="text-xs text-slate-600 flex items-center gap-1">
                      <CalendarDays className="w-3 h-3 text-slate-400" />
                      {formatDate(request.startDate)} → {formatDate(request.endDate)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{request.reason}</p>
                  {request.rejectionReason && (
                    <p className="text-xs text-rose-700 mt-2 bg-rose-50 rounded-lg p-2">
                      <strong>Rejected:</strong> {request.rejectionReason}
                    </p>
                  )}
                  {request.reviewer && (
                    <p className="text-[10px] text-slate-400 mt-1.5">
                      Reviewed by {request.reviewer.fullName}
                    </p>
                  )}
                </div>

                {request.status === 'PENDING' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancel(request.id)}
                    disabled={busy}
                    className="flex-shrink-0"
                  >
                    <Ban className="w-3.5 h-3.5 mr-1.5" />
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New request modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-600" />
                  New leave request
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sent to the Clinic Manager for approval.
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    From <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    min={todayISO()}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    To <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    min={form.startDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Leave type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.leaveType}
                  onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                >
                  {LEAVE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  rows={3}
                  maxLength={1000}
                  placeholder="Describe why you need this leave"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {form.reason.length}/1000 characters
                </p>
              </div>

              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 leading-snug">
                  Leave cannot start in the past and cannot overlap an existing pending or approved
                  request.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-5 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={busy}>
                Submit request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLeaveRequests;
