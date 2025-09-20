import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FeedbackSystem() {
  const [feedback, setFeedback] = useState({
    service: '',
    rating: 5,
    comments: '',
    anonymous: false
  });
  const [services, setServices] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('/api/services');
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchServices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.service) {
      alert('Please select a service');
      return;
    }

    try {
      await axios.post('/api/feedback', feedback);
      setSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setFeedback({
          service: '',
          rating: 5,
          comments: '',
          anonymous: false
        });
      }, 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback');
    }
  };

  return (
    <div className="feedback-system">
      <h2>Service Feedback System</h2>
      
      {submitted ? (
        <div className="success-message">
          Thank you for your feedback!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="form-group">
            <label>Select Service</label>
            <select
              value={feedback.service}
              onChange={(e) => setFeedback({...feedback, service: e.target.value})}
              required
            >
              <option value="">Choose a service</option>
              {services.map(service => (
                <option key={service.id} value={service.name}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Rating</label>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  className={`star ${star <= feedback.rating ? 'filled' : ''}`}
                  onClick={() => setFeedback({...feedback, rating: star})}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label>Comments</label>
            <textarea
              value={feedback.comments}
              onChange={(e) => setFeedback({...feedback, comments: e.target.value})}
              placeholder="Share your experience..."
              rows={4}
            />
          </div>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={feedback.anonymous}
                onChange={(e) => setFeedback({...feedback, anonymous: e.target.checked})}
              />
              Submit anonymously
            </label>
          </div>
          
          <button type="submit">Submit Feedback</button>
        </form>
      )}
    </div>
  );
}

export default FeedbackSystem;