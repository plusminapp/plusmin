import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { AuthProvider } from "@asgardeo/auth-react";
import { CustomProvider } from './context/CustomContext.tsx';

const config = {
  clientID: "wnvfL9kJtnIf0ziF3oK2QUkgaWIa",
  baseUrl: "https://api.eu.asgardeo.io/t/plusmin",
  signInRedirectURL: "https://plusminapp.nl",
  signOutRedirectURL: "https://plusminapp.nl",
  scope: ["openid", "profile"],
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider config={config}>
      <CustomProvider>
        <App />
      </CustomProvider>
    </AuthProvider>
  </StrictMode>,
)
