import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MostWanted() {
  const [criminals, setCriminals] = useState([]);
  const [selectedCriminal, setSelectedCriminal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCriminals = async () => {
      try {
        const response = await axios.get('/api/most-wanted');
        setCriminals(response.data);
      } catch (error) {
        console.error('Error fetching most wanted criminals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCriminals();
  }, []);

  const handleCriminalClick = async (criminalId) => {
    try {
      const response = await axios.get(`/api/most-wanted/${criminalId}`);
      setSelectedCriminal(response.data);
    } catch (error) {
      console.error('Error fetching criminal details:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading most wanted criminals...</div>;
  }

  return (
    <div className="most-wanted">
      <h2>Most Wanted Criminals</h2>
      
      <div className="criminals-grid">
        {criminals.map(criminal => (
          <div 
            key={criminal.id} 
            className="criminal-card"
            onClick={() => handleCriminalClick(criminal.id)}
          >
            <div className="criminal-image">
              <img src={criminal.image_url || 'https://placehold.co/150x200/EFEFEF/AAAAAA?text=Photo+Not+Available'} alt={criminal.name} />
            </div>
            <div className="criminal-info">
              <h3>{criminal.name}</h3>
              <p className="crime">{criminal.crime}</p>
              <p className="reward">Reward: ₹{criminal.reward_amount.toLocaleString()}</p>
              <div className={`status ${criminal.status.toLowerCase()}`}>
                {criminal.status}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedCriminal && (
        <div className="criminal-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{selectedCriminal.name}</h2>
              <button className="close-btn" onClick={() => setSelectedCriminal(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="criminal-details">
                <div className="detail-image">
                  <img src={selectedCriminal.image_url || 'https://placehold.co/300x400/EFEFEF/AAAAAA?text=Photo+Not+Available'} alt={selectedCriminal.name} />
                </div>
                
                <div className="detail-info">
                  <div className="detail-item">
                    <h4>Crime</h4>
                    <p>{selectedCriminal.crime}</p>
                  </div>
                  
                  <div className="detail-item">
                    <h4>Description</h4>
                    <p>{selectedCriminal.description}</p>
                  </div>
                  
                  <div className="detail-item">
                    <h4>Last Seen</h4>
                    <p>{selectedCriminal.last_seen}</p>
                  </div>
                  
                  <div className="detail-item">
                    <h4>Reward</h4>
                    <p className="reward-amount">₹{selectedCriminal.reward_amount.toLocaleString()}</p>
                  </div>
                  
                  <div className="detail-item">
                    <h4>Status</h4>
                    <div className={`status ${selectedCriminal.status.toLowerCase()}`}>
                      {selectedCriminal.status}
                    </div>
                  </div>
                  
                  <div className="detail-actions">
                    <button className="action-btn">
                      Report Sighting
                    </button>
                    <button className="action-btn secondary">
                      Share Information
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MostWanted;