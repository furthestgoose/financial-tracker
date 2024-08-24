import React from 'react';
import Sidebar from './ui/sidebar';
import DashboardHeader from './ui/Dashboard_header';

const Dashboard = () => {

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar page="Home" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-6 overflow-auto">
        {/* White box wrapping the header only */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <DashboardHeader Page_Name="Home" />
        </div>

        {/* Content body outside the white box */}
        <div className="flex-1">
          <p className="text-gray-700">This is your personalized dashboard. Explore the sidebar for more options.</p>
          {/* Add more dashboard content here */}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
