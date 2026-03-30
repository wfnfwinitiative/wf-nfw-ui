import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useFeatureFlags } from '../../contexts/FeatureFlagsContext';
import { showToast } from '../../components/common/Toast';
import { FeatureFlagCard } from '../../components/admin/FeatureFlagCard';
import { FLAG_META } from '../../constants';

export const FeatureFlag = () => {
  const { flags, loading: flagsLoading, updateFlag, refreshFlags } = useFeatureFlags();
  const [loadingFlags, setLoadingFlags] = useState({});

  const handleToggle = async (flagKey) => {
    const currentlyEnabled = flags[flagKey]?.enabled ?? false;
    setLoadingFlags(prev => ({ ...prev, [flagKey]: true }));
    try {
      await updateFlag(flagKey, !currentlyEnabled);
      showToast(
        `${FLAG_META[flagKey]?.title ?? flagKey} ${!currentlyEnabled ? 'enabled' : 'disabled'} successfully`,
        'success'
      );
    } catch {
      showToast('Failed to update feature flag. Please try again.', 'error');
      await refreshFlags();
    } finally {
      setLoadingFlags(prev => ({ ...prev, [flagKey]: false }));
    }
  };

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 md:mb-2">
          Feature Flags
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Turn platform features on or off without code changes. Changes take effect immediately.
          Only Admins can modify these settings.
        </p>
      </div>

      {flagsLoading ? (
        <div className="flex justify-center items-center p-16">
          <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl">
          {Object.entries(FLAG_META).map(([flagKey, meta]) => (
            <FeatureFlagCard
              key={flagKey}
              flagKey={flagKey}
              meta={meta}
              enabled={flags[flagKey]?.enabled ?? false}
              loading={loadingFlags[flagKey] ?? false}
              onToggle={() => handleToggle(flagKey)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeatureFlag;
