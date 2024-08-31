import React, { useRef, useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Signup: React.FC = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const { signup } = useAuth();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [passwordValid, setPasswordValid] = useState<boolean>(false);
  const [isPhone, setIsPhone] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkDeviceType = () => {
      setIsPhone(window.innerWidth < 768);
    };

    document.title = "FinancePro SignUp"

    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);

    return () => {
      window.removeEventListener('resize', checkDeviceType);
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!emailRef.current || !passwordRef.current) return;

    try {
      setError('');
      setLoading(true);
      await signup(emailRef.current.value, passwordRef.current.value);
      navigate('/dashboard');
    } catch {
      setError('Failed to create an account');
    }

    setLoading(false);
  };

  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasMinLength = password.length >= 6;
    
    setPasswordValid(hasUpperCase && hasLowerCase && hasNumber && hasMinLength);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    validatePassword(e.target.value);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-400 to-blue-500">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-gray-200">
        {isPhone ? (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Device Not Supported</h2>
            <p className="text-gray-600 mb-6">Sorry, our service is only available on tablets and computers.</p>
            <p className="text-gray-600">Please use a tablet or computer to sign up.</p>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">Sign Up</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <p className="text-red-500 text-center mb-4">{error}</p>}
              <div>
                <input
                  type="email"
                  ref={emailRef}
                  required
                  placeholder="Email"
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  title="Enter a valid email address"
                  disabled={loading}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                />
              </div>
              <div>
                <input
                  type="password"
                  ref={passwordRef}
                  required
                  placeholder="Password"
                  onChange={handlePasswordChange}
                  disabled={loading}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
                />
              </div>
              <button
                disabled={loading || !passwordValid}
                type="submit"
                className="w-full py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
              >
                {loading ? 'Signing Up...' : 'Sign Up'}
              </button>
              {!passwordValid && (
                <p className="text-sm text-orange-600 mt-2 text-center">
                  Password must be at least 6 characters long, include an uppercase letter, a lowercase letter, and a number.
                </p>
              )}
            </form>
            <div className="mt-6 text-center">
              <p className="text-gray-600">Already have an account?</p>
              <a
                href="/login"
                className="text-blue-500 hover:underline mt-2 inline-block"
              >
                Log in here
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Signup;
