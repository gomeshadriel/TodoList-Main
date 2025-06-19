import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Header = () => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="app-header">
      <div className="header-content">
        <h1>TodoList App</h1>
        <div className="user-info">
          <span className="user-details">
            Welcome, {user.name} 
            <span className={`user-badge ${user.type}`}>
              {user.type === 'admin' ? 'Admin' : 'User'}
            </span>
          </span>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};