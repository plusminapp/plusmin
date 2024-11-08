// src/hooks/useAuthToken.ts
import { useState, useEffect } from 'react';
import { useAuthContext } from '@asgardeo/auth-react';

export function useAuthToken() {
  const { getIDToken } = useAuthContext();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const idToken = await getIDToken();
      setToken(idToken);
    };

    fetchToken();
  }, [getIDToken]);

  return token;
}
