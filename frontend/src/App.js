import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import ComplaintForm from './components/ComplaintForm';
import ComplaintDetailScreen from './screens/ComplaintDetailScreen';
import TrackingScreen from './screens/TrackingScreen';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import CorruptionMap from './components/CorruptionMap';
import LegalGuidance from './components/LegalGuidance';
import WhistleblowerProtection from './components/WhistleblowerProtection';
import AccountabilityPortal from './components/AccountabilityPortal';
import CommunityNetwork from './components/CommunityNetwork';
import FeedbackSystem from './components/FeedbackSystem';
import MostWanted from './components/MostWanted';
import './App.css';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Bhrashtachar Mukt</h1>
        <p>AI-Powered Anti-Corruption System</p>
      </header>
      
      <main className="App-main">
        <Routes>
          <Route path="/login" element={!user ? <LoginScreen /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={user ? <DashboardScreen /> : <Navigate to="/login" />} />
          <Route path="/complaint" element={user ? <ComplaintForm /> : <Navigate to="/login" />} />
          <Route path="/tracking" element={user ? <TrackingScreen /> : <Navigate to="/login" />} />
          <Route path="/complaint-detail/:id" element={user ? <ComplaintDetailScreen /> : <Navigate to="/login" />} />
          <Route path="/analytics-dashboard" element={user ? <AnalyticsDashboard /> : <Navigate to="/login" />} />
          <Route path="/corruption-map" element={user ? <CorruptionMap /> : <Navigate to="/login" />} />
          <Route path="/legal-guidance" element={user ? <LegalGuidance /> : <Navigate to="/login" />} />
          <Route path="/whistleblower-protection" element={user ? <WhistleblowerProtection /> : <Navigate to="/login" />} />
          <Route path="/accountability-portal" element={user ? <AccountabilityPortal /> : <Navigate to="/login" />} />
          <Route path="/community-network" element={user ? <CommunityNetwork /> : <Navigate to="/login" />} />
          <Route path="/feedback-system" element={user ? <FeedbackSystem /> : <Navigate to="/login" />} />
          <Route path="/most-wanted" element={user ? <MostWanted /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
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
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;