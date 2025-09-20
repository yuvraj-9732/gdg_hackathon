import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

function CorruptionMap() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [center] = useState([20.5937, 78.9629]);
  const [zoom] = useState(5);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get('/api/complaints-with-location');
        setComplaints(response.data);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return 'green';
      case 'in progress':
        return 'orange';
      default:
        return 'red';
    }
  };

  if (loading) {
    return <div className="loading">Loading map...</div>;
  }

  return (
    <div className="corruption-map">
      <h2>Corruption Hotspots Map</h2>
      <MapContainer center={center} zoom={zoom} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {complaints.map(complaint => (
          complaint.latitude && complaint.longitude && (
            <Marker
              key={complaint.id}
              position={[complaint.latitude, complaint.longitude]}
            >
              <Popup>
                <div className="popup-content">
                  <h4>{complaint.type}</h4>
                  <p>{complaint.description}</p>
                  <p><strong>Status:</strong> {complaint.status}</p>
                  <p><strong>Date:</strong> {new Date(complaint.created_at).toLocaleDateString()}</p>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
      
      <div className="map-legend">
        <h3>Legend</h3>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color red"></div>
            <span>Submitted</span>
          </div>
          <div className="legend-item">
            <div className="legend-color orange"></div>
            <span>In Progress</span>
          </div>
          <div className="legend-item">
            <div className="legend-color green"></div>
            <span>Resolved</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CorruptionMap;