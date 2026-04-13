import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { User, LayoutDashboard, LogOut } from 'lucide-react';

export const ProfileDropdown = ({ hideEditProfile = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const dashboardPath = user?.role ? `/${user.role}/dashboard` : '/login';

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex flex-row items-center justify-end gap-2 min-h-[44px] rounded-full focus:outline-none"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="text-right flex-shrink-0 hidden sm:block">
          <p className="text-sm md:text-base font-semibold text-ngo-dark dark:text-gray-200">{user?.name}</p>
          <p className="text-xs text-ngo-gray dark:text-gray-400 capitalize">{(user?.roles || [user?.role]).join(', ')}</p>
        </div>
        <div className="w-10 h-10 bg-ngo-orange rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-1rem)] bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-[9999] overflow-y-auto max-h-[calc(100vh-72px)]">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{user?.name}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{(user?.roles || [user?.role]).join(', ')}</p>
          </div>

          <div className="py-1">
            {!hideEditProfile && (
              <button
                type="button"
                onClick={() => { setOpen(false); navigate('/profile/edit'); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-ngo-light dark:hover:bg-gray-700 text-left"
              >
                <User className="w-4 h-4 text-ngo-orange flex-shrink-0" />
                Edit Profile
              </button>
            )}
            <button
              type="button"
              onClick={() => { setOpen(false); navigate(dashboardPath); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-ngo-light dark:hover:bg-gray-700 text-left"
            >
              <LayoutDashboard className="w-4 h-4 text-ngo-orange flex-shrink-0" />
              Dashboard
            </button>
          </div>

          <div className="py-1 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 text-left"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
