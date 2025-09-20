import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AccountabilityPortal() {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [performance, setPerformance] = useState({});
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('/api/departments');
        setDepartments(response.data);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDept) {
      const fetchPerformance = async () => {
        setLoading(true);
        try {
          const response = await axios.get(`/api/department-performance/${selectedDept}`);
          setPerformance(response.data);
        } catch (error) {
          console.error('Error fetching performance:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchPerformance();
    }
  }, [selectedDept]);

  useEffect(() => {
    const fetchOfficials = async () => {
      try {
        const response = await axios.get('/api/official-performance');
        setOfficials(response.data);
      } catch (error) {
        console.error('Error fetching officials:', error);
      }
    };

    fetchOfficials();
  }, []);

  return (
    <div className="accountability-portal">
      <h2>Government Accountability Portal</h2>
      
      <div className="department-selector">
        <h3>Select Department</h3>
        <div className="department-grid">
          {departments.map(dept => (
            <div 
              key={dept}
              className={`department-card ${selectedDept === dept ? 'selected' : ''}`}
              onClick={() => setSelectedDept(dept)}
            >
              {dept}
            </div>
          ))}
        </div>
      </div>
      
      {selectedDept && (
        <div className="performance-metrics">
          <h3>Performance Metrics - {selectedDept}</h3>
          
          {loading ? (
            <div className="loading">Loading performance data...</div>
          ) : (
            <div className="metrics-grid">
              <div className="metric-card">
                <h4>Total Complaints</h4>
                <div className="metric-value">{performance.total_complaints || 0}</div>
              </div>
              
              <div className="metric-card">
                <h4>Resolution Rate</h4>
                <div className="metric-value">{performance.resolution_rate || 0}%</div>
                <div className="metric-bar">
                  <div 
                    className="metric-fill" 
                    style={{ width: `${performance.resolution_rate || 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="metric-card">
                <h4>Avg. Resolution Time</h4>
                <div className="metric-value">{performance.avg_resolution_time || 0} days</div>
              </div>
              
              <div className="metric-card">
                <h4>Citizen Satisfaction</h4>
                <div className="metric-value">{performance.satisfaction || 0}/5</div>
                <div className="rating-stars">
                  {'★'.repeat(Math.floor(performance.satisfaction || 0))}
                  {'☆'.repeat(5 - Math.floor(performance.satisfaction || 0))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="officials-performance">
        <h3>Officials Performance</h3>
        
        <div className="officials-table">
          <div className="table-header">
            <div className="table-cell">Name</div>
            <div className="table-cell">Department</div>
            <div className="table-cell">Position</div>
            <div className="table-cell">Complaints</div>
            <div className="table-cell">Resolved</div>
            <div className="table-cell">Resolution Rate</div>
            <div className="table-cell">Performance Score</div>
          </div>
          
          {officials.map((official, index) => (
            <div key={index} className="table-row">
              <div className="table-cell">{official.name}</div>
              <div className="table-cell">{official.department}</div>
              <div className="table-cell">{official.position}</div>
              <div className="table-cell">{official.assigned_complaints}</div>
              <div className="table-cell">{official.resolved}</div>
              <div className="table-cell">{official.resolution_rate}%</div>
              <div className="table-cell">
                <div className={`performance-score ${official.performance_score > 80 ? 'good' : official.performance_score > 60 ? 'average' : 'poor'}`}>
                  {official.performance_score}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AccountabilityPortal;