import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { MapPin, Clock, Building2, Phone, Truck, ArrowLeft } from 'lucide-react';
import { useDriverTasksContext } from '../../contexts/DriverTasksContext';

function InfoRow({ icon: Icon, color, label, value, href }) {
  return (
    <div className="flex gap-3">
      <Icon className={`w-5 h-5 ${color} shrink-0 mt-1`} />
      <div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        {href
          ? <a href={href} className="text-primary-600 hover:underline font-medium">{value}</a>
          : <p className="text-gray-900 font-medium">{value}</p>
        }
      </div>
    </div>
  );
}

export const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { assignments, loading } = useDriverTasksContext();

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  const task = assignments.find(a => String(a.id) === String(id));

  if (!task) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Task not found.</p>
        <Button variant="secondary" onClick={() => navigate(-1)} className="mt-4">Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-ngo-dark mb-1">Task Details</h1>
          <p className="text-sm md:text-base text-ngo-gray">Pickup from {task.pickup.organizationName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Donor Location</h2>
          <div className="space-y-4">
            <InfoRow icon={Building2} color="text-orange-600" label="Organization" value={task.pickup.organizationName} />
            {task.pickup.contactNumber && (
              <InfoRow icon={Phone} color="text-green-600" label="Phone" value={task.pickup.contactNumber} href={`tel:${task.pickup.contactNumber}`} />
            )}
            {task.pickup.location?.address && (
              <InfoRow icon={MapPin} color="text-red-600" label="Address" value={task.pickup.location.address} />
            )}
            {task.pickup.scheduledTime && (
              <InfoRow icon={Clock} color="text-purple-600" label="Scheduled Time" value={new Date(task.pickup.scheduledTime).toLocaleString()} />
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hunger Spot</h2>
          <div className="space-y-4">
            <InfoRow icon={Building2} color="text-green-600" label="Hunger Spot" value={task.delivery?.hungerSpotName || 'TBD'} />
            {task.delivery?.location?.address && (
              <InfoRow icon={MapPin} color="text-red-600" label="Address" value={task.delivery.location.address} />
            )}
            <InfoRow icon={Truck} color="text-orange-600" label="Vehicle" value={task.vehicle?.number || '—'} />
          </div>
        </div>
      </div>

      <div>
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      </div>
    </div>
  );
};


