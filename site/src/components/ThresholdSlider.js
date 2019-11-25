import React from 'react';
import PropTypes from 'prop-types';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { PaperSheet } from './PaperSheet';

export const ThresholdSlider = ({
  maxWidth,
  threshold,
  setThreshold,
  part,
}) => {
  const handleSliderChange = (event, newValue) => {
    setThreshold(newValue);
  };

  return (
    <PaperSheet>
      <Box
        display="flex"
        alignItems="start"
        flexDirection="column"
        justifyContent="space-between"
        maxWidth={maxWidth}
      >
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
          Threshold ({part})
        </Typography>
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          minWidth="300px"
          width="100%"
        >
          <Slider
            value={typeof threshold === 'number' ? threshold : 0}
            onChange={handleSliderChange}
            aria-labelledby="input-slider"
            valueLabelDisplay="auto"
          />
        </Box>
      </Box>
    </PaperSheet>
  );
};

ThresholdSlider.propTypes = {
  maxWidth: PropTypes.number.isRequired,
  threshold: PropTypes.number.isRequired,
  setThreshold: PropTypes.func.isRequired,
  part: PropTypes.string.isRequired,
};
