import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, Home, List, LogOut, Settings } from 'lucide-react';

const Layout = () => {
  const { logout, admin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/login');
    }
  };

  const navigationItems = [
    {
      path: '/',
      label: 'Incidents',
      icon: AlertTriangle
    },
    {
      path: '/shelters',
      label: 'Shelters',
      icon: Home
    },
    {
      path: '/types',
      label: 'Incident Types',
      icon: List
    }
  ];

  const getPageTitle = () => {
    const currentPath = location.pathname;
    const currentItem = navigationItems.find(item => item.path === currentPath);
    return currentItem ? currentItem.label : 'Admin Panel';
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Emergency Admin</h1>
          <p style={{ 
            fontSize: 'var(--font-size-sm)', 
            color: 'var(--color-gray-400)',
            marginTop: 'var(--spacing-2)'
          }}>
            Welcome, {admin?.username}
          </p>
        </div>

        <nav>
          <ul className="sidebar-nav">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.path} className="sidebar-nav-item">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.path);
                    }}
                    className={`sidebar-nav-link ${
                      location.pathname === item.path ? 'active' : ''
                    }`}
                  >
                    <IconComponent size={20} style={{ marginRight: 'var(--spacing-2)' }} />
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div style={{ 
          marginTop: 'auto',
          paddingTop: 'var(--spacing-8)',
          borderTop: '1px solid var(--color-gray-700)'
        }}>
          <button
            onClick={handleLogout}
            className="sidebar-nav-link"
            style={{
              width: '100%',
              border: 'none',
              background: 'none',
              textAlign: 'left',
              cursor: 'pointer'
            }}
          >
            <LogOut size={20} style={{ marginRight: 'var(--spacing-2)' }} />
            Logout
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="header">
          <h1 className="header-title">{getPageTitle()}</h1>
          <div className="header-actions">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--spacing-2)',
              color: 'var(--color-gray-600)',
              fontSize: 'var(--font-size-sm)'
            }}>
              <Settings size={20} />
              <span>{admin?.username}</span>
            </div>
          </div>
        </header>

        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;