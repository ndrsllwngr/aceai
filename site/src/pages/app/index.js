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
      <Header>
        <Content
          id="main-content"
          style={{
            backgroundColor: '#f4f4f4',
            minHeight: '100vh',
          }}
        >
          <div className="bx--grid">
            <div className="bx--row">
              <section className="bx--offset-lg-3 bx--col-lg-13">
                <Router>
                  <Dashboard path="/app/dashboard" />
                  <LandingPage path="/app" />
                </Router>
              </section>
            </div>
          </div>
        </Content>
      </Header>
    </AppProvider>
  );
};

export default App;
