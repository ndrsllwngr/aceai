import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Box } from 'rebass';

export const Widget = ({ title, tags, caption = undefined, children }) => {
  return (
    <div>
      <Flex
        display="flex"
        backgroundColor="#ffffff"
        padding="2rem"
        flexDirection="column"
        justifyContent="space-between"
      >
        <Box>
          <Box>
            <h5 className="bp3-heading">{title}</h5>
            {tags}
          </Box>
          {caption && <p>{caption}</p>}
        </Box>
        {children}
      </Flex>
    </div>
  );
};

Widget.propTypes = {
  title: PropTypes.string,
  tags: PropTypes.node,
  caption: PropTypes.string,
  children: PropTypes.node,
};
