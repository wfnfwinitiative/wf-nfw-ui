import React, { useState, useEffect } from 'react';
import { featureFlagsService, FEATURE_FLAGS } from '../../services/api/featureFlagsService';
import { showToast } from '../../components/common/Toast';
import { Loader2 } from 'lucide-react';

export const FeatureFlag = () => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleImageUploadEnabled, setGoogleImageUploadEnabled] = useState(false);
  const [googleImageUploadLoading, setGoogleImageUploadLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const fetchFlags = async () => {
      setPageLoading(true);
      try {
        const data = await featureFlagsService.getAllFlags();
        // Defensively handle cases where the API might not return an array
        const flags = Array.isArray(data) ? data : [];
        
        const voiceSupportFlag = flags.find(f => f.feature_flag_name === FEATURE_FLAGS.VOICE_SUPPORT);
        setEnabled(voiceSupportFlag ? voiceSupportFlag.enabled : false);

        const googleImageUploadFlag = flags.find(f => f.feature_flag_name === FEATURE_FLAGS.GOOGLE_IMAGE_UPLOAD);
        setGoogleImageUploadEnabled(googleImageUploadFlag ? googleImageUploadFlag.enabled : false);

      } catch (error) {
        console.error("Failed to load feature flags", error);
        showToast('Failed to load feature flags', 'error');
        // Keep them off on error
        setEnabled(false);
        setGoogleImageUploadEnabled(false);
      } finally {
        setPageLoading(false);
      }
    };
    fetchFlags();
  }, []);

  const handleToggle = async () => {
    const previousState = enabled;
    const nextState = !previousState;
    setEnabled(nextState); // Optimistic update
    setLoading(true);
    try {
      await featureFlagsService.updateFlag(FEATURE_FLAGS.VOICE_SUPPORT, nextState);
      showToast('Feature flag updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update feature flag:', error);
      showToast('Failed to update feature flag', 'error');
      setEnabled(previousState); // Revert on failure
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleImageUploadToggle = async () => {
    const previousState = googleImageUploadEnabled;
    const nextState = !previousState;
    setGoogleImageUploadEnabled(nextState); // Optimistic update
    setGoogleImageUploadLoading(true);
    try {
      await featureFlagsService.updateFlag(FEATURE_FLAGS.GOOGLE_IMAGE_UPLOAD, nextState);
      showToast('Feature flag updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update feature flag:', error);
      showToast('Failed to update feature flag', 'error');
      setGoogleImageUploadEnabled(previousState); // Revert on failure
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
