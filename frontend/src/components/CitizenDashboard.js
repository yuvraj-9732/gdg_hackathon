import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ComplaintCard from './ComplaintCard';
import StatCard from './StatCard';

// Icons for the citizen dashboard
const TotalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>;
const ResolvedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const PendingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

function CitizenDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/user/complaints?user_id=${user.id}`);
        setComplaints(response.data);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchComplaints();
    }
  }, [user]);

  const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length;
  const pendingComplaints = complaints.length - resolvedComplaints;

  return (
    <div className="citizen-dashboard">
      <div className="dashboard-header-personal">
        <h2>Citizen Dashboard</h2>
        <p>Welcome, {user.name}. View your complaint history and status.</p>
      </div>
      <div className="dashboard-stats">
        <StatCard 
          icon={<TotalIcon />}
          title="Total Complaints Filed"
          value={complaints.length} />
        <StatCard 
          icon={<ResolvedIcon />}
          title="Resolved Complaints"
          value={resolvedComplaints} />
        <StatCard 
          icon={<PendingIcon />}
          title="Pending Complaints"
          value={pendingComplaints} />
      </div>
      <h3>Your Complaints</h3>
      
      {loading ? (
        <p>Loading complaints...</p>
      ) : complaints.length === 0 ? (
        <p>No complaints filed yet.</p>
      ) : (
        <div className="complaints-list">
          {complaints.map(complaint => (
            <ComplaintCard key={complaint.id} complaint={complaint} userType="citizen" />
          ))}
        </div>
      )}
    </div>
  );
}

export default CitizenDashboard;