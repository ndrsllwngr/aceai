/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/ssr-apis/
 */

// TODO keep gatsby-browser.js identical
import React from 'react';
import PropTypes from 'prop-types';
import { InnerApp } from './src/components/InnerApp';
import { UiProvider } from './src/components/context-ui';
import { AppProvider } from './src/components/context-app';
import './src/pages/app.css';

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
