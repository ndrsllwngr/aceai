import React from 'react';
import {
  Divider,
  Button,
  Drawer as BluePrintDrawer,
  Position,
  Classes,
} from '@blueprintjs/core';
import { Link } from 'gatsby';
import { Match } from '@reach/router';
import { useUi } from '../context-ui';
import { useApp } from '../context-app';

export const Drawer = () => {
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
    <BluePrintDrawer
      autoFocus
      canEscapeKeyClose
      canOutsideClickClose
      isCloseButtonShown
      icon="menu"
      title="Menu"
      enforceFocus
      hasBackdrop
      isOpen={uiContext.drawerNavigationIsOpen}
      position={Position.RIGHT}
      usePortal
      onClose={handleUiContextChange('drawerNavigationIsOpen', false)}
    >
      <div className={Classes.DRAWER_BODY}>
        <div className={Classes.DIALOG_BODY}>
          <div className="flex flex-col">
            <Match path="/">
              {({ match }) => (
                <Link to="/" style={{ textDecoration: 'none' }}>
                  <Button
                    fill
                    large
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
                    fill
                    large
                    to="/dashboard"
                    active={match}
                    className="bp3-minimal"
                    icon="dashboard"
                    text="Dashboard"
                  />
                </Link>
              )}
            </Match>
            <Divider />
            <Button
              className="bp3-minimal"
              icon={appContext.posenet_turnedOn ? 'stop' : 'power'}
              onClick={handleChange}
              disabled={
                appContext.calibration_calibrationDataAvailable === false
              }
              fill
              large
            />
            <Button
              className="bp3-minimal"
              icon={uiContext.videoCanvasIsOpen ? 'eye-on' : 'eye-open'}
              onClick={handleUiContextChange(
                'videoCanvasIsOpen',
                !uiContext.videoCanvasIsOpen,
              )}
              fill
              large
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
              fill
              large
            />
            <Button
              className="bp3-minimal"
              icon="cog"
              onClick={handleUiContextChange('drawerSettingsIsOpen', true)}
              fill
              large
            />
          </div>
        </div>
      </div>
      <div className={Classes.DRAWER_FOOTER}>
        <a href="https://www.mobile.ifi.lmu.de/lehrveranstaltungen/affective-computing-6/">
          ACEAI
        </a>{' '}
        2019/20
      </div>
    </BluePrintDrawer>
  );
};
