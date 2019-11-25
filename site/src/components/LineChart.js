import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { Line } from 'react-chartjs-2';
import { PaperSheet } from './PaperSheet';

import 'chartjs-plugin-streaming';

export const LineChart = ({ data, part }) => {
  return (
    <PaperSheet>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="start"
        justifyContent="space-between"
        minWidth="300px"
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
          POSTURE CHART ({part})
        </Typography>
        <Line
          type="line"
          data={{
            datasets: [
              {
                label: 'Math.abs (left and right shoulder)',
                data,
                borderColor: '#0099ff',
                backgroundColor: '#afd9ff',
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
            tooltips: false,
            legend: {
              display: false,
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
      </Box>
    </PaperSheet>
  );
};

LineChart.propTypes = {
  data: PropTypes.array.isRequired,
  part: PropTypes.string.isRequired,
};
