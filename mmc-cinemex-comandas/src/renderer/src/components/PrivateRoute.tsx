// src/components/PrivateRoute.tsx
import React, { useContext } from 'react';
import AuthContext from '../../../auth/context/AuthContext.js';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>; // Muestra un indicador de carga
  }

  return token ? <>{children}</> : <Navigate to="/login" />;
};

export default PrivateRoute;