/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';
import PropTypes from 'prop-types';
import { Box } from 'rebass';
import { Spinner, Collapse } from '@blueprintjs/core';
import { Widget } from './widget';
import { useUi } from './_context-ui';

export const VideoCanvas = ({ videoHeight, videoWidth, loading }) => {
  const [uiContext] = useUi();

  return (
    <Widget
      title={uiContext.videoCanvasIsOpen ? 'Camera' : 'Camera is hidden.'}
      // caption="including PoseNet data"
      style={{
        position: 'fixed',
        bottom: '1rem',
        left: '1rem',
        height: 'auto',
      }}
    >
      <div
        style={{
          overflow: 'hidden',
          padding: '0',
          backgroundColor: '#f4f4f4',
        }}
      >
        <Collapse
          isOpen={uiContext.videoCanvasIsOpen}
          keepChildrenMounted
          transitionDuration={200}
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
            <canvas
              id="output"
              style={{
                display: uiContext.videoCanvasIsOpen ? 'block' : 'none',
              }}
            />
          </Box>
        </Collapse>
      </div>
    </Widget>
  );
};

VideoCanvas.propTypes = {
  videoHeight: PropTypes.number.isRequired,
  videoWidth: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
};
