import React from 'react';
import { useAuth } from '/Users/adambyford/Desktop/Portfolio_Projects/financial_tracker/src/contexts/AuthContext'; // Adjust the import path if necessary
import { Button } from '/Users/adambyford/Desktop/Portfolio_Projects/financial_tracker/src/components/ui/button'; // Adjust the import path if necessary
import { useNavigate } from 'react-router-dom';

// Define prop types for the component
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
    <header className="content-header flex justify-between items-center mb-4">
      <h1 className="text-2xl font-semibold">{Page_Name}</h1>
      <Button
        onClick={handleLogout}
        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        Logout
      </Button>
    </header>
  );
};

export default DashboardHeader;
