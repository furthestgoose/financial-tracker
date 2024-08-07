import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Signup from './components/SignUp';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
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
          <Route path="*" element={<NotFoundPage />} /> {/* 404 Page Route */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;