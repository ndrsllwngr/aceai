import React from 'react';
import { Router } from '@reach/router';
import { Toaster } from '@blueprintjs/core';
import Manual from '../../components/pages/Manual';
import Dashboard from '../../components/pages/Dashboard';
import { UiProvider, useUi } from '../../components/_context-ui';
import { AppProvider } from '../../components/_context-app';
import Navigation from '../../components/Navigation/index';
import Drawer from '../../components/Drawer';
import '../app.css';

const App = () => {
  return (
    <UiProvider>
      <AppProvider>
        <InnerApp />
      </AppProvider>
    </UiProvider>
  );
};

const InnerApp = () => {
  const [uiContext] = useUi();

  return (
    <>
      <Navigation />
      <Router>
        <Dashboard path="/app/dashboard" />
        <Manual path="/app" />
      </Router>
      <Drawer />
      <Toaster
        autoFocus={false}
        canEscapeKeyClear
        position="bottom-right"
        ref={uiContext.toasterRef}
      />
    </>
  );
};

export default App;
