import React, { useState } from 'react';
import axios from 'axios';

function RewardSystem() {
  const [reward, setReward] = useState({
    complaint_id: '',
    amount: ''
  });
  const [submissionStatus, setSubmissionStatus] = useState(null);

  const handleChange = (e) => {
    setReward({ ...reward, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/rewards', reward);
      setSubmissionStatus({ success: true, id: response.data.id });
    } catch (error) {
      setSubmissionStatus({ success: false, error: error.message });
    }
  };

  return (
    <div className="reward-system">
      <h2>Whistleblower Reward System</h2>
      
      {submissionStatus && submissionStatus.success && (
        <div className="success-message">
          Reward request submitted successfully! ID: {submissionStatus.id}
        </div>
      )}
      
      {submissionStatus && !submissionStatus.success && (
        <div className="error-message">
          Error: {submissionStatus.error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Complaint ID:</label>
          <input 
            type="number" 
            name="complaint_id" 
            value={reward.complaint_id} 
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Reward Amount (₹):</label>
          <input 
            type="number" 
            name="amount" 
            value={reward.amount} 
            onChange={handleChange}
            required
          />
        </div>
        
        <button type="submit">Submit Reward Request</button>
      </form>
      
      <div className="reward-info">
        <h3>How It Works</h3>
        <p>1. Submit a corruption complaint through our system</p>
        <p>2. If your complaint leads to a conviction, you're eligible for a reward</p>
        <p>3. Rewards range from ₹5,000 to ₹5,00,000 based on the severity of the case</p>
        <p>4. All rewards are distributed through secure digital payments</p>
      </div>
    </div>
  );
}

export default RewardSystem;