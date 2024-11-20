import { createContext, useContext } from 'react';

const AuthTokenContext = createContext<string | null>(null);

export const useAuthTokenContext = () => useContext(AuthTokenContext);

export default AuthTokenContext;
