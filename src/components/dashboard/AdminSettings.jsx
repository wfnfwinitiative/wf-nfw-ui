import { useState } from 'react';
import { Settings, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useFeatureFlags, FEATURE_FLAGS } from '../../contexts/FeatureFlagsContext';
import { showToast } from '../common';

export function AdminSettings() {
  const { flags, updateFlag, createFlag, loading, isVoiceEnabled } = useFeatureFlags();
  const [updating, setUpdating] = useState(false);

  const voiceFlag = flags[FEATURE_FLAGS.VOICE_SUPPORT];

  const handleToggleVoice = async () => {
    setUpdating(true);
    try {
      // If flag doesn't exist, create it first
      if (!voiceFlag?.id) {
        await createFlag(FEATURE_FLAGS.VOICE_SUPPORT, true);
        showToast('Voice support flag created and enabled', 'success');
      } else {
        // Toggle existing flag
        await updateFlag(FEATURE_FLAGS.VOICE_SUPPORT, !isVoiceEnabled);
        showToast(
          `Voice support ${!isVoiceEnabled ? 'enabled' : 'disabled'} successfully`,
          'success'
        );
      }
    } catch (error) {
      showToast('Failed to update voice support setting', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          <Settings className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">System Settings</h2>
          <p className="text-sm text-gray-500">Manage application-wide settings</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Voice Support Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            {isVoiceEnabled ? (
              <Volume2 className="w-5 h-5 text-green-600" />
            ) : (
              <VolumeX className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <h3 className="font-medium text-gray-900">Voice Support</h3>
              <p className="text-sm text-gray-500">
                Enable or disable voice input for drivers
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleVoice}
            disabled={updating}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              isVoiceEnabled ? 'bg-green-500' : 'bg-gray-300'
            } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
            role="switch"
            aria-checked={isVoiceEnabled}
          >
            <span className="sr-only">Toggle voice support</span>
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isVoiceEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            >
              {updating && (
                <Loader2 className="w-3 h-3 animate-spin text-gray-400 absolute top-1 left-1" />
              )}
            </span>
          </button>
        </div>

        {/* Status Indicator */}
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isVoiceEnabled ? 'bg-green-500' : 'bg-gray-400'
            }`}
          />
          Voice input is currently {isVoiceEnabled ? 'enabled' : 'disabled'} for all
          drivers
        </div>
      </div>
    </section>
  );
}

export default AdminSettings;
