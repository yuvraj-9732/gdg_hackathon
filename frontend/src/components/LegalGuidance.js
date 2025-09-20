import React, { useState } from 'react';
import axios from 'axios';

function LegalGuidance() {
  const [complaintType, setComplaintType] = useState('');
  const [guidance, setGuidance] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!complaintType) {
      alert('Please select a complaint type');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/legal-guidance', { type: complaintType });
      setGuidance(response.data);
    } catch (error) {
      console.error('Error fetching legal guidance:', error);
      alert('Error fetching legal guidance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="legal-guidance">
      <h2>Legal Guidance System</h2>
      
      <form onSubmit={handleSubmit} className="guidance-form">
        <div className="form-group">
          <label>Select Complaint Type:</label>
          <select 
            value={complaintType} 
            onChange={(e) => setComplaintType(e.target.value)}
            required
          >
            <option value="">-- Select --</option>
            <option value="bribery">Bribery</option>
            <option value="harassment">Harassment</option>
            <option value="delay">Service Delay</option>
            <option value="nepotism">Nepotism</option>
            <option value="embezzlement">Embezzlement</option>
          </select>
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Get Legal Guidance'}
        </button>
      </form>
      
      {guidance && (
        <div className="guidance-result">
          <h3>Legal Guidance for {complaintType.charAt(0).toUpperCase() + complaintType.slice(1)}</h3>
          
          <div className="guidance-section">
            <h4>Relevant Legal Sections</h4>
            <ul>
              {guidance.sections.map((section, index) => (
                <li key={index}>{section}</li>
              ))}
            </ul>
          </div>
          
          <div className="guidance-section">
            <h4>Recommended Steps</h4>
            <ol>
              {guidance.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
          
          <div className="guidance-section">
            <h4>Expected Timeframe</h4>
            <p>{guidance.timeframe}</p>
          </div>
          
          <div className="guidance-note">
            <p><strong>Note:</strong> This is automated legal guidance. For complex cases, please consult with a legal professional.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default LegalGuidance;