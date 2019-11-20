import React, { useContext, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

const emptyState = {
  webCam: false,
};

const WebcamContext = React.createContext();

export function WebcamProvider({ children }) {
  const [webcamContext, setWebcamContext] = useState(emptyState);
  const value = useMemo(() => [webcamContext, setWebcamContext], [
    webcamContext,
  ]);
  return (
    <WebcamContext.Provider value={value}>{children}</WebcamContext.Provider>
  );
}

WebcamProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useWebcam() {
  const context = useContext(WebcamContext);
  if (!context) {
    throw new Error(`useWebcam must be used within a WebcamProvider`);
  }
  return context;
}
