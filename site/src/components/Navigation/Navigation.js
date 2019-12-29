import React from 'react';
import { Match } from '@reach/router';
import { Link } from 'gatsby';
import { Alignment, Button, Navbar } from '@blueprintjs/core';
import { useUi } from '../_context-ui';
import { useApp } from '../_context-app';

export const Navigation = () => {
  const [uiContext, setUiContext] = useUi();
  const [appContext, setAppContext] = useApp();

  const handleChange = () => {
    setAppContext({ ...appContext, webCam: !appContext.webCam });
  };
  const handleUiContextChange = (property, value) => () => {
    setUiContext({ ...uiContext, [property]: value });
  };
  return (
    <>
      <Navbar
        style={{
          position: 'fixed',
          boxShadow: '0 1px 3px 0 rgba(0,0,0,.1), 0 1px 2px 0 rgba(0,0,0,.06)',
          color: '#1a202c',
          height: 'auto',
          minHeight: '50px',
        }}
      >
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>
            <strong style={{ fontWeight: 800 }}>[ACEAI]</strong> BodyPose
          </Navbar.Heading>
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
          <Button
            className="bp3-minimal"
            icon={uiContext.videoCanvasIsOpen ? 'eye-on' : 'eye-open'}
            onClick={handleUiContextChange(
              'videoCanvasIsOpen',
              !uiContext.videoCanvasIsOpen,
            )}
          />
          <Button
            className="bp3-minimal"
            icon={
              uiContext.showNotificationBrowser
                ? 'notifications-updated'
                : 'notifications'
            }
            onClick={handleUiContextChange(
              'showNotificationBrowser',
              !uiContext.showNotificationBrowser,
            )}
          />
          <Button
            className="bp3-minimal"
            icon="cog"
            onClick={handleUiContextChange('drawerIsOpen', true)}
          />
        </Navbar.Group>
      </Navbar>
    </>
  );
};
