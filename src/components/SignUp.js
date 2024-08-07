import React, { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styling/signup.css';

const Signup = () => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { signup } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

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

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasMinLength = password.length >= 6;
    
    setPasswordValid(hasUpperCase && hasLowerCase && hasNumber && hasMinLength);
  };

  return (
    <div className='signup-container'>
    <form onSubmit={handleSubmit} className="signup-form">
      <h2>Sign Up</h2>
      {error && <p className="error-message">{error}</p>}
      <input 
        type="email" 
        ref={emailRef} 
        required 
        placeholder="Email" 
        pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" 
        title="Enter a valid email address"
        className="signup-input"
      />
      <input 
        type="password" 
        ref={passwordRef} 
        required 
        placeholder="Password" 
        onChange={(e) => validatePassword(e.target.value)}
        className="signup-input"
      />
      <button 
        disabled={loading || !passwordValid} 
        type="submit" 
        className="signup-button"
      >
        Sign Up
      </button>
      {!passwordValid && <p className="password-info">Password must be at least 6 characters long, include an uppercase letter, a lowercase letter, and a number.</p>}
    </form>
    </div>
  );
};

export default Signup;
