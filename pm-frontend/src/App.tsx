import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from '@asgardeo/auth-react';

import Home from './pages/Home';
import Profiel from './pages/Profiel';
import Stand from './pages/Stand';
import InkomstenUitgaven from './pages/InkomstenUitgaven';
import Lening from './pages/Lening';
import Header from './components/Header';
import Budget from './pages/Budget';
import LoginPagina from './pages/LoginPagina';

import Container from '@mui/material/Container';
import NotFound from './pages/NotFound';

const ProtectedRoute: React.FC<{ element: JSX.Element }> = ({ element }) => {
  const { state } = useAuthContext();
  return state.isAuthenticated ? element : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <>
      <Container maxWidth="xl">
        <Router>
        <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<LoginPagina />} />
            {/* Beschermde routes */}
            <Route path="/stand" element={<ProtectedRoute element={<Stand />} />} />
            <Route path="/inkomsten-uitgaven" element={<ProtectedRoute element={<InkomstenUitgaven />} />} />
            <Route path="/lening" element={<ProtectedRoute element={<Lening />} />} />
            <Route path="/budget" element={<ProtectedRoute element={<Budget />} />} />
            <Route path="/profiel" element={<ProtectedRoute element={<Profiel />} />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </Container>
    </>
  );
};

export default App;
