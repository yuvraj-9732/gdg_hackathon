import React, { useState, useEffect } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function AnalyticsDashboard() {
  const [complaintsByType, setComplaintsByType] = useState({ labels: [], datasets: [] });
  const [trendData, setTrendData] = useState({ labels: [], datasets: [] });
  const [resolutionTime, setResolutionTime] = useState({ labels: [], datasets: [] });
  const [riskAnalysis, setRiskAnalysis] = useState([]);
  const [anomalies, setAnomalies] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch complaints by type
      const typeResponse = await axios.get('/api/complaints-by-type');
      setComplaintsByType({
        labels: typeResponse.data.labels,
        datasets: [
          {
            label: 'Number of Complaints',
            data: typeResponse.data.data,
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            borderColor: 'rgb(53, 162, 235)',
            borderWidth: 1,
          },
        ],
      });

      // Fetch trend data
      const trendResponse = await axios.get('/api/trend-data');
      setTrendData({
        labels: trendResponse.data.labels,
        datasets: [
          {
            label: 'Complaints Over Time',
            data: trendResponse.data.data,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            tension: 0.3,
          },
        ],
      });

      // Fetch resolution time
      const timeResponse = await axios.get('/api/resolution-time');
      setResolutionTime({
        labels: timeResponse.data.labels,
        datasets: [
          {
            label: 'Average Resolution Time (days)',
            data: timeResponse.data.data,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 1,
          },
        ],
      });

      // Fetch risk analysis
      const riskResponse = await axios.get('/api/risk-analysis');
      setRiskAnalysis(riskResponse.data);

      // Fetch anomalies
      const anomaliesResponse = await axios.get('/api/anomalies');
      setAnomalies(anomaliesResponse.data);
    };

    fetchData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Corruption Analytics Dashboard',
      },
    },
  };

  return (
    <div className="analytics-dashboard">
      <h2>Corruption Analytics Dashboard</h2>
      
      <div className="charts-grid">
        <div className="chart-container">
          <h3>Complaints by Type</h3>
          <Bar data={complaintsByType} options={options} />
        </div>
        
        <div className="chart-container">
          <h3>Trend Over Time</h3>
          <Line data={trendData} options={options} />
        </div>
        
        <div className="chart-container">
          <h3>Resolution Time by Type</h3>
          <Bar data={resolutionTime} options={options} />
        </div>
      </div>

      <div className="risk-analysis">
        <h3>Risk Analysis</h3>
        <div className="risk-cards">
          {riskAnalysis.map((risk, index) => (
            <div key={index} className="risk-card">
              <h4>{risk.type}</h4>
              <div className="risk-stats">
                <p>Total: {risk.total}</p>
                <p>Resolved: {risk.resolved}</p>
                <p>Risk Score: {risk.risk_score}%</p>
              </div>
              <div className="risk-bar">
                <div 
                  className="risk-fill" 
                  style={{ width: `${risk.risk_score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="anomalies">
        <h3>Anomaly Detection</h3>
        {anomalies.length === 0 ? (
          <p>No anomalies detected in the last 30 days.</p>
        ) : (
          <div className="anomaly-list">
            {anomalies.map((anomaly, index) => (
              <div key={index} className={`anomaly-item ${anomaly.severity.toLowerCase()}`}>
                <div className="anomaly-date">{anomaly.date}</div>
                <div className="anomaly-count">{anomaly.count} complaints</div>
                <div className="anomaly-severity">{anomaly.severity}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsDashboard;