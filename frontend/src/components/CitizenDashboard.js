import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

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

  return (
    <div className="citizen-dashboard">
      <div className="dashboard-actions">
        <Link to="/complaint" className="dashboard-btn">File New Complaint</Link>
        <Link to="/tracking" className="dashboard-btn">Track Complaints</Link>
      </div>
      
      <h3>Your Complaints</h3>
      
      {loading ? (
        <p>Loading complaints...</p>
      ) : complaints.length === 0 ? (
        <p>No complaints filed yet.</p>
      ) : (
        <div className="complaints-list">
          {complaints.map(complaint => (
            <div key={complaint.id} className="complaint-card">
              <h4>{complaint.type}</h4>
              <p>{complaint.description.substring(0, 100)}...</p>
              <div className="complaint-meta">
                <span>Status: {complaint.status}</span>
                <span>Created: {new Date(complaint.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CitizenDashboard;