import { useState } from 'react';
import { MapPin, Phone, Clock, Truck, Building2, Navigation, Users, Scale, FileText } from 'lucide-react';
import { StatusBadge, Button } from '../../components/common';
import { ConfirmDialog } from '../../components/ui';
import { navigateTo } from '../../utils/navigationUtils';

export function DriverAssignmentCard({ assignment, onClick, onStatusUpdate, onReject, disabled = false }) {
  const { pickup, delivery, vehicle, status, estimated_count, estimated_unit, food_collected, feeding_count, notes } = assignment;
  const canOpenDetails     = status === 'assigned';
  const canConfirmDelivery = status === 'inpickup';
  const isCompleted = ['delivered', 'verified', 'completed'].includes(status);

  const [showReject, setShowReject] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const handleRejectConfirm = async () => {
    if (!onReject) return;
    setRejecting(true);
    try {
      await onReject(assignment);
    } finally {
      setRejecting(false);
      setShowReject(false);
    }
  };

  return (
    <>
      <ConfirmDialog
        isOpen={showReject}
        title="Reject Assignment"
        message="Are you sure you want to reject this pickup? This action cannot be undone."
        confirmLabel="Reject"
        cancelLabel="Cancel"
        confirmVariant="danger"
        loading={rejecting}
        onConfirm={handleRejectConfirm}
        onCancel={() => setShowReject(false)}
      />

      <div
        onClick={disabled ? undefined : onClick}
      className={`
        bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden
        transition-all duration-200 flex flex-col
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg cursor-pointer'}
        ${isCompleted ? 'opacity-70' : ''}
      `}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 line-clamp-1">
                  {`${pickup.organizationName} → ${delivery.hungerSpotName}`}
          </h3>
          {pickup.contactPerson && (
            <p className="text-sm text-gray-500">{pickup.contactPerson}</p>
          )}
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Body */}
      <div className="p-4 space-y-4 flex-1">
        {/* Pickup Details */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Donor Location
          </p>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">
                {pickup.organizationName}
              </p>
              {pickup.location.address && (
                <div className="flex items-start gap-1">
                  <p className="text-xs text-gray-500 flex-1">{pickup.location.address}</p>
                  {(pickup.location.lat || pickup.location.address) && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); navigateTo(pickup.location); }}
                      className="shrink-0 text-blue-500 hover:text-blue-700"
                      title="Navigate to Pickup Location"
                    >
                      <Navigation className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {pickup.contactNumber && (
                <div className="flex items-center gap-2">
                  <a href={`tel:${pickup.contactNumber}`} className="text-xs text-primary-600 hover:underline flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" />{pickup.contactNumber}
                  </a>              
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Hunger Spot
          </p>
          <div className="flex items-start gap-2">
            <Building2 className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">
                {delivery.hungerSpotName || 'Hunger Spot TBD'}
              </p>
              {delivery.location.address && (
                <div className="flex items-start gap-1">
                  <p className="text-xs text-gray-500 flex-1">{delivery.location.address}</p>
                  {(delivery.location.lat || delivery.location.address) && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); navigateTo(delivery.location); }}
                      className="shrink-0 text-blue-500 hover:text-blue-700"
                      title="Navigate to Drop"
                    >
                      <Navigation className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

            {delivery.contactNumber && (
              <div className="flex items-center gap-2">
                <a href={`tel:${delivery.contactNumber}`} className="text-xs text-primary-600 hover:underline flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3" />{delivery.contactNumber}
                </a>              
              </div>
            )}
            </div>
          </div>
        </div>

          <div className="flex items-center gap-3">
            {['assigned', 'rejected', 'created'].includes(status) ? (
              pickup.scheduledTime && (
                <>
                  <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-orange-50 rounded-lg border border-orange-200">
                    <Clock className="w-3 h-3 text-orange-600 shrink-0" />
                    <p className="text-xs text-orange-700 font-medium">
                      Pickup By: {new Date(pickup.scheduledTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </>
              )
            ) : (
              pickup.pickedUpAt && (
                <>
                  <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                    <Clock className="w-3 h-3 text-green-600 shrink-0" />
                    <p className="text-xs text-green-700 font-medium">
                      Picked Up: {new Date(pickup.pickedUpAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </>
              )
            )}
            {['assigned', 'rejected', 'created', 'inpickup'].includes(status) ? (
              delivery.deliveryBy && (
                <>
                  <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-orange-50 rounded-lg border border-orange-200">
                    <Clock className="w-3 h-3 text-orange-600 shrink-0" />
                    <p className="text-xs text-orange-700 font-medium">
                      Deliver by: {new Date(delivery.deliveryBy).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </>
              )
            ) : (
              delivery.deliveredAt && (
                <>
                  <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                    <Clock className="w-3 h-3 text-green-600 shrink-0" />
                    <p className="text-xs text-green-700 font-medium">
                      Delivered: {new Date(delivery.deliveredAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </>
              )
            )}
        </div>


        {/* Vehicle & Feeding Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <Truck className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">
              Vehicle {vehicle.number}{vehicle.type ? ` (${vehicle.type})` : ''}
            </span>
          </div>
          {estimated_count != null && (
            <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
              {estimated_unit === 'people'
                ? <Users className="w-4 h-4 text-blue-500" />
                : <Scale className="w-4 h-4 text-blue-500" />
              }
              <span className="text-sm text-blue-700 font-medium">
               {'Estimated: '} {estimated_count} {estimated_unit === 'people' ? 'people' : 'kg'}
              </span>
            </div>
          )}
        </div>

        {/* Food Collected & People Fed — shown only for delivered/completed */}
        {['delivered', 'completed'].includes(status) && (
          <div className="flex items-center gap-3">
            {food_collected != null && (
              <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                <Scale className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700 font-medium">
                  Collected: {food_collected} kg
                </span>
              </div>
            )}
            {feeding_count != null && (
              <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700 font-medium">
                  Fed: {feeding_count} people
                </span>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div className="flex items-start gap-2 px-3 py-2 bg-yellow-50 rounded-lg">
            <FileText className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
            <span className="text-sm text-yellow-800 line-clamp-2">{notes}</span>
          </div>
        )}


      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        {canOpenDetails && (
          <div className="flex gap-2">
            <Button
              onClick={(e) => { e.stopPropagation(); setShowReject(true); }}
              variant="secondary"
              className="flex-1 !border-red-400 !text-red-600 hover:!bg-red-50"
              disabled={disabled}
            >
              Reject
            </Button>
            <Button
              onClick={disabled ? undefined : onClick}
              variant="primary"
              className="flex-1"
              disabled={disabled}
            >
              Fill Pickup Details
            </Button>
          </div>
        )}
        {canConfirmDelivery && (
          <Button
            onClick={onClick}
            variant="success"
            className="w-full"
          >
            Confirm Delivery
          </Button>
        )}
        {status === 'delivered' && (
          <div className="text-center text-sm text-green-600 font-medium">
            ✓ Awaiting coordinator verification
          </div>
        )}
        {(status === 'verified' || status === 'completed') && (
          <div className="text-center text-sm text-primary-600 font-medium">
            ✓ {status === 'completed' ? 'Completed' : 'Verified'}
          </div>
        )}
        {status === 'rejected' && (
          <div className="text-center text-sm text-red-500 font-medium">
            Rejected
          </div>
        )}
      </div>
    </div>
    </>
  );
}

export default DriverAssignmentCard;
