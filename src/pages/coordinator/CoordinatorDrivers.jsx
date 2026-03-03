import React, { useState, useEffect } from 'react';
import { DataTable } from '../../components/DataTable';
import { mockApi } from '../../services/mockApi';

export const CoordinatorDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [pickups, setPickups] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [driversData, pickupsData] = await Promise.all([
      mockApi.getDrivers(),
      mockApi.getPickups()
    ]);
    setDrivers(driversData);
    setPickups(pickupsData);
  };

  const columns = [
    { header: 'Driver Name', field: 'name' },
    { header: 'Phone', field: 'phone' },
    {
      header: 'Active Tasks',
      render: (row) => {
        const activeTasks = pickups.filter(p => 
          p.driverId === row.id && 
          !['VERIFIED', 'REJECTED'].includes(p.status)
        ).length;
        return activeTasks;
      }
    },
    {
      header: 'Status',
      render: (row) => {
        const hasActive = pickups.some(p => 
          p.driverId === row.id && 
          ['ACCEPTED', 'PICKUP_DONE'].includes(p.status)
        );
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            hasActive ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
          }`}>
            {hasActive ? 'Busy' : 'Available'}
          </span>
        );
      }
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ngo-dark mb-2">Driver Status</h1>
        <p className="text-ngo-gray">Monitor driver availability and tasks</p>
      </div>

      <DataTable columns={columns} data={drivers} />
    </div>
  );
};
