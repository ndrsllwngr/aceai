import React from 'react';
import { Match } from '@reach/router';
import { Link } from 'gatsby';
import {
  Alignment,
  Button,
  Navbar,
  Tooltip,
  Position,
} from '@blueprintjs/core';
import { useUi } from '../context-ui';
import { useApp } from '../context-app';

export const Navigation = () => {
  const [uiContext, setUiContext] = useUi();
  const [appContext, setAppContext] = useApp();

  const handleChange = () => {
    setAppContext({
      ...appContext,
      posenet_turnedOn: !appContext.posenet_turnedOn,
    });
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
          height: 'auto',
        }}
      >
        <div className="container px-6 mx-auto flex flex-row h-full justify-between">
          <Navbar.Group align={Alignment.LEFT}>
            <Navbar.Heading>
              <span className="font-extrabold">BodyPose</span>{' '}
              <Tooltip
                content={`${
                  process.env.COMMIT_REF ? process.env.COMMIT_REF : 'DEVELOP'
                }`}
                position={Position.BOTTOM}
              >
                <span className="text-gray-300 font-medium text-xs">v1.0</span>
              </Tooltip>
            </Navbar.Heading>
          </Navbar.Group>
          <div className="block md:hidden">
            <Navbar.Group align={Alignment.RIGHT}>
              <Button
                onClick={handleUiContextChange('drawerNavigationIsOpen', true)}
                className="bp3-minimal"
                icon="menu"
              />
            </Navbar.Group>
          </div>
          <div className="hidden md:block">
            <Navbar.Group align={Alignment.RIGHT}>
              <Match exact path="/">
                {({ match }) => (
                  <Link to="/" style={{ textDecoration: 'none' }}>
                    <Button
                      to="/"
                      active={match}
                      className="bp3-minimal"
                      icon="manual"
                      text="About"
                    />
                  </Link>
                )}
              </Match>
              <Match path="/dashboard">
                {({ match }) => (
                  <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                    <Button
                      to="/dashboard"
                      active={match}
                      className="bp3-minimal"
                      icon="dashboard"
                      text="Dashboard"
                    />
                  </Link>
                )}
              </Match>
              <Navbar.Divider />

              <Tooltip
                content={appContext.posenet_turnedOn ? 'Stop' : 'Start'}
                position={Position.BOTTOM}
              >
                <Button
                  className="bp3-minimal"
                  icon={appContext.posenet_turnedOn ? 'stop' : 'power'}
                  onClick={handleChange}
                  disabled={
                    appContext.calibration_calibrationDataAvailable === false
                  }
                />
              </Tooltip>
              <Tooltip content="Calibrate" position={Position.BOTTOM}>
                <Button
                  className="bp3-minimal"
                  icon="cube-add"
                  // onClick={handleChange}
                />
              </Tooltip>
              <Tooltip
                content={
                  uiContext.videoCanvasIsOpen
                    ? 'Hide camera feed'
                    : 'Show camera feed'
                }
                position={Position.BOTTOM}
              >
                <Button
                  className="bp3-minimal"
                  icon={uiContext.videoCanvasIsOpen ? 'eye-on' : 'eye-open'}
                  onClick={handleUiContextChange(
                    'videoCanvasIsOpen',
                    !uiContext.videoCanvasIsOpen,
                  )}
                />
              </Tooltip>
              <Tooltip
                content={
                  uiContext.showNotificationBrowser
                    ? 'Disable browser notifications'
                    : 'Enable browser notiifications'
                }
                position={Position.BOTTOM}
              >
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
              </Tooltip>
              <Tooltip content="Settings" position={Position.BOTTOM}>
                <Button
                  className="bp3-minimal"
                  icon="cog"
                  onClick={handleUiContextChange('drawerSettingsIsOpen', true)}
                />
              </Tooltip>
            </Navbar.Group>
          </div>
        </div>
      </Navbar>
    </>
  );
};
