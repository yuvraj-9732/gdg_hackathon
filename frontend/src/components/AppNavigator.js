import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

// Import your components
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ComplaintForm from './ComplaintForm';
import ComplaintDetailScreen from '../screens/ComplaintDetailScreen';
import TrackingScreen from '../screens/TrackingScreen';
import AnalyticsDashboard from './AnalyticsDashboard';
import CorruptionMap from './CorruptionMap';
import LegalGuidance from './LegalGuidance';
import WhistleblowerProtection from './WhistleblowerProtection';
import AccountabilityPortal from './AccountabilityPortal'; // Assuming it's in components
import CommunityNetwork from './CommunityNetwork'; // Assuming it's in components
import FeedbackSystem from './FeedbackSystem'; // Assuming it's in components
import MostWanted from './MostWanted';

const pageVariants = {
  initial: {
    opacity: 0,
    x: '-100vw',
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: '100vw',
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
};

const AnimatedRoute = ({ children }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={pageTransition}
  >
    {children}
  </motion.div>
);

function AppNavigator() {
  const location = useLocation();
  const { user } = useAuth();

  // This component protects routes that require a user to be logged in.
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public and Auth Routes */}
        <Route path="/login" element={<AnimatedRoute>{!user ? <LoginScreen /> : <Navigate to="/dashboard" />}</AnimatedRoute>} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><AnimatedRoute><DashboardScreen /></AnimatedRoute></ProtectedRoute>} />
        <Route path="/complaint" element={<ProtectedRoute><AnimatedRoute><ComplaintForm /></AnimatedRoute></ProtectedRoute>} />
        <Route path="/tracking" element={<ProtectedRoute><AnimatedRoute><TrackingScreen /></AnimatedRoute></ProtectedRoute>} />
        <Route path="/complaint-detail/:id" element={<ProtectedRoute><AnimatedRoute><ComplaintDetailScreen /></AnimatedRoute></ProtectedRoute>} />
        <Route path="/analytics-dashboard" element={<ProtectedRoute><AnimatedRoute><AnalyticsDashboard /></AnimatedRoute></ProtectedRoute>} />
        <Route path="/corruption-map" element={<ProtectedRoute><AnimatedRoute><CorruptionMap /></AnimatedRoute></ProtectedRoute>} />
        <Route path="/legal-guidance" element={<ProtectedRoute><AnimatedRoute><LegalGuidance /></AnimatedRoute></ProtectedRoute>} />
        <Route path="/whistleblower-protection" element={<ProtectedRoute><AnimatedRoute><WhistleblowerProtection /></AnimatedRoute></ProtectedRoute>} />
        <Route path="/accountability-portal" element={<ProtectedRoute><AnimatedRoute><AccountabilityPortal /></AnimatedRoute></ProtectedRoute>} />
        <Route path="/community-network" element={<ProtectedRoute><AnimatedRoute><CommunityNetwork /></AnimatedRoute></ProtectedRoute>} />
        <Route path="/feedback-system" element={<ProtectedRoute><AnimatedRoute><FeedbackSystem /></AnimatedRoute></ProtectedRoute>} />
        <Route path="/most-wanted" element={<ProtectedRoute><AnimatedRoute><MostWanted /></AnimatedRoute></ProtectedRoute>} />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </AnimatePresence>
  );
}

export default AppNavigator;