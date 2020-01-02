import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { ResizeSensor, Toaster } from '@blueprintjs/core';
import Navigation from './Navigation/index';
import DrawerSettings from './DrawerSettings';
import DrawerNavigation from './DrawerNavigation';
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
        <div className="pt-16 sm:pt-16 h-full">{element}</div>
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
