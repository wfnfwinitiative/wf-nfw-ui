import { MapPin, Phone, Clock, Truck, Building2, ExternalLink, Users, FileText } from 'lucide-react';
import { StatusBadge, Button } from '../../components/common';

export function DriverAssignmentCard({ assignment, onClick, onStatusUpdate }) {
  const { pickup, delivery, vehicle, status, feeding_count, notes } = assignment;
  const canOpenDetails     = status === 'assigned';
  const canConfirmDelivery = status === 'inpicked';
  const isCompleted = ['delivered', 'verified', 'completed'].includes(status);

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden
        hover:shadow-lg transition-all duration-200 cursor-pointer
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
      <div className="p-4 space-y-4">
        {/* Pickup Details */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Pickup From
          </p>
          <div className="space-y-2">
            {pickup.location.address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-600 line-clamp-2">
                  {pickup.location.address}
                </span>
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
            <div>
              <p className="text-sm font-medium text-gray-700">
                {delivery.hungerSpotName || 'Hunger Spot TBD'}
              </p>
              {delivery.location.address && (
                <p className="text-xs text-gray-500">{delivery.location.address}</p>
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

        {/* Map Link */}
        {pickup.location.mapLink && (
          <a
            href={pickup.location.mapLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-2 text-sm text-primary-600 hover:text-primary-700"
          >
            <ExternalLink className="w-4 h-4" />
            Open in Google Maps
          </a>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        {canOpenDetails && (
          <Button
            onClick={onClick}
            variant="warning"
            className="w-full"
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
