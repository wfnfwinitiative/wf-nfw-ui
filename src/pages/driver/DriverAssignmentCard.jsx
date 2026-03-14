import { MapPin, Phone, Clock, Truck, Building2, Navigation, Users, FileText } from 'lucide-react';
import { StatusBadge, Button } from '../../components/common';
import { navigateTo } from '../../utils/navigationUtils';

export function DriverAssignmentCard({ assignment, onClick, onStatusUpdate, disabled = false }) {
  const { pickup, delivery, vehicle, status, feeding_count, notes } = assignment;
  const canOpenDetails     = status === 'assigned';
  const canConfirmDelivery = status === 'inpicked';
  const isCompleted = ['delivered', 'verified', 'completed'].includes(status);

  return (
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
            {pickup.organizationName}
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
            Pickup From
          </p>
          <div className="space-y-2">
            {pickup.location.address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-600 line-clamp-2 flex-1">
                  {pickup.location.address}
                </span>
                {(pickup.location.lat || pickup.location.address) && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); navigateTo(pickup.location); }}
                    className="shrink-0 text-blue-500 hover:text-blue-700"
                    title="Navigate to Pickup"
                  >
                    <Navigation className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
            {pickup.contactNumber && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <a
                  href={`tel:${pickup.contactNumber}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm text-primary-600 hover:underline"
                >
                  {pickup.contactNumber}
                </a>
              </div>
            )}
            {pickup.scheduledTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  ETA: {new Date(pickup.scheduledTime).toLocaleString([], {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            )}
            {delivery.deliveryBy && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-orange-600">
                  Deliver by: {new Date(delivery.deliveryBy).toLocaleString([], {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Details */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Deliver To
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
            </div>
          </div>
        </div>

        {/* Vehicle & Feeding Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <Truck className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">
              Vehicle {vehicle.number}{vehicle.type ? ` (${vehicle.type})` : ''}
            </span>
          </div>
          {feeding_count != null && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-blue-700 font-medium">{feeding_count}</span>
            </div>
          )}
        </div>

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
          <Button
            onClick={disabled ? undefined : onClick}
            variant="warning"
            className="w-full"
            disabled={disabled}
          >
            Fill Pickup Details
          </Button>
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
  );
}

export default DriverAssignmentCard;
