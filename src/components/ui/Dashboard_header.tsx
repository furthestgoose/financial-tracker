import React from 'react';
import { useAuth } from '/Users/adambyford/Desktop/Portfolio_Projects/financial_tracker/src/contexts/AuthContext';
import { Button } from '/Users/adambyford/Desktop/Portfolio_Projects/financial_tracker/src/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface DashboardHeaderProps {
  Page_Name: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ Page_Name }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch {
      console.error('Failed to log out');
    }
  };

  return (
    <header className="bg-white shadow-md flex justify-between items-center p-4 rounded-lg mb-6">
      <h1 className="text-3xl font-bold text-gray-800">{Page_Name}</h1>
      <Button
        onClick={handleLogout}
        className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300"
      >
        Logout
      </Button>
    </header>
  );
};

export default DashboardHeader;
