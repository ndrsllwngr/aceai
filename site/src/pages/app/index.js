import React from 'react';
import { Router } from '@reach/router';
import Manual from '../../components/pages/Manual';
import Dashboard from '../../components/pages/Dashboard';
import { AppProvider } from '../../components/_context-app';
import Navigation from '../../components/Navigation/index';
import '../app.css';

const App = () => {
  return (
    <AppProvider>
      <Navigation />
      <Router>
        <Dashboard path="/app/dashboard" />
        <Manual path="/app" />
      </Router>
    </AppProvider>
  );
};

export default App;
