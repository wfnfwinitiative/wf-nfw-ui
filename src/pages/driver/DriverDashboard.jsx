import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { mockApi } from '../../services/mockApi';
import { useNavigate } from 'react-router-dom';
import { TileCard } from '../../components/TileCard';
import { StatusBadge } from '../../components/StatusBadge';
import { Truck, Package, MapPin, Clock } from 'lucide-react';

export const DriverDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const drivers = await mockApi.getDrivers();
    const currentDriver = drivers.find(d => d.phone === user.phone);
    setDriver(currentDriver);

    if (currentDriver) {
      const pickups = await mockApi.getPickups({ driverId: currentDriver.id });
      setTasks(pickups.filter(p => !['VERIFIED', 'REJECTED'].includes(p.status)));
    }
  };

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-ngo-dark mb-1 md:mb-2">Driver Dashboard</h1>
        <p className="text-sm md:text-base text-ngo-gray">Your assigned pickup tasks</p>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 md:p-12 text-center border border-gray-100">
          <Truck className="w-12 h-12 md:w-16 md:h-16 text-ngo-gray mx-auto mb-4" />
          <h3 className="text-lg md:text-xl font-semibold text-ngo-dark mb-2">No Active Tasks</h3>
          <p className="text-sm md:text-base text-ngo-gray">You don't have any assigned pickups at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {tasks.map(task => (
            <div
              key={task.id}
              onClick={() => navigate(`/driver/task/${task.id}`)}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer p-4 md:p-6 border border-gray-100 min-h-[44px]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-ngo-orange to-orange-600 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-ngo-dark">Pickup #{task.id}</h3>
                    <p className="text-xs text-ngo-gray">{task.scheduledDate}</p>
                  </div>
                </div>
                <StatusBadge status={task.status} />
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-ngo-orange mt-1 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-ngo-dark">From: {task.pickupLocationName}</p>
                    <p className="text-ngo-gray">To: {task.hungerSpotName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-ngo-green" />
                  <p className="text-sm text-ngo-gray">{task.scheduledTime}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <p className="text-sm font-medium text-ngo-orange">Click to view details →</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
