import React from 'react';
import { Link } from 'react-router-dom';

const ComplaintCard = ({ complaint, userType = 'citizen' }) => {
  return (
    <div className="complaint-card">
      <h4>{complaint.type}</h4>
      <p>{complaint.description.substring(0, 100)}...</p>
      <div className="complaint-meta">
        {userType === 'police' && <span>Filed by: {complaint.user_name}</span>}
        <span>Status: {complaint.status}</span>
        <span>Created: {new Date(complaint.created_at).toLocaleDateString()}</span>
      </div>
      {userType === 'police' && (
        <Link to={`/complaint-detail/${complaint.id}`} className="detail-btn">
          View Details
        </Link>
      )}
    </div>
  );
};

export default ComplaintCard;