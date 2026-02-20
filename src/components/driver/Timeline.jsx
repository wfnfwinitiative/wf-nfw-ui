import { CheckCircle, Circle, Clock, MapPin, FileText, Truck, Shield } from 'lucide-react';

const statusConfig = {
  assigned: {
    icon: Circle,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    lineColor: 'bg-blue-200',
    label: 'Assigned',
  },
  reached: {
    icon: MapPin,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    lineColor: 'bg-yellow-200',
    label: 'Reached Pickup',
  },
  submitted: {
    icon: FileText,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    lineColor: 'bg-purple-200',
    label: 'Details Submitted',
  },
  delivered: {
    icon: Truck,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    lineColor: 'bg-green-200',
    label: 'Delivered',
  },
  verified: {
    icon: Shield,
    color: 'text-primary-500',
    bgColor: 'bg-primary-50',
    lineColor: 'bg-primary-200',
    label: 'Verified',
  },
};

export function Timeline({ events }) {
  if (!events || events.length === 0) {
    return (
      <p className="text-gray-500 text-sm">No timeline events yet.</p>
    );
  }

  return (
    <div className="relative">
      {events.map((event, index) => {
        const config = statusConfig[event.status] || statusConfig.assigned;
        const Icon = config.icon;
        const isLast = index === events.length - 1;

        return (
          <div key={index} className="relative flex gap-4 pb-6">
            {/* Connector Line */}
            {!isLast && (
              <div
                className={`absolute left-4 top-8 w-0.5 h-full -ml-px ${config.lineColor}`}
              />
            )}

            {/* Icon */}
            <div
              className={`
                relative z-10 flex items-center justify-center w-8 h-8 rounded-full
                ${config.bgColor}
              `}
            >
              <Icon className={`w-4 h-4 ${config.color}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm font-medium text-gray-900">{config.label}</p>
              {event.note && (
                <p className="text-sm text-gray-500 mt-0.5">{event.note}</p>
              )}
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                <Clock className="w-3 h-3" />
                {new Date(event.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Timeline;
