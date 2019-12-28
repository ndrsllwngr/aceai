import React from 'react';
import {
  // Toaster,
  Button,
  Intent,
  Drawer,
  Position,
  Classes,
} from '@blueprintjs/core';

import SEO from '../../seo';
import { PoseNetCamera } from '../../PoseNetCamera/camera';
import { useUi } from '../../_context-ui';
// import { useApp } from '../../_context-app';

const showNotification = () => {
  if (typeof Notification !== 'undefined') {
    Notification.requestPermission(result => {
      if (result === 'granted') {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification('Update', {
            body: 'BodyPose experimental feature notification',
            icon: 'link-to-your-icon',
            vibrate: [200, 100, 200, 100, 200, 100, 400],
            tag: 'request',
            actions: [
              // you can customize these actions as you like
              {
                // eslint-disable-next-line no-console
                action: () => console.log('update'), // you should define this
                title: 'update',
              },
              {
                // eslint-disable-next-line no-console
                action: () => console.log('ignore'), // you should define this
                title: 'ignore',
              },
            ],
          });
        });
      }
    });
  }
};

export const Dashboard = () => {
  // const [appContext] = useApp();
  const [uiContext, setUiContext] = useUi();
  const handleDrawerIsOpen = val => () => {
    setUiContext({ ...uiContext, drawerIsOpen: val });
  };
  // const toasterRef = useRef(uiContext.toasterRef);
  const showToast = () => {
    if (uiContext.showNotificationInApp && uiContext.toasterRef.current) {
      uiContext.toasterRef.current.show({
        message: 'test',
        intent: Intent.PRIMARY,
      });
    }
    if (uiContext.showNotificationBrowser) {
      showNotification();
    }
  };
  return (
    <>
      <SEO title="Dashboard" />
      <Button onClick={showToast}>Toaster</Button>
      {/* <Toaster
        autoFocus={false}
        canEscapeKeyClear
        position="bottom-right"
        ref={toasterRef}
      /> */}
      <Drawer
        autoFocus
        canEscapeKeyClose
        canOutsideClickClose
        isCloseButtonShown
        icon="info-sign"
        title="Palantir Foundry"
        enforceFocus
        hasBackdrop
        isOpen={uiContext.drawerIsOpen}
        position={Position.RIGHT}
        usePortal
        onClose={handleDrawerIsOpen(false)}
      >
        <div className={Classes.DRAWER_BODY}>
          <div className={Classes.DIALOG_BODY}>
            <p>
              <strong>
                Data integration is the seminal problem of the digital age. For
                over ten years, we’ve helped the world’s premier organizations
                rise to the challenge.
              </strong>
            </p>
            <p>
              Palantir Foundry radically reimagines the way enterprises interact
              with data by amplifying and extending the power of data
              integration. With Foundry, anyone can source, fuse, and transform
              data into any shape they desire. Business analysts become data
              engineers — and leaders in their organization’s data revolution.
            </p>
            <p>
              Foundry’s back end includes a suite of best-in-class data
              integration capabilities: data provenance, git-style versioning
              semantics, granular access controls, branching, transformation
              authoring, and more. But these powers are not limited to the
              back-end IT shop.
            </p>
            <p>
              In Foundry, tables, applications, reports, presentations, and
              spreadsheets operate as data integrations in their own right.
              Access controls, transformation logic, and data quality flow from
              original data source to intermediate analysis to presentation in
              real time. Every end product created in Foundry becomes a new data
              source that other users can build upon. And the enterprise data
              foundation goes where the business drives it.
            </p>
            <p>
              Start the revolution. Unleash the power of data integration with
              Palantir Foundry.
            </p>
          </div>
        </div>
        <div className={Classes.DRAWER_FOOTER}>Footer</div>
      </Drawer>
      <PoseNetCamera />
    </>
  );
};
