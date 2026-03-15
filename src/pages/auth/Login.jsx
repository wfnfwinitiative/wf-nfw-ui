import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { Logo } from '../../components/Logo';
import logo from '../../assets/NoFoodWaste_Logo_Orange.png';
import { Phone, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const REMEMBER_KEY = 'nfw_remember';

export const Login = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { setSidebarOpen } = useSidebar();
  const navigate = useNavigate();

  // Restore saved credentials on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(REMEMBER_KEY) || 'null');
      if (saved?.mobile && saved?.password) {
        setMobileNumber(saved.mobile);
        setPassword(saved.password);
        setRememberMe(true);
      }
    } catch {}
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(mobileNumber, password);
      if (rememberMe) {
        localStorage.setItem(REMEMBER_KEY, JSON.stringify({ mobile: mobileNumber, password }));
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }
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
      {/* Left: Hero — compact banner on mobile, full panel on desktop */}
      <div className="relative flex lg:w-1/2 min-h-[200px] lg:min-h-screen">
        <div
          className="absolute inset-0 bg-cover bg-center"
           <input
             type={showPassword ? 'text' : 'password'}
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             placeholder="Enter password"
             className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none transition-all"
             required
             autoComplete="new-password"
            href="https://nofoodwastechennai.ngo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 mb-4 lg:mb-8 hover:opacity-80 transition-opacity w-fit"
          >
            <img src={logo} alt="NoFoodWaste" className="w-14 h-14 lg:w-28 lg:h-28 object-contain" />
            <span className="text-xl lg:text-2xl font-bold">NoFoodWaste</span>
          </a>
          <h1 className="text-2xl lg:text-4xl font-bold mb-2 lg:mb-4 leading-tight">
            Saving Food,<br />Serving Humanity
          </h1>
          <p className="text-sm lg:text-lg text-white/90 max-w-md hidden sm:block">
            Join us in our mission to reduce food waste and feed those in need.
            Every meal saved is a life touched.
          </p>
          <div className="mt-4 lg:mt-12 flex items-center gap-4 lg:gap-6">
            <div className="text-center">
              <p className="text-xl lg:text-3xl font-bold">2,450+</p>
              <p className="text-xs lg:text-sm text-white/80">Kg Food Saved</p>
            </div>
            <div className="w-px h-8 lg:h-12 bg-white/30" />
            <div className="text-center">
              <p className="text-xl lg:text-3xl font-bold">45+</p>
              <p className="text-xs lg:text-sm text-white/80">Hunger Spots</p>
            </div>
            <div className="w-px h-8 lg:h-12 bg-white/30" />
            <div className="text-center">
              <p className="text-xl lg:text-3xl font-bold">156+</p>
              <p className="text-xs lg:text-sm text-white/80">Deliveries</p>
            </div>
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

            <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
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
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ngo-orange focus:border-transparent outline-none transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ngo-gray hover:text-ngo-dark transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-ngo-orange rounded focus:ring-ngo-orange"
                  />
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
          </div>
        </div>
      </div>
    </div>
  );
};
