import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

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

  return (
    <div className="police-dashboard">
      <h3>Assigned Complaints</h3>
      
      {loading ? (
        <p>Loading complaints...</p>
      ) : complaints.length === 0 ? (
        <p>No complaints assigned.</p>
      ) : (
        <div className="complaints-list">
          {complaints.map(complaint => (
            <div key={complaint.id} className="complaint-card">
              <h4>{complaint.type}</h4>
              <p>{complaint.description.substring(0, 100)}...</p>
              <div className="complaint-meta">
                <span>Filed by: {complaint.user_name}</span>
                <span>Status: {complaint.status}</span>
                <span>Created: {new Date(complaint.created_at).toLocaleDateString()}</span>
              </div>
              <Link to={`/complaint-detail/${complaint.id}`} className="detail-btn">View Details</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PoliceDashboard;