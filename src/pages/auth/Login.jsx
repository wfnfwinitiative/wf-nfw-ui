import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { Logo } from '../../components/Logo';
import { Phone, Lock, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const Login = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { setSidebarOpen } = useSidebar();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(mobileNumber, password);
      setSidebarOpen(true);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left: Hero (60% on desktop, full width on mobile, stacks first) */}
      <div className="relative flex-1 min-h-[220px] lg:min-h-screen bg-gradient-to-br from-ngo-orange via-orange-400 to-amber-200 flex flex-col justify-center px-6 py-10 lg:px-12 lg:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(255,255,255,0.15)_0%,_transparent_50%)]" aria-hidden />
        <div className="relative z-10">
          <Logo className="mb-6 lg:mb-10" />
          <p className="text-xl md:text-2xl font-semibold text-white/95 mb-2">
            Rescuing Food. Serving Humanity.
          </p>
          <p className="text-sm md:text-base text-white/90 max-w-md">
            Join our mission to reduce food waste and feed communities. Log in to the operations platform to coordinate pickups, verify deliveries, and support the cause.
          </p>
          <div className="mt-6 flex gap-2">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm" aria-hidden />
            <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-sm" aria-hidden />
            <div className="w-10 h-10 rounded-full bg-white/25 backdrop-blur-sm" aria-hidden />
          </div>
        </div>
      </div>

      {/* Right: Form (40% on desktop, full width on mobile) */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-6 lg:p-8 bg-gradient-to-b from-white via-orange-50/30 to-ngo-light">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 md:p-8">
            <div className="text-center mb-6">
              <h1 className="text-lg md:text-xl font-bold text-ngo-dark mb-1">No Food Waste Platform</h1>
              <p className="text-sm text-ngo-gray">Sign in to continue</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-ngo-dark mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ngo-gray" />
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Enter mobile number"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ngo-dark mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ngo-gray" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input type="checkbox" className="w-4 h-4 text-ngo-orange rounded focus:ring-ngo-orange" />
                  <span className="text-sm text-ngo-gray">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm font-medium text-ngo-orange hover:text-orange-600 transition-colors min-h-[44px] flex items-center">
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                fullWidth
                className="h-12"
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-ngo-gray">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-ngo-orange hover:text-orange-600 transition-colors">
                  Register here
                </Link>
              </p>
            </div>

            <div className="mt-6 p-4 bg-ngo-light rounded-xl">
              <p className="text-xs font-semibold text-ngo-dark mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-xs text-ngo-gray">
                <p>Admin: 9876543210 / admin123</p>
                <p>Coordinator: 9876543211 / coord123</p>
                <p>Driver: 9876543212 / driver123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
