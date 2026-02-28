import { useState, useRef } from 'react';
import { Modal, Button, showToast } from '../common';
import { VoiceInputPanel } from './VoiceInputPanel';
import { MapPin, Building2, Truck, Phone, User, VolumeX } from 'lucide-react';
import { useFeatureFlags } from '../../contexts/FeatureFlagsContext';

export function PickupDetailModal({ isOpen, onClose, assignment, onStatusUpdate }) {
  const [submitting, setSubmitting] = useState(false);
  const voicePanelRef = useRef(null);
  const { isVoiceEnabled } = useFeatureFlags();

  if (!assignment) return null;

  const { pickup, delivery, vehicle, status } = assignment;

  const canSubmit = status === 'reached';
  const canMarkDelivered = status === 'submitted';

  const handleSubmit = async () => {
    // Get data from VoiceInputPanel via ref or state lifting
    // For now, we'll access global state or use callback
    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onStatusUpdate(assignment.id, 'submitted', {
        submittedDetails: {
          pickupTime: new Date().toISOString(),
        },
      });
      showToast('Pickup confirmed successfully!', 'success');
      onClose();
    } catch (error) {
      showToast('Failed to confirm pickup. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkDelivered = async () => {
    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      onStatusUpdate(assignment.id, 'delivered', {
        submittedDetails: {
          ...assignment.submittedDetails,
          actualDeliveryTime: new Date().toISOString(),
        },
      });
      showToast('Marked as delivered!', 'success');
      onClose();
    } catch (error) {
      showToast('Failed to update status', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pickup Confirmation"
      size="lg"
    >
      <div className="flex flex-col h-[70vh]">
        {/* Compact Assignment Info Header */}
        <div className="p-3 sm:p-4 border-b border-gray-200 bg-white">
          <div className="flex items-start sm:items-center justify-between mb-2 sm:mb-3 gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
                {pickup.organizationName}
              </h3>
              <div className="flex items-center gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-gray-500">
                <span className="flex items-center gap-1 truncate">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                  <span className="truncate">{pickup.contactPerson}</span>
                </span>
                <a
                  href={`tel:${pickup.contactNumber}`}
                  className="flex items-center gap-1 text-primary-600 shrink-0"
                >
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                  Call
                </a>
              </div>
            </div>
            <div className="text-right text-xs text-gray-500 shrink-0">
              <div className="flex items-center gap-1">
                <Truck className="w-3 h-3 sm:w-4 sm:h-4" />
                {vehicle.number}
              </div>
            </div>
          </div>

          {/* Compact Location Info - Stack on mobile */}
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 text-xs">
            <div className="flex-1 p-2 bg-blue-50 rounded flex items-center gap-2 min-w-0">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
              <span className="text-gray-700 truncate">{pickup.location.address}</span>
            </div>
            <div className="hidden sm:flex items-center text-gray-400">→</div>
            <div className="flex-1 p-2 bg-green-50 rounded flex items-center gap-2 min-w-0">
              <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 shrink-0" />
              <span className="text-gray-700 truncate">{delivery.hungerSpotName}</span>
            </div>
          </div>
        </div>

        {/* Main Content - VoiceInputPanel with Grid */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {canSubmit ? (
            isVoiceEnabled ? (
              <VoiceInputPanel ref={voicePanelRef} disabled={!canSubmit} />
            ) : (
              <div className="p-6">
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <VolumeX className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Voice Input Disabled</h4>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    Voice input has been disabled by the administrator. Please contact your admin for assistance.
                  </p>
                </div>
              </div>
            )
          ) : (
            <div className="p-6">
              <div className="text-center py-8">
                <h4 className="font-semibold text-gray-900 mb-2">Pickup Confirmed</h4>
                {assignment.submittedDetails ? (
                  <div className="text-sm text-gray-600">
                    <p>Submitted at: {new Date(assignment.submittedDetails.pickupTime).toLocaleString()}</p>
                    {assignment.submittedDetails.actualDeliveryTime && (
                      <p className="text-green-600 mt-2">
                        Delivered at: {new Date(assignment.submittedDetails.actualDeliveryTime).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Awaiting confirmation</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-white flex justify-end gap-2 sm:gap-3">
        <Button variant="secondary" onClick={onClose} className="text-sm sm:text-base">
          Close
        </Button>
        {canSubmit && (
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={submitting}
            className="text-sm sm:text-base"
          >
            Confirm
          </Button>
        )}
        {canMarkDelivered && (
          <Button
            variant="success"
            onClick={handleMarkDelivered}
            loading={submitting}
            className="text-sm sm:text-base"
          >
            Delivered
          </Button>
        )}
      </div>
    </Modal>
  );
}

export default PickupDetailModal;
