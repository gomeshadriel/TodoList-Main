import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export const DebugInfo = () => {
  const { user, token, isAuthenticated } = useAuth();

  const testAPI = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      console.log('API Test Result:', result);
    } catch (error) {
      console.error('API Test Error:', error);
    }
  };

  return (
    <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px', borderRadius: '5px' }}>
      <h4>Debug Info:</h4>
      <p>Authenticated: {isAuthenticated() ? 'Yes' : 'No'}</p>
      <p>User: {user ? JSON.stringify(user) : 'None'}</p>
      <p>Token: {token ? 'Present' : 'Missing'}</p>
      <button onClick={testAPI}>Test API</button>
    </div>
  );
};