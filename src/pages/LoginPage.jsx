import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/NoFoodWaste_Logo_Orange.png';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    console.log('Login attempt with:', { email, password });
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { email: 'admin@nofoodwaste.org', password: 'admin123', role: 'Admin' },
    { email: 'coordinator@nofoodwaste.org', password: 'coord123', role: 'Coordinator' },
    { email: 'driver@nofoodwaste.org', password: 'driver123', role: 'Driver' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80')`,
          }}
        >
          <div className="absolute inset-0 bg-linear-to-r from-black/70 to-black/50" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <a
            href="https://nofoodwastechennai.ngo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity w-fit"
          >
            <img src={logo} alt="NoFoodWaste" className="w-12 h-12" />
            <span className="text-2xl font-bold">NoFoodWaste</span>
          </a>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Saving Food,<br />Serving Humanity
          </h1>
          <p className="text-lg text-primary-100 max-w-md">
            Join us in our mission to reduce food waste and feed those in need. 
            Every meal saved is a life touched.
          </p>
          <div className="mt-12 flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold">2,450+</p>
              <p className="text-sm text-primary-200">Kg Food Saved</p>
            </div>
            <div className="w-px h-12 bg-primary-400/30" />
            <div className="text-center">
              <p className="text-3xl font-bold">45+</p>
              <p className="text-sm text-primary-200">Hunger Spots</p>
            </div>
            <div className="w-px h-12 bg-primary-400/30" />
            <div className="text-center">
              <p className="text-3xl font-bold">156+</p>
              <p className="text-sm text-primary-200">Deliveries</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <a
            href="https://nofoodwastechennai.ngo"
            target="_blank"
            rel="noopener noreferrer"
            className="lg:hidden flex items-center justify-center gap-2 mb-8 hover:opacity-80 transition-opacity"
          >
            <img src={logo} alt="NoFoodWaste" className="w-10 h-10" />
            <span className="text-xl font-bold text-gray-900">NoFoodWaste</span>
          </a>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-gray-500 mt-1">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" loading={loading}>
                Sign In
              </Button>
            </form>

            {/* Demo accounts */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center mb-4">Demo Accounts</p>
              <div className="space-y-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.role}
                    onClick={() => {
                      setEmail(account.email);
                      setPassword(account.password);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm"
                  >
                    <span className="font-medium text-gray-700">{account.role}</span>
                    <span className="text-gray-400 text-xs">{account.email}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
