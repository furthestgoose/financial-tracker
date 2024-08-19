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
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Dashboard</h2>
        </div>
        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">Home</a>
          <a href="/income" className="nav-item">Income</a>
          <a href="/investments" className="nav-item">Investments</a>
          <a href="/expenses" className="nav-item">Expenses</a>
          <a href="/one-time-expenses" className="nav-item">One time Expenses</a>
          <a href="/settings" className="nav-item">Settings</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="content-header">
          <h1>Welcome, {currentUser.email}</h1>
          <button onClick={handleLogout} className="logout-button">
            Log Out
          </button>
        </header>
        <div className="content-body">
          <p>This is your personalized dashboard. Explore the sidebar for more options.</p>
          {/* Add more dashboard content here */}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;