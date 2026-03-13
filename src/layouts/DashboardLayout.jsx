import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';
import { Logo } from '../components/Logo';
import { ProfileDropdown } from '../components/ProfileDropdown';
import { Menu, X, Home, Users, Truck, MapPin, FileCheck, Flag, ShieldCheck  } from 'lucide-react';
import { ToastContainer, useToast } from '../components/common/Toast';

export const DashboardLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isSidebarOpen, setSidebarOpen } = useSidebar();
  const { toasts, removeToast } = useToast();

  const menuItems = {
    admin: [
      { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
      { icon: ShieldCheck, label: 'Admins', path: '/admin/admins' },
      { icon: Users, label: 'Coordinators', path: '/admin/coordinators' },
      { icon: Truck, label: 'Drivers', path: '/admin/drivers' },
      { icon: Flag, label: 'Feature Flag', path: '/admin/feature-flag' }
    ],
    coordinator: [
      { icon: Home, label: 'Dashboard', path: '/coordinator/dashboard' },
      { icon: Truck, label: 'Vehicles', path: '/coordinator/vehicles' },
      { icon: MapPin, label: 'Donors', path: '/coordinator/donors' },
      { icon: MapPin, label: 'HungerSpots', path: '/coordinator/hungerspots' },
      { divider: true },
      { icon: Truck, label: 'Create Opportunity', path: '/coordinator/create-opportunity' },
      { icon: FileCheck, label: 'Review Opportunities', path: '/coordinator/review-opportunities' }
    ],
    driver: [
      { icon: Home, label: 'Dashboard', path: '/driver/dashboard' },
      { icon: Truck, label: 'My Tasks', path: '/driver/tasks' }
    ],
    supportadmin: [
      { icon: Home, label: 'Dashboard', path: '/supportadmin/dashboard' }
    ]
  };

  const currentMenu = (() => {
    const roles = user?.roles || (user?.role ? [user.role] : []);
    const seen = new Set();
    const merged = [];
    for (const role of roles) {
      for (const item of menuItems[role] || []) {
        if (item.divider) {
          merged.push(item);
        } else if (!seen.has(item.label)) {
          seen.add(item.label);
          merged.push(item);
        }
      }
    }
    return merged.length ? merged : (menuItems[user?.role] || []);
  })();

  return (
    <div className="min-h-screen bg-ngo-light dark:bg-gray-900">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}
      <aside className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-50 md:translate-x-0 ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:w-0 md:overflow-hidden'} overflow-y-auto`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <Logo />
          {/* Show close button only on mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-300" />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {currentMenu.map((item, idx) => (
            item.divider ? (
              <hr key={idx} className="my-2 border-gray-200 dark:border-gray-700" />
            ) : (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-3 min-h-[44px] text-gray-800 dark:text-gray-200 hover:bg-ngo-light dark:hover:bg-gray-800 rounded-xl transition-colors text-left touch-manipulation text-sm md:text-base"
            >
              <item.icon className="w-5 h-5 text-ngo-orange flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </button>
            )
          ))}
        </nav>
      </aside>

      <div className={`transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
        <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-row items-center justify-between px-4 md:px-6 py-4 gap-3">
            <button
              onClick={() => setSidebarOpen(prev => !prev)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 touch-manipulation flex-shrink-0 text-gray-800 dark:text-gray-200"
              aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              {isSidebarOpen ? <Menu className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex flex-row items-center justify-end gap-3 flex-wrap md:flex-nowrap min-w-0">
              <ProfileDropdown />
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 bg-ngo-light dark:bg-gray-900">
          <Outlet />
        </main>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};
