import { useState, useRef } from 'react';
import { Modal, Button, showToast } from '../../components/common';
import { VoiceInputPanel } from './VoiceInputPanel';
import { MapPin, Building2, Truck, Phone, User, Camera, X } from 'lucide-react';
import { useFeatureFlags } from '../../contexts/FeatureFlagsContext';
import { uploadImageToDrive } from '../../services/api/googleDriveService';


export function PickupDetailModal({ isOpen, onClose, assignment, onStatusUpdate }) {
  const [submitting, setSubmitting] = useState(false);
  const [deliveryImages, setDeliveryImages] = useState([]);
  const voicePanelRef = useRef(null);
  const deliveryFileInputRef = useRef(null);
  const { isVoiceEnabled } = useFeatureFlags();

  // Read driver info directly from localStorage to ensure we have the latest data, especially after login or profile updates need to revisit this approach later to see if we can centralize user state better
  const storedUser = (() => { try { return JSON.parse(localStorage.getItem('nofoodwaste_user') || '{}'); } catch { return {}; } })();

  if (!assignment) return null;

  const { pickup, delivery, vehicle, status } = assignment;
  const driverName = storedUser?.name || storedUser?.phone || `Driver${storedUser?.id || ''}`;
  const opportunityId = String(assignment.id || '');

  const canSubmit = status === 'reached';
  const canMarkDelivered = status === 'submitted';

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Upload all pickup images to Google Drive
      const images = voicePanelRef.current?.getImages() || [];
      if (images.length > 0) {
        await Promise.all(
          images.map(img => uploadImageToDrive(img.file, { uploadType: 'pickup', driverName, opportunityId }))
        );
        showToast(`${images.length} pickup image(s) uploaded to Google Drive`, 'success');
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      onStatusUpdate(assignment.id, 'submitted', {
        submittedDetails: { pickupTime: new Date().toISOString() },
      });
      showToast('Pickup confirmed successfully!', 'success');
      onClose();
    } catch (error) {
      showToast('Failed to confirm pickup. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeliveryImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));
    setDeliveryImages(prev => [...prev, ...newImages]);
  };

  const handleRemoveDeliveryImage = (id) => {
    setDeliveryImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img?.preview) URL.revokeObjectURL(img.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const handleMarkDelivered = async () => {
    setSubmitting(true);
    try {
      // Upload delivery images to Google Drive
      if (deliveryImages.length > 0) {
        await Promise.all(
          deliveryImages.map(img => uploadImageToDrive(img.file, { uploadType: 'deliver', driverName, opportunityId }))
        );
        showToast(`${deliveryImages.length} delivery image(s) uploaded to Google Drive`, 'success');
      }

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

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {canSubmit ? (
            <VoiceInputPanel ref={voicePanelRef} disabled={!canSubmit} />
          ) : canMarkDelivered ? (
            <div className="p-4">
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-1">Pickup Confirmed</h4>
                {assignment.submittedDetails?.pickupTime && (
                  <p className="text-xs text-gray-500">
                    Picked up at: {new Date(assignment.submittedDetails.pickupTime).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Delivery Image Upload */}
              <div className="border border-dashed border-gray-300 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                  Delivery Photos
                </h4>
                <p className="text-xs text-gray-500 mb-3">
                  Add photos of the delivered food. They will be uploaded to Google Drive on submit.
                </p>

                <input
                  ref={deliveryFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleDeliveryImageChange}
                />

                <button
                  onClick={() => deliveryFileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm mb-3"
                >
                  <Camera className="w-4 h-4" />
                  Add Delivery Photos
                </button>

                {deliveryImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {deliveryImages.map(img => (
                      <div key={img.id} className="relative aspect-square group">
                        <img
                          src={img.preview}
                          alt={img.name}
                          className="w-full h-full object-cover rounded cursor-pointer hover:opacity-90"
                        />
                        <button
                          onClick={() => handleRemoveDeliveryImage(img.id)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {deliveryImages.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-2">No delivery photos added yet.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="text-center py-8">
                <h4 className="font-semibold text-gray-900 mb-2">Delivered</h4>
                {assignment.submittedDetails?.actualDeliveryTime && (
                  <p className="text-green-600 text-sm mt-2">
                    Delivered at: {new Date(assignment.submittedDetails.actualDeliveryTime).toLocaleString()}
                  </p>
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
