import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StatCard from './StatCard';

// Simple SVG Icons for the Stat Cards
const ComplaintIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const ResolvedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const InProgressIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const RewardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>;

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
        <StatCard 
          icon={<ComplaintIcon />}
          title="Total Complaints"
          value={dashboardData.total_complaints.toLocaleString()}
        />
        <StatCard 
          icon={<ResolvedIcon />}
          title="Resolved"
          value={dashboardData.resolved_complaints.toLocaleString()}
        />
        <StatCard 
          icon={<InProgressIcon />}
          title="In Progress"
          value={dashboardData.in_progress_complaints.toLocaleString()}
        />
        <StatCard 
          icon={<RewardIcon />}
          title="Rewards Distributed"
          value={`₹${dashboardData.rewards_distributed.toLocaleString()}`}
        />
      </div>
      
    </div>
  );
}

export default Dashboard;