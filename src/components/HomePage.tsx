import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to the Financial Tracker App</h1>
      <p className="text-lg text-gray-600 mb-8">Your one-stop solution for managing finances efficiently.</p>
      <div className="flex space-x-4">
        <Link
          to="/login"
          className="Homebtn bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300"
        >
          Log In
        </Link>
        <Link
          to="/signup"
          className="Homebtn bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
