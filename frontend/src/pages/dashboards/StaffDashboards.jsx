import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { triageService } from '../../services/triageService';
import EmergencyIntakeModal from '../../components/triage/EmergencyIntakeModal';
import AiScheduleManager from '../../components/schedule/AiScheduleManager';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileSpreadsheet,
  Pill,
  TrendingUp,
  Settings,
  Building2,
  Clock,
  Download,
  UserPlus,
  ShieldAlert,
  Activity,
  CheckCircle2,
  Stethoscope,
  FlaskConical,
  CalendarCheck,
  CreditCard,
  ChevronRight,
  UserCheck,
  Siren,
  AlertTriangle,
  Volume2,
  VolumeX,
  PlayCircle,
  FileText,
  Sparkles,
} from 'lucide-react';

/* =========================================================================
   1. CLINIC MANAGER DASHBOARD (Left 2, Right 10 Full Width)
   ========================================================================= */
export const ManagerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { title: 'Total Registered Users', value: '1,280', change: '+12% this month', icon: Users, color: 'text-blue-600 bg-blue-50' },
    { title: 'Duty Staff Today', value: '18 / 22', change: '4 on approved leave', icon: Stethoscope, color: 'text-indigo-600 bg-indigo-50' },
    { title: 'Appointments Today', value: '42', change: '8 Emergency cases', icon: CalendarCheck, color: 'text-emerald-600 bg-emerald-50' },
    { title: 'Hospital Revenue (MTD)', value: '185,400,000 đ', change: '+8.4% vs last month', icon: CreditCard, color: 'text-amber-600 bg-amber-50' },
  ];

  const staffMembers = [
    { id: '1', name: 'Dr. Sarah Connor', code: 'EMP-MGR-001', role: 'CLINIC_MANAGER', dept: 'Executive Administration', status: 'Active', shift: 'Morning / Full-time' },
    { id: '2', name: 'Dr. John Watson', code: 'EMP-VET-001', role: 'VETERINARIAN', dept: 'Clinical Medicine', status: 'Active', shift: '08:00 - 16:00' },
    { id: '3', name: 'Emily Clark', code: 'EMP-REC-001', role: 'RECEPTIONIST', dept: 'Customer Service & Triage', status: 'Active', shift: '07:30 - 15:30' },
    { id: '4', name: 'David Miller', code: 'EMP-NUR-001', role: 'NURSE', dept: 'Inpatient & Lab Care', status: 'Active', shift: '08:00 - 16:00' },
    { id: '5', name: 'Dr. Anna Stone', code: 'EMP-VET-002', role: 'VETERINARIAN', dept: 'Surgery & Orthopedics', status: 'On Leave', shift: 'Approved Personal Leave' },
  ];

  const recentActivities = [
    { id: 'a1', time: '10 mins ago', text: 'Dr. Watson completed examination for Golden Retriever "Lucky"', icon: Stethoscope, color: 'text-emerald-600 bg-emerald-50' },
    { id: 'a2', time: '25 mins ago', text: 'Reception desk registered walk-in emergency intake #TR-042', icon: ShieldAlert, color: 'text-rose-600 bg-rose-50' },
    { id: 'a3', time: '1 hour ago', text: 'Leave request approved for Nurse Helen (Nov 10 - Nov 12)', icon: FileSpreadsheet, color: 'text-blue-600 bg-blue-50' },
    { id: 'a4', time: '2 hours ago', text: 'Invoice #INV-2026-089 settled via VietQR (1,250,000 đ)', icon: CreditCard, color: 'text-amber-600 bg-amber-50' },
  ];

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'schedules', label: 'Lịch Làm Việc & Xếp Ca AI', icon: CalendarDays, badge: 'AI Smart' },
    { id: 'staff', label: 'Staff & Personnel', icon: Users },
    { id: 'leaves', label: 'Leave Requests', icon: FileSpreadsheet, badge: '2 pending' },
    { id: 'services', label: 'Services & Pharmacy', icon: Pill },
    { id: 'reports', label: 'Analytics & Invoices', icon: TrendingUp },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="grid grid-cols-12 w-full">
        {/* LEFT COLUMN: 2 COLS */}
        <aside className="col-span-12 lg:col-span-2 bg-white border-r border-slate-200 min-h-full p-4 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="px-2 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Clinic Admin Console
              </span>
              <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2 mt-1">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>Executive Desk</span>
              </h2>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-200 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <IconComponent className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white text-blue-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6 px-1">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                  {user?.fullName?.charAt(0) || 'M'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800 truncate">{user?.fullName}</p>
                  <p className="text-[10px] text-slate-500 font-mono">CLINIC_MANAGER</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: 10 COLS */}
        <main className="col-span-12 lg:col-span-10 p-6 sm:p-8 space-y-8 min-h-screen">
          {activeTab === 'schedules' ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800 uppercase tracking-wide flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> AI Scheduling Module
                    </span>
                    <span className="text-xs text-slate-400">Roster & Shift Operations</span>
                  </div>
                  <h1 className="text-2xl font-bold text-slate-800 mt-1 flex items-center gap-2">
                    <CalendarDays className="w-6 h-6 text-indigo-600" />
                    <span>Lịch Làm Việc & Xếp Ca Tự Động Bằng AI</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Mô hình AI tự động phân bổ ca trực 24/7 (Sáng, Chiều, Đêm), bảo đảm độ phủ cấp cứu và cân bằng khối lượng công việc.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700"
                >
                  Quay lại Tổng quan
                </button>
              </div>

              <AiScheduleManager />
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wide">
                  Hospital Overview
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mt-1.5 flex items-center gap-2">
                Welcome back, {user?.fullName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                PHMS Hospital operations, duty shift coverage, staff oversight and clinical KPI tracker.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setActiveTab('schedules')}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-sm shadow-indigo-200"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>AI Tạo Lịch Làm Việc</span>
              </button>
              <button className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm">
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Daily Report</span>
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
                <UserPlus className="w-4 h-4" />
                <span>Provision Staff Account</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((s, idx) => {
              const IconComp = s.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between"
                >
                  <div>
                    <span className="text-xs font-medium text-slate-500">{s.title}</span>
                    <div className="text-2xl font-bold text-slate-800 mt-1.5">{s.value}</div>
                    <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      <TrendingUp className="w-3 h-3" />
                      {s.change}
                    </span>
                  </div>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>Clinical & Hospital Personnel</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Active staff accounts, duty shifts, and assigned clinical departments
                  </p>
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  5 Registered Staff
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100 text-[11px] uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Staff Member</th>
                      <th className="pb-3 font-semibold">Role</th>
                      <th className="pb-3 font-semibold">Department</th>
                      <th className="pb-3 font-semibold">Duty Shift</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {staffMembers.map((staff) => (
                      <tr key={staff.id} className="hover:bg-slate-50/75 transition-colors">
                        <td className="py-3.5 pr-2">
                          <p className="font-semibold text-slate-800">{staff.name}</p>
                          <span className="text-[11px] text-slate-400 font-mono">{staff.code}</span>
                        </td>
                        <td className="py-3.5 pr-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              staff.role === 'VETERINARIAN'
                                ? 'bg-emerald-100 text-emerald-800'
                                : staff.role === 'RECEPTIONIST'
                                ? 'bg-blue-100 text-blue-800'
                                : staff.role === 'NURSE'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {staff.role}
                          </span>
                        </td>
                        <td className="py-3.5 pr-2 text-slate-600 text-xs">{staff.dept}</td>
                        <td className="py-3.5 pr-2 text-slate-600 text-xs font-medium">{staff.shift}</td>
                        <td className="py-3.5 pr-2">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${
                              staff.status === 'Active' ? 'text-emerald-600' : 'text-amber-600'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                staff.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                            ></span>
                            {staff.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <button className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="font-bold text-slate-800 text-base pb-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span>Live Hospital Activity</span>
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </h3>

                <div className="space-y-4">
                  {recentActivities.map((act) => {
                    const ActIcon = act.icon;
                    return (
                      <div key={act.id} className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${act.color}`}>
                          <ActIcon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-700 leading-snug">{act.text}</p>
                          <span className="text-[10px] text-slate-400 mt-0.5 block flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {act.time}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gradient-to-tr from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-blue-800" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                    Quy định Phê duyệt & Lịch trực
                  </h4>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  When approving a staff member's leave request, the system automatically locks all corresponding shift slots, preventing new outpatient bookings.
                </p>
                <div className="pt-2">
                  <button className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 underline">
                    <span>Review Pending Leaves (2)</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
      </div>
    </div>
  );
};

/* =========================================================================
   2. RECEPTIONIST DASHBOARD (UC-EMG-01: Emergency Walk-In Intake)
   ========================================================================= */
export const ReceptionDashboard = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');

  const fetchQueue = useCallback(async () => {
    try {
      const data = await triageService.getEmergencyQueue();
      setQueue(data || []);
    } catch (err) {
      console.error('Failed to load emergency queue:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
    // Refresh queue every 15 seconds
    const interval = setInterval(fetchQueue, 15000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const handleTriageSuccess = (newEncounter) => {
    setNotification(
      `🚨 Case #${newEncounter.triageRecord?.conditionLevel} admitted! Priority Ticket #${newEncounter.id.slice(-4)} assigned to Dr. ${newEncounter.veterinarian?.fullName || 'Duty Vet'}.`
    );
    fetchQueue();
  };

  const criticalCount = queue.filter(
    (q) => q.triageRecord?.conditionLevel === 'LEVEL_1_CRITICAL' && q.status === 'EMERGENCY_WAITING'
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner & Emergency Walk-In Intake CTA */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wide">
              Front Desk & Intake Desk
            </span>
            <span className="text-xs text-slate-400">Receptionist: {user?.fullName}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mt-1 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span>Emergency Triage & Patient Reception</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Evaluate walk-in condition severity, bypass standard queues, and route to duty vets.
          </p>
        </div>

        {/* Primary CTA for EMG-01 */}
        <Button
          variant="danger"
          size="lg"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2.5 shadow-md shadow-rose-200 text-sm font-bold py-3.5 px-6 rounded-2xl"
        >
          <Siren className="w-5 h-5 animate-bounce" />
          <span>+ Tiếp Nhận Cấp Cứu Khẩn Cấp</span>
        </Button>
      </div>

      {notification && (
        <Alert
          type="success"
          message={notification}
          onClose={() => setNotification('')}
        />
      )}

      {/* Emergency Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">Hàng Đợi Cấp Cứu Đang Chờ</span>
            <div className="text-2xl font-bold text-slate-800 mt-1">{queue.length} Ca</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">Cấp độ 1 - Nguy kịch (Ưu tiên số 1)</span>
            <div className="text-2xl font-bold text-rose-600 mt-1">{criticalCount} Ca</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Siren className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-400">Cơ chế phân loại</span>
            <div className="text-xs font-bold text-emerald-700 mt-1.5">Ưu tiên cấp cứu trực tiếp</div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Ca nguy cấp ngắt lịch thường</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Live Priority Queue Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-600" />
              <span>Hàng Đợi Cấp Cứu Ưu Tiên Trực Tuyến</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tự động phân tầng: Nguy kịch (Ưu tiên #1) → Khẩn cấp (Ưu tiên #2) → Tiêu chuẩn (Thứ tự tiếp nhận)
            </p>
          </div>
          <button
            onClick={fetchQueue}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
          >
            Làm mới danh sách
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <Spinner size="md" />
          </div>
        ) : queue.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Không có ca cấp cứu nào đang chờ.</p>
            <p className="text-xs">Bấm "+ Tiếp Nhận Cấp Cứu Khẩn Cấp" khi có bệnh nhân tới quầy tiếp tân.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 text-[11px] uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Ưu tiên #</th>
                  <th className="pb-3 font-semibold">Mức độ nghiêm trọng</th>
                  <th className="pb-3 font-semibold">Patient & Owner</th>
                  <th className="pb-3 font-semibold">Observed Symptoms</th>
                  <th className="pb-3 font-semibold">Assigned Vet</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Intake Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queue.map((item) => {
                  const level = item.triageRecord?.conditionLevel;
                  const isCritical = level === 'LEVEL_1_CRITICAL';
                  const isUrgent = level === 'LEVEL_2_URGENT';

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isCritical ? 'bg-rose-50/40' : ''
                      }`}
                    >
                      <td className="py-4 pr-3">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                            isCritical
                              ? 'bg-rose-600 text-white shadow-sm'
                              : isUrgent
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          #{item.priorityQueueNumber}
                        </span>
                      </td>

                      <td className="py-4 pr-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                            isCritical
                              ? 'bg-rose-100 text-rose-800'
                              : isUrgent
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {isCritical && <Siren className="w-3.5 h-3.5 animate-pulse" />}
                          {isUrgent && <AlertTriangle className="w-3.5 h-3.5" />}
                          {level?.replace('LEVEL_', 'Level ')}
                        </span>
                      </td>

                      <td className="py-4 pr-3">
                        <p className="font-bold text-slate-800 text-sm">{item.pet?.name}</p>
                        <span className="text-[11px] text-slate-500">
                          {item.pet?.species} • Owner: {item.pet?.owner?.user?.fullName || 'Anonymous'}
                        </span>
                      </td>

                      <td className="py-4 pr-3 max-w-xs">
                        <p className="text-xs text-slate-700 font-medium truncate" title={item.triageRecord?.initialSymptoms}>
                          {item.triageRecord?.initialSymptoms}
                        </p>
                      </td>

                      <td className="py-4 pr-3">
                        <span className="text-xs font-semibold text-slate-800">
                          Dr. {item.veterinarian?.fullName || 'Unassigned'}
                        </span>
                      </td>

                      <td className="py-4 pr-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'IN_EXAMINATION'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.status === 'IN_EXAMINATION' ? 'IN EXAMINATION' : 'WAITING VET'}
                        </span>
                      </td>

                      <td className="py-4 text-right text-xs text-slate-400 font-mono">
                        {new Date(item.triageRecord?.triageTime || item.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for intake */}
      <EmergencyIntakeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleTriageSuccess}
      />
    </div>
  );
};

/* =========================================================================
   3. VETERINARIAN DASHBOARD (UC-EMG-01 & BR-04 Queue Receiver)
   ========================================================================= */
export const VetDashboard = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activePatient, setActivePatient] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);
  const [actionNotice, setActionNotice] = useState('');

  const previousCriticalRef = useRef(0);

  // Play audio chime for Level 1 emergency alert using Web Audio API
  const playEmergencyAudioChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 alert tone
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }, [soundEnabled]);

  const fetchQueue = useCallback(async () => {
    try {
      const data = await triageService.getEmergencyQueue();
      setQueue(data || []);

      // Check if new Level 1 critical arrived
      const criticalWaiting = (data || []).filter(
        (q) => q.triageRecord?.conditionLevel === 'LEVEL_1_CRITICAL' && q.status === 'EMERGENCY_WAITING'
      );

      if (criticalWaiting.length > previousCriticalRef.current) {
        playEmergencyAudioChime();
      }
      previousCriticalRef.current = criticalWaiting.length;

      // Find if there is an ongoing IN_EXAMINATION patient
      const inExam = (data || []).find((q) => q.status === 'IN_EXAMINATION');
      if (inExam) {
        setActivePatient(inExam);
      }
    } catch (err) {
      console.error('Failed to load vet emergency queue:', err);
    } finally {
      setLoading(false);
    }
  }, [playEmergencyAudioChime]);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const handleAcceptCase = async (appointmentId) => {
    try {
      setAcceptingId(appointmentId);
      const res = await triageService.acceptEmergencyCase(appointmentId);
      setActionNotice(
        `Case accepted! Patient "${res.pet?.name}" is now IN_EXAMINATION in Room 1.`
      );
      fetchQueue();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept emergency case.');
    } finally {
      setAcceptingId(null);
    }
  };

  const criticalWaitingList = queue.filter(
    (q) => q.triageRecord?.conditionLevel === 'LEVEL_1_CRITICAL' && q.status === 'EMERGENCY_WAITING'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Vet Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
              Clinical Examination Suite
            </span>
            <span className="text-xs text-slate-400">Veterinarian: {user?.fullName}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mt-1 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-emerald-600" />
            <span>Hàng Đợi Cấp Cứu & Khám Bệnh Trực Tuyến</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tiếp nhận và điều phối ca khám lâm sàng theo thời gian thực.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors ${
              soundEnabled
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                : 'border-slate-300 bg-slate-100 text-slate-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'Âm thanh cảnh báo: BẬT' : 'Âm thanh: TẮT'}</span>
          </button>

          <button
            onClick={fetchQueue}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            Làm mới
          </button>
        </div>
      </div>

      {actionNotice && (
        <Alert
          type="success"
          message={actionNotice}
          onClose={() => setActionNotice('')}
        />
      )}

      {/* CRITICAL POPUP BANNER */}
      {criticalWaitingList.length > 0 && (
        <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-red-800 text-white p-5 rounded-3xl shadow-lg shadow-rose-200 flex flex-col sm:flex-row items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Siren className="w-7 h-7 text-white animate-spin" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-rose-200">
                🚨 CẢNH BÁO BỆNH NHÂN CẤP CỨU NGUY KỊCH (ƯU TIÊN SỐ 1)
              </div>
              <h3 className="text-base sm:text-lg font-bold">
                Có {criticalWaitingList.length} ca nguy kịch cần sơ cứu / hồi sức tức thì!
              </h3>
              <p className="text-xs text-rose-100 mt-0.5">
                Các ca khám thường cần tạm hoãn để ưu tiên tiếp nhận cấp cứu Level 1.
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="md"
            onClick={() => handleAcceptCase(criticalWaitingList[0].id)}
            isLoading={acceptingId === criticalWaitingList[0].id}
            className="flex-shrink-0 font-bold text-rose-700 bg-white hover:bg-rose-50"
          >
            Accept Patient #{criticalWaitingList[0].pet?.name} →
          </Button>
        </div>
      )}

      {/* Grid: Active Patient In Examination vs Emergency Queue List */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Active Patient Encounter */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-base flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-emerald-600" />
              <span>Current Examination Patient</span>
            </span>
            {activePatient && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 animate-pulse">
                IN EXAMINATION
              </span>
            )}
          </h3>

          {activePatient ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{activePatient.pet?.name}</h4>
                    <p className="text-xs text-slate-500">
                      {activePatient.pet?.species} • {activePatient.pet?.breed || 'Standard'}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded bg-rose-100 text-rose-800">
                    {activePatient.triageRecord?.conditionLevel}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-emerald-200/60 text-xs text-slate-700 space-y-1">
                  <p>
                    <span className="font-semibold">Symptoms:</span>{' '}
                    {activePatient.triageRecord?.initialSymptoms}
                  </p>
                  <p>
                    <span className="font-semibold">Admitted:</span>{' '}
                    {new Date(activePatient.triageRecord?.triageTime).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Bước khám tiếp theo:</span>
                </p>
                <p>Ghi nhận chỉ số sinh hiệu (Nhiệt độ, Cân nặng, Nhịp tim) và tiến hành chẩn đoán lâm sàng.</p>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Stethoscope className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-medium text-slate-500">Chưa có bệnh nhân nào đang trong ca khám.</p>
              <p className="text-[11px]">Chọn một ca từ danh sách cấp cứu bên phải để bắt đầu khám bệnh.</p>
            </div>
          )}
        </div>

        {/* Priority Emergency Queue (2 cols on xl) */}
        <div className="xl:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Activity className="w-5 h-5 text-rose-600" />
                <span>Hàng Đợi Cấp Cứu Ưu Tiên</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Danh sách ca khám cấp cứu được phân loại theo mức độ nghiêm trọng
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700">
              {queue.length} Active Tickets
            </span>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <Spinner size="md" />
            </div>
          ) : queue.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">No patients waiting in queue.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((item) => {
                const level = item.triageRecord?.conditionLevel;
                const isCritical = level === 'LEVEL_1_CRITICAL';
                const isUrgent = level === 'LEVEL_2_URGENT';
                const isBeingExamined = item.status === 'IN_EXAMINATION';

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isCritical
                        ? 'border-rose-300 bg-rose-50/50 shadow-sm'
                        : isUrgent
                        ? 'border-amber-200 bg-amber-50/40'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                          isCritical
                            ? 'bg-rose-600 text-white shadow-sm'
                            : isUrgent
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        #{item.priorityQueueNumber}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-base">{item.pet?.name}</h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isCritical
                                ? 'bg-rose-100 text-rose-800'
                                : isUrgent
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {level?.replace('LEVEL_', 'Level ')}
                          </span>
                          {isBeingExamined && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              IN EXAM
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 mt-0.5">
                          {item.pet?.species} • Weight: {item.pet?.weight || '?'} kg • Owner:{' '}
                          {item.pet?.owner?.user?.fullName || 'Anonymous'}
                        </p>

                        <p className="text-xs text-slate-700 mt-1.5 font-medium leading-relaxed bg-white/70 p-2 rounded-lg border border-slate-100">
                          <span className="font-semibold text-rose-700">Symptoms:</span>{' '}
                          {item.triageRecord?.initialSymptoms}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 flex-shrink-0">
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(item.triageRecord?.triageTime || item.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      {!isBeingExamined ? (
                        <Button
                          variant={isCritical ? 'danger' : 'primary'}
                          size="sm"
                          isLoading={acceptingId === item.id}
                          onClick={() => handleAcceptCase(item.id)}
                          className="flex items-center gap-1.5 text-xs font-bold"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>Start Examination</span>
                        </Button>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Active in Room</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   4. INPATIENT & LABORATORY DASHBOARD
   ========================================================================= */
export const LabDashboard = () => {
  const { user } = useAuth();
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Inpatient & Laboratory Queue</h1>
            <p className="text-sm text-slate-500">
              Logged in as {user?.fullName} ({user?.role})
            </p>
          </div>
        </div>
        <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-sm text-indigo-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <span>Hàng đợi chỉ định cận lâm sàng, xét nghiệm & chăm sóc nội trú.</span>
        </div>
      </div>
    </div>
  );
};
