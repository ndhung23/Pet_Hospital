import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
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
} from 'lucide-react';

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
    { id: 'staff', label: 'Staff & Personnel', icon: Users },
    { id: 'schedules', label: 'Duty Shifts & Roster', icon: CalendarDays },
    { id: 'leaves', label: 'Leave Requests', icon: FileSpreadsheet, badge: '2 pending' },
    { id: 'services', label: 'Services & Pharmacy', icon: Pill },
    { id: 'reports', label: 'Analytics & Invoices', icon: TrendingUp },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-slate-50">
      {/* 12-Column Grid: Left 2, Right 10, Full Width */}
      <div className="grid grid-cols-12 w-full">
        {/* ================= LEFT COLUMN: 2 COLS (Sidebar) ================= */}
        <aside className="col-span-12 lg:col-span-2 bg-white border-r border-slate-200 min-h-full p-4 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Sidebar Branding */}
            <div className="px-2 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Clinic Admin Console
              </span>
              <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2 mt-1">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>Executive Desk</span>
              </h2>
            </div>

            {/* Navigation Menu */}
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

          {/* Bottom Admin Card */}
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

        {/* ================= RIGHT COLUMN: 10 COLS (Content) ================= */}
        <main className="col-span-12 lg:col-span-10 p-6 sm:p-8 space-y-8 min-h-screen">
          {/* Top Bar / Greetings */}
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

          {/* 4 Metric Cards */}
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

          {/* Central Grid: Staff Management Table & Recent Operational Feed */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Staff Overview */}
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

              {/* Table */}
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

            {/* Right Feed: Activity & Quick Policy Alert */}
            <div className="space-y-6">
              {/* Activity Log */}
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

              {/* Policy Card */}
              <div className="bg-gradient-to-tr from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 space-y-2.5">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-blue-800" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                    Hospital Policy Reminder (BR-03)
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
        </main>
      </div>
    </div>
  );
};

export const ReceptionDashboard = () => {
  const { user } = useAuth();
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Reception Desk & Triage Queue</h1>
            <p className="text-sm text-slate-500">
              Logged in as {user?.fullName} ({user?.role})
            </p>
          </div>
        </div>
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>Receptionist workspace initialized. Emergency triage (UC-EMG-01) and Invoicing (UC-INV-01) modules are staged.</span>
        </div>
      </div>
    </div>
  );
};

export const VetDashboard = () => {
  const { user } = useAuth();
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Veterinarian Examination Room</h1>
            <p className="text-sm text-slate-500">
              Logged in as {user?.fullName} ({user?.role})
            </p>
          </div>
        </div>
        <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Clinical examination & EMR encounter management workspace ready.</span>
        </div>
      </div>
    </div>
  );
};

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
          <span>Paraclinical lab orders & inpatient nursing care queue.</span>
        </div>
      </div>
    </div>
  );
};
