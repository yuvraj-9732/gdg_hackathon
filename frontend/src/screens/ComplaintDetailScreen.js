import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function ComplaintDetailScreen() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [resolution, setResolution] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/complaints/${id}`);
        setComplaint(response.data);
      } catch (error) {
        console.error('Error fetching complaint:', error);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/complaints/${id}/comments`);
        setComments(response.data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
    fetchComments();
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/police/complaints/${id}/comment`, {
        user_id: user.id,
        comment: newComment
      });
      
      // Refresh comments
      const response = await axios.get(`http://localhost:5000/api/complaints/${id}/comments`);
      setComments(response.data);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleCloseComplaint = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/police/complaints/${id}/close`, {
        user_id: user.id,
        resolution: resolution
      });
      
      // Refresh complaint
      const response = await axios.get(`http://localhost:5000/api/complaints/${id}`);
      setComplaint(response.data);
      
      // Refresh comments
      const commentsResponse = await axios.get(`http://localhost:5000/api/complaints/${id}/comments`);
      setComments(commentsResponse.data);
      
      setResolution('');
    } catch (error) {
      console.error('Error closing complaint:', error);
    }
  };

  if (loading) {
    return <div>Loading complaint details...</div>;
  }

  return (
    <div className="complaint-detail">
      <button onClick={() => navigate('/dashboard')} className="back-btn">Back to Dashboard</button>
      
      <div className="complaint-header">
        <h2>Complaint Details</h2>
        <div className={`status-badge ${complaint.status.toLowerCase()}`}>
          {complaint.status}
        </div>
      </div>
      
      <div className="complaint-info">
        <h3>{complaint.type}</h3>
        <p>{complaint.description}</p>
        <div className="complaint-meta">
          <span>Filed by: {complaint.user_name}</span>
          <span>Created: {new Date(complaint.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="comments-section">
        <h3>Investigation Notes</h3>
        
        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment.id} className="comment">
              <div className="comment-header">
                <span className="comment-author">{comment.name} ({comment.role})</span>
                <span className="comment-time">{new Date(comment.timestamp).toLocaleString()}</span>
              </div>
              <p className="comment-text">{comment.comment}</p>
            </div>
          ))}
        </div>
        
        {complaint.status !== 'Resolved' && (
          <>
            <form onSubmit={handleAddComment} className="comment-form">
              <h4>Add Investigation Note</h4>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
              />
              <button type="submit">Add Note</button>
            </form>
            
            <form onSubmit={handleCloseComplaint} className="resolution-form">
              <h4>Resolve Complaint</h4>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Enter resolution details..."
                required
              />
              <button type="submit">Close Complaint</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ComplaintDetailScreen;