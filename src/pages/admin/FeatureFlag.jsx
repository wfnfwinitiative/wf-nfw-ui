import React, { useState, useEffect } from 'react';
import { mockApi } from '../../services/mockApi';
import { showToast } from '../../components/common/Toast';

const FEATURE_KEY = 'LLM_FEATURE';
const STORAGE_KEY = 'nofoodwaste_llm_feature';

const getStoredFlag = () => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'true') return true;
    if (v === 'false') return false;
  } catch (_) {}
  return false;
};

export const FeatureFlag = () => {
  const [enabled, setEnabled] = useState(getStoredFlag);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEnabled(getStoredFlag());
  }, []);

  const handleToggle = async () => {
    const next = !enabled;
    setLoading(true);
    try {
      const res = await mockApi.updateFeatureFlag({ feature: FEATURE_KEY, enabled: next });
      if (res?.status === 'success') {
        localStorage.setItem(STORAGE_KEY, String(next));
        setEnabled(next);
        showToast('Feature flag updated successfully', 'success');
      } else {
        showToast('Failed to update feature flag', 'error');
      }
    } catch (_) {
      showToast('Failed to update feature flag', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-1 md:mb-2">Feature Flag</h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Enable or disable features via backend (mock).</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 max-w-md">
        <div className="flex items-center justify-between gap-4">
          <label htmlFor="llm-toggle" className="text-base font-medium text-gray-800 dark:text-gray-200">
            Voice Enable
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
    </div>
  );
};

export default FeatureFlag;
