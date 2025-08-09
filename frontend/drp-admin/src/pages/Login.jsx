import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    // Clear any existing errors when component mounts
    setErrors({});
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      console.log('Sending credentials:', formData);
      const result = await login(formData);
      
      if (!result.success) {
        setErrors({ 
          submit: result.error || 'Login failed. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ 
        submit: 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="content-area">
      <div className="form-container">
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-8)' }}>
          <h1 style={{ 
            color: 'var(--color-orange)', 
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 'var(--font-weight-bold)',
            marginBottom: 'var(--spacing-2)'
          }}>
            Admin Panel
          </h1>
          <p style={{ 
            color: 'var(--color-gray-600)',
            fontSize: 'var(--font-size-base)'
          }}>
            Sign in to manage incidents and system data
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {errors.submit && (
            <div className="error-message" style={{ 
              marginBottom: 'var(--spacing-4)',
              padding: 'var(--spacing-3)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center'
            }}>
              {errors.submit}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={`form-input ${errors.username ? 'error' : ''}`}
              placeholder="Enter your username"
              disabled={loading}
            />
            {errors.username && (
              <div className="error-message">{errors.username}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Enter your password"
              disabled={loading}
            />
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ 
                  width: '20px', 
                  height: '20px',
                  borderWidth: '2px'
                }}></div>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div style={{ 
          marginTop: 'var(--spacing-6)',
          padding: 'var(--spacing-4)',
          backgroundColor: 'var(--color-gray-100)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-gray-600)'
        }}>
          <strong>Environment Variables Required:</strong><br />
          ADMIN_USERNAME and ADMIN_PASSWORD<br />
          should be set in your backend .env file
        </div>
      </div>
    </div>
  );
};

export default Login;