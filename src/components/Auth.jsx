import React, { useState } from 'react';
import { Login } from './Login';
import { Register } from './Register';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-wrapper">
      {isLogin ? (
        <Login onSwitchToRegister={() => setIsLogin(false)} />
      ) : (
        <Register onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </div>
  );
};