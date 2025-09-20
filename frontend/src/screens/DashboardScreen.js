import React from 'react';
import { useAuth } from '../context/AuthContext';
import CitizenDashboard from '../components/CitizenDashboard';
import PoliceDashboard from '../components/PoliceDashboard';

function DashboardScreen() {
  const { user } = useAuth();

  // This component now acts as a simple router for the correct user dashboard.
  if (!user) {
    return null; // Or a loading/error state
  }

  return (
    <div className="dashboard-screen">
      {user.role === 'citizen' ? <CitizenDashboard /> : <PoliceDashboard />}
    </div>
  );
}

export default DashboardScreen;