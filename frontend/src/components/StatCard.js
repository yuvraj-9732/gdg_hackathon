import React from 'react';

const StatCard = ({ icon, title, value, description }) => {
  return (
    <div className="stat-card-enhanced">
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-info">
        <p className="stat-card-value">{value}</p>
        <h4 className="stat-card-title">{title}</h4>
        {description && <p className="stat-card-description">{description}</p>}
      </div>
    </div>
  );
};

export default StatCard;