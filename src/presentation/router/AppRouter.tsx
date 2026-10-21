import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TotemAccesoScreen } from '../screens/kiosk/TotemAccesoScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { MainLayout } from '../layout/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { ControlAccesoScreen } from '../screens/ingreso/ControlAccesoScreen';
import { ClientesScreen } from '../screens/clientes/ClientesScreen';
import { PersonalTrainersScreen } from '../screens/usuarios/PersonalTrainersScreen';
import { TipoRol } from '../../core/shared/enums';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Member Kiosk Route */}
        <Route path="/" element={<TotemAccesoScreen />} />

        {/* Private Staff/Admin Auth Routes (unlinked from kiosk) */}
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/admin" element={<Navigate to="/login" replace />} />

        {/* Protected App Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardScreen />} />
            <Route path="/ingreso" element={<ControlAccesoScreen />} />
            <Route path="/clientes" element={<ClientesScreen />} />

            {/* Admin Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={[TipoRol.Admin]} />}>
              <Route path="/trainers" element={<PersonalTrainersScreen />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

