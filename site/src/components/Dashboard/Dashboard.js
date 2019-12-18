import React from 'react';
// import { ToastNotification } from 'carbon-components-react';
import SEO from '../seo';
import { PoseNetCamera } from '../PoseNetCamera/camera';
// import { useApp } from '../ctx-app';

export const Dashboard = () => {
  // const [appContext] = useApp();

  return (
    <>
      <SEO title="Dashboard" />
      <PoseNetCamera />
      {/* {appContext.webCam ? (
        <ToastNotification
          caption={`Time stamp [${new Date().toLocaleTimeString()}]`}
          hideCloseButton={false}
          iconDescription="describes the close button"
          kind="success"
          notificationType="toast"
          // onCloseButtonClick={function noRefCheck() {}}
          role="alert"
          style={{
            marginBottom: '.5rem',
            minWidth: '30rem',
          }}
          title="BodyPose started!"
          subtitle="Real-time pose estimation is running."
          timeout={0}
        />
      ) : (
        <ToastNotification
          caption={`Time stamp [${new Date().toLocaleTimeString()}]`}
          hideCloseButton={false}
          iconDescription="describes the close button"
          kind="info"
          notificationType="toast"
          // onCloseButtonClick={function noRefCheck() {}}
          role="alert"
          style={{
            marginBottom: '.5rem',
            minWidth: '30rem',
          }}
          title="BodyPose stopped!"
          subtitle="Real-time pose estimation shut down."
          timeout={0}
        />
      )} */}
    </>
  );
};
