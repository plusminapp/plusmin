// src/api/fetchClient.ts
import { useAuthTokenContext } from '../context/AuthTokenContext';

export const useFetchClient = () => {
  const token = useAuthTokenContext();

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }

    return fetch(url, {
      ...options,
      headers,
    });
  };

  return fetchWithAuth;
};
