import React from 'react';
import { Match } from '@reach/router';
import { Link } from 'gatsby';
import { Alignment, Button, Navbar } from '@blueprintjs/core';
import { useApp } from '../_context-app';

export const Navigation = () => {
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
