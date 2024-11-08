// src/context/AuthTokenProvider.tsx
import React from 'react';
import AuthTokenContext from './AuthTokenContext';
import { useAuthToken } from '../hooks/useAuthToken';

export const AuthTokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = useAuthToken();

  return <AuthTokenContext.Provider value={token}>{children}</AuthTokenContext.Provider>;
};
