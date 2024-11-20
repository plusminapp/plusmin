// src/hooks/useAuthToken.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@asgardeo/auth-react';

export function useAuthToken() {
  const { getIDToken } = useAuthContext();
  const [token, setToken] = useState<string | null>(null);

  const { state } = useAuthContext();

  const handleIdToken = useCallback(async () => {
    const idToken = await getIDToken()
    setToken(idToken)
  }, [getIDToken])

  useEffect(() => {
      if (state.isAuthenticated) {
        handleIdToken()
    };
  }, [state.isAuthenticated, handleIdToken]);

  return token;
}
