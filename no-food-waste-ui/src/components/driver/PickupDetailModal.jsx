import { useState } from 'react';
import { Modal, Button, showToast } from '../common';
import { PickupForm } from './PickupForm';
import { VoiceInputPanel } from './VoiceInputPanel';
import { Timeline } from './Timeline';
import { MapPin, Building2, Truck, Clock, Phone, User, Mic, FileText } from 'lucide-react';

export function PickupDetailModal({ isOpen, onClose, assignment, onStatusUpdate }) {
  const [formData, setFormData] = useState({
    foodName: '',
    quantityCollected: '',
    pickupLocation: assignment?.pickup?.location?.address || '',
    pickupTime: new Date().toISOString().slice(0, 16),
    hungerSpotName: assignment?.delivery?.hungerSpotName || '',
    dropLocation: assignment?.delivery?.location?.address || '',
    estimatedDeliveryTime: '',
  });
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('form'); // 'form' or 'voice' for mobile

  if (!assignment) return null;

  const { pickup, delivery, vehicle, status, timeline } = assignment;

  const canSubmit = status === 'reached';
  const canMarkDelivered = status === 'submitted';

  const handleVoiceDataParsed = (parsedData) => {
    setFormData((prev) => ({
      ...prev,
      ...Object.fromEntries(
        Object.entries(parsedData).filter(([_, value]) => value)
      ),
    }));
    showToast('Voice data applied to form', 'success');
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.foodName || !formData.quantityCollected) {
      showToast('Please fill in required fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onStatusUpdate(assignment.id, 'submitted', {
        submittedDetails: {
          ...formData,
          images: images.map((img) => URL.createObjectURL(img)),
        },
      });
      showToast('Pickup details submitted successfully!', 'success');
    } catch (error) {
      showToast('Failed to submit details. Please try again.', 'error');
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
      title="Pickup Details"
      size="full"
    >
      {/* Mobile Tab Switcher - Only visible on small screens when form is editable */}
      {canSubmit && (
        <div className="lg:hidden flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors
              ${activeTab === 'form' 
                ? 'text-primary-600 border-b-2 border-primary-600 bg-white' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <FileText className="w-4 h-4" />
            Fill Form
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors
              ${activeTab === 'voice' 
                ? 'text-primary-600 border-b-2 border-primary-600 bg-white' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <Mic className="w-4 h-4" />
            Voice Input
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row h-[calc(90vh-120px)] lg:h-[calc(90vh-80px)]">
        {/* Left Side - Form or Details */}
        <div className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:border-r border-gray-200
          ${activeTab === 'form' ? 'block' : 'hidden'} lg:block`}>
          {/* Assignment Info Header */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {pickup.organizationName}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {pickup.contactPerson}
                  </span>
                  <a
                    href={`tel:${pickup.contactNumber}`}
                    className="flex items-center gap-1 text-primary-600 hover:underline"
                  >
                    <Phone className="w-4 h-4" />
                    {pickup.contactNumber}
                  </a>
                </div>
              </div>
            </div>

            {/* Location Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium text-sm">Pickup Location</span>
                </div>
                <p className="text-sm text-gray-700">{pickup.location.address}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Scheduled: {new Date(pickup.scheduledTime).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <Building2 className="w-4 h-4" />
                  <span className="font-medium text-sm">Delivery Location</span>
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {delivery.hungerSpotName}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {delivery.location.address}
                </p>
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
              <Truck className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {vehicle.number} - {vehicle.type}
                </p>
                {vehicle.pickupLocation && (
                  <p className="text-xs text-gray-500">
                    Vehicle from: {vehicle.pickupLocation}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form or Submitted Details */}
          {canSubmit ? (
            <PickupForm
              formData={formData}
              setFormData={setFormData}
              images={images}
              setImages={setImages}
              organizationName={pickup.organizationName}
              vehicleInfo={vehicle}
            />
          ) : (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Submitted Details</h4>
              {assignment.submittedDetails ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Food Name</p>
                    <p className="text-sm font-medium">{assignment.submittedDetails.foodName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Quantity Collected</p>
                    <p className="text-sm font-medium">{assignment.submittedDetails.quantityCollected}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Pickup Time</p>
                    <p className="text-sm font-medium">
                      {new Date(assignment.submittedDetails.pickupTime).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Est. Delivery Time</p>
                    <p className="text-sm font-medium">
                      {assignment.submittedDetails.estimatedDeliveryTime
                        ? new Date(assignment.submittedDetails.estimatedDeliveryTime).toLocaleString()
                        : '-'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No details submitted yet</p>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">Progress Timeline</h4>
            <Timeline events={timeline} />
          </div>
        </div>

        {/* Right Side - Voice Input Panel */}
        <div className={`w-full lg:w-96 bg-gray-50 p-4 sm:p-6 overflow-y-auto
          ${activeTab === 'voice' ? 'block' : 'hidden'} lg:block`}>
          <VoiceInputPanel
            onDataParsed={handleVoiceDataParsed}
            disabled={!canSubmit}
            onComplete={() => setActiveTab('form')} // Switch to form after voice processing on mobile
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 border-t border-gray-200 bg-white flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        {canSubmit && (
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={submitting}
          >
            Submit Pickup Details
          </Button>
        )}
        {canMarkDelivered && (
          <Button
            variant="success"
            onClick={handleMarkDelivered}
            loading={submitting}
          >
            Mark as Delivered
          </Button>
        )}
      </div>
    </Modal>
  );
}

export default PickupDetailModal;
