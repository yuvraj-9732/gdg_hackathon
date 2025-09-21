import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ComplaintCard from './ComplaintCard';
import StatCard from './StatCard';

// Icons for the police dashboard
const AssignedIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const PendingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

function PoliceDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [comments, setComments] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentEvidence, setCommentEvidence] = useState(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [resolution, setResolution] = useState('');
  const [resolutionEvidence, setResolutionEvidence] = useState(null);
  const [officerTags, setOfficerTags] = useState([]);
  const [showSystemicAnalysis, setShowSystemicAnalysis] = useState(false);
  const [systemicAnalysisResult, setSystemicAnalysisResult] = useState('');
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/police/complaints');
        setComplaints(response.data);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);
  
  const fetchComments = async (complaintId) => {
    try {
      const response = await axios.get(`/api/complaints/${complaintId}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchEvidence = async (complaintId) => {
    try {
      const response = await axios.get(`/api/complaints/${complaintId}/evidence`);
      setEvidence(response.data);
    } catch (error) {
      console.error('Error fetching evidence:', error);
    }
  };

  const fetchOfficerTags = async (officerId) => {
    if (!officerId) {
      setOfficerTags([]);
      return;
    }
    try {
      const response = await axios.get(`/api/users/${officerId}/tags`);
      setOfficerTags(response.data);
    } catch (error) {
      console.error('Error fetching officer tags:', error);
    }
  };

  const handleSelectComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    fetchComments(complaint.id);
    fetchEvidence(complaint.id);
    fetchOfficerTags(complaint.assigned_official_id);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const formData = new FormData();
      formData.append('user_id', user.id);
      formData.append('comment', newComment);
      if (commentEvidence) {
        for (let i = 0; i < commentEvidence.length; i++) {
          formData.append('evidence', commentEvidence[i]);
        }
      }

      await axios.post(`/api/police/complaints/${selectedComplaint.id}/comment`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Refresh comments and update complaint status locally
      fetchComments(selectedComplaint.id);
      fetchEvidence(selectedComplaint.id); // Refresh evidence list
      setNewComment('');
      setCommentEvidence(null);
      // Manually reset file input if you have a ref to it, or reset the form it's in
      const wasUnassigned = !selectedComplaint.assigned_official_id;
      const updatedComplaints = complaints.map(c => 
        c.id === selectedComplaint.id ? { ...c, status: 'In Progress', assigned_official_id: c.assigned_official_id || user.id } : c
      );
      setComplaints(updatedComplaints);
      setSelectedComplaint(prev => ({ ...prev, status: 'In Progress', assigned_official_id: prev.assigned_official_id || user.id }));
      
      // If the complaint was just assigned, we need to fetch the tags for the newly assigned officer.
      if (wasUnassigned) {
        fetchOfficerTags(user.id);
      }
    } catch (error) {
      console.error('Error adding comment/evidence:', error);
    }
  };

  const handleCloseComplaint = async () => {
    if (!resolution.trim()) return;

    try {
      const formData = new FormData();
      formData.append('user_id', user.id);
      formData.append('resolution', resolution);
      if (resolutionEvidence) {
        for (let i = 0; i < resolutionEvidence.length; i++) {
          formData.append('evidence', resolutionEvidence[i]);
        }
      }

      await axios.post(`/api/police/complaints/${selectedComplaint.id}/close`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Refresh UI
      setShowCloseModal(false);
      setResolution('');
      setResolutionEvidence(null);
      const updatedComplaints = complaints.map(c => 
        c.id === selectedComplaint.id ? { ...c, status: 'Resolved' } : c
      );
      setComplaints(updatedComplaints);
      setSelectedComplaint(prev => ({ ...prev, status: 'Resolved' }));
      fetchComments(selectedComplaint.id);
      fetchEvidence(selectedComplaint.id); // Refresh evidence list
    } catch (error) {
      console.error('Error closing complaint with evidence:', error);
    }
  };

  const handleSystemicAnalysis = async () => {
    setShowSystemicAnalysis(true);
    setIsAnalysisLoading(true);
    setSystemicAnalysisResult('');
    try {
      const response = await axios.get('/api/systemic-flaw-analysis');
      setSystemicAnalysisResult(response.data.analysis);
    } catch (error) {
      console.error('Error fetching systemic flaw analysis:', error);
      setSystemicAnalysisResult('Failed to load analysis. Please try again.');
    } finally {
      setIsAnalysisLoading(false);
    }
  };
  const pendingComplaints = complaints.filter(c => c.status !== 'Resolved').length;

  if (selectedComplaint) {
    return (
      <div className="complaint-detail-view">
        <button onClick={() => setSelectedComplaint(null)}>&larr; Back to Dashboard</button>
        <h2>Complaint Details (ID: {selectedComplaint.id})</h2>
        <p><strong>Type:</strong> {selectedComplaint.type}</p>
        <p><strong>Description:</strong> {selectedComplaint.description}</p>
        <p><strong>Status:</strong> {selectedComplaint.status}</p>
        <p><strong>Submitted by:</strong> {selectedComplaint.user_name}</p>
        <p><strong>Date:</strong> {new Date(selectedComplaint.created_at).toLocaleString()}</p>

        {officerTags.length > 0 && (
          <div className="officer-tags-section">
            <h4>Internal Flags for Assigned Officer:</h4>
            <ul>
              {officerTags.map(tag => (
                <li key={tag.tag_type} className="tag-red">
                  {tag.tag_type.replace('_', ' ')} ({tag.count})
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="evidence-section">
          <h3>Attached Evidence</h3>
          {evidence.length > 0 ? (
            <ul>
              {evidence.map(file => (
                <li key={file.id}>
                  <a href={`http://localhost:5000/uploads/${file.file_path}`} target="_blank" rel="noopener noreferrer">
                    {file.file_path}
                  </a>
                </li>
              ))}
            </ul>
          ) : <p>No evidence has been attached to this complaint yet.</p>}
        </div>
        
        <div className="comments-section">
          <h3>Case Notes & Progress</h3>
          {comments.map(comment => (
            <div key={comment.id} className="comment">
              <p><strong>{comment.name} ({comment.role}):</strong> {comment.comment}</p>
              <small>{new Date(comment.timestamp).toLocaleString()}</small>
            </div>
          ))}
          <div className="add-comment">
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a progress note..."
            />
            <div className="form-group">
              <label>Attach Evidence:</label>
              <input 
                type="file"
                multiple
                onChange={(e) => setCommentEvidence(e.target.files)}
                accept="application/pdf,video/mp4,audio/mpeg,image/*,.doc,.docx,.xls,.xlsx"
              />
            </div>
            <button onClick={handleAddComment}>Add Note</button>
          </div>
        </div>

        {selectedComplaint.status !== 'Resolved' && (
          <button onClick={() => setShowCloseModal(true)} className="close-case-btn">Close Case</button>
        )}

        {showCloseModal && (
          <div className="modal">
            <div className="modal-content">
              <h3>Close Complaint #{selectedComplaint.id}</h3>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Enter concluding statement..."
              />
              <div className="form-group">
                <label>Attach Final Evidence/Documents:</label>
                <input 
                  type="file"
                  multiple
                  onChange={(e) => setResolutionEvidence(e.target.files)}
                  accept="application/pdf,video/mp4,audio/mpeg,image/*,.doc,.docx,.xls,.xlsx"
                />
              </div>
              <button onClick={handleCloseComplaint}>Confirm Close Case</button>
              <button onClick={() => setShowCloseModal(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="police-dashboard">
      <div className="dashboard-header-personal">
        <h2>Officer Dashboard</h2>
        <p>Welcome, {user.name}. Here is your current workload.</p>
      </div>
      <div className="dashboard-stats">
        <StatCard 
          icon={<AssignedIcon />}
          title="Total Assigned Complaints"
          value={complaints.length} />
        <StatCard 
          icon={<PendingIcon />}
          title="Pending Resolution"
          value={pendingComplaints} />
      </div>
      <div className="dashboard-actions">
        <button onClick={handleSystemicAnalysis}>
          Run Systemic Flaw Analysis (AI)
        </button>
      </div>

      {showSystemicAnalysis && (
        <div className="modal">
          <div className="modal-content">
            <h3>AI-Powered Systemic Flaw Analysis</h3>
            {isAnalysisLoading ? <p>AI is analyzing all complaints... this may take a moment.</p> : (
              <pre className="analysis-result">{systemicAnalysisResult}</pre>
            )}
            <button onClick={() => setShowSystemicAnalysis(false)}>Close</button>
          </div>
        </div>
      )}
      <h3>Assigned Complaints</h3>
      
      {loading ? (
        <p>Loading complaints...</p>
      ) : complaints.length === 0 ? (
        <p>No complaints assigned.</p>
      ) : (
        <div className="complaints-list">
          {complaints.map(complaint => (
            <div key={complaint.id} onClick={() => handleSelectComplaint(complaint)}>
              <ComplaintCard complaint={complaint} userType="police" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PoliceDashboard;