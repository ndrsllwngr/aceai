/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';
import PropTypes from 'prop-types';
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
          <div style={{ height: videoHeight, width: videoWidth }}>
            <video
              id="video"
              playsInline
              style={{ transform: 'scaleX(-1)', display: 'none' }}
            ></video>
            {loading && (
              <div className="fixed">
                <div
                  className="flex flex-row items-center justify-center"
                  style={{ height: videoHeight, width: videoWidth }}
                >
                  <Spinner intent="none" size={50} />
                </div>
              </div>
            )}
            <canvas
              id="output"
              style={{
                display: uiContext.videoCanvasIsOpen ? 'block' : 'none',
              }}
            />
          </div>
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
