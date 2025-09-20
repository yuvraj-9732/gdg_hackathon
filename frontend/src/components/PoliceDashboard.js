import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ComplaintCard from './ComplaintCard';
import StatCard from './StatCard';

// Icons for the police dashboard
const AssignedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const PendingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

function PoliceDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/police/complaints');
        setComplaints(response.data);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);
  
  const pendingComplaints = complaints.filter(c => c.status !== 'Resolved').length;

  return (
    <div className="police-dashboard">
      <div className="dashboard-header-personal">
        <h2>Officer Dashboard</h2>
        <p>Welcome, {user.name}. Here is your current workload.</p>
      </div>
      <div className="dashboard-stats">
        <StatCard 
          icon={<AssignedIcon />}
          title="Total Assigned Complaints"
          value={complaints.length} />
        <StatCard 
          icon={<PendingIcon />}
          title="Pending Resolution"
          value={pendingComplaints} />
      </div>
      <h3>Assigned Complaints</h3>
      
      {loading ? (
        <p>Loading complaints...</p>
      ) : complaints.length === 0 ? (
        <p>No complaints assigned.</p>
      ) : (
        <div className="complaints-list">
          {complaints.map(complaint => (
            <ComplaintCard key={complaint.id} complaint={complaint} userType="police" />
          ))}
        </div>
      )}
    </div>
  );
}

export default PoliceDashboard;