// src/App.tsx
import React from 'react';
import Header from './components/Header/Header';
// import BetalingOverzicht from './pages/BetalingOverzicht/BetalingOverzicht';
import Login from './pages/Login';

const App: React.FC = () => (
  <>
  <Header></Header>
  <Login></Login>
  </>
);

export default App;
