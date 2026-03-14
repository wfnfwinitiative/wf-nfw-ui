import { useState, useRef, useEffect } from 'react';
import { Modal, Button, showToast } from '../../components/common';
import { VoiceInputPanel } from './VoiceInputPanel';
import { MapPin, Building2, Truck, Phone, Camera, X, Loader2, Check, AlertCircle } from 'lucide-react';
import { useFeatureFlags } from '../../contexts/FeatureFlagsContext';
import { uploadImageToDrive } from '../../services/api/googleDriveService';
import {
  submitPickupItems,
  submitDelivery,
} from '../../services/api/opportunityEventItemDriverService';
import { useAuth } from '../../auth/AuthContext';


export function PickupDetailModal({ isOpen, onClose, assignment, onStatusUpdate, readOnly = false }) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [deliveryImages, setDeliveryImages] = useState([]);
  const voicePanelRef = useRef(null);
  const deliveryFileInputRef = useRef(null);
  const deliveryFolderUrlRef = useRef(null);
  const { isVoiceEnabled } = useFeatureFlags();

  // Clear all image state whenever the modal opens for a different assignment
  useEffect(() => {
    setDeliveryImages((prev) => {
      prev.forEach((img) => { if (img.preview) URL.revokeObjectURL(img.preview); });
      return [];
    });
    deliveryFolderUrlRef.current = null;
    if (deliveryFileInputRef.current) deliveryFileInputRef.current.value = '';
  }, [assignment?.id]);

  if (!assignment) return null;

  const { pickup, delivery, vehicle, status, feeding_count, notes } = assignment;
  const driverName = user?.name || user?.mobileNumber || `Driver${user?.id || ''}`;
  const opportunityId = String(assignment.id || '');

  const canSubmit = status === 'assigned';        // Assigned → fill items → InPicked
  const canMarkDelivered = status === 'inpicked'; // InPicked → confirm delivery → Delivered

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const foodItems = voicePanelRef.current?.getFoodItems() || [];

      if (foodItems.length === 0) {
        showToast('Please add at least one food item before confirming.', 'error');
        setSubmitting(false);
        return;
      }

      // 1. Upload pickup images to Google Drive (optional)
      await voicePanelRef.current?.uploadAll();
      const pickupFolderUrl = voicePanelRef.current?.getFolderUrl();

      // 2. Submit food items + status-change event to backend
      await submitPickupItems(
        assignment.id,
        foodItems,
        user?.id,
        assignment.status_id,
        assignment.notes
      );

      onStatusUpdate(assignment.id, 'inpicked', {
        submittedDetails: {
          pickupTime: new Date().toISOString(),
          pickupFolderUrl,
          foodItems,
        },
      });
      showToast('Pickup confirmed successfully!', 'success');
      onClose();
    } catch (error) {
      console.error('Pickup submission error:', error);
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
      status: 'pending',
    }));
    setDeliveryImages(prev => [...prev, ...newImages]);
    e.target.value = '';
  };

  const handleRemoveDeliveryImage = (id) => {
    if (submitting) return; // locked during upload
    setDeliveryImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img?.preview) URL.revokeObjectURL(img.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const handleMarkDelivered = async () => {
    setSubmitting(true);
    try {
      // Upload delivery images sequentially
      for (const img of deliveryImages) {
        setDeliveryImages(prev => prev.map(i => i.id === img.id ? { ...i, status: 'uploading' } : i));
        try {
          const res = await uploadImageToDrive(img.file, { uploadType: 'delivery', driverName, opportunityId });
          const url = res?.file?.parent_folder_url;
          if (url && !deliveryFolderUrlRef.current) deliveryFolderUrlRef.current = url;
          setDeliveryImages(prev => prev.map(i => i.id === img.id ? { ...i, status: 'done' } : i));
        } catch {
          setDeliveryImages(prev => prev.map(i => i.id === img.id ? { ...i, status: 'error' } : i));
        }
      }
      // POST a new event to preserve history: InPicked → Delivered
      await submitDelivery(assignment.id, user?.id, assignment.status_id || 3);

      onStatusUpdate(assignment.id, 'delivered', {
        submittedDetails: {
          ...assignment.submittedDetails,
          actualDeliveryTime: new Date().toISOString(),
          deliveryFolderUrl: deliveryFolderUrlRef.current,
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
                {pickup.contactNumber && (
                  <a
                    href={`tel:${pickup.contactNumber}`}
                    className="flex items-center gap-1 text-primary-600 shrink-0"
                  >
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                    {pickup.contactNumber}
                  </a>
                )}
                {feeding_count != null && (
                  <span className="flex items-center gap-1 text-blue-600 shrink-0">
                    <span className="font-medium">{feeding_count} servings</span>
                  </span>
                )}
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
            {pickup.location.address && (
              <div className="flex-1 p-2 bg-blue-50 rounded flex items-center gap-2 min-w-0">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
                <span className="text-gray-700 truncate">{pickup.location.address}</span>
              </div>
            )}
            {(pickup.location.address && delivery.hungerSpotName) && (
              <div className="hidden sm:flex items-center text-gray-400">→</div>
            )}
            <div className="flex-1 p-2 bg-green-50 rounded flex items-center gap-2 min-w-0">
              <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 shrink-0" />
              <span className="text-gray-700 truncate">{delivery.hungerSpotName || 'Hunger Spot TBD'}</span>
            </div>
          </div>
          {notes && (
            <p className="mt-2 text-xs text-gray-500 italic line-clamp-2">{notes}</p>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {readOnly ? (
            <div className="p-6">
              <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-blue-500" />
                </div>
                <h4 className="font-semibold text-gray-900">Upcoming Assignment</h4>
                <p className="text-sm text-gray-500 max-w-xs">
                  This assignment is scheduled for a future date. Pickup details can only be filled on or after the scheduled day.
                </p>
              </div>
            </div>
          ) : canSubmit ? (
            <VoiceInputPanel              key={assignment?.id}              ref={voicePanelRef}
              disabled={!canSubmit}
              driverName={driverName}
              opportunityId={opportunityId}
              uploadType="pickup"
            />
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
                  <div className="mb-3">
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                      <span>{deliveryImages.filter(i => i.status === 'done').length}/{deliveryImages.length} uploaded</span>
                      {submitting && deliveryImages.every(i => i.status === 'done' || i.status === 'error') ? (
                        <span className="text-green-600 font-medium">Upload complete ✓</span>
                      ) : submitting ? (
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${(deliveryImages.filter(i => i.status === 'done').length / deliveryImages.length) * 100}%` }}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}

                {deliveryImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {deliveryImages.map(img => (
                      <div key={img.id} className="relative aspect-square group">
                        <img
                          src={img.preview}
                          alt={img.name}
                          className={`w-full h-full object-cover rounded transition-opacity ${
                            img.status === 'done' ? 'cursor-pointer hover:opacity-90' : 'opacity-60'
                          }`}
                        />
                        {img.status === 'uploading' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                          </div>
                        )}
                        {img.status === 'done' && (
                          <div className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                        {img.status === 'error' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-red-500/50 rounded">
                            <AlertCircle className="w-5 h-5 text-white" />
                          </div>
                        )}
                        {!submitting && (
                          <button
                            onClick={() => handleRemoveDeliveryImage(img.id)}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
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
        {!readOnly && canSubmit && (
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={submitting}
            className="text-sm sm:text-base"
          >
            Confirm
          </Button>
        )}
        {!readOnly && canMarkDelivered && (
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
