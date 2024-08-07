import React, { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import '../styling/login.css';

const Login = () => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
      navigate('/dashboard');
    } catch {
      setError('Failed to log in');
    }

    setLoading(false);
  };

  return (
    <div className="login-background">
    <div className="login-container">
      <div className="login-form-wrapper">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Log In</h2>
          {error && <p className="error-message">{error}</p>}
          <input
            type="email"
            ref={emailRef}
            required
            placeholder="Email"
            className="login-input"
          />
          <input
            type="password"
            ref={passwordRef}
            required
            placeholder="Password"
            className="login-input"
          />
          <button disabled={loading} type="submit" className="login-button">
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
    </div>
  );
};

export default Login;
