import React from 'react';
import { Link } from 'react-router-dom';
import '../styling/404Page.css'; 

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <Link to="/" className="is404btn">Go to Home Page</Link>
    </div>
  );
};

export default NotFoundPage;
