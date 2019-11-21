import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { StatusIcon } from './StatusIcon';
import { PaperSheet } from './PaperSheet';

export const PostureStatus = ({ maxWidth, msg, value, status }) => {
  return (
    <PaperSheet>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        maxWidth={maxWidth}
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="start"
          justifyContent="space-between"
          minWidth="300px"
        >
          <>
            <Typography
              variant="overline"
              display="block"
              style={{
                fontSize: '11px',
                lineHeight: '13px',
                letterSpacing: '0.33px',
                marginBottom: '8px',
                color: '#546e7a',
              }}
            >
              {msg}
            </Typography>
            <Typography
              variant="h6"
              style={{
                fontSize: '24px',
                lineHeight: '28px',
                letterSpacing: '-0.06px',
                color: '#222222',
              }}
            >
              {value}
            </Typography>
          </>
        </Box>
        <StatusIcon status={status}></StatusIcon>
      </Box>
    </PaperSheet>
  );
};

PostureStatus.propTypes = {
  maxWidth: PropTypes.number.isRequired,
  msg: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  status: PropTypes.string.isRequired,
};
