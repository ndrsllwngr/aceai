import React from 'react';
import PropTypes from 'prop-types';

export const TimerComponent = ({ title, timer }) => {
  return (
    <>
      <span className="camera-time-value">
        {timer.getTimeValues().toString()}
      </span>
      <span className="camera-time-label">{title}</span>
    </>
  );
};

TimerComponent.propTypes = {
  title: PropTypes.string,
  timer: PropTypes.any,
};
