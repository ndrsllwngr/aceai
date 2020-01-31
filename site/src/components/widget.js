import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, Position } from '@blueprintjs/core';
import { motion } from 'framer-motion';

export const Widget = ({
  title,
  tags,
  caption = undefined,
  children,
  style,
}) => {
  return (
    <>
      <div
        className="flex flex-col justify-between p-6 h-full bg-white rounded shadow"
        style={{
          ...style,
        }}
      >
        <div>
          <div className="flex flex-row justify-start">
            <h5 className="bp3-heading">{title}</h5>
            <div>{tags}</div>
          </div>
          {caption && <p>{caption}</p>}
        </div>
        {children}
      </div>
    </>
  );
};

Widget.propTypes = {
  title: PropTypes.string,
  tags: PropTypes.node,
  caption: PropTypes.string,
  children: PropTypes.node,
  style: PropTypes.object,
};

export const states = {
  NEUTRAL: 'gray',
  SUCCESS: 'green',
  WARNING: 'yellow',
  DANGER: 'red',
};

export const WidgetModern = ({
  name,
  value,
  status = states.NEUTRAL,
  minimal = false,
  description,
}) => {
  return (
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
      <div
        className={`rounded-lg shadow-xl text-center pt-${
          minimal ? '6' : '12'
        } pb-6 bg-gradient-${status === states.WARNING ? 'orange' : status}`}
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
            <div className={`font-semibold text-${status}-700`}>{name}</div>
          </Tooltip>
        </div>
      </div>
    </motion.div>
  );
};

WidgetModern.propTypes = {
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  status: PropTypes.oneOf([states]),
  minimal: PropTypes.bool,
  description: PropTypes.string,
};
