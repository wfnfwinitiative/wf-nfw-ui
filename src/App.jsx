import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { FeatureFlagsProvider } from './contexts/FeatureFlagsContext';
import { ReviewOpportunitiesProvider } from './contexts/ReviewOpportunitiesContext';
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
import { FeatureFlag } from './pages/admin/FeatureFlag';

import { CoordinatorDashboard } from './pages/coordinator/CoordinatorDashboard';
import { CreatePickup } from './pages/coordinator/CreatePickup';
import { CoordinatorDrivers } from './pages/coordinator/CoordinatorDrivers';

import { DriverDashboard } from './pages/driver/DriverDashboard';
import { DriverTasksPage } from './pages/driver/DriverTasksPage';
import { TaskDetail } from './pages/driver/TaskDetail';

import { ReviewOpportunities } from './pages/reviewOpportunities/ReviewOpportunities';
import { ReviewOpportunityDetail } from './pages/reviewOpportunities/ReviewOpportunityDetail';
import { Verification } from './pages/verification/Verification';
import { VerificationDetail } from './pages/verification/VerificationDetail';
import { Profile } from './pages/profile/Profile';
import { useAuth } from './auth/AuthContext';

function DashboardRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user?.role) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={`/${user.role}/dashboard`} replace />;
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <FeatureFlagsProvider>
          <ReviewOpportunitiesProvider>
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
            <Route path="feature-flag" element={<FeatureFlag />} />
            <Route path="settings" element={<div className="text-center py-12 text-ngo-gray">Settings page coming soon...</div>} />
          </Route>

          <Route path="/coordinator" element={<RoleGuard allowedRoles={['coordinator']}><DashboardLayout /></RoleGuard>}>
            <Route path="dashboard" element={<CoordinatorDashboard />} />
            <Route path="create-opportunity" element={<CreatePickup />} />
            <Route path="drivers" element={<CoordinatorDrivers />} />
            <Route path="review-opportunities" element={<ReviewOpportunities />} />
            <Route path="review-opportunities/:id" element={<ReviewOpportunityDetail />} />
          </Route>

          <Route path="/driver" element={<RoleGuard allowedRoles={['driver']}><DashboardLayout /></RoleGuard>}>
            <Route path="dashboard" element={<DriverDashboard />} />
            <Route path="tasks" element={<DriverTasksPage />} />
            <Route path="task/:id" element={<TaskDetail />} />
          </Route>

          <Route path="/verification" element={<RoleGuard allowedRoles={['admin', 'coordinator']}><DashboardLayout /></RoleGuard>}>
            <Route index element={<Verification />} />
            <Route path=":id" element={<VerificationDetail />} />
          </Route>

          <Route path="/profile" element={<RoleGuard allowedRoles={['admin', 'coordinator', 'driver']}><DashboardLayout /></RoleGuard>}>
            <Route index element={<Profile />} />
            <Route path="edit" element={<Profile />} />
          </Route>

          <Route path="/dashboard" element={<DashboardRedirect />} />

          <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
            </SidebarProvider>
          </BrowserRouter>
        </ReviewOpportunitiesProvider>
        </FeatureFlagsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
