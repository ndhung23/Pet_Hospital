import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getRoleDashboardRoute } from '../contexts/AuthContext';
import {
  HeartPulse,
  Sparkles,
  LayoutDashboard,
  LogOut,
  User,
  Calendar,
  PawPrint,
  CalendarPlus,
} from 'lucide-react';

const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const dashboardRoute = getRoleDashboardRoute(role);

  const roleLabels = {
    PET_OWNER: 'Pet Owner',
    RECEPTIONIST: 'Receptionist',
    VETERINARIAN: 'Veterinarian',
    NURSE: 'Nurse',
    CLINIC_MANAGER: 'Clinic Manager',
  };

  const navItemClass = (path) =>
    `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
      location.pathname === path
        ? 'bg-blue-50 text-blue-700 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-6">
            <Link to={dashboardRoute} className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-200">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  PHMS Hospital
                </span>
                <span className="hidden sm:block text-[10px] text-slate-400 font-medium -mt-1">
                  Veterinary Care & Clinical Suite
                </span>
              </div>
            </Link>

            {user && (
              <div className="hidden md:flex items-center space-x-1">
                <Link to={dashboardRoute} className={navItemClass(dashboardRoute)}>
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                {/* CRUD Links for Pet & Appointment */}
                <Link to="/pets" className={navItemClass('/pets')}>
                  <PawPrint className="w-4 h-4 text-emerald-600" />
                  <span>Pets</span>
                </Link>

                <Link to="/appointments" className={navItemClass('/appointments')}>
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Appointments</span>
                </Link>

                <Link to="/appointments/book" className={navItemClass('/appointments/book')}>
                  <CalendarPlus className="w-4 h-4 text-indigo-600" />
                  <span>Book Visit</span>
                </Link>

                {role === 'PET_OWNER' && (
                  <Link to="/ai-advisor" className={navItemClass('/ai-advisor')}>
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>AI Guide</span>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* User actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-xs sm:text-sm text-slate-700 hover:text-blue-600 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold leading-tight text-slate-800">{user.fullName}</p>
                    <span className="inline-block text-[10px] font-medium text-slate-500">
                      {roleLabels[role] || role}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 text-xs sm:text-sm text-rose-600 hover:text-rose-700 font-medium px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <div className="space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-blue-600"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
