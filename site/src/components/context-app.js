import React, { useContext, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

export const initialState = {
  // GLOBAL
  global_videoWidth: 343,
  global_videoHeight: 242,
  global_logging: false,
  global_openDrawer: true,
  // CALIBRATION
  calibration_calibrationDataAvailable: false,
  // POSENET
  posenet_turnedOn: false,
  posenet_loading: false,
  posenet_running: false,
  posenet_webcamAvailable: false,
  posenet_charts: true,
  posenet_measurement: 'median',
  posenet_threshold: 0,
  // EPOCH
  epoch_epochMode: true,
  epoch_epochCount: 100,
  // TIMER
  timer_timeUntilBadPosture: 10,
  // THRESHOLD
  threshold_body: 12, // maybe 8
  threshold_head: 8,
  threshold_height: 10,
  threshold_distance: 20,
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
