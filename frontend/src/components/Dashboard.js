import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/dashboard')
      .then(response => setDashboardData(response.data))
      .catch(error => console.error(error));
  }, []);

  if (!dashboardData) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h2>Corruption Dashboard</h2>
      
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
          <h3>Submitted</h3>
          <p className="stat-number">{dashboardData.submitted_complaints}</p>
        </div>
        
        <div className="stat-card">
          <h3>Rewards Distributed</h3>
          <p className="stat-number">₹{dashboardData.rewards_distributed.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="dashboard-message">
        <p>This dashboard shows real-time statistics of corruption complaints and rewards.</p>
        <p>In a full implementation, this would be connected to live government databases.</p>
      </div>
    </div>
  );
}

export default Dashboard;