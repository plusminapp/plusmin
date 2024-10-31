// src/App.tsx
import React from 'react';
import Header from './components/Header/Header';
import TransactieOverzicht from './pages/TransactieOverzicht/TransactieOverzicht';

const App: React.FC = () => (
  <>
  <Header></Header>
  <TransactieOverzicht></TransactieOverzicht>
  </>
);

export default App;
