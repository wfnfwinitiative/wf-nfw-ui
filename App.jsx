import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { RoleGuard } from './auth/RoleGuard';
import { DashboardLayout } from './layouts/DashboardLayout';

import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Coordinators } from './pages/admin/Coordinators';
import { Drivers } from './pages/admin/Drivers';
import { Vehicles } from './pages/admin/Vehicles';
import { PickupLocations } from './pages/admin/PickupLocations';
import { HungerSpots } from './pages/admin/HungerSpots';

import { CoordinatorDashboard } from './pages/coordinator/CoordinatorDashboard';
import { CreatePickup } from './pages/coordinator/CreatePickup';
import { CoordinatorDrivers } from './pages/coordinator/CoordinatorDrivers';

import { DriverDashboard } from './pages/driver/DriverDashboard';

import { Verification } from './pages/verification/Verification';
import { VerificationDetail } from './pages/verification/VerificationDetail';
import { Profile } from './pages/profile/Profile';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
      <BrowserRouter>
        <SidebarProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/admin" element={<RoleGuard allowedRoles={['admin']}><DashboardLayout /></RoleGuard>}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="coordinators" element={<Coordinators />} />
            <Route path="drivers" element={<Drivers />} />
            <Route path="vehicles" element={<Vehicles />} />
            <Route path="pickup-locations" element={<PickupLocations />} />
            <Route path="hungerspots" element={<HungerSpots />} />
            <Route path="settings" element={<div className="text-center py-12 text-ngo-gray">Settings page coming soon...</div>} />
          </Route>

          <Route path="/coordinator" element={<RoleGuard allowedRoles={['coordinator']}><DashboardLayout /></RoleGuard>}>
            <Route path="dashboard" element={<CoordinatorDashboard />} />
            <Route path="create-pickup" element={<CreatePickup />} />
            <Route path="drivers" element={<CoordinatorDrivers />} />
          </Route>

          <Route path="/driver" element={<RoleGuard allowedRoles={['driver']}><DashboardLayout /></RoleGuard>}>
            <Route path="dashboard" element={<DriverDashboard />} />
            {/* <Route path="tasks" element={<DriverDashboard />} />
            <Route path="task/:id" element={<TaskDetail />} /> */}
          </Route>

          <Route path="/verification" element={<RoleGuard allowedRoles={['admin', 'coordinator']}><DashboardLayout /></RoleGuard>}>
            <Route index element={<Verification />} />
            <Route path=":id" element={<VerificationDetail />} />
          </Route>

          <Route path="/profile" element={<RoleGuard allowedRoles={['admin', 'coordinator', 'driver']}><DashboardLayout /></RoleGuard>}>
            <Route index element={<Profile />} />
            <Route path="edit" element={<Profile />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
        </SidebarProvider>
      </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
