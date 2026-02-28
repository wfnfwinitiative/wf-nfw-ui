import { AdminSettings } from '../components/dashboard/AdminSettings';
import { Settings } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
          <Settings className="w-6 h-6 text-gray-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500">Manage application settings and configurations</p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Voice Support Settings */}
        <AdminSettings />

        {/* Add more settings sections here as needed */}
      </div>
    </div>
  );
}

export default SettingsPage;
