import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Position } from '@blueprintjs/core';

export const states = {
  NEUTRAL: 'gray',
  SUCCESS: 'green',
  WARNING: 'yellow',
  DANGER: 'red',
};

export const Tile = React.memo(
  ({
    name,
    value,
    status = states.SUCCESS,
    minimal = false,
    description,
    background,
  }) => {
    return (
      <div
        className={`w-full h-full rounded-lg overflow-hidden shadow-xl bg-gradient-${
          status === states.WARNING ? 'orange' : status
        }`}
      >
        <div className="relative">
          {background && (
            <div className="absolute top-0 left-0 bottom-0 right-0 rounded-lg overflow-hidden">
              {background}
            </div>
          )}
          <div className="w-full h-full top-0 left-0">
            <div
              className={`rounded-lg shadow-xl text-center pt-${
                minimal ? '6' : '12'
              } pb-6`}
            >
              {minimal === false && (
                <div
                  className={`leading-none font-number mb-6 text-5xl text-${status}-500`}
                >
                  {value}
                </div>
              )}
              <div className="flex flex-row justify-center items-center">
                <Tooltip content={description} position={Position.BOTTOM}>
                  <div className={`font-semibold text-${status}-700`}>
                    {name}
                  </div>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

Tile.propTypes = {
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  status: PropTypes.oneOf([states]),
  minimal: PropTypes.bool,
  description: PropTypes.string,
  background: PropTypes.node,
};
