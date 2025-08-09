import React from 'react';
import { Home, Construction, Plus, Edit, Trash2, MapPin, Users, Settings } from 'lucide-react';

export const Shelters = () => {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <Home size={24} color="var(--color-orange)" />
          Shelters Management
        </h2>
      </div>
      <div className="card-body">
        <div style={{ 
          textAlign: 'center', 
          padding: 'var(--spacing-8)',
          color: 'var(--color-gray-600)'
        }}>
          <Construction size={64} />
          <h3 style={{ 
            marginTop: 'var(--spacing-4)',
            fontSize: 'var(--font-size-xl)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-gray-700)'
          }}>
            Coming Soon
          </h3>
          <p style={{ 
            marginTop: 'var(--spacing-2)',
            fontSize: 'var(--font-size-base)'
          }}>
            Shelters management functionality will be implemented here.
          </p>
          <div style={{
            marginTop: 'var(--spacing-6)',
            padding: 'var(--spacing-4)',
            backgroundColor: 'var(--color-gray-100)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'left'
          }}>
            <h4 style={{ 
              marginBottom: 'var(--spacing-3)',
              color: 'var(--color-gray-700)',
              fontWeight: 'var(--font-weight-medium)'
            }}>
              Planned Features:
            </h4>
            <ul style={{ 
              listStyle: 'none',
              paddingLeft: 0,
              color: 'var(--color-gray-600)'
            }}>
              <li style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--spacing-2)',
                marginBottom: 'var(--spacing-2)'
              }}>
                <Plus size={16} />
                Add new shelters
              </li>
              <li style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--spacing-2)',
                marginBottom: 'var(--spacing-2)'
              }}>
                <Edit size={16} />
                Edit shelter information
              </li>
              <li style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--spacing-2)',
                marginBottom: 'var(--spacing-2)'
              }}>
                <Trash2 size={16} />
                Delete shelters
              </li>
              <li style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--spacing-2)',
                marginBottom: 'var(--spacing-2)'
              }}>
                <MapPin size={16} />
                Manage shelter locations
              </li>
              <li style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--spacing-2)'
              }}>
                <Users size={16} />
                Track shelter capacity
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Types = () => {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <Settings size={24} color="var(--color-orange)" />
          Incident Types Management
        </h2>
      </div>
      <div className="card-body">
        <div style={{ 
          textAlign: 'center', 
          padding: 'var(--spacing-8)',
          color: 'var(--color-gray-600)'
        }}>
          <Construction size={64} />
          <h3 style={{ 
            marginTop: 'var(--spacing-4)',
            fontSize: 'var(--font-size-xl)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-gray-700)'
          }}>
            Coming Soon
          </h3>
          <p style={{ 
            marginTop: 'var(--spacing-2)',
            fontSize: 'var(--font-size-base)'
          }}>
            Incident types management functionality will be implemented here.
          </p>
          <div style={{
            marginTop: 'var(--spacing-6)',
            padding: 'var(--spacing-4)',
            backgroundColor: 'var(--color-gray-100)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'left'
          }}>
            <h4 style={{ 
              marginBottom: 'var(--spacing-3)',
              color: 'var(--color-gray-700)',
              fontWeight: 'var(--font-weight-medium)'
            }}>
              Planned Features:
            </h4>
            <ul style={{ 
              listStyle: 'none',
              paddingLeft: 0,
              color: 'var(--color-gray-600)'
            }}>
              <li style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--spacing-2)',
                marginBottom: 'var(--spacing-2)'
              }}>
                <Plus size={16} />
                Create new incident types
              </li>
              <li style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--spacing-2)',
                marginBottom: 'var(--spacing-2)'
              }}>
                <Edit size={16} />
                Edit type definitions
              </li>
              <li style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--spacing-2)',
                marginBottom: 'var(--spacing-2)'
              }}>
                <Trash2 size={16} />
                Remove unused types
              </li>
              <li style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--spacing-2)',
                marginBottom: 'var(--spacing-2)'
              }}>
                <Settings size={16} />
                Customize type colors
              </li>
              <li style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--spacing-2)'
              }}>
                <Settings size={16} />
                Set severity priorities
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};