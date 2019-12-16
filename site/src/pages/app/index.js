import React from 'react';
import '../app.scss';
import { Router } from '@reach/router';
import { Content } from 'carbon-components-react/lib/components/UIShell';
import LandingPage from '../../components/LandingPage';
import Dashboard from '../../components/Dashboard';
import Header from '../../components/Header';
import { AppProvider } from '../../components/ctx-app';

const App = () => {
  return (
    <AppProvider>
      <Header />
      <Content>
        <Router>
          <Dashboard path="/app/dashboard" />
          <LandingPage path="/app" />
        </Router>
      </Content>
    </AppProvider>
  );
};

export default App;
