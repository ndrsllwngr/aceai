import React, { useRef } from 'react';
import { Toaster, Button, Intent } from '@blueprintjs/core';
import SEO from '../../seo';
import { PoseNetCamera } from '../../PoseNetCamera/camera';
// import { useApp } from '../ctx-app';

export const Dashboard = () => {
  // const [appContext] = useApp();
  const toasterRef = useRef(null);
  const showToast = () => {
    if (toasterRef.current) {
      toasterRef.current.show({ message: 'test', intent: Intent.PRIMARY });
    }
  };
  return (
    <>
      <SEO title="Dashboard" />
      <Button onClick={showToast}>Test</Button>
      <Toaster
        autoFocus={false}
        canEscapeKeyClear
        position="bottom-right"
        ref={toasterRef}
      ></Toaster>
      <PoseNetCamera />
    </>
  );
};
