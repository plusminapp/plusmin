// src/App.tsx
import React from 'react';
import Header from './components/Header/Header';
// import TransactieOverzicht from './pages/TransactieOverzicht/TransactieOverzicht';
import Login from './pages/Login';

const App: React.FC = () => (
  <>
  <Header></Header>
  <Login></Login>
  </>
);

export default App;
