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
        padding="2rem"
        flexDirection="column"
        justifyContent="space-between"
        style={{
          boxShadow: '0 1px 3px 0 rgba(0,0,0,.1), 0 1px 2px 0 rgba(0,0,0,.06)',
          borderRadius: '0.5rem',
          ...style,
        }}
      >
        <Box>
          <Flex flexDirection="row" justifyContent="space-between">
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
