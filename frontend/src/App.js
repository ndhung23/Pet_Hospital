/**
 * File: App.js
 * Module: Frontend Application Root & Routing
 * Author: he194418-NhacTuanAnh
 * Date: 09/11/2026
 * Version: 1.0.0
 * Description: Root React router configuring protected routes for appointment and pet CRUD views.
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, getRoleDashboardRoute } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// App Pages
import Profile from './pages/Profile';
import AiAdvisor from './pages/AiAdvisor';
import PetOwnerDashboard from './pages/dashboards/PetOwnerDashboard';
import {
  ReceptionDashboard,
  VetDashboard,
  LabDashboard,
  ManagerDashboard,
} from './pages/dashboards/StaffDashboards';

// CRUD Pages (HE194418 - Nhac Tuan Anh)
import BookAppointmentView from './pages/BookAppointmentView';
import AppointmentListView from './pages/AppointmentListView';
import PetListView from './pages/PetListView';
import AddPetView from './pages/AddPetView';

// Root redirect component based on authentication state
const RootRedirect = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated && role) {
    return <Navigate to={getRoleDashboardRoute(role)} replace />;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Root redirect */}
              <Route path="/" element={<RootRedirect />} />

              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected Routes for All Authenticated Users */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<Profile />} />

                {/* CRUD Use Cases for Pet and Appointment */}
                <Route path="/appointments" element={<AppointmentListView />} />
                <Route path="/appointments/book" element={<BookAppointmentView />} />
                <Route path="/pets" element={<PetListView />} />
                <Route path="/pets/add" element={<AddPetView />} />
              </Route>

              {/* Role-Specific Protected Routes */}
              <Route element={<ProtectedRoute allowedRoles={['PET_OWNER']} />}>
                <Route path="/portal" element={<PetOwnerDashboard />} />
                <Route path="/ai-advisor" element={<AiAdvisor />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['RECEPTIONIST']} />}>
                <Route path="/reception" element={<ReceptionDashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['VETERINARIAN']} />}>
                <Route path="/vet" element={<VetDashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['NURSE']} />}>
                <Route path="/lab" element={<LabDashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['CLINIC_MANAGER']} />}>
                <Route path="/manager" element={<ManagerDashboard />} />
              </Route>

              {/* Catch-all fallback */}
              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
