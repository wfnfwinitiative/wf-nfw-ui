import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockApi } from '../../services/mockApi';
import { StatusBadge } from '../../components/StatusBadge';
import { ArrowLeft, MapPin, Clock, Package, Camera, Mic, CheckCircle, Upload } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [proofData, setProofData] = useState({
    pickupPhotos: '',
    deliveryPhotos: '',
    voiceNote: '',
    actualQuantity: '',
    gpsLat: '',
    gpsLng: ''
  });

  useEffect(() => {
    loadTask();
  }, [id]);

  const loadTask = async () => {
    const pickup = await mockApi.getPickupById(id);
    setTask(pickup);
    setAccepted(pickup.status !== 'ASSIGNED');
    setLoading(false);
  };

  const handleAccept = async () => {
    await mockApi.acceptPickup(id);
    setAccepted(true);
    loadTask();
  };

  const handlePhotoUpload = (field) => {
    const mockUrl = `https://drive.google.com/file/d/${Math.random().toString(36).substr(2, 9)}`;
    setProofData({ ...proofData, [field]: mockUrl });
  };

  const handleVoiceRecord = async () => {
    const mockVoiceUrl = `https://drive.google.com/file/d/${Math.random().toString(36).substr(2, 9)}/audio.mp3`;
    setProofData({ ...proofData, voiceNote: mockVoiceUrl });
  };

  const handleGetGPS = () => {
    setProofData({
      ...proofData,
      gpsLat: (28.5 + Math.random() * 0.2).toFixed(6),
      gpsLng: (77.2 + Math.random() * 0.2).toFixed(6)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    await mockApi.submitProof(id, {
      ...proofData,
      submittedAt: new Date().toISOString()
    });

    setTimeout(() => {
      navigate('/driver/dashboard');
    }, 1500);
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!task) {
    return <div className="text-center py-12">Task not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Button onClick={() => navigate('/driver/dashboard')} variant="secondary" className="mb-6 text-ngo-gray hover:text-ngo-dark border-0 bg-transparent shadow-none">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Button>

      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-ngo-dark mb-1">Pickup #{task.id}</h1>
            <p className="text-ngo-gray">{task.scheduledDate} at {task.scheduledTime}</p>
          </div>
          <StatusBadge status={task.status} />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 bg-orange-50 rounded-xl">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-ngo-orange mt-1" />
              <div>
                <p className="text-xs text-ngo-gray mb-1">PICKUP FROM</p>
                <p className="font-semibold text-ngo-dark">{task.pickupLocationName}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-xl">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-ngo-green mt-1" />
              <div>
                <p className="text-xs text-ngo-gray mb-1">DELIVER TO</p>
                <p className="font-semibold text-ngo-dark">{task.hungerSpotName}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-ngo-light rounded-xl">
          <Package className="w-6 h-6 text-ngo-orange" />
          <div>
            <p className="text-sm text-ngo-gray">Estimated Quantity</p>
            <p className="font-semibold text-ngo-dark">{task.estimatedQuantity}</p>
          </div>
        </div>

        {task.notes && (
          <div className="mt-4 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm font-semibold text-ngo-dark mb-1">Notes:</p>
            <p className="text-sm text-ngo-gray">{task.notes}</p>
          </div>
        )}
      </div>

      {!accepted && task.status === 'ASSIGNED' && (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-ngo-dark mb-4">Accept this task?</h2>
          <Button onClick={handleAccept} variant="primary" fullWidth>
            Accept Task
          </Button>
        </div>
      )}

      {accepted && !['VERIFIED', 'REJECTED', 'PENDING_VERIFICATION'].includes(task.status) && (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-ngo-dark mb-6">Submit Proof of Delivery</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-ngo-dark mb-3">Pickup Photos</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => handlePhotoUpload('pickupPhotos')}
                  className="flex items-center gap-2 px-4 py-3 bg-ngo-light hover:bg-gray-200 rounded-xl transition-colors"
                >
                  <Camera className="w-5 h-5 text-ngo-orange" />
                  Upload Photos
                </button>
                {proofData.pickupPhotos && (
                  <span className="text-sm text-ngo-green flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Uploaded
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ngo-dark mb-3">Delivery Photos</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => handlePhotoUpload('deliveryPhotos')}
                  className="flex items-center gap-2 px-4 py-3 bg-ngo-light hover:bg-gray-200 rounded-xl transition-colors"
                >
                  <Camera className="w-5 h-5 text-ngo-orange" />
                  Upload Photos
                </button>
                {proofData.deliveryPhotos && (
                  <span className="text-sm text-ngo-green flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Uploaded
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ngo-dark mb-3">Voice Note (Optional)</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleVoiceRecord}
                  className="flex items-center gap-2 px-4 py-3 bg-ngo-light hover:bg-gray-200 rounded-xl transition-colors"
                >
                  <Mic className="w-5 h-5 text-ngo-orange" />
                  Record Voice Note
                </button>
                {proofData.voiceNote && (
                  <span className="text-sm text-ngo-green flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Recorded
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ngo-dark mb-2">Actual Quantity Delivered</label>
              <input
                type="text"
                value={proofData.actualQuantity}
                onChange={(e) => setProofData({ ...proofData, actualQuantity: e.target.value })}
                placeholder="e.g., 45 meals, 18kg"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ngo-dark mb-3">GPS Location</label>
              <div className="flex items-center gap-4 mb-3">
                <button
                  type="button"
                  onClick={handleGetGPS}
                  className="flex items-center gap-2 px-4 py-3 bg-ngo-light hover:bg-gray-200 rounded-xl transition-colors"
                >
                  <MapPin className="w-5 h-5 text-ngo-orange" />
                  Get Current Location
                </button>
                {proofData.gpsLat && (
                  <span className="text-sm text-ngo-green flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Captured
                  </span>
                )}
              </div>
              {proofData.gpsLat && (
                <p className="text-xs text-ngo-gray">
                  Lat: {proofData.gpsLat}, Lng: {proofData.gpsLng}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={submitting || !proofData.pickupPhotos || !proofData.deliveryPhotos || !proofData.gpsLat}
              variant="primary"
              fullWidth
            >
              {submitting ? 'Submitting...' : 'Submit Proof'}
            </Button>
          </form>
        </div>
      )}

      {task.status === 'PENDING_VERIFICATION' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <Clock className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-ngo-dark mb-2">Pending Verification</h3>
          <p className="text-ngo-gray">Your submission is being reviewed by the coordinator.</p>
        </div>
      )}
    </div>
  );
};
