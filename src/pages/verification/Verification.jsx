import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockApi } from '../../services/mockApi';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { Eye } from 'lucide-react';

export const Verification = () => {
  const navigate = useNavigate();
  const [pickups, setPickups] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [pickupsData, submissionsData] = await Promise.all([
      mockApi.getPickups({ status: 'PENDING_VERIFICATION' }),
      mockApi.getSubmissions()
    ]);
    setPickups(pickupsData);
    setSubmissions(submissionsData);
    setLoading(false);
  };

  const columns = [
    {
      header: 'Pickup ID',
      field: 'id',
      render: (row) => `#${row.id}`
    },
    { header: 'Driver', field: 'driverName' },
    {
      header: 'Route',
      render: (row) => (
        <div className="text-sm">
          <div className="text-ngo-dark font-medium">{row.pickupLocationName}</div>
          <div className="text-ngo-gray">→ {row.hungerSpotName}</div>
        </div>
      )
    },
    {
      header: 'Submitted',
      render: (row) => {
        const submission = submissions.find(s => s.pickupId === row.id);
        return submission ? new Date(submission.submittedAt).toLocaleDateString() : 'N/A';
      }
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      render: (row) => (
        <Button onClick={() => navigate(`/verification/${row.id}`)} variant="primary">
          <Eye className="w-4 h-4" />
          Review
        </Button>
      )
    }
  ];

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-ngo-dark mb-1 md:mb-2">Verification Queue</h1>
        <p className="text-sm md:text-base text-ngo-gray">Review and verify submitted pickup proofs</p>
      </div>

      {pickups.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 md:p-12 text-center border border-gray-100">
          <h3 className="text-lg md:text-xl font-semibold text-ngo-dark mb-2">No Pending Verifications</h3>
          <p className="text-sm md:text-base text-ngo-gray">All submissions have been reviewed.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <DataTable columns={columns} data={pickups} />
        </div>
      )}
    </div>
  );
};
