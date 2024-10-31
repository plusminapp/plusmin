// src/pages/Login.tsx
import React from 'react';
import { useAuthContext } from "@asgardeo/auth-react";
// import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { state, signIn, signOut } = useAuthContext();
  // const navigate = useNavigate()
  const handleLogin = () => {
    signIn();
    // navigate('/dashboard');
  };
  const handleLogout = () => {
    signOut();
    // navigate('/dashboard');
  };

  return (
    <div>
      <h2>Login/logout Page</h2>
      {!state.isAuthenticated &&
        <button onClick={handleLogin}>Login</button>
      }
      {state.isAuthenticated &&
        <button onClick={handleLogout}>Logout</button>
      }
      <p>Current state: {JSON.stringify(state)}</p>
    </div>
  );
};

export default Login;
