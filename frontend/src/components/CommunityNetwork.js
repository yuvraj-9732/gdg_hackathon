import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CommunityNetwork() {
  const [reports, setReports] = useState([]);
  const [newReport, setNewReport] = useState({
    location: '',
    issue: '',
    severity: 'medium',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get('/api/community-reports');
        setReports(response.data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    fetchReports();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newReport.location || !newReport.issue || !newReport.description) {
      alert('Please fill all fields');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post('/api/community-reports', newReport);
      setNewReport({
        location: '',
        issue: '',
        severity: 'medium',
        description: ''
      });
      
      // Refresh reports
      const response = await axios.get('/api/community-reports');
      setReports(response.data);
      
      alert('Report submitted successfully!');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error submitting report');
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return '#f44336';
      case 'medium':
        return '#ff9800';
      default:
        return '#4caf50';
    }
  };

  return (
    <div className="community-network">
      <h2>Community Reporting Network</h2>
      
      <div className="report-form">
        <h3>Report Community Issue</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={newReport.location}
              onChange={(e) => setNewReport({...newReport, location: e.target.value})}
              placeholder="Enter location"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Issue Type</label>
            <input
              type="text"
              value={newReport.issue}
              onChange={(e) => setNewReport({...newReport, issue: e.target.value})}
              placeholder="e.g., Bribery, Harassment, Service Delay"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Severity</label>
            <select
              value={newReport.severity}
              onChange={(e) => setNewReport({...newReport, severity: e.target.value})}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={newReport.description}
              onChange={(e) => setNewReport({...newReport, description: e.target.value})}
              placeholder="Describe the issue in detail..."
              rows={4}
              required
            />
          </div>
          
          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
      
      <div className="reports-map">
        <h3>Recent Community Reports</h3>
        
        {reports.length === 0 ? (
          <p className="no-reports">No reports found. Be the first to report!</p>
        ) : (
          <div className="reports-list">
            {reports.map(report => (
              <div key={report.id} className="report-item">
                <div className="report-header">
                  <div className="report-location">{report.location}</div>
                  <div 
                    className="report-severity" 
                    style={{ backgroundColor: getSeverityColor(report.severity) }}
                  >
                    {report.severity}
                  </div>
                </div>
                
                <div className="report-content">
                  <h4>{report.issue}</h4>
                  <p>{report.description}</p>
                  <div className="report-meta">
                    <span className="report-status">{report.status}</span>
                    <span className="report-date">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CommunityNetwork;