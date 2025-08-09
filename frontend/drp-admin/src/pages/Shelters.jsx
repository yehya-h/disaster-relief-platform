import React, { useState, useEffect } from 'react';
import { sheltersAPI } from '../utils/api';
import { 
  Home, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Users, 
  Save,
  X,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

const Shelters = () => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingShelter, setEditingShelter] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    latitude: '',
    longitude: '',
    capacity: '',
    // filledCapacity: '' // Commented as requested - for future implementation
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadShelters();
  }, []);

  const loadShelters = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await sheltersAPI.getShelters();
      setShelters(response.data);
    } catch (error) {
      console.error('Error loading shelters:', error);
      setError('Failed to load shelters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      latitude: '',
      longitude: '',
      capacity: '',
      // filledCapacity: ''
    });
    setFormErrors({});
    setEditingShelter(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (shelter) => {
    setEditingShelter(shelter);
    setFormData({
      title: shelter.title,
      latitude: shelter.location?.coordinates?.[1] || '',
      longitude: shelter.location?.coordinates?.[0] || '',
      capacity: shelter.capacity.toString(),
      // filledCapacity: shelter.filledCapacity?.toString() || '0'
    });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (formData.latitude === "" || formData.latitude === null) {
      errors.latitude = 'Latitude is required';
    } else if (isNaN(formData.latitude) || Math.abs(formData.latitude) > 90) {
      errors.latitude = 'Latitude must be a number between -90 and 90';
    }
    
    if (formData.longitude === "" || formData.longitude === null) {
      errors.longitude = 'Longitude is required';
    } else if (isNaN(formData.longitude) || Math.abs(formData.longitude) > 180) {
      errors.longitude = 'Longitude must be a number between -180 and 180';
    }

    if (formData.capacity === "" || formData.capacity === null) {
      errors.capacity = 'Capacity is required';
    } else if (isNaN(formData.capacity) || parseInt(formData.capacity) <= 0) {
      errors.capacity = 'Capacity must be a positive number';
    }

    // Validate filled capacity when implemented
    // if (formData.filledCapacity && (isNaN(formData.filledCapacity) || parseInt(formData.filledCapacity) < 0)) {
    //   errors.filledCapacity = 'Filled capacity must be a non-negative number';
    // }
    // if (parseInt(formData.filledCapacity) > parseInt(formData.capacity)) {
    //   errors.filledCapacity = 'Filled capacity cannot exceed total capacity';
    // }
    
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    
    try {
      const shelterData = {
        title: formData.title.trim(),
        location: {
          type: 'Point',
          coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)]
        },
        capacity: parseInt(formData.capacity),
        // filledCapacity: parseInt(formData.filledCapacity) || 0
      };

      if (editingShelter) {
        await sheltersAPI.updateShelter(editingShelter._id, shelterData);
      } else {
        await sheltersAPI.createShelter(shelterData);
      }
      
      await loadShelters();
      closeModal();
    } catch (error) {
      console.error('Error saving shelter:', error);
      setFormErrors({ 
        submit: error.response?.data?.message || 'Failed to save shelter. Please try again.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (shelterId, shelterTitle) => {
    if (!confirm(`Are you sure you want to delete "${shelterTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await sheltersAPI.deleteShelter(shelterId);
      await loadShelters();
    } catch (error) {
      console.error('Error deleting shelter:', error);
      alert('Failed to delete shelter. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p style={{ marginTop: 'var(--spacing-4)', color: 'var(--color-gray-600)' }}>
          Loading shelters...
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
          onClick={loadShelters}
          className="btn btn-primary"
          style={{ marginTop: 'var(--spacing-4)' }}
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Add Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--spacing-6)'
      }}>
        <div>
          <h2 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-black-navy)',
            marginBottom: 'var(--spacing-2)'
          }}>
            Shelters Management
          </h2>
          <p style={{ color: 'var(--color-gray-600)' }}>
            Manage emergency shelters and their capacities
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn btn-primary"
        >
          <Plus size={20} />
          Add Shelter
        </button>
      </div>

      {/* Shelters Grid */}
      {shelters.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <div style={{ 
              textAlign: 'center', 
              padding: 'var(--spacing-8)',
              color: 'var(--color-gray-600)'
            }}>
              <Home size={48} />
              <h3 style={{ 
                marginTop: 'var(--spacing-4)',
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-gray-700)'
              }}>
                No Shelters Found
              </h3>
              <p style={{ 
                marginTop: 'var(--spacing-2)',
                fontSize: 'var(--font-size-base)'
              }}>
                Start by adding your first emergency shelter.
              </p>
              <button
                onClick={openCreateModal}
                className="btn btn-primary"
                style={{ marginTop: 'var(--spacing-4)' }}
              >
                <Plus size={16} />
                Add First Shelter
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: 'var(--spacing-6)',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))'
        }}>
          {shelters.map((shelter) => (
            <div key={shelter._id} className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <h3 className="card-title">{shelter.title}</h3>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 'var(--spacing-2)',
                      marginTop: 'var(--spacing-2)',
                      color: 'var(--color-gray-600)',
                      fontSize: 'var(--font-size-sm)'
                    }}>
                      <MapPin size={14} />
                      <span>
                        {shelter.location?.coordinates ? 
                          `${shelter.location.coordinates[1].toFixed(4)}, ${shelter.location.coordinates[0].toFixed(4)}` : 
                          'Unknown location'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-body">
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--spacing-4)',
                  marginBottom: 'var(--spacing-4)'
                }}>
                  <div style={{
                    padding: 'var(--spacing-3)',
                    backgroundColor: 'var(--color-gray-100)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 'var(--spacing-2)',
                      marginBottom: 'var(--spacing-1)'
                    }}>
                      <Users size={16} color="var(--color-gray-600)" />
                      <span style={{ 
                        fontSize: 'var(--font-size-sm)', 
                        color: 'var(--color-gray-600)' 
                      }}>
                        Total Capacity
                      </span>
                    </div>
                    <div style={{
                      fontSize: 'var(--font-size-xl)',
                      fontWeight: 'var(--font-weight-bold)',
                      color: 'var(--color-navy)'
                    }}>
                      {shelter.capacity}
                    </div>
                  </div>
                  
                  {/* Placeholder for filled capacity - commented for future implementation */}
                  {/* 
                  <div style={{
                    padding: 'var(--spacing-3)',
                    backgroundColor: 'var(--color-orange-light)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 'var(--spacing-2)',
                      marginBottom: 'var(--spacing-1)'
                    }}>
                      <Users size={16} color="var(--color-orange-dark)" />
                      <span style={{ 
                        fontSize: 'var(--font-size-sm)', 
                        color: 'var(--color-orange-dark)' 
                      }}>
                        Current Occupancy
                      </span>
                    </div>
                    <div style={{
                      fontSize: 'var(--font-size-xl)',
                      fontWeight: 'var(--font-weight-bold)',
                      color: 'var(--color-orange-dark)'
                    }}>
                      {shelter.filledCapacity || 0}
                    </div>
                  </div>
                  */}
                </div>
                
                {/* Occupancy progress bar - for future implementation */}
                {/*
                <div style={{ marginBottom: 'var(--spacing-4)' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--spacing-2)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-gray-600)'
                  }}>
                    <span>Occupancy</span>
                    <span>{Math.round(((shelter.filledCapacity || 0) / shelter.capacity) * 100)}%</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: 'var(--color-gray-200)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.min(((shelter.filledCapacity || 0) / shelter.capacity) * 100, 100)}%`,
                      height: '100%',
                      backgroundColor: ((shelter.filledCapacity || 0) / shelter.capacity) > 0.8 ? 'var(--color-error)' : 'var(--color-success)',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>
                */}
              </div>

              <div className="card-actions">
                <button
                  onClick={() => openEditModal(shelter)}
                  className="btn btn-outline btn-sm"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(shelter._id, shelter.title)}
                  className="btn btn-danger btn-sm"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 'var(--z-modal)',
          padding: 'var(--spacing-4)'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div className="card-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="card-title">
                  {editingShelter ? 'Edit Shelter' : 'Add New Shelter'}
                </h3>
                <button
                  onClick={closeModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 'var(--spacing-2)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-gray-600)'
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="card-body">
                {formErrors.submit && (
                  <div className="error-message" style={{ 
                    marginBottom: 'var(--spacing-4)',
                    padding: 'var(--spacing-3)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    {formErrors.submit}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="title" className="form-label">
                    Shelter Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`form-input ${formErrors.title ? 'error' : ''}`}
                    placeholder="Enter shelter name"
                    disabled={submitting}
                  />
                  {formErrors.title && (
                    <div className="error-message">{formErrors.title}</div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
                  <div className="form-group">
                    <label htmlFor="latitude" className="form-label">
                      Latitude *
                    </label>
                    <input
                      type="number"
                      step="any"
                      id="latitude"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      className={`form-input ${formErrors.latitude ? 'error' : ''}`}
                      placeholder="e.g., 33.8938"
                      disabled={submitting}
                    />
                    {formErrors.latitude && (
                      <div className="error-message">{formErrors.latitude}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="longitude" className="form-label">
                      Longitude *
                    </label>
                    <input
                      type="number"
                      step="any"
                      id="longitude"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      className={`form-input ${formErrors.longitude ? 'error' : ''}`}
                      placeholder="e.g., 35.5018"
                      disabled={submitting}
                    />
                    {formErrors.longitude && (
                      <div className="error-message">{formErrors.longitude}</div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="capacity" className="form-label">
                    Total Capacity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    className={`form-input ${formErrors.capacity ? 'error' : ''}`}
                    placeholder="Enter maximum capacity"
                    disabled={submitting}
                  />
                  {formErrors.capacity && (
                    <div className="error-message">{formErrors.capacity}</div>
                  )}
                </div>

                {/* Filled Capacity field - commented for future implementation */}
                {/*
                <div className="form-group">
                  <label htmlFor="filledCapacity" className="form-label">
                    Current Occupancy
                  </label>
                  <input
                    type="number"
                    min="0"
                    id="filledCapacity"
                    name="filledCapacity"
                    value={formData.filledCapacity}
                    onChange={handleInputChange}
                    className={`form-input ${formErrors.filledCapacity ? 'error' : ''}`}
                    placeholder="Enter current number of occupants"
                    disabled={submitting}
                  />
                  {formErrors.filledCapacity && (
                    <div className="error-message">{formErrors.filledCapacity}</div>
                  )}
                  <div style={{ 
                    fontSize: 'var(--font-size-sm)', 
                    color: 'var(--color-gray-600)',
                    marginTop: 'var(--spacing-1)'
                  }}>
                    Optional: Leave blank or enter 0 if unknown
                  </div>
                </div>
                */}
              </div>

              <div className="card-actions">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn btn-outline"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="spinner" style={{ 
                        width: '16px', 
                        height: '16px',
                        borderWidth: '2px'
                      }}></div>
                      {editingShelter ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {editingShelter ? 'Update Shelter' : 'Create Shelter'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shelters;