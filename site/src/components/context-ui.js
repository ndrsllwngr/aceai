import React, { useContext, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

const emptyState = {
  videoCanvasIsOpen: false,
  drawerSettingsIsOpen: false,
  drawerNavigationIsOpen: false,
  toasterRef: React.createRef(),
  showNotificationInApp: true,
  showNotificationBrowser: false,
};

const UiContext = React.createContext();

export function UiProvider({ children }) {
  const [uiContext, setUiContext] = useState(emptyState);
  const value = useMemo(() => [uiContext, setUiContext], [uiContext]);
  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

UiProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useUi() {
  const context = useContext(UiContext);
  if (!context) {
    throw new Error(`useUi must be used within a UiProvider`);
  }
  return context;
}
