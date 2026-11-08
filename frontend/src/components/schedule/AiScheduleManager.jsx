import React, { useState, useEffect } from 'react';
import { scheduleService } from '../../services/scheduleService';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import Spinner from '../ui/Spinner';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Save,
  RotateCcw,
  X,
} from 'lucide-react';

// Shift definition constants
const SHIFTS = [
  { key: 'MORNING', label: 'Ca Sáng', time: '07:00 - 15:00', badgeColor: 'bg-amber-50 text-amber-800 border-amber-200' },
  { key: 'AFTERNOON', label: 'Ca Chiều', time: '15:00 - 23:00', badgeColor: 'bg-blue-50 text-blue-800 border-blue-200' },
  { key: 'NIGHT', label: 'Ca Đêm (Cấp cứu 24/7)', time: '23:00 - 07:00', badgeColor: 'bg-purple-50 text-purple-800 border-purple-200' },
];

const ROLE_STYLES = {
  VETERINARIAN: { label: 'Bác sĩ', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  NURSE: { label: 'Y tá', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200', dot: 'bg-cyan-500' },
  RECEPTIONIST: { label: 'Lễ tân', bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
};

const DAY_NAMES = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

const getMonday = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const formatDateIso = (d) => d.toISOString().split('T')[0];

const AiScheduleManager = () => {
  const [currentMonday, setCurrentMonday] = useState(() => getMonday(new Date()));
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [notification, setNotification] = useState('');
  const [error, setError] = useState('');

  // AI Modal States
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('Ưu tiên trực luân phiên đều đặn và đảm bảo ca đêm luôn có bác sĩ thú y trực cấp cứu.');
  const [previewShifts, setPreviewShifts] = useState(null);

  // Calculate 7 days for the selected week
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(currentMonday);
    d.setDate(currentMonday.getDate() + i);
    return {
      date: d,
      dateStr: formatDateIso(d),
      dayName: DAY_NAMES[d.getDay()],
      formatted: `${d.getDate()}/${d.getMonth() + 1}`,
      isToday: formatDateIso(d) === formatDateIso(new Date()),
    };
  });

  const weekStartDate = weekDays[0].dateStr;
  const weekEndDate = weekDays[6].dateStr;

  // Load shifts for current week
  const fetchWeekShifts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await scheduleService.getWeeklySchedule({
        startDate: weekStartDate,
        endDate: weekEndDate,
      });
      setShifts(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải lịch làm việc.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeekShifts();
    setPreviewShifts(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonday]);

  // Navigate week
  const handlePrevWeek = () => {
    const prev = new Date(currentMonday);
    prev.setDate(currentMonday.getDate() - 7);
    setCurrentMonday(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentMonday);
    next.setDate(currentMonday.getDate() + 7);
    setCurrentMonday(next);
  };

  const handleThisWeek = () => {
    setCurrentMonday(getMonday(new Date()));
  };

  // Generate Schedule with AI
  const handleGenerateAi = async () => {
    setAiGenerating(true);
    setError('');
    try {
      const res = await scheduleService.generateAiSchedule({
        startDate: weekStartDate,
        customInstructions: customPrompt,
      });
      setPreviewShifts(res.shifts || []);
      setNotification(`AI đã xếp thành công ${res.totalShifts} ca trực cho tuần! Hãy kiểm tra bản xem trước và bấm Lưu.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi gọi mô hình AI xếp lịch.');
    } finally {
      setAiGenerating(false);
    }
  };

  // Save / Publish shifts to Supabase database
  const handlePublishSchedule = async () => {
    if (!previewShifts || previewShifts.length === 0) return;

    setLoading(true);
    setError('');
    try {
      await scheduleService.publishSchedule({
        shifts: previewShifts,
        replaceExisting: true,
      });
      setNotification('Lịch trực tuần đã được lưu và công bố thành công tới toàn bộ nhân viên!');
      setPreviewShifts(null);
      setIsAiModalOpen(false);
      await fetchWeekShifts();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu lịch trực.');
    } finally {
      setLoading(false);
    }
  };

  // Active dataset to display: either Preview shifts or Saved shifts
  const displayShifts = previewShifts || shifts;

  // Filter shifts by role if selected
  const filteredShifts = displayShifts.filter((s) => {
    const r = s.user?.role || s.role;
    if (roleFilter === 'ALL') return true;
    return r === roleFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left: Week Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevWeek}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Tuần trước"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center px-3">
            <span className="text-xs text-slate-400 font-medium block">Khoảng thời gian:</span>
            <span className="text-sm font-bold text-slate-800">
              {weekDays[0].formatted} — {weekDays[6].formatted}/{currentMonday.getFullYear()}
            </span>
          </div>

          <button
            onClick={handleNextWeek}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="Tuần kế tiếp"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={handleThisWeek}
            className="ml-2 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            Tuần này
          </button>
        </div>

        {/* Center: Role Filter */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-medium text-slate-600">
          {[
            { key: 'ALL', label: 'Tất cả vị trí' },
            { key: 'VETERINARIAN', label: 'Bác sĩ thú y' },
            { key: 'NURSE', label: 'Y tá điều dưỡng' },
            { key: 'RECEPTIONIST', label: 'Lễ tân tiếp đón' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setRoleFilter(item.key)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                roleFilter === item.key ? 'bg-white text-slate-900 font-bold shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right Action: AI Schedule Generator CTA */}
        <div className="flex items-center gap-2.5">
          {previewShifts && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewShifts(null)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Hủy bản xem trước</span>
            </Button>
          )}

          {previewShifts ? (
            <Button
              variant="primary"
              size="md"
              onClick={handlePublishSchedule}
              isLoading={loading}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 text-xs font-bold"
            >
              <Save className="w-4 h-4" />
              <span>Lưu & Công Bố Lịch Này</span>
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-indigo-200 text-xs font-bold"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>AI Tạo Lịch Tuần</span>
            </Button>
          )}
        </div>
      </div>

      {notification && <Alert type="success" message={notification} onClose={() => setNotification('')} />}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Preview Alert Banner */}
      {previewShifts && (
        <div className="p-4 bg-gradient-to-r from-amber-50 to-indigo-50 border border-amber-200/80 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                Đang hiển thị bản xem trước do AI đề xuất ({previewShifts.length} ca trực)
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Các ca trực được sắp xếp tự động đáp ứng quy định ca đêm cấp cứu 24/7 và cân bằng khối lượng làm việc.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPreviewShifts(null)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-semibold"
            >
              Hủy
            </button>
            <button
              onClick={handlePublishSchedule}
              className="px-4 py-1.5 text-xs bg-emerald-600 text-white hover:bg-emerald-700 font-bold rounded-xl shadow-xs"
            >
              Xác nhận lưu
            </button>
          </div>
        </div>
      )}

      {/* Main Roster Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" />
            <p className="text-xs text-slate-500 font-medium">Đang tải lịch làm việc của nhân sự...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[900px]">
              {/* Header: 7 Days of the Week */}
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="p-4 text-left text-xs font-bold text-slate-500 w-36 uppercase tracking-wider">
                    Ca Trực
                  </th>
                  {weekDays.map((day) => (
                    <th
                      key={day.dateStr}
                      className={`p-3 text-center border-l border-slate-200/80 transition-colors ${
                        day.isToday ? 'bg-blue-50/60' : ''
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-800">{day.dayName}</p>
                      <p className={`text-[11px] font-semibold mt-0.5 ${day.isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                        {day.formatted} {day.isToday && '(Hôm nay)'}
                      </p>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Rows: Morning, Afternoon, Night Shifts */}
              <tbody className="divide-y divide-slate-100">
                {SHIFTS.map((shift) => (
                  <tr key={shift.key} className="hover:bg-slate-50/40 transition-colors">
                    {/* Shift Label Header */}
                    <td className="p-4 align-top bg-slate-50/30">
                      <div className="space-y-1">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${shift.badgeColor}`}>
                          {shift.label}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                          <Clock className="w-3 h-3" />
                          <span>{shift.time}</span>
                        </div>
                      </div>
                    </td>

                    {/* Day Cells */}
                    {weekDays.map((day) => {
                      // Find shifts assigned to this day and shiftType
                      const cellShifts = filteredShifts.filter((s) => {
                        const shiftDate = s.date ? (typeof s.date === 'string' ? s.date.split('T')[0] : formatDateIso(new Date(s.date))) : '';
                        return shiftDate === day.dateStr && s.shiftType === shift.key;
                      });

                      return (
                        <td
                          key={day.dateStr}
                          className={`p-2 align-top border-l border-slate-200/60 ${
                            day.isToday ? 'bg-blue-50/20' : ''
                          }`}
                        >
                          <div className="min-h-[105px] space-y-1.5">
                            {cellShifts.length === 0 ? (
                              <div className="h-full flex items-center justify-center text-[11px] text-slate-300 italic pt-6">
                                Trống ca
                              </div>
                            ) : (
                              cellShifts.map((cs, idx) => {
                                const staffRole = cs.user?.role || cs.role;
                                const staffName = cs.user?.fullName || cs.staffName || 'Nhân viên';
                                const roleMeta = ROLE_STYLES[staffRole] || {
                                  label: staffRole,
                                  bg: 'bg-slate-100 text-slate-700 border-slate-200',
                                  dot: 'bg-slate-400',
                                };

                                return (
                                  <div
                                    key={cs.id || idx}
                                    className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow space-y-1"
                                  >
                                    <div className="flex items-center justify-between gap-1">
                                      <span
                                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${roleMeta.bg}`}
                                      >
                                        <span className={`w-1.5 h-1.5 rounded-full ${roleMeta.dot}`} />
                                        <span>{roleMeta.label}</span>
                                      </span>
                                      {cs.roomOrDesk && (
                                        <span className="text-[9px] text-slate-400 truncate max-w-[70px]">
                                          {cs.roomOrDesk}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs font-semibold text-slate-800 truncate leading-snug">
                                      {staffName}
                                    </p>
                                  </div>
                                );
                              })
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
        )}
      </div>

      {/* AI GENERATION MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">AI Xếp Lịch Làm Việc Thông Minh</h3>
                  <p className="text-xs text-slate-500">Mô hình Gemini AI tối ưu hóa ca trực bệnh viện</p>
                </div>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50/70 border border-blue-200/60 rounded-2xl text-xs text-blue-900 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Quy tắc xếp lịch tự động:</span>
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-blue-800 text-[11px]">
                  <li>Đảm bảo đủ 3 ca (Sáng, Chiều, Đêm 24/7) cho tất cả các ngày trong tuần.</li>
                  <li>Ca đêm luôn có Bác sĩ thú y trực cấp cứu và hỗ trợ phòng khám.</li>
                  <li>Cân bằng khối lượng công việc, tối đa 5 ca/tuần cho mỗi nhân viên.</li>
                  <li>Không xếp ca sáng ngay sau ca đêm nhằm bảo đảm sức khỏe nhân sự.</li>
                </ul>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Yêu Cầu Tùy Chọn Của Quản Lý (Prompts)
                </label>
                <textarea
                  rows={3}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Ví dụ: Bác sĩ trực đêm luân phiên, tăng cường thêm lễ tân cho sáng Thứ Hai..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center justify-between">
                <span>Tuần áp dụng:</span>
                <span className="font-bold text-slate-800">
                  {weekDays[0].formatted} — {weekDays[6].formatted}/{currentMonday.getFullYear()}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="md"
                disabled={aiGenerating}
                onClick={() => setIsAiModalOpen(false)}
              >
                Đóng
              </Button>
              <Button
                variant="primary"
                size="md"
                isLoading={aiGenerating}
                onClick={handleGenerateAi}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 font-bold"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Bắt Đầu Tạo Lịch</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiScheduleManager;
