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
  // EPOCH
  epoch_epochMode: false,
  epoch_epochCount: 50,
  epoch_timeWindowMeanInMilliseconds: 20000,
  // TIMER
  timer_timeUntilBadPosture: 5,
  // THRESHOLD
  threshold_body: 15,
  threshold_head: 7,
  threshold_height: 5,
  threshold_distance: 10,
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
