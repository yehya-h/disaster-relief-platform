import React, { useState, useEffect } from 'react';
import { incidentsAPI } from '../utils/api';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin, 
  AlertCircle, 
  FileText,
  ChevronDown,
  RefreshCw,
  Info
} from 'lucide-react';

const Incidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [formsByIncident, setFormsByIncident] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentChunk, setCurrentChunk] = useState(1);
  const [totalChunks, setTotalChunks] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async (chunk = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);
      
      setError('');

      // Using the provided API structure
      const response = await incidentsAPI.getIncidents(chunk);
      const { incidents: newIncidents, formsByIncident: newFormsByIncident, totalchunks } = response.data;

      if (append) {
        setIncidents(prev => [...prev, ...newIncidents]);
        setFormsByIncident(prev => ({ ...prev, ...newFormsByIncident }));
      } else {
        setIncidents(newIncidents);
        setFormsByIncident(newFormsByIncident);
      }

      setTotalChunks(totalchunks);
      setCurrentChunk(chunk);
    } catch (error) {
      console.error('Error loading incidents:', error);
      setError('Failed to load incidents. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreIncidents = () => {
    if (currentChunk < totalChunks && !loadingMore) {
      loadIncidents(currentChunk + 1, true);
    }
  };

  const toggleIncidentFakeStatus = async (incidentId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await incidentsAPI.updateIncidentStatus(incidentId, newStatus);
      
      // Update local state
      setIncidents(prev => 
        prev.map(incident => 
          incident._id === incidentId 
            ? { ...incident, isFake: newStatus }
            : incident
        )
      );
    } catch (error) {
      console.error('Error updating incident status:', error);
      alert('Failed to update incident status. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'severity-high';
      case 'medium':
        return 'severity-medium';
      case 'low':
        return 'severity-low';
      default:
        return 'severity-low';
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p style={{ marginTop: 'var(--spacing-4)', color: 'var(--color-gray-600)' }}>
          Loading incidents...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: 'var(--spacing-8)',
        color: 'var(--color-error)'
      }}>
        <AlertTriangle size={48} />
        <h2 style={{ marginTop: 'var(--spacing-4)' }}>Error</h2>
        <p>{error}</p>
        <button 
          onClick={() => loadIncidents(1, false)}
          className="btn btn-primary"
          style={{ marginTop: 'var(--spacing-4)' }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {incidents.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: 'var(--spacing-8)',
          color: 'var(--color-gray-600)'
        }}>
          <Info size={48} />
          <h2 style={{ marginTop: 'var(--spacing-4)' }}>No Incidents Found</h2>
          <p>There are no incidents to display at this time.</p>
        </div>
      ) : (
        <>
          <div className="incidents-grid">
            {incidents.map((incident) => {
              const incidentForms = formsByIncident[incident._id] || [];
              const activeForm = incidentForms.find(form => form.active);
              const allImages = incidentForms.map(form => form.imageUrl).filter(Boolean);

              return (
                <div key={incident._id} className="incident-card">
                  <div className="incident-header">
                    <div>
                      <h3 style={{ 
                        fontSize: 'var(--font-size-lg)',
                        fontWeight: 'var(--font-weight-semibold)',
                        marginBottom: 'var(--spacing-2)'
                      }}>
                        Incident #{incident._id.slice(-6)}
                      </h3>
                      <span className={`incident-status ${incident.isFake ? 'fake' : 'verified'}`}>
                        {incident.isFake ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                        {incident.isFake ? 'Marked as Fake' : 'Verified'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                      <span style={{ 
                        fontSize: 'var(--font-size-sm)', 
                        color: 'var(--color-gray-600)' 
                      }}>
                        Mark as Fake:
                      </span>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={incident.isFake}
                          onChange={() => toggleIncidentFakeStatus(incident._id, incident.isFake)}
                        />
                        <span className="switch-slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="incident-body">
                    {activeForm && (
                      <>
                        <div className="incident-description">
                          {activeForm.description}
                        </div>

                        <div className="incident-meta">
                          <div className="meta-item">
                            <Clock size={16} color="var(--color-gray-500)" />
                            <span className="meta-label">Reported:</span>
                            <span className="meta-value">{formatDate(activeForm.timestamp)}</span>
                          </div>
                          <div className="meta-item">
                            <MapPin size={16} color="var(--color-gray-500)" />
                            <span className="meta-label">Location:</span>
                            <span className="meta-value">
                              {activeForm.location?.coordinates ? 
                                `${activeForm.location.coordinates[1].toFixed(4)}, ${activeForm.location.coordinates[0].toFixed(4)}` : 
                                'Unknown'
                              }
                            </span>
                          </div>
                          <div className="meta-item">
                            <AlertCircle size={16} color="var(--color-gray-500)" />
                            <span className="meta-label">Severity:</span>
                            <span className={`severity-badge ${getSeverityColor(activeForm.severity)}`}>
                              {activeForm.severity}
                            </span>
                          </div>
                          <div className="meta-item">
                            <FileText size={16} color="var(--color-gray-500)" />
                            <span className="meta-label">Forms:</span>
                            <span className="meta-value">{incidentForms.length} reports</span>
                          </div>
                        </div>
                      </>
                    )}

                    {allImages.length > 0 && (
                      <div>
                        <h4 style={{ 
                          fontSize: 'var(--font-size-base)',
                          fontWeight: 'var(--font-weight-medium)',
                          marginBottom: 'var(--spacing-3)',
                          color: 'var(--color-gray-700)'
                        }}>
                          Images ({allImages.length})
                        </h4>
                        <div className="incident-images">
                          {allImages.slice(0, 6).map((imageUrl, index) => (
                            <div key={index} className="incident-image">
                              <img 
                                src={imageUrl} 
                                alt={`Incident image ${index + 1}`}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          ))}
                          {allImages.length > 6 && (
                            <div className="incident-image" style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'var(--color-gray-200)',
                              color: 'var(--color-gray-600)',
                              fontSize: 'var(--font-size-sm)',
                              fontWeight: 'var(--font-weight-medium)'
                            }}>
                              +{allImages.length - 6} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="incident-actions">
                    <span style={{ 
                      fontSize: 'var(--font-size-sm)', 
                      color: 'var(--color-gray-600)' 
                    }}>
                      Created: {formatDate(incident.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {currentChunk < totalChunks && (
            <div style={{ textAlign: 'center', marginTop: 'var(--spacing-8)' }}>
              <button
                onClick={loadMoreIncidents}
                disabled={loadingMore}
                className="btn btn-primary btn-lg"
              >
                {loadingMore ? (
                  <>
                    <div className="spinner" style={{ 
                      width: '20px', 
                      height: '20px',
                      borderWidth: '2px'
                    }}></div>
                    Loading More...
                  </>
                ) : (
                  <>
                    <ChevronDown size={20} />
                    Load More ({currentChunk}/{totalChunks})
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Incidents;