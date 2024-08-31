import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  useEffect(() => {
    document.title = "404 Error"
 }, []);
  
  return (
    <div
      className="not-found-page text-center font-Roboto
    bg-gradient-to-b from-gray-900 to-black flex flex-col justify-center
    items-center h-screen w-screen p-10"
    >
      <div className="404-container flex flex-col items-center">
        <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500 mb-4 animate-pulse">
          404
        </h1>
        <h2 className="text-3xl font-bold text-white mb-4">
          Oops! Page Not Found
        </h2>
        <p className="text-lg text-gray-300 mb-8">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500
          text-white text-lg font-medium rounded-full shadow-lg hover:from-emerald-500 hover:to-green-500 transition duration-300 ease-in-out transform hover:-translate-y-1"
        >
          Go to Home Page
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
