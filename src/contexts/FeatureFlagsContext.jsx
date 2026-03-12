import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { featureFlagsService, FEATURE_FLAGS } from '../services/api/featureFlagsService';

const FeatureFlagsContext = createContext(null);

export { FEATURE_FLAGS };

export function FeatureFlagsProvider({ children }) {
  const [flags, setFlags] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all feature flags on mount
  const fetchFlags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await featureFlagsService.getAllFlags();
      // Defensively handle cases where the API might not return an array
      const flagsList = Array.isArray(data) ? data : [];
      
      // Convert array to object for easier lookup
      const flagsMap = {};
      flagsList.forEach(flag => {
        flagsMap[flag.feature_flag_name] = {
          enabled: flag.enabled,
          name: flag.feature_flag_name,
        };
      });
      setFlags(flagsMap);
    } catch (err) {
      console.error('Failed to fetch feature flags:', err);
      setError(err.message || 'Failed to load feature flags');
      // Set default values on error
      setFlags({
        [FEATURE_FLAGS.VOICE_SUPPORT]: { enabled: true, name: FEATURE_FLAGS.VOICE_SUPPORT },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  // Check if a feature flag is enabled
  const isFeatureEnabled = useCallback((flagName) => {
    const flag = flags[flagName];
    // Default to true if flag doesn't exist (fail-open)
    return flag ? flag.enabled : true;
  }, [flags]);

  // Update a feature flag (Admin only)
  const updateFlag = useCallback(async (flagName, enabled) => {
    const flag = flags[flagName];
    if (!flag) {
      throw new Error(`Flag ${flagName} not found`);
    }

    try {
      const updatedFlag = await featureFlagsService.updateFlag(flag, enabled);
      setFlags(prev => ({
        ...prev,
        [flagName]: {
          ...prev[flagName],
          enabled: updatedFlag.enabled,
        },
      }));
      return updatedFlag;
    } catch (err) {
      console.error('Failed to update feature flag:', err);
      throw err;
    }
  }, [flags]);

  // Create a new feature flag (Admin only)
  const createFlag = useCallback(async (flagName, enabled = true) => {
    try {
      const newFlag = await featureFlagsService.createFlag(flagName, enabled);
      setFlags(prev => ({
        ...prev,
        [newFlag.feature_flag_name]: {
          enabled: newFlag.enabled,
          name: newFlag.feature_flag_name,
        },
      }));
      return newFlag;
    } catch (err) {
      console.error('Failed to create feature flag:', err);
      throw err;
    }
  }, []);

  // Check if voice support is enabled (convenience method)
  const isVoiceEnabled = isFeatureEnabled(FEATURE_FLAGS.VOICE_SUPPORT);

  const value = {
    flags,
    loading,
    error,
    isFeatureEnabled,
    updateFlag,
    createFlag,
    refreshFlags: fetchFlags,
    isVoiceEnabled,
  };

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  return context;
}

export default FeatureFlagsContext;
