import React from 'react';
import PropTypes from 'prop-types';
import { ResponsiveLine } from '@nivo/line';
// import { curveMonotoneX } from 'd3-shape';
// import * as time from 'd3-time';

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
export const NewLineChart = ({ data }) => {
  return (
    <ResponsiveLine
      data={data}
      width="400"
      height="400"
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      // xScale={{ type: 'point' }}
      // yScale={{ type: 'linear', stacked: true, min: 'auto', max: 'auto' }}
      xScale={{ type: 'time', format: 'native' }}
      yScale={{ type: 'linear', max: 100 }}
      animate={false}
      motionStiffness={120}
      enableSlices={false}
      motionDamping={50}
      isInteractive={false}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        orient: 'bottom',
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'time',
        legendOffset: 36,
        legendPosition: 'middle',
        format: '%H:%M:%S',
      }}
      axisLeft={{
        orient: 'left',
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: 'score',
        legendOffset: -40,
        legendPosition: 'middle',
      }}
      colors={{ scheme: 'nivo' }}
      curve="monotoneX"
      enableGridX
      enablePoints={false}
      pointSize={10}
      pointColor={{ theme: 'background' }}
      pointBorderWidth={2}
      pointBorderColor={{ from: 'serieColor' }}
      pointLabel="y"
      pointLabelYOffset={-12}
      useMesh
      legends={[
        {
          anchor: 'bottom-right',
          direction: 'column',
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: 'left-to-right',
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: 'circle',
          symbolBorderColor: 'rgba(0, 0, 0, .5)',
          effects: [
            {
              on: 'hover',
              style: {
                itemBackground: 'rgba(0, 0, 0, .03)',
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
    />
  );
};

NewLineChart.propTypes = {
  data: PropTypes.array.isRequired,
};
