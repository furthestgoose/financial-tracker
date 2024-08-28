import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Sidebar from './ui/sidebar';
import DashboardHeader from './ui/Dashboard_header';

const Goals: React.FC = () => {

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      <Sidebar page="Goals" />
      <main className="flex-1 flex flex-col p-6 overflow-auto">
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <DashboardHeader Page_Name="Goals" />
        </div>


        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         
        </div>
      </main>
    </div>
  );
};

export default Goals;
