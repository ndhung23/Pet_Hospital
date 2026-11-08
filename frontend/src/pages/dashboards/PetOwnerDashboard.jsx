import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Sparkles,
  Bot,
  User,
  CalendarPlus,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const PetOwnerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 rounded-3xl p-8 text-white shadow-md mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Pet Owner Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold mt-2">Welcome back, {user?.fullName}!</h1>
            <p className="text-blue-100 text-sm mt-1 max-w-xl">
              Access 24/7 AI-guided health triage, track your pets' clinical history, and manage your account.
            </p>
          </div>
          <Link
            to="/ai-advisor"
            className="inline-flex items-center gap-2 px-5 py-3 bg-white text-blue-600 font-semibold text-sm rounded-xl hover:bg-blue-50 transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Consult AI Health Advisor</span>
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">AI Health Guidance</h3>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            Query symptoms anytime. Built-in emergency detection alerts you if symptoms require emergency triage.
          </p>
          <Link
            to="/ai-advisor"
            className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>Open Consultation</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <User className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">My Profile & Pets</h3>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            Update your residential address, contact number, and review your registered pets and clinical history.
          </p>
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>View Profile</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <CalendarPlus className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">Online Appointments</h3>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            Book appointments with on-duty veterinarians (UC-BOOK-01 module scheduled in next sprint).
          </p>
          <span className="inline-block mt-4 text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
            Coming Soon (UC-BOOK-01)
          </span>
        </div>
      </div>
    </div>
  );
};

export default PetOwnerDashboard;
