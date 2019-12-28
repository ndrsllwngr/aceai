import React from 'react';
import { Router, Match } from '@reach/router';
import { Link } from 'gatsby';
import { Alignment, Button, Navbar } from '@blueprintjs/core';
import LandingPage from '../../components/LandingPage';
import Dashboard from '../../components/Dashboard';
import { AppProvider, useApp } from '../../components/ctx-app';
import '../app.css';

const TopNavigation = () => {
  const [appContext, setAppContext] = useApp();

  const handleChange = () => {
    setAppContext({ ...appContext, webCam: !appContext.webCam });
  };
  return (
    <>
      <Navbar>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>BodyPose</Navbar.Heading>
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          <Match path="/app">
            {({ match }) => (
              <Link to="/app" style={{ textDecoration: 'none' }}>
                <Button
                  to="/app"
                  active={match}
                  className="bp3-minimal"
                  icon="manual"
                  text="Manual"
                />
              </Link>
            )}
          </Match>
          <Match path="/app/dashboard">
            {({ match }) => (
              <Link to="/app/dashboard" style={{ textDecoration: 'none' }}>
                <Button
                  to="/app/dashboard"
                  active={match}
                  className="bp3-minimal"
                  icon="dashboard"
                  text="Dashboard"
                />
              </Link>
            )}
          </Match>
          <Navbar.Divider />
          <Button
            className="bp3-minimal"
            icon={appContext.webCam ? 'stop' : 'power'}
            onClick={handleChange}
          />
          <Button className="bp3-minimal" icon="notifications" />
          <Button className="bp3-minimal" icon="cog" />
        </Navbar.Group>
      </Navbar>
    </>
  );
};

const App = () => {
  return (
    <AppProvider>
      <TopNavigation />
      <Router>
        <Dashboard path="/app/dashboard" />
        <LandingPage path="/app" />
      </Router>
    </AppProvider>
  );
};

export default App;
