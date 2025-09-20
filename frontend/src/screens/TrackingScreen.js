import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function TrackingScreen() {
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
    <div className="tracking-screen">
      <h2>Track Your Complaints</h2>
      
      {loading ? (
        <p>Loading complaints...</p>
      ) : complaints.length === 0 ? (
        <p>No complaints filed yet.</p>
      ) : (
        <div className="tracking-list">
          {complaints.map(complaint => (
            <div key={complaint.id} className="tracking-card">
              <div className="tracking-header">
                <h3>{complaint.type}</h3>
                <div className={`status-badge ${complaint.status.toLowerCase()}`}>
                  {complaint.status}
                </div>
              </div>
              
              <p>{complaint.description}</p>
              
              <div className="tracking-timeline">
                <div className="timeline-item">
                  <div className="timeline-date">
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-title">Complaint Filed</div>
                    <p>Your complaint has been submitted successfully.</p>
                  </div>
                </div>
                
                {complaint.status !== 'Submitted' && (
                  <div className="timeline-item">
                    <div className="timeline-date">
                      {new Date(complaint.updated_at).toLocaleDateString()}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-title">Under Investigation</div>
                      <p>Your complaint is being reviewed by authorities.</p>
                    </div>
                  </div>
                )}
                
                {complaint.status === 'Resolved' && (
                  <div className="timeline-item">
                    <div className="timeline-date">
                      {new Date(complaint.updated_at).toLocaleDateString()}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-title">Resolved</div>
                      <p>Your complaint has been resolved.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrackingScreen;