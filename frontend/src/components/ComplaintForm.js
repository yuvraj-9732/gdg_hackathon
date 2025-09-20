// src/components/ComplaintForm.js
import React, { useState, useContext } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function ComplaintForm() {
  const [complaint, setComplaint] = useState({
    type: '',
    description: ''
  });
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [firDraft, setFirDraft] = useState('');
  const { user } = useAuth();

  const handleChange = (e) => {
    setComplaint({ ...complaint, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!user) {
      setSubmissionStatus({ 
        success: false, 
        error: 'You must be logged in to submit a complaint' 
      });
      return;
    }

    try {
      console.log('Submitting complaint:', { ...complaint, user_id: user.id });
      
      const response = await axios.post('/api/complaints', {
        ...complaint,
        user_id: user.id
      });
      
      console.log('Response:', response.data);
      
      setSubmissionStatus({ success: true, id: response.data.id });
      setAnalysis(response.data.analysis);
      setFirDraft(response.data.fir_draft);
      
      // Reset form
      setComplaint({ type: '', description: '' });
    } catch (error) {
      console.error('Error submitting complaint:', error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setSubmissionStatus({ 
          success: false, 
          error: `Server error: ${error.response.data.error || error.response.statusText}` 
        });
      } else if (error.request) {
        // The request was made but no response was received
        setSubmissionStatus({ 
          success: false, 
          error: 'Network error: Unable to connect to the server. Please check if the backend is running.' 
        });
      } else {
        // Something happened in setting up the request that triggered an Error
        setSubmissionStatus({ 
          success: false, 
          error: `Error: ${error.message}` 
        });
      }
    }
  };

  return (
    <div className="complaint-form">
      <h2>Submit Corruption Complaint</h2>
      
      {submissionStatus && submissionStatus.success && (
        <div className="success-message">
          Complaint submitted successfully! ID: {submissionStatus.id}
        </div>
      )}
      
      {submissionStatus && !submissionStatus.success && (
        <div className="error-message">
          Error: {submissionStatus.error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Complaint Type:</label>
          <select 
            name="type" 
            value={complaint.type} 
            onChange={handleChange}
            required
          >
            <option value="">Select</option>
            <option value="bribery">Bribery</option>
            <option value="harassment">Harassment</option>
            <option value="delay">Service Delay</option>
            <option value="nepotism">Nepotism</option>
            <option value="embezzlement">Embezzlement</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Description:</label>
          <textarea 
            name="description" 
            value={complaint.description} 
            onChange={handleChange}
            required
          />
        </div>
        
        <button type="submit">Submit Complaint</button>
      </form>
      
      {analysis && (
        <div className="analysis-result">
          <h3>AI Analysis</h3>
          <p>{analysis}</p>
        </div>
      )}
      
      {firDraft && (
        <div className="fir-draft">
          <h3>Auto-Generated FIR Draft</h3>
          <pre>{firDraft}</pre>
        </div>
      )}
    </div>
  );
}

export default ComplaintForm;