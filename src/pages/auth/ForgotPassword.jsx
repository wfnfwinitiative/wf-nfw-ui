import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { Phone, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const ForgotPassword = () => {
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ngo-light via-white to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Logo className="mb-4" />
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-ngo-green" />
            </div>
            <h2 className="text-2xl font-bold text-ngo-dark mb-2">Reset Link Sent!</h2>
            <p className="text-ngo-gray mb-6">
              We've sent password reset instructions to your phone number.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-ngo-orange hover:text-orange-600 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ngo-light via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="mb-4" />
          <h1 className="text-3xl font-bold text-ngo-dark mb-2">Forgot Password</h1>
          <p className="text-ngo-gray">Enter your phone number to reset password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-ngo-dark mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ngo-gray" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter registered phone number"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>

            <Button type="submit" variant="primary" fullWidth>
              Send Reset Link
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-ngo-gray hover:text-ngo-dark transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
