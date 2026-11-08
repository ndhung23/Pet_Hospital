import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export const ReceptionDashboard = () => {
  const { user } = useAuth();
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">Reception Desk & Triage Queue</h1>
        <p className="text-sm text-slate-500 mt-1">
          Logged in as {user?.fullName} ({user?.role})
        </p>
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
          📍 Receptionist workspace initialized. Emergency triage (UC-EMG-01) and Invoicing (UC-INV-01) modules are staged.
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
        <h1 className="text-2xl font-bold text-slate-800">Veterinarian Examination Room</h1>
        <p className="text-sm text-slate-500 mt-1">
          Logged in as {user?.fullName} ({user?.role})
        </p>
        <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">
          🩺 Clinical examination & EMR encounter management workspace ready.
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
        <h1 className="text-2xl font-bold text-slate-800">Inpatient & Laboratory Queue</h1>
        <p className="text-sm text-slate-500 mt-1">
          Logged in as {user?.fullName} ({user?.role})
        </p>
        <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-sm text-indigo-800">
          🧪 Paraclinical lab orders & inpatient nursing care queue.
        </div>
      </div>
    </div>
  );
};

export const ManagerDashboard = () => {
  const { user } = useAuth();
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">Clinic Manager Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Logged in as {user?.fullName} ({user?.role})
        </p>
        <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-xl text-sm text-purple-800">
          📊 Administrative management, duty schedules, leave approvals & catalog oversight.
        </div>
      </div>
    </div>
  );
};
