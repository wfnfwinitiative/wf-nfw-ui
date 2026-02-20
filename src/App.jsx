import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ROLES } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth';
import { DashboardLayout } from './components/layout';
import {
  LoginPage,
  DashboardPage,

  // Need to implement these pages
  // SettingsPage,
  // PickupRequestsPage,
  // DriverStatusPage,
  // UserManagementPage,
  // AnalyticsPage,
  // AssignPickupsPage,
  // AssignmentsPage,
} from './pages';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              {/* Common Routes for all roles */}
              <Route path="/dashboard" element={<DashboardPage />} />

              {/* Driver Routes */}
              <Route element={<ProtectedRoute allowedRoles={[ROLES.DRIVER]} />}>

              // TODO: Implement these pages and uncomment the routes
                {/* <Route path="/assignments" element={<AssignmentsPage />} /> */}
              </Route>

              {/* Coordinator Routes */}
              <Route element={<ProtectedRoute allowedRoles={[ROLES.COORDINATOR]} />}>
                  {/* <Route path="/pickups" element={<PickupRequestsPage />} /> */}
                {/* <Route path="/drivers" element={<DriverStatusPage />} /> */}
              </Route>

              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
                {/* <Route path="/users" element={<UserManagementPage />} />
                <Route path="/assign" element={<AssignPickupsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} /> */}
              </Route>
            </Route>
          </Route>

          {/* Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
