import { useState } from 'react';
import { Loader2, Users, Info } from 'lucide-react';
import { Card, CardBody } from '../common/Card';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { GoogleDriveSetupPanel } from './GoogleDriveSetupPanel';

function EnabledBadge({ enabled }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
        enabled
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-gray-100 text-gray-500 border border-gray-200'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${enabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
      {enabled ? 'Enabled' : 'Disabled'}
    </span>
  );
}

export function FeatureFlagCard({ flagKey, meta, enabled, loading, onToggle }) {
  const { Icon, title, description, iconColor, iconBg, affectedRoles, whenEnabled, whenDisabled, requiresSetup } = meta;
  const [showSetup, setShowSetup] = useState(false);

  const handleToggle = () => {
    setShowSetup(!enabled && requiresSetup);
    onToggle();
  };

  return (
    <Card className="w-full">
      <CardBody className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className={`shrink-0 w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 className="font-semibold text-gray-900 text-base leading-tight">{title}</h3>
                <div className="mt-1.5">
                  <EnabledBadge enabled={enabled} />
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 mt-0.5">
                {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                <ToggleSwitch
                  id={`toggle-${flagKey}`}
                  checked={enabled}
                  disabled={loading}
                  onChange={handleToggle}
                />
              </div>
            </div>

            <p className="mt-3 text-sm text-gray-500 leading-relaxed">{description}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-md px-2 py-1">
                <Users className="w-3 h-3" />
                Affects: {affectedRoles}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-md px-2 py-1">
                <Info className="w-3 h-3" />
                {enabled ? whenEnabled : whenDisabled}
              </span>
            </div>
          </div>
        </div>

        {requiresSetup && showSetup && enabled && (
          <GoogleDriveSetupPanel onClose={() => setShowSetup(false)} />
        )}
      </CardBody>
    </Card>
  );
}
