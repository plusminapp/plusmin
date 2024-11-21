import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { AuthProvider } from "@asgardeo/auth-react";

const config = {
  clientID: "wnvfL9kJtnIf0ziF3oK2QUkgaWIa",
  baseUrl: "https://api.eu.asgardeo.io/t/plusmin",
  signInRedirectURL: "https://plusmin.vliet.io/",
  signOutRedirectURL: "https://plusmin.vliet.io/",
  scope: ["openid", "profile"],
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider config={config}>
        <App />
    </AuthProvider>
  </StrictMode>,
)
