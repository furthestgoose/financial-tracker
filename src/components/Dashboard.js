import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styling/dashboard.css'; 

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      console.error('Failed to log out');
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <p>Welcome, {currentUser.email}</p>
      <button className="dashboard-button" onClick={handleLogout}>Log Out</button>
    </div>
  );
};

export default Dashboard;
