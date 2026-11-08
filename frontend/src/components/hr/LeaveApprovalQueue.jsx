import React, { useState, useEffect, useCallback } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  CalendarDays,
  User,
  MessageSquare,
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

const dayCount = (start, end) => {
  const a = new Date(start);
  const b = new Date(end);
  return Math.round((b - a) / 86400000) + 1;
};

/**
 * UC-HR-03: Manager reviews leave requests.
 * Shows the shifts and appointments each request would disrupt before deciding.
 */
const LeaveApprovalQueue = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [rejecting, setRejecting] = useState(null); // { id, reason }
  const [filter, setFilter] = useState('PENDING');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await hrService.getLeaveRequests(filter);
      setRequests(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load leave requests.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (request) => {
    setBusyId(request.id);
    setError('');
    setNotice('');
    try {
      const result = await hrService.approveLeaveRequest(request.id);
      const parts = [`Approved ${request.user?.fullName}'s leave.`];
      if (result.lockedShiftCount > 0) {
        parts.push(`${result.lockedShiftCount} shift(s) locked.`);
      }
      if (result.appointmentsNeedingReassignment?.length > 0) {
        parts.push(
          `${result.appointmentsNeedingReassignment.length} appointment(s) need reassignment.`
        );
      }
      setNotice(parts.join(' '));
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Approval failed.');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async () => {
    if (!rejecting?.reason || rejecting.reason.trim().length < 3) {
      setError('A rejection reason is required (at least 3 characters).');
      return;
    }
    setBusyId(rejecting.id);
    setError('');
    try {
      await hrService.rejectLeaveRequest(rejecting.id, rejecting.reason.trim());
      setNotice('Leave request rejected.');
      setRejecting(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Rejection failed.');
    } finally {
      setBusyId(null);
    }
  };

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              <span>Leave Requests</span>
              {pendingCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {pendingCount} pending
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Approving locks every overlapping shift (BR-03) and flags affected appointments.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${
                  filter === status
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
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
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Nothing to review</p>
          <p className="text-xs text-slate-400 mt-1">
            No {filter === 'ALL' ? '' : filter.toLowerCase()} leave requests right now.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => {
            const shifts = request.affectedShifts || [];
            const appointments = request.affectedAppointments || [];
            const isPending = request.status === 'PENDING';
            const busy = busyId === request.id;

            return (
              <div
                key={request.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800 text-sm">
                        {request.user?.fullName}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {request.user?.role}
                      </span>
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
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-2">
                      <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium">
                        {formatDate(request.startDate)} → {formatDate(request.endDate)}
                      </span>
                      <span className="text-slate-400">
                        ({dayCount(request.startDate, request.endDate)} day
                        {dayCount(request.startDate, request.endDate) === 1 ? '' : 's'})
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 rounded-lg p-2.5">
                      {request.reason}
                    </p>

                    {request.rejectionReason && (
                      <p className="text-xs text-rose-700 mt-2 bg-rose-50 rounded-lg p-2.5 flex items-start gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Rejection reason:</strong> {request.rejectionReason}
                        </span>
                      </p>
                    )}

                    {/* Impact preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                      <div
                        className={`rounded-lg border p-2.5 ${
                          shifts.length > 0
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                          <Clock className="w-3 h-3" />
                          Shifts affected
                        </div>
                        <div className="text-sm font-bold text-slate-800 mt-0.5">
                          {shifts.length}
                        </div>
                        {shifts.length > 0 && (
                          <div className="text-[10px] text-slate-600 mt-1 space-y-0.5">
                            {shifts.slice(0, 3).map((s) => (
                              <div key={s.id}>
                                {formatDate(s.date)} · {s.shiftType}
                                {s.roomOrDesk ? ` · ${s.roomOrDesk}` : ''}
                              </div>
                            ))}
                            {shifts.length > 3 && (
                              <div className="text-slate-400">+{shifts.length - 3} more</div>
                            )}
                          </div>
                        )}
                      </div>

                      <div
                        className={`rounded-lg border p-2.5 ${
                          appointments.length > 0
                            ? 'bg-rose-50 border-rose-200'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                          <AlertTriangle className="w-3 h-3" />
                          Appointments to reassign
                        </div>
                        <div className="text-sm font-bold text-slate-800 mt-0.5">
                          {appointments.length}
                        </div>
                        {appointments.length > 0 && (
                          <div className="text-[10px] text-slate-600 mt-1 space-y-0.5">
                            {appointments.slice(0, 3).map((a) => (
                              <div key={a.id}>
                                {a.pet?.name} · {a.status}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {request.reviewer && (
                      <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Reviewed by {request.reviewer.fullName}
                      </p>
                    )}
                  </div>

                  {isPending && (
                    <div className="flex lg:flex-col gap-2 flex-shrink-0">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApprove(request)}
                        isLoading={busy}
                        className="whitespace-nowrap"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setRejecting({ id: request.id, reason: '' });
                          setError('');
                        }}
                        disabled={busy}
                        className="whitespace-nowrap"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1.5" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject modal */}
      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600" />
                Reject leave request
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                The staff member will see this reason. Shifts stay untouched.
              </p>
            </div>
            <div className="p-5">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={rejecting.reason}
                onChange={(e) => setRejecting({ ...rejecting, reason: e.target.value })}
                rows={3}
                maxLength={500}
                placeholder="e.g. That week is short-staffed, please pick another date."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {rejecting.reason.length}/500 characters
              </p>
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setRejecting(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleReject}
                isLoading={busyId === rejecting.id}
              >
                Confirm rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApprovalQueue;
