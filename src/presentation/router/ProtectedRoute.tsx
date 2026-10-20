import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { TipoRol } from '../../core/shared/enums';
import { useAuthStore } from '../store/useAuthStore';

interface ProtectedRouteProps {
  allowedRoles?: TipoRol[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.idRol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
