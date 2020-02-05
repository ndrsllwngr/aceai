import React from 'react';
import PropTypes from 'prop-types';
import { Chart } from 'react-google-charts';

export const timelineModel = [
  { type: 'string', id: 'Source' },
  { type: 'string', id: 'Status' },
  { type: 'string', id: 'style', role: 'style' },
  { type: 'datetime', id: 'Start' },
  { type: 'datetime', id: 'End' },
];

export const Timeline = ({ data }) => {
  return (
    <Chart
      width="100%"
      // height="300px"
      chartType="Timeline"
      loader={<div>Loading Chart</div>}
      data={data}
      rootProps={{ 'data-testid': '3' }}
    />
  );
};

Timeline.propTypes = {
  data: PropTypes.array,
};
