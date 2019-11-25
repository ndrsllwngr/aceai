/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fade from '@material-ui/core/Fade';
import { PaperSheet } from './PaperSheet';

export const VideoCanvas = ({ videoHeight, videoWidth, loading }) => {
  return (
    <PaperSheet customStyle={{ overflow: 'hidden', padding: '0' }}>
      <Box height={videoHeight} width={videoWidth}>
        <video
          id="video"
          playsInline
          style={{ transform: 'scaleX(-1)', display: 'none' }}
        ></video>
        <Fade
          in={loading}
          style={{
            transitionDelay: loading ? '100ms' : '0ms',
          }}
          unmountOnExit
        >
          <Box position="fixed">
            <Box
              display="flex"
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              height={videoHeight}
              width={videoWidth}
            >
              <CircularProgress color="primary" />
            </Box>
          </Box>
        </Fade>
        <canvas id="output" />
      </Box>
    </PaperSheet>
  );
};

VideoCanvas.propTypes = {
  videoHeight: PropTypes.number.isRequired,
  videoWidth: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
};
