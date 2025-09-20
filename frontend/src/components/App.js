// src/App.js
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator'; // The new navigator
import LoadingSpinner from './components/common/LoadingSpinner'; // A reusable spinner

import './styles/App.css';
import './styles/theme.css'; // Import the new theme

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
        <p>Loading Application...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Bhrashtachar Mukt</h1>
        <p>AI-Powered Anti-Corruption System</p>
      </header>
      <main className="App-main">
        <AppNavigator />
      </main>
      <footer className="App-footer">
        <p>Hackathon MVP Demo | Not connected to real government systems</p>
      </footer>
    </div>
  );
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