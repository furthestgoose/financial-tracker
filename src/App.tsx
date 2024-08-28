import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Signup from './components/SignUp';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Income from './components/income';
import Expenses from './components/expenses';
import Investments from './components/Investments';
import ProtectedRoute from './components/ProtectedRoute';
import Bank_Accounts from "./components/Bank_Accounts";
import HomePage from './components/HomePage';
import NotFoundPage from './components/404Page';
import goals from "./components/Goals";

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute component={Dashboard} />} />
          <Route path="/income" element={<ProtectedRoute component={Income} />} />
          <Route path="/expenses" element={<ProtectedRoute component={Expenses} />} />
          <Route path="/goals" element={<ProtectedRoute component={goals} />} />
          <Route path="/investments" element={<ProtectedRoute component={Investments} />} />
          <Route path="/bank-accounts" element={<ProtectedRoute component={Bank_Accounts} />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
