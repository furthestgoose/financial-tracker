import React from 'react';
import { Link } from 'react-router-dom';
import '../styling/HomePage.css'; 

const HomePage = () => {
  return (
    <div className="home-page">
      <h1>Welcome to the Financial Tracker App</h1>
      <p>Your one-stop solution for managing finances efficiently.</p>
      <Link to="/login" className="Homebtn">Log In</Link>
      <Link to="/signup" className="Homebtn">Sign Up</Link>
    </div>
  );
};

export default HomePage;
