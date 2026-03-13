import React, { useState, useEffect } from 'react';
import { FEATURE_FLAGS } from '../../services/api/featureFlagsService';
import { useFeatureFlags } from '../../contexts/FeatureFlagsContext';
import { showToast } from '../../components/common/Toast';
import { Loader2 } from 'lucide-react';

export const FeatureFlag = () => {
  const { flags, loading: flagsLoading, updateFlag, refreshFlags } = useFeatureFlags();
  const [loading, setLoading] = useState(false);
  const [googleImageUploadLoading, setGoogleImageUploadLoading] = useState(false);

  // Derive toggle states directly from shared context
  const enabled = flags[FEATURE_FLAGS.VOICE_SUPPORT]?.enabled ?? false;
  const googleImageUploadEnabled = flags[FEATURE_FLAGS.GOOGLE_IMAGE_UPLOAD]?.enabled ?? false;

  const pageLoading = flagsLoading;

  const handleToggle = async () => {
    setLoading(true);
    try {
      await updateFlag(FEATURE_FLAGS.VOICE_SUPPORT, !enabled);
      showToast('Feature flag updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update feature flag:', error);
      showToast('Failed to update feature flag', 'error');
      await refreshFlags(); // re-sync context with DB on failure
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleImageUploadToggle = async () => {
    setGoogleImageUploadLoading(true);
    try {
      await updateFlag(FEATURE_FLAGS.GOOGLE_IMAGE_UPLOAD, !googleImageUploadEnabled);
      showToast('Feature flag updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update feature flag:', error);
      showToast('Failed to update feature flag', 'error');
      await refreshFlags(); // re-sync context with DB on failure
    } finally {
      setGoogleImageUploadLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-1 md:mb-2">Feature Flags</h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Enable or disable features.</p>
      </div>

      {pageLoading ? (
        <div className="flex justify-center items-center p-16">
          <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 max-w-md space-y-4">
        <div>
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="llm-toggle" className="text-base font-medium text-gray-800 dark:text-gray-200">
              Voice Support
            </label>
            <button
              id="llm-toggle"
              type="button"
              role="switch"
              aria-checked={enabled}
              disabled={loading}
              onClick={handleToggle}
              className={`
                relative inline-flex h-7 w-12 min-w-[3rem] flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ngo-orange focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                ${enabled ? 'bg-ngo-orange' : 'bg-gray-200 dark:bg-gray-600'}
              `}
            >
              <span
                className={`
                  pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0
                  transition duration-200 ease-in-out
                  ${enabled ? 'translate-x-5' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
          {loading && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Updating…</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="google-image-upload-toggle" className="text-base font-medium text-gray-800 dark:text-gray-200">
              Google Image upload
            </label>
            <button
              id="google-image-upload-toggle"
              type="button"
              role="switch"
              aria-checked={googleImageUploadEnabled}
              disabled={googleImageUploadLoading}
              onClick={handleGoogleImageUploadToggle}
              className={`
                relative inline-flex h-7 w-12 min-w-[3rem] flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ngo-orange focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                ${googleImageUploadEnabled ? 'bg-ngo-orange' : 'bg-gray-200 dark:bg-gray-600'}
              `}
            >
              <span
                className={`
                  pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0
                  transition duration-200 ease-in-out
                  ${googleImageUploadEnabled ? 'translate-x-5' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
          {googleImageUploadLoading && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Updating…</p>
          )}
        </div>
        </div>
      )}
    </div>
  );
};

export default FeatureFlag;
