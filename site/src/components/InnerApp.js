import React from 'react';
import PropTypes from 'prop-types';
import { Toaster } from '@blueprintjs/core';
import Navigation from './Navigation/index';
import DrawerSettings from './DrawerSettings';
import DrawerNavigation from './DrawerNavigation';
import { useUi } from './context-ui';

export const InnerApp = ({ element }) => {
  const [uiContext] = useUi();

  return (
    <>
      <Navigation />
      <div className="pt-16 sm:pt-16 h-full">{element}</div>
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
