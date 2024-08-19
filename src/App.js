import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Signup from './components/SignUp';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Income from './components/income';
import Expenses from './components/expenses';
import One_time_Expenses from './components/One-time-expenses';
import Investments from './components/Investments';
import ProtectedRoute from './components/ProtectedRoute';
import Settings from './components/Settings';
import HomePage from './components/HomePage'; // Import HomePage
import NotFoundPage from './components/404Page'; // Import NotFoundPage

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} /> {/* Home Page Route */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute component={Dashboard} />} />
          <Route path="/income" element={<ProtectedRoute component={Income} />} />
          <Route path="/expenses" element={<ProtectedRoute component={Expenses} />} />
          <Route path="/one-time-expenses" element={<ProtectedRoute component={One_time_Expenses} />} />
          <Route path="/investments" element={<ProtectedRoute component={Investments} />} />
          <Route path="/settings" element={<ProtectedRoute component={Settings} />} />
          <Route path="*" element={<NotFoundPage />} /> {/* 404 Page Route */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;