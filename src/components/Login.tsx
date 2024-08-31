import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const { login } = useAuth();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isPhone, setIsPhone] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkDeviceType = () => {
      setIsPhone(window.innerWidth < 768);
    };

    document.title = "FinancePro Login"

    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);

    return () => {
      window.removeEventListener('resize', checkDeviceType);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (emailRef.current && passwordRef.current) {
      try {
        setError('');
        setLoading(true);
        await login(emailRef.current.value, passwordRef.current.value);
        navigate('/dashboard');
      } catch {
        setError('Failed to log in');
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-400 to-blue-500">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-gray-200">
        {isPhone ? (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Device Not Supported</h2>
            <p className="text-gray-600 mb-6">Sorry, our service is only available on tablets and computers.</p>
            <p className="text-gray-600">Please use a tablet or computer to log in.</p>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Log In</h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && <p className="text-red-500 text-center mb-4">{error}</p>}
              <div>
                <input
                  type="email"
                  ref={emailRef}
                  required
                  placeholder="Email"
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                />
              </div>
              <div>
                <input
                  type="password"
                  ref={passwordRef}
                  required
                  placeholder="Password"
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                />
              </div>
              <button
                disabled={loading}
                type="submit"
                className="w-full py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
              >
                {loading ? 'Logging In...' : 'Log In'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
