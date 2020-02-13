import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { ResizeSensor, Toaster } from '@blueprintjs/core';
import Navigation, { Drawer as DrawerNavigation } from './Navigation';
import DrawerSettings from './DrawerSettings';
import { useUi } from './context-ui';

export const InnerApp = ({ element }) => {
  const [uiContext, setUiContext] = useUi();

  function handleResize(entries) {
    const width = get(entries, '0.contentRect.width');
    if (width >= 640) {
      if (uiContext.screenWidthSmallerThanSM) {
        setUiContext({ ...uiContext, screenWidthSmallerThanSM: false });
      }
    } else if (!uiContext.screenWidthSmallerThanSM) {
      setUiContext({ ...uiContext, screenWidthSmallerThanSM: true });
    }
  }

  return (
    <>
      <Navigation />
      <ResizeSensor onResize={handleResize}>
        <div className="h-full">{element}</div>
      </ResizeSensor>
      <DrawerNavigation />
      <DrawerSettings />
      <Toaster
        autoFocus={false}
        canEscapeKeyClear
        position="bottom-right"
        ref={uiContext.toasterRef}
      />
    </>
  );
};

InnerApp.propTypes = {
  element: PropTypes.node.isRequired,
};
