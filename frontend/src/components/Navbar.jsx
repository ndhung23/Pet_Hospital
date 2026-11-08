import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getRoleDashboardRoute } from '../contexts/AuthContext';

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
    `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
      location.pathname === path
        ? 'bg-blue-50 text-blue-700 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-8">
            <Link to={dashboardRoute} className="flex items-center space-x-2">
              <span className="text-2xl">🐾</span>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                PHMS Hospital
              </span>
            </Link>

            {user && (
              <div className="hidden md:flex items-center space-x-2">
                <Link to={dashboardRoute} className={navItemClass(dashboardRoute)}>
                  Dashboard
                </Link>
                {role === 'PET_OWNER' && (
                  <Link to="/ai-advisor" className={navItemClass('/ai-advisor')}>
                    ✨ AI Health Guide
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
                  className="flex items-center space-x-2 text-sm text-slate-700 hover:text-blue-600 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white transition-colors"
                >
                  <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                    {user.fullName ? user.fullName.charAt(0) : 'U'}
                  </span>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold leading-tight">{user.fullName}</p>
                    <span className="inline-block text-[10px] font-medium px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                      {roleLabels[role] || role}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-xs sm:text-sm text-rose-600 hover:text-rose-700 font-medium px-3 py-1.5 rounded-md hover:bg-rose-50 transition-colors"
                >
                  Logout
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
