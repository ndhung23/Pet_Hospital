import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Sparkles,
  Bot,
  CalendarPlus,
  ArrowRight,
  ShieldCheck,
  Calendar,
  PawPrint,
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
              Book clinic visits online, manage registered pet profiles, review appointments, and access 24/7 AI-guided health triage.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/appointments/book"
              className="inline-flex items-center gap-2 px-5 py-3 bg-white text-blue-600 font-semibold text-sm rounded-xl hover:bg-blue-50 transition-colors shadow-sm"
            >
              <CalendarPlus className="w-4 h-4 text-blue-600" />
              <span>Book Appointment (UC-BOOK-01)</span>
            </Link>
            <Link
              to="/ai-advisor"
              className="inline-flex items-center gap-2 px-4 py-3 bg-blue-700/60 text-white font-medium text-sm rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>AI Advisor</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Book Appointment */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition-colors">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <CalendarPlus className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">Book Appointment</h3>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            Schedule a clinic visit with our duty veterinarians in 30-min consultation slots (BR-02).
          </p>
          <Link
            to="/appointments/book"
            className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>Book Visit Online (UC-BOOK-01)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* View Appointments */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-400 transition-colors">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">My Appointments</h3>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            View booking status (UC-BOOK-05), reschedule slots (UC-BOOK-04), or cancel visits (UC-BOOK-03).
          </p>
          <Link
            to="/appointments"
            className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <span>Manage Appointments</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Manage Pets */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-400 transition-colors">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <PawPrint className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">My Pets</h3>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            View pet list (UC-PET-04), register new pet profiles (UC-PET-01), or update profiles (UC-PET-02).
          </p>
          <Link
            to="/pets"
            className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            <span>Manage Pets</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* AI Health Guidance */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-400 transition-colors">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">AI Health Guide</h3>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            Query symptoms 24/7 with veterinary guidance disclaimer and automated medical context injection.
          </p>
          <Link
            to="/ai-advisor"
            className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-purple-600 hover:text-purple-700"
          >
            <span>Open Consultation</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PetOwnerDashboard;
