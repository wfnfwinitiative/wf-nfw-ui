import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockApi } from '../../services/mockApi';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, MapPin, Camera, Mic, CheckCircle, XCircle, AlertCircle, User, Clock, Package } from 'lucide-react';

export const VerificationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pickup, setPickup] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    const pickupData = await mockApi.getPickupById(id);
    const submissions = await mockApi.getSubmissions(id);
    setPickup(pickupData);
    setSubmission(submissions[0] || null);
    setLoading(false);
  };

  const handleVerify = async (action) => {
    setProcessing(true);
    await mockApi.verifySubmission(submission.id, action, notes);
    setTimeout(() => {
      navigate('/verification');
    }, 1000);
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!pickup || !submission) {
    return <div className="text-center py-12">Submission not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Button onClick={() => navigate('/verification')} variant="secondary" className="mb-6 text-ngo-gray hover:text-ngo-dark border-0 bg-transparent shadow-none">
        <ArrowLeft className="w-4 h-4" />
        Back to Queue
      </Button>

      <div className="grid gap-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-ngo-dark">Pickup #{pickup.id}</h1>
            <StatusBadge status={pickup.status} />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="p-4 bg-ngo-light rounded-xl">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-ngo-orange mt-1" />
                <div>
                  <p className="text-xs text-ngo-gray mb-1">DRIVER</p>
                  <p className="font-semibold text-ngo-dark">{pickup.driverName}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-ngo-light rounded-xl">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-ngo-green mt-1" />
                <div>
                  <p className="text-xs text-ngo-gray mb-1">SCHEDULED</p>
                  <p className="font-semibold text-ngo-dark">{pickup.scheduledDate} {pickup.scheduledTime}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 border border-orange-200 rounded-xl">
              <div className="flex items-start gap-2 mb-2">
                <MapPin className="w-4 h-4 text-ngo-orange mt-1" />
                <p className="text-xs text-ngo-gray">PICKUP FROM</p>
              </div>
              <p className="font-semibold text-ngo-dark">{pickup.pickupLocationName}</p>
            </div>

            <div className="p-4 border border-green-200 rounded-xl">
              <div className="flex items-start gap-2 mb-2">
                <MapPin className="w-4 h-4 text-ngo-green mt-1" />
                <p className="text-xs text-ngo-gray">DELIVERED TO</p>
              </div>
              <p className="font-semibold text-ngo-dark">{pickup.hungerSpotName}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-xs text-ngo-gray mb-1">ESTIMATED QUANTITY</p>
              <p className="font-semibold text-ngo-dark">{pickup.estimatedQuantity}</p>
            </div>

            <div className="p-4 bg-green-50 rounded-xl">
              <p className="text-xs text-ngo-gray mb-1">ACTUAL QUANTITY</p>
              <p className="font-semibold text-ngo-dark">{submission.actualQuantity}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-ngo-dark mb-6">Submitted Proof</h2>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Camera className="w-5 h-5 text-ngo-orange" />
                <h3 className="font-semibold text-ngo-dark">Pickup Photos</h3>
              </div>
              <div className="p-4 bg-ngo-light rounded-xl">
                <a
                  href={submission.pickupPhotos}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-ngo-orange hover:underline"
                >
                  View Photos →
                </a>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Camera className="w-5 h-5 text-ngo-green" />
                <h3 className="font-semibold text-ngo-dark">Delivery Photos</h3>
              </div>
              <div className="p-4 bg-ngo-light rounded-xl">
                <a
                  href={submission.deliveryPhotos}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-ngo-green hover:underline"
                >
                  View Photos →
                </a>
              </div>
            </div>

            {submission.voiceNote && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Mic className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-ngo-dark">Voice Note</h3>
                </div>
                <div className="p-4 bg-ngo-light rounded-xl">
                  <a
                    href={submission.voiceNote}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 hover:underline"
                  >
                    Listen to Audio →
                  </a>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-ngo-dark">GPS Location</h3>
              </div>
              <div className="p-4 bg-ngo-light rounded-xl">
                <p className="text-sm text-ngo-gray">
                  Latitude: {submission.gpsLat} | Longitude: {submission.gpsLng}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-ngo-gray" />
                <h3 className="font-semibold text-ngo-dark">Submission Time</h3>
              </div>
              <div className="p-4 bg-ngo-light rounded-xl">
                <p className="text-sm text-ngo-gray">
                  {new Date(submission.submittedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-ngo-dark mb-6">Verification Action</h2>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-ngo-dark mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none"
              rows="3"
              placeholder="Add any notes or comments..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={() => handleVerify('APPROVE')} disabled={processing} variant="primary" fullWidth>
              <CheckCircle className="w-5 h-5" />
              Approve
            </Button>
            <Button onClick={() => handleVerify('NEEDS_CORRECTION')} disabled={processing} variant="secondary" fullWidth>
              <AlertCircle className="w-5 h-5" />
              Needs Correction
            </Button>
            <Button onClick={() => handleVerify('REJECT')} disabled={processing} variant="danger" fullWidth>
              <XCircle className="w-5 h-5" />
              Reject
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
