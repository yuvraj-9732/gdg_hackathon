import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

function DashboardScreen() {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    total_complaints: 0,
    resolved_complaints: 0,
    in_progress_complaints: 0,
    submitted_complaints: 0,
    rewards_distributed: 0,
    most_wanted_count: 0,
    pending_reports: 0,
    avg_rating: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="dashboard-screen">
      <div className="dashboard-header">
        <h2>Welcome, {user?.name}</h2>
        <p>Role: {user?.role}</p>
        <p>Aadhar: {user?.aadhar}</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Complaints</h3>
          <p className="stat-number">{dashboardData.total_complaints}</p>
        </div>
        
        <div className="stat-card">
          <h3>Resolved</h3>
          <p className="stat-number">{dashboardData.resolved_complaints}</p>
        </div>
        
        <div className="stat-card">
          <h3>In Progress</h3>
          <p className="stat-number">{dashboardData.in_progress_complaints}</p>
        </div>
        
        <div className="stat-card">
          <h3>Rewards Distributed</h3>
          <p className="stat-number">₹{dashboardData.rewards_distributed.toLocaleString()}</p>
        </div>
      </div>

      <div className="dashboard-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          {user?.role === 'citizen' && (
            <>
              <Link to="/complaint" className="action-btn">
                File New Complaint
              </Link>
              <Link to="/tracking" className="action-btn">
                Track Complaints
              </Link>
              <Link to="/legal-guidance" className="action-btn">
                Legal Guidance
              </Link>
              <Link to="/whistleblower-protection" className="action-btn">
                Protection Tools
              </Link>
            </>
          )}
          
          {user?.role !== 'citizen' && (
            <>
              <Link to="/complaint-detail/1" className="action-btn">
                View Assigned Complaints
              </Link>
              <Link to="/accountability-portal" className="action-btn">
                Accountability Portal
              </Link>
            </>
          )}
          
          <Link to="/analytics-dashboard" className="action-btn">
            Analytics Dashboard
          </Link>
          
          <Link to="/corruption-map" className="action-btn">
            Corruption Map
          </Link>
          
          <Link to="/community-network" className="action-btn">
            Community Reports
          </Link>
          
          <Link to="/feedback-system" className="action-btn">
            Service Feedback
          </Link>
          
          <Link to="/most-wanted" className="action-btn">
            Most Wanted
          </Link>
        </div>
      </div>

      <div className="dashboard-highlights">
        <h3>System Highlights</h3>
        <div className="highlights-grid">
          <div className="highlight-card">
            <h4>Most Wanted Criminals</h4>
            <p className="highlight-number">{dashboardData.most_wanted_count}</p>
            <p>Active cases</p>
          </div>
          
          <div className="highlight-card">
            <h4>Pending Community Reports</h4>
            <p className="highlight-number">{dashboardData.pending_reports}</p>
            <p>Awaiting investigation</p>
          </div>
          
          <div className="highlight-card">
            <h4>Avg. Service Rating</h4>
            <p className="highlight-number">{dashboardData.avg_rating}/5</p>
            <p>Citizen satisfaction</p>
          </div>
        </div>
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default DashboardScreen;