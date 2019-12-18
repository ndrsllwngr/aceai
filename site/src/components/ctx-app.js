import React, { useContext, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

const emptyState = {
  videoWidth: 343,
  videoHeight: 242,
  loading: false,
  webCam: false,
  charts: true,
  consoleLog: false,
  openDrawer: true,
  epochMode: false,
  epochCount: 50,
  median: true,
  timeWindowMeanInMilliseconds: 20000,
};

const AppContext = React.createContext();

export function AppProvider({ children }) {
  const [appContext, setAppContext] = useState(emptyState);
  const value = useMemo(() => [appContext, setAppContext], [appContext]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error(`useApp must be used within a AppProvider`);
  }
  return context;
}
