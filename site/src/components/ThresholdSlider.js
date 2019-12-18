import React from 'react';
import PropTypes from 'prop-types';
import { Slider } from 'carbon-components-react';

export const ThresholdSlider = ({ threshold = 0, setThreshold, part }) => {
  const handleSliderChange = (event, newValue) => {
    setThreshold(newValue);
  };

  return (
    <Slider
      ariaLabelInput="Label for slider value"
      disabled={false}
      hideTextInput={false}
      id="slider"
      inputType="number"
      labelText={`Threshold (${part})`}
      light={false}
      max={100}
      maxLabel=""
      min={0}
      minLabel=""
      name=""
      onChange={handleSliderChange}
      onRelease={handleSliderChange}
      step={1}
      stepMuliplier={4}
      value={threshold}
    />
  );
};

ThresholdSlider.propTypes = {
  threshold: PropTypes.number.isRequired,
  setThreshold: PropTypes.func.isRequired,
  part: PropTypes.string.isRequired,
};
