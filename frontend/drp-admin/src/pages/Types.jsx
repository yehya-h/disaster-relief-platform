import React, { useState, useEffect } from 'react';
import { typesAPI } from '../utils/api';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  AlertTriangle,
  RefreshCw,
  List,
  Lightbulb,
  MinusCircle
} from 'lucide-react';

const Types = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    safetyTips: ['']
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await typesAPI.getTypes();
      setTypes(response.data);
    } catch (error) {
      console.error('Error loading types:', error);
      setError('Failed to load incident types. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      safetyTips: ['']
    });
    setFormErrors({});
    setEditingType(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (type) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      safetyTips: type.safetyTips.length > 0 ? [...type.safetyTips] : ['']
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
    
    if (!formData.name.trim()) {
      errors.name = 'Type name is required';
    }
    
    // Filter out empty safety tips
    const validSafetyTips = formData.safetyTips.filter(tip => tip.trim());
    if (validSafetyTips.length === 0) {
      errors.safetyTips = 'At least one safety tip is required';
    }
    
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

  const handleSafetyTipChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      safetyTips: prev.safetyTips.map((tip, i) => i === index ? value : tip)
    }));
    
    // Clear safety tips error when user starts typing
    if (formErrors.safetyTips) {
      setFormErrors(prev => ({
        ...prev,
        safetyTips: ''
      }));
    }
  };

  const addSafetyTip = () => {
    setFormData(prev => ({
      ...prev,
      safetyTips: [...prev.safetyTips, '']
    }));
  };

  const removeSafetyTip = (index) => {
    if (formData.safetyTips.length > 1) {
      setFormData(prev => ({
        ...prev,
        safetyTips: prev.safetyTips.filter((_, i) => i !== index)
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
      // Filter out empty safety tips before submitting
      const typeData = {
        name: formData.name.trim(),
        safetyTips: formData.safetyTips.filter(tip => tip.trim()).map(tip => tip.trim())
      };

      if (editingType) {
        await typesAPI.updateType(editingType._id, typeData);
      } else {
        await typesAPI.createType(typeData);
      }
      
      await loadTypes();
      closeModal();
    } catch (error) {
      console.error('Error saving type:', error);
      setFormErrors({ 
        submit: error.response?.data?.message || 'Failed to save incident type. Please try again.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (typeId, typeName) => {
    if (!confirm(`Are you sure you want to delete "${typeName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await typesAPI.deleteType(typeId);
      await loadTypes();
    } catch (error) {
      console.error('Error deleting type:', error);
      alert('Failed to delete incident type. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p style={{ marginTop: 'var(--spacing-4)', color: 'var(--color-gray-600)' }}>
          Loading incident types...
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
          onClick={loadTypes}
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
            Incident Types Management
          </h2>
          <p style={{ color: 'var(--color-gray-600)' }}>
            Manage incident types and their safety guidelines
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn btn-primary"
        >
          <Plus size={20} />
          Add Type
        </button>
      </div>

      {/* Types Grid */}
      {types.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <div style={{ 
              textAlign: 'center', 
              padding: 'var(--spacing-8)',
              color: 'var(--color-gray-600)'
            }}>
              <Settings size={48} />
              <h3 style={{ 
                marginTop: 'var(--spacing-4)',
                fontSize: 'var(--font-size-xl)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-gray-700)'
              }}>
                No Incident Types Found
              </h3>
              <p style={{ 
                marginTop: 'var(--spacing-2)',
                fontSize: 'var(--font-size-base)'
              }}>
                Start by adding your first incident type with safety guidelines.
              </p>
              <button
                onClick={openCreateModal}
                className="btn btn-primary"
                style={{ marginTop: 'var(--spacing-4)' }}
              >
                <Plus size={16} />
                Add First Type
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
          {types.map((type) => (
            <div key={type._id} className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                    <div style={{
                      padding: 'var(--spacing-2)',
                      backgroundColor: 'var(--color-orange)',
                      borderRadius: 'var(--radius-md)',
                      color: 'white'
                    }}>
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <h3 className="card-title">{type.name}</h3>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-2)',
                        marginTop: 'var(--spacing-1)',
                        color: 'var(--color-gray-600)',
                        fontSize: 'var(--font-size-sm)'
                      }}>
                        <Lightbulb size={14} />
                        <span>{type.safetyTips.length} safety tips</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-body">
                <h4 style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 'var(--font-weight-medium)',
                  marginBottom: 'var(--spacing-3)',
                  color: 'var(--color-gray-700)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-2)'
                }}>
                  <List size={16} />
                  Safety Guidelines
                </h4>
                <div style={{
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {type.safetyTips.map((tip, index) => (
                    <div key={index} style={{
                      padding: 'var(--spacing-3)',
                      marginBottom: 'var(--spacing-2)',
                      backgroundColor: 'var(--color-gray-100)',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: '3px solid var(--color-orange)',
                      fontSize: 'var(--font-size-sm)',
                      lineHeight: '1.5'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 'var(--spacing-2)'
                      }}>
                        <span style={{
                          minWidth: '20px',
                          height: '20px',
                          backgroundColor: 'var(--color-orange)',
                          color: 'white',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: 'var(--font-weight-semibold)',
                          marginTop: '2px'
                        }}>
                          {index + 1}
                        </span>
                        <span style={{ flex: 1 }}>{tip}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-actions">
                <button
                  onClick={() => openEditModal(type)}
                  className="btn btn-outline btn-sm"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(type._id, type.name)}
                  className="btn btn-danger btn-sm"
                  disabled={true}
                  title="Delete is currently disabled for incident types"
                  style={{ 
                    opacity: 0.5, 
                    cursor: 'not-allowed',
                    position: 'relative'
                  }}
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
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div className="card-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="card-title">
                  {editingType ? 'Edit Incident Type' : 'Add New Incident Type'}
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
                  <label htmlFor="name" className="form-label">
                    Type Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`form-input ${formErrors.name ? 'error' : ''}`}
                    placeholder="e.g., Earthquake, Fire, Flood"
                    disabled={submitting}
                  />
                  {formErrors.name && (
                    <div className="error-message">{formErrors.name}</div>
                  )}
                </div>

                <div className="form-group">
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--spacing-3)'
                  }}>
                    <label className="form-label">
                      Safety Tips *
                    </label>
                    <button
                      type="button"
                      onClick={addSafetyTip}
                      className="btn btn-outline btn-sm"
                      disabled={submitting}
                    >
                      <Plus size={14} />
                      Add Tip
                    </button>
                  </div>

                  {formData.safetyTips.map((tip, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      gap: 'var(--spacing-2)',
                      marginBottom: 'var(--spacing-3)',
                      alignItems: 'flex-start'
                    }}>
                      <div style={{
                        minWidth: '30px',
                        height: '42px',
                        backgroundColor: 'var(--color-gray-200)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 'var(--font-weight-semibold)',
                        color: 'var(--color-gray-600)'
                      }}>
                        {index + 1}
                      </div>
                      <textarea
                        value={tip}
                        onChange={(e) => handleSafetyTipChange(index, e.target.value)}
                        className="form-input"
                        placeholder={`Safety tip ${index + 1}...`}
                        rows={2}
                        disabled={submitting}
                        style={{ 
                          flex: 1,
                          resize: 'vertical',
                          minHeight: '42px'
                        }}
                      />
                      {formData.safetyTips.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSafetyTip(index)}
                          className="btn btn-outline btn-sm"
                          disabled={submitting}
                          style={{
                            minWidth: '42px',
                            height: '42px',
                            padding: 0,
                            color: 'var(--color-error)'
                          }}
                        >
                          <MinusCircle size={16} />
                        </button>
                      )}
                    </div>
                  ))}

                  {formErrors.safetyTips && (
                    <div className="error-message">{formErrors.safetyTips}</div>
                  )}
                  
                  <div style={{ 
                    fontSize: 'var(--font-size-sm)', 
                    color: 'var(--color-gray-600)',
                    marginTop: 'var(--spacing-2)'
                  }}>
                    Provide clear, actionable safety guidelines for this incident type.
                  </div>
                </div>
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
                      {editingType ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {editingType ? 'Update Type' : 'Create Type'}
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

export default Types;