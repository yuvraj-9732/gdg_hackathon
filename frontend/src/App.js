import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppNavigator from './components/AppNavigator';
import LoadingSpinner from './components/LoadingSpinner';
import MainLayout from './MainLayout';

import './App.css';
import './components/theme.css'; // Corrected path

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
        <p>Loading Application...</p>
      </div>
    );
  }

  // If a user is logged in, wrap the content with the MainLayout
  if (user) {
    return (
      <MainLayout>
        <AppNavigator />
      </MainLayout>
    );
  }

  // Otherwise, show the default layout (for the login screen)
  return <AppNavigator />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;