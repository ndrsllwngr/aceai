/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Toaster } from '@blueprintjs/core';
import Navigation from './src/components/Navigation/index';
import Drawer from './src/components/Drawer';
import { UiProvider, useUi } from './src/components/context-ui';
import { AppProvider } from './src/components/context-app';
import './src/pages/app.css';

const InnerApp = ({ element }) => {
  const [uiContext] = useUi();

  return (
    <>
      <Navigation />
      <div className="pt-32 sm:pt-16">{element}</div>
      <Drawer />
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

export const wrapRootElement = ({ element }) => (
  <UiProvider>
    <AppProvider>
      <InnerApp element={element} />
    </AppProvider>
  </UiProvider>
);

wrapRootElement.propTypes = {
  element: PropTypes.node.isRequired,
};
