import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AiChatWidget from './components/AiChatWidget';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';

// App Pages
import Profile from './pages/Profile';
import AiAdvisor from './pages/AiAdvisor';
import MedicalRecordsPage from './pages/MedicalRecordsPage';
import PetOwnerDashboard from './pages/dashboards/PetOwnerDashboard';
import {
  ReceptionDashboard,
  VetDashboard,
  LabDashboard,
  ManagerDashboard,
} from './pages/dashboards/StaffDashboards';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Landing Page */}
              <Route path="/" element={<Home />} />

              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected Routes for All Authenticated Users (AUTH-04, AUTH-05, EMR-02, EMR-03) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/records" element={<MedicalRecordsPage />} />
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          {/* Global Floating AI Assistant Widget */}
          <AiChatWidget />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
