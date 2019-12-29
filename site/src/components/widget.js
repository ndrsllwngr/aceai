import React from 'react';
import PropTypes from 'prop-types';

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
        className="flex flex-col justify-between p-6 h-full bg-white rounded-lg shadow"
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
