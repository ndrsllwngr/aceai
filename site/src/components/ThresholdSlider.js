import React from 'react';
import PropTypes from 'prop-types';
import Slider from '@material-ui/core/Slider';
import Input from '@material-ui/core/Input';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import { PaperSheet } from './PaperSheet';

const useStyles = makeStyles({
  root: {
    width: 250,
  },
  input: {
    width: 42,
  },
});

export const ThresholdSlider = ({
  maxWidth,
  threshold,
  setThreshold,
  children,
}) => {
  const classes = useStyles();
  const handleSliderChange = (event, newValue) => {
    setThreshold(newValue);
  };

  const handleInputChange = event => {
    setThreshold(event.target.value === '' ? '' : Number(event.target.value));
  };

  const handleBlur = () => {
    if (threshold < 0) {
      setThreshold(0);
    } else if (threshold > 100) {
      setThreshold(100);
    }
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
          Threshold ({children})
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
            style={{ marginRight: '50px' }}
          />
          <Input
            className={classes.input}
            value={threshold}
            margin="dense"
            onChange={handleInputChange}
            onBlur={handleBlur}
            inputProps={{
              step: 10,
              min: 0,
              max: 100,
              type: 'number',
              'aria-labelledby': 'input-slider',
            }}
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
  children: PropTypes.any,
};
