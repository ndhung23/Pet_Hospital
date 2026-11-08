import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Copy,
  Send,
  Lock,
  Unlock,
  Plus,
  Trash2,
  X,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import Spinner from '../ui/Spinner';
import { hrService } from '../../services/hrService';

const SHIFT_TYPES = [
  { value: 'MORNING', label: 'Morning', time: '07:00 - 13:00', tone: 'bg-amber-50 text-amber-800 border-amber-200' },
  { value: 'AFTERNOON', label: 'Afternoon', time: '13:00 - 19:00', tone: 'bg-sky-50 text-sky-800 border-sky-200' },
  { value: 'EVENING', label: 'Evening', time: '19:00 - 23:00', tone: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
];

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const toISO = (date) => {
  const d = new Date(date);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
    .toISOString()
    .slice(0, 10);
};

const addDays = (iso, days) => {
  const d = new Date(`${iso}T00:00:00.000Z`);
  return toISO(new Date(d.getTime() + days * 86400000));
};

const mondayOf = (iso) => {
  const d = new Date(`${iso}T00:00:00.000Z`);
  const day = d.getUTCDay();
  return addDays(iso, day === 0 ? -6 : 1 - day);
};

const formatDay = (iso) => {
  const d = new Date(`${iso}T00:00:00.000Z`);
  return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
};

/**
 * UC-HR-01: Manage Weekly Shift Rosters.
 * Manager builds the week, sees who is on approved leave, publishes when ready.
 */
const RosterManager = () => {
  const [weekStart, setWeekStart] = useState(() => mondayOf(toISO(new Date())));
  const [roster, setRoster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [assignTarget, setAssignTarget] = useState(null); // { date, shiftType }
  const [form, setForm] = useState({ userId: '', roomOrDesk: '', notes: '' });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await hrService.getWeeklyRoster(weekStart);
      setRoster(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load the roster.');
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => {
    load();
  }, [load]);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  // shift lookup: `${date}|${shiftType}` -> array of shifts
  const shiftIndex = useMemo(() => {
    const map = {};
    (roster?.shifts || []).forEach((shift) => {
      const key = `${shift.date.slice(0, 10)}|${shift.shiftType}`;
      if (!map[key]) map[key] = [];
      map[key].push(shift);
    });
    return map;
  }, [roster]);

  // who is on approved leave on a given date
  const leaveOn = useCallback(
    (date) => {
      return (roster?.approvedLeaves || []).filter(
        (leave) =>
          leave.startDate.slice(0, 10) <= date && leave.endDate.slice(0, 10) >= date
      );
    },
    [roster]
  );

  const isPublished = roster?.isPublished ?? false;

  const run = async (action, successMessage) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await action();
      setNotice(successMessage);
      await load();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'The action could not be completed.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleAssign = async () => {
    if (!form.userId) {
      setError('Pick a staff member first.');
      return;
    }
    const ok = await run(
      () =>
        hrService.assignShift({
          userId: form.userId,
          date: assignTarget.date,
          shiftType: assignTarget.shiftType,
          roomOrDesk: form.roomOrDesk || null,
          notes: form.notes || null,
        }),
      'Shift assigned.'
    );
    if (ok) {
      setAssignTarget(null);
      setForm({ userId: '', roomOrDesk: '', notes: '' });
    }
  };

  const handleRemove = (shiftId) =>
    run(() => hrService.removeShift(shiftId), 'Shift removed.');

  const handleClone = () =>
    run(async () => {
      const result = await hrService.clonePreviousWeek(weekStart);
      setNotice(`Cloned ${result.created} shift(s), skipped ${result.skipped.length}.`);
    }, 'Previous week cloned.');

  const handlePublish = () =>
    run(() => hrService.publishRoster(weekStart), 'Roster published. Booking slots are open.');

  const handleUnpublish = () =>
    run(() => hrService.unpublishRoster(weekStart), 'Roster reopened for editing.');

  const totalShifts = roster?.shifts?.length || 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              <span>Weekly Duty Roster</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isPublished ? 'Published' : 'Draft'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Week of {formatDay(weekStart)} - {formatDay(addDays(weekStart, 6))} · {totalShifts}{' '}
              shift{totalShifts === 1 ? '' : 's'} assigned
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 border border-slate-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setWeekStart(addDays(weekStart, -7))}
                className="p-2 hover:bg-slate-100 text-slate-600"
                title="Previous week"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 text-xs font-semibold text-slate-700 whitespace-nowrap">
                {formatDay(weekStart)} - {formatDay(addDays(weekStart, 6))}
              </span>
              <button
                onClick={() => setWeekStart(addDays(weekStart, 7))}
                className="p-2 hover:bg-slate-100 text-slate-600"
                title="Next week"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Button variant="outline" size="sm" onClick={handleClone} disabled={busy || isPublished}>
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              Clone last week
            </Button>

            {isPublished ? (
              <Button variant="secondary" size="sm" onClick={handleUnpublish} disabled={busy}>
                <Unlock className="w-3.5 h-3.5 mr-1.5" />
                Reopen
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handlePublish}
                disabled={busy || totalShifts === 0}
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Publish roster
              </Button>
            )}
          </div>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {notice && <Alert type="success" message={notice} onClose={() => setNotice('')} />}

      {isPublished && (
        <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
          <Lock className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-800 leading-relaxed">
            This roster is published and locked. Reopen it to change assignments. Booking slots for
            this week are already open to Pet Owners.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[860px]">
              <thead>
                <tr>
                  <th className="w-28 p-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 bg-slate-50">
                    Shift
                  </th>
                  {days.map((day, idx) => (
                    <th
                      key={day}
                      className="p-3 text-center border-b border-l border-slate-200 bg-slate-50"
                    >
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        {DAY_LABELS[idx]}
                      </div>
                      <div className="text-sm font-bold text-slate-800">{formatDay(day)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SHIFT_TYPES.map((shiftType) => (
                  <tr key={shiftType.value} className="border-b border-slate-100 last:border-0">
                    <td className="p-3 align-top bg-slate-50/60">
                      <div className="text-xs font-bold text-slate-800">{shiftType.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{shiftType.time}</div>
                    </td>
                    {days.map((day) => {
                      const cellShifts = shiftIndex[`${day}|${shiftType.value}`] || [];
                      const onLeave = leaveOn(day);
                      return (
                        <td
                          key={`${day}-${shiftType.value}`}
                          className="p-1.5 align-top border-l border-slate-100"
                        >
                          <div className="space-y-1 min-h-[64px]">
                            {cellShifts.map((shift) => (
                              <div
                                key={shift.id}
                                className={`group relative rounded-lg border px-2 py-1.5 text-[11px] ${
                                  shift.status === 'CANCELLED'
                                    ? 'bg-slate-100 border-slate-200 text-slate-400 line-through'
                                    : shiftType.tone
                                }`}
                              >
                                <div className="font-semibold truncate pr-4">
                                  {shift.user?.fullName}
                                </div>
                                <div className="text-[10px] opacity-80 truncate">
                                  {shift.user?.role}
                                  {shift.roomOrDesk ? ` · ${shift.roomOrDesk}` : ''}
                                </div>
                                {!isPublished && shift.status !== 'CANCELLED' && (
                                  <button
                                    onClick={() => handleRemove(shift.id)}
                                    disabled={busy}
                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-rose-600 hover:text-rose-800 transition-opacity"
                                    title="Remove shift"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            ))}

                            {onLeave.length > 0 && (
                              <div className="text-[9px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 truncate">
                                On leave: {onLeave.map((l) => l.user?.fullName).join(', ')}
                              </div>
                            )}

                            {!isPublished && (
                              <button
                                onClick={() => {
                                  setAssignTarget({ date: day, shiftType: shiftType.value });
                                  setForm({ userId: '', roomOrDesk: '', notes: '' });
                                  setError('');
                                }}
                                className="w-full flex items-center justify-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded py-1 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                                Assign
                              </button>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign modal */}
      {assignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  Assign shift
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {formatDay(assignTarget.date)} ·{' '}
                  {SHIFT_TYPES.find((s) => s.value === assignTarget.shiftType)?.label}
                </p>
              </div>
              <button
                onClick={() => setAssignTarget(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {leaveOn(assignTarget.date).length > 0 && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-800 leading-snug">
                    On approved leave this day:{' '}
                    <strong>
                      {leaveOn(assignTarget.date)
                        .map((l) => l.user?.fullName)
                        .join(', ')}
                    </strong>
                    . They cannot be assigned (BR-03).
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Staff member <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                >
                  <option value="">Select staff…</option>
                  {(roster?.staff || []).map((member) => {
                    const blocked = leaveOn(assignTarget.date).some(
                      (l) => l.userId === member.id
                    );
                    return (
                      <option key={member.id} value={member.id} disabled={blocked}>
                        {member.fullName} — {member.role}
                        {blocked ? ' (on leave)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Room / Desk
                </label>
                <input
                  value={form.roomOrDesk}
                  onChange={(e) => setForm({ ...form, roomOrDesk: e.target.value })}
                  placeholder="Exam 1, Lab, Front desk…"
                  maxLength={50}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  maxLength={1000}
                  placeholder="Optional handover notes"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 p-5 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setAssignTarget(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleAssign} isLoading={busy}>
                Assign shift
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RosterManager;
