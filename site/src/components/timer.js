import React from 'react';
import PropTypes from 'prop-types';

export const TimerComponent = ({ title, timer }) => {
  return (
    <>
      <div className="flex flex-col items-center">
        <span className="camera-time-value">
          {timer
            .getTimeValues()
            .toString(['hours', 'minutes', 'seconds', 'secondTenths'])}
        </span>
        <span className="camera-time-label">{title}</span>
      </div>
    </>
  );
};

TimerComponent.propTypes = {
  title: PropTypes.string,
  timer: PropTypes.any,
};
