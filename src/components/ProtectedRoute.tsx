import React from 'react';
import { Navigate, RouteProps } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Define the type for the component prop
interface ProtectedRouteProps {
  component: React.ComponentType;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return <Component />;
};

export default ProtectedRoute;
