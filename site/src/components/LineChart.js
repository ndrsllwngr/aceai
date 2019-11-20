import React from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import { PaperSheet } from './PaperSheet';

import 'chartjs-plugin-streaming';

export const LineChart = ({ data }) => {
  return (
    <PaperSheet>
      <Line
        type="line"
        data={{
          datasets: [
            {
              label: 'Math.abs (left and right shoulder)',
              data,
            },
          ],
        }}
        options={{
          scales: {
            xAxes: [
              {
                type: 'realtime',
              },
            ],
          },
        }}
        scales={{
          xAxes: [
            {
              type: 'realtime',
              realtime: {
                duration: 20000,
                refresh: 1000,
                delay: 2000,
              },
            },
          ],
          yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: 'value',
              },
            },
          ],
        }}
      />
    </PaperSheet>
  );
};

LineChart.propTypes = {
  data: PropTypes.array.isRequired,
};
