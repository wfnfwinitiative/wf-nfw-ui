import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { MapPin, Clock, Building2, Phone, User, Truck, ArrowLeft } from 'lucide-react';

export const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data - in a real app, this would come from an API
  const task = {
    id: 1,
    status: 'reached',
    pickup: {
      organizationName: 'Taj Krishna Hotel',
      contactPerson: 'Nargis Siddique',
      contactNumber: '+91 98765 43210',
      location: {
        address: 'Road No. 1, Banjara Hills, Hyderabad',
        coordinates: { lat: 17.4156, lng: 78.4347 },
        mapLink: 'https://maps.google.com/?q=17.4156,78.4347',
      },
      scheduledTime: '2026-02-14T10:00:00',
      estimatedQuantity: '50 kg',
    },
    delivery: {
      hungerSpotName: 'Akshaya Patra - Gachibowli',
      location: {
        address: 'DLF Cyber City, Gachibowli, Hyderabad',
      },
    },
    vehicle: {
      number: 'TS-09-AB-1234',
      type: 'Mini Truck',
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-ngo-dark mb-1">Task Details</h1>
          <p className="text-sm md:text-base text-ngo-gray">Pickup from {task.pickup.organizationName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pickup Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pickup Location</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Building2 className="w-5 h-5 text-orange-600 shrink-0 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-600">Organization</p>
                <p className="text-gray-900 font-medium">{task.pickup.organizationName}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <User className="w-5 h-5 text-blue-600 shrink-0 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-600">Contact Person</p>
                <p className="text-gray-900 font-medium">{task.pickup.contactPerson}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Phone className="w-5 h-5 text-green-600 shrink-0 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-600">Phone</p>
                <a href={`tel:${task.pickup.contactNumber}`} className="text-primary-600 hover:underline">
                  {task.pickup.contactNumber}
                </a>
              </div>
            </div>

            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-red-600 shrink-0 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-600">Address</p>
                <p className="text-gray-900">{task.pickup.location.address}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Clock className="w-5 h-5 text-purple-600 shrink-0 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled Time</p>
                <p className="text-gray-900">
                  {new Date(task.pickup.scheduledTime).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Location</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Building2 className="w-5 h-5 text-green-600 shrink-0 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-600">Hunger Spot</p>
                <p className="text-gray-900 font-medium">{task.delivery.hungerSpotName}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-red-600 shrink-0 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-600">Address</p>
                <p className="text-gray-900">{task.delivery.location.address}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Truck className="w-5 h-5 text-orange-600 shrink-0 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-600">Vehicle Information</p>
                <p className="text-gray-900 font-medium">{task.vehicle.number}</p>
                <p className="text-sm text-gray-500">{task.vehicle.type}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Back
        </Button>
        <Button variant="primary">
          Start Task
        </Button>
      </div>
    </div>
  );
};
