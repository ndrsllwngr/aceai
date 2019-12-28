import React, { useContext, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

export const initialState = {
  videoWidth: 343,
  videoHeight: 242,
  loading: false,
  webCam: false,
  charts: true,
  consoleLog: false,
  openDrawer: true,
  epochMode: false,
  epochCount: 50,
  thresholdFrontViewBody: 15,
  thresholdFrontViewHead: 7,
  measure: 'median',
  timeWindowMeanInMilliseconds: 20000,
};

const AppContext = React.createContext();

export function AppProvider({ children }) {
  const [appContext, setAppContext] = useState(initialState);
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
