import React from 'react';
import { Router } from '@reach/router';
import Manual from '../../components/pages/Manual';
import Dashboard from '../../components/pages/Dashboard';
import { UiProvider } from '../../components/_context-ui';
import { AppProvider } from '../../components/_context-app';
import Navigation from '../../components/Navigation/index';
import '../app.css';

const App = () => {
  return (
    <UiProvider>
      <AppProvider>
        <Navigation />
        <Router>
          <Dashboard path="/app/dashboard" />
          <Manual path="/app" />
        </Router>
      </AppProvider>
    </UiProvider>
  );
};

export default App;
