import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const actionGroups = [
  {
    title: 'Core Actions',
    actions: [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'File Complaint', path: '/complaint' },
      { name: 'Track Complaints', path: '/tracking' },
    ],
  },
  {
    title: 'Analysis & Tools',
    actions: [
      { name: 'Analytics', path: '/analytics-dashboard' },
      { name: 'Corruption Map', path: '/corruption-map' },
      { name: 'Legal Guidance', path: '/legal-guidance' },
      { name: 'Whistleblower Protection', path: '/whistleblower-protection' },
    ],
  },
  {
    title: 'Community & Information',
    actions: [
      { name: 'Community Network', path: '/community-network' },
      { name: 'Most Wanted', path: '/most-wanted' },
      { name: 'Accountability', path: '/accountability-portal' },
      { name: 'Feedback System', path: '/feedback-system' },
    ],
  },
];

function SidePanel() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    // Add a confirmation before logging out
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  return (
    <div className="side-panel">
      <div className="side-panel-header">
        <h4>Quick Actions</h4>
      </div>
      <nav className="side-panel-nav">
        {actionGroups.map((group) => (
          <div key={group.title} className="nav-group">
            <h5 className="nav-group-title">{group.title}</h5>
            {group.actions.map((action) => (
              <NavLink
                key={action.path}
                to={action.path}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                end={action.path === '/dashboard'} // Ensure only dashboard is 'end'
              >
                {action.name}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="side-panel-footer">
        <div className="user-info">
          <p>Welcome, {user?.name}</p>
          <span className="user-role">({user?.role})</span>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Log Out
        </button>
      </div>
    </div>
  );
}

export default SidePanel;