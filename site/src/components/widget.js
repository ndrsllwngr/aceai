import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Box } from 'rebass';

export const Widget = ({
  title,
  tags,
  caption = undefined,
  children,
  style,
}) => {
  return (
    <>
      <Flex
        display="flex"
        backgroundColor="#ffffff"
        padding="1.5rem"
        flexDirection="column"
        justifyContent="space-between"
        style={{
          boxShadow:
            '0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -2px rgba(0,0,0,.05)',
          borderRadius: '0.5rem',
          height: '100%',
          ...style,
        }}
      >
        <Box>
          <Flex flexDirection="row" justifyContent="flex-start">
            <h5 className="bp3-heading">{title}</h5>
            <div>{tags}</div>
          </Flex>
          {caption && <p>{caption}</p>}
        </Box>
        {children}
      </Flex>
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
