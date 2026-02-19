import { MapPin, Phone, Clock, Truck, Building2, ExternalLink } from 'lucide-react';
import { StatusBadge, Button } from '../common';

export function DriverAssignmentCard({ assignment, onClick, onStatusUpdate }) {
  const { pickup, delivery, vehicle, status } = assignment;

  const canMarkReached = status === 'assigned';
  const canOpenDetails = status === 'reached';
  const isCompleted = ['delivered', 'verified'].includes(status);

  const handleReachedClick = (e) => {
    e.stopPropagation();
    onStatusUpdate(assignment.id, 'reached');
  };

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden
        hover:shadow-md transition-all cursor-pointer
        ${isCompleted ? 'opacity-75' : ''}
      `}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-linear-to-r from-primary-50 to-white border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 line-clamp-1">
              {pickup.organizationName}
            </h3>
            <p className="text-sm text-gray-500">{pickup.contactPerson}</p>
          </div>
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Pickup Details */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
            Pickup From
          </p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <span className="text-sm text-gray-600 line-clamp-2">
                {pickup.location.address}
              </span>
            </div>
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
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {new Date(pickup.scheduledTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
            Deliver To
          </p>
          <div className="flex items-start gap-2">
            <Building2 className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700">
                {delivery.hungerSpotName}
              </p>
              <p className="text-xs text-gray-500">{delivery.location.address}</p>
            </div>
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
          <Truck className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {vehicle.number} ({vehicle.type})
          </span>
        </div>

        {/* Map Link */}
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
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        {canMarkReached && (
          <Button
            onClick={handleReachedClick}
            variant="primary"
            className="w-full"
          >
            Reached Pickup Location
          </Button>
        )}
        {canOpenDetails && (
          <Button
            onClick={onClick}
            variant="warning"
            className="w-full"
          >
            Fill Pickup Details
          </Button>
        )}
        {status === 'submitted' && (
          <div className="text-center text-sm text-purple-600 font-medium">
            Awaiting delivery confirmation
          </div>
        )}
        {status === 'delivered' && (
          <div className="text-center text-sm text-green-600 font-medium">
            Awaiting coordinator verification
          </div>
        )}
      </div>
    </div>
  );
}

export default DriverAssignmentCard;
