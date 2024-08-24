import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div
      className="not-found-page text-center p-2 max-w-600px
    m-auto font-Roboto bg-black flex justify-center
    items-center min-h-screen p-20"
    >
      <div className="404-container">
        <h1 className="text-4xl text-red-600 mb-1">404 - Page Not Found</h1>
        <p className="text-lg text-white mb-2">
          Sorry, the page you are looking for does not exist.
        </p>
        <Link
          to="/"
          className="is404btn inline-block p-6 m-2 bg-slate-800
          text-white text-base hover:bg-slate-900"
        >
          Go to Home Page
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
