import React, { useState, useEffect } from 'react';
import axios from 'axios';

function WhistleblowerProtection() {
  const [anonymityLevel, setAnonymityLevel] = useState('partial');
  const [complaintType, setComplaintType] = useState('bribery');
  const [protectionMeasures, setProtectionMeasures] = useState([]);
  const [riskLevel, setRiskLevel] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateProtection = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/protection-assessment', {
        anonymityLevel,
        complaintType
      });
      setProtectionMeasures(response.data.measures);
      setRiskLevel(response.data.risk_level);
    } catch (error) {
      console.error('Error calculating protection:', error);
      alert('Error calculating protection measures');
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial protection measures on component mount
  useEffect(() => {
    calculateProtection();
  }, []);

  return (
    <div className="whistleblower-protection">
      <h2>Whistleblower Protection System</h2>
      
      <div className="protection-form">
        <div className="form-group">
          <label>Anonymity Level:</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                value="full"
                checked={anonymityLevel === 'full'}
                onChange={() => setAnonymityLevel('full')}
              />
              Full Anonymity
            </label>
            <label>
              <input
                type="radio"
                value="partial"
                checked={anonymityLevel === 'partial'}
                onChange={() => setAnonymityLevel('partial')}
              />
              Partial Anonymity
            </label>
          </div>
        </div>
        
        <div className="form-group">
          <label>Complaint Type:</label>
          <select 
            value={complaintType} 
            onChange={(e) => setComplaintType(e.target.value)}
          >
            <option value="bribery">Bribery</option>
            <option value="harassment">Harassment</option>
            <option value="financial">Financial Fraud</option>
            <option value="procurement">Procurement Fraud</option>
          </select>
        </div>
        
        <button onClick={calculateProtection} disabled={loading}>
          {loading ? 'Calculating...' : 'Calculate Protection Measures'}
        </button>
      </div>
      
      {protectionMeasures.length > 0 && (
        <div className="protection-result">
          <h3>Recommended Protection Measures</h3>
          
          <div className={`risk-indicator ${riskLevel.toLowerCase()}`}>
            <h4>Risk Level: {riskLevel}</h4>
          </div>
          
          <div className="measures-list">
            {protectionMeasures.map((measure, index) => (
              <div key={index} className="measure-item">
                <span className="measure-icon">✓</span>
                <span>{measure}</span>
              </div>
            ))}
          </div>
          
          <div className="protection-info">
            <h4>How It Works:</h4>
            <p>Based on your selected anonymity level and complaint type, our system calculates the appropriate protection measures to ensure your safety throughout the reporting process.</p>
            
            <h4>Next Steps:</h4>
            <ol>
              <li>Follow the recommended protection measures</li>
              <li>Document all interactions related to your complaint</li>
              <li>Report any threats or intimidation immediately</li>
              <li>Keep your case number and contact information secure</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

export default WhistleblowerProtection;