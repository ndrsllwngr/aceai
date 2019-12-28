import React from 'react';
import { Match } from '@reach/router';
import { Link } from 'gatsby';
import { Alignment, Button, Navbar, Toaster } from '@blueprintjs/core';
import { useUi } from '../_context-ui';
import { useApp } from '../_context-app';

// function askNotificationPermission() {
//   // function to actually ask the permissions
//   function handlePermission(permission) {
//     // Whatever the user answers, we make sure Chrome stores the information
//     if (!('permission' in Notification)) {
//       Notification.permission = permission;
//     }

//     // set the button to shown or hidden, depending on what the user answers
//     // if (
//     //   Notification.permission === 'denied' ||
//     //   Notification.permission === 'default'
//     // ) {
//     //   notificationBtn.style.display = 'block';
//     // } else {
//     //   notificationBtn.style.display = 'none';
//     // }
//   }

//   // Let's check if the browser supports notifications
//   // eslint-disable-next-line no-unsafe-negation
//   if (!'Notification' in window) {
//     // eslint-disable-next-line no-console
//     console.log('This browser does not support notifications.');
//   } else if (checkNotificationPromise()) {
//     Notification.requestPermission().then(permission => {
//       handlePermission(permission);
//     });
//   } else {
//     // eslint-disable-next-line func-names
//     Notification.requestPermission(function(permission) {
//       handlePermission(permission);
//     });
//   }
// }

// function checkNotificationPromise() {
//   try {
//     Notification.requestPermission().then();
//   } catch (e) {
//     return false;
//   }

//   return true;
// }

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
      <Toaster
        autoFocus={false}
        canEscapeKeyClear
        position="bottom-right"
        ref={uiContext.toasterRef}
      />
    </>
  );
};
