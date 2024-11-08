// src/App.tsx
import React from 'react';
import Header from './components/Header/Header';
import Login from './pages/Login';
import BetalingOverzicht from './pages/BetalingOverzicht/BetalingOverzicht';

const App: React.FC = () => (
  <>
  <Header></Header>
  <Login></Login>
  <BetalingOverzicht></BetalingOverzicht>
  </>
);

export default App;
