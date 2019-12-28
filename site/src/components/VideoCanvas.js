/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';
import PropTypes from 'prop-types';
import { Box } from 'rebass';
import { Spinner } from '@blueprintjs/core';

export const VideoCanvas = ({ videoHeight, videoWidth, loading }) => {
  return (
    <div
      style={{ overflow: 'hidden', padding: '0', backgroundColor: '#f4f4f4' }}
    >
      <Box height={videoHeight} width={videoWidth}>
        <video
          id="video"
          playsInline
          style={{ transform: 'scaleX(-1)', display: 'none' }}
        ></video>
        {loading && (
          <Box position="fixed">
            <Box
              display="flex"
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              height={videoHeight}
              width={videoWidth}
            >
              <Spinner intent="none" size={50} />
            </Box>
          </Box>
        )}
        <canvas id="output" />
      </Box>
    </div>
  );
};

VideoCanvas.propTypes = {
  videoHeight: PropTypes.number.isRequired,
  videoWidth: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
};
