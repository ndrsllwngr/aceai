import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box } from 'rebass';
import {
  XYPlot,
  XAxis,
  YAxis,
  HorizontalGridLines,
  VerticalGridLines,
  LineSeries,
  AreaSeries,
} from 'react-vis';
import { Button } from 'carbon-components-react';

import View20 from '@carbon/icons-react/lib/view/20';
import ViewOff20 from '@carbon/icons-react/lib/view--off/20';

export const Graph = ({ data, width, height, yDomain, loading }) => {
  const [showGraph, setShowGraph] = useState(false);
  return (
    <>
      {showGraph === true &&
        (loading ? (
          <>Loading...</>
        ) : (
          <XYPlot
            width={width}
            height={height}
            yDomain={yDomain}
            margin={{ bottom: 100 }}
          >
            <HorizontalGridLines />
            <VerticalGridLines />
            <XAxis
              attr="x"
              attrAxis="y"
              orientation="bottom"
              // eslint-disable-next-line react/jsx-no-bind
              tickFormat={function tickFormat(d) {
                return new Date(d).toLocaleTimeString();
              }}
              tickLabelAngle={-60}
            />
            <YAxis />
            <AreaSeries
              data={data}
              opacity={0.25}
              stroke="transparent"
              style={{}}
            />
            <LineSeries
              curve={null}
              data={data}
              opacity={1}
              stroke="#12939a"
              strokeStyle="solid"
              style={{}}
            />
          </XYPlot>
        ))}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
        }}
      >
        <Button onClick={() => setShowGraph(!showGraph)}>
          {showGraph ? (
            <>
              <ViewOff20 className="graph-icon"></ViewOff20>
              Hide graph
            </>
          ) : (
            <>
              <View20 className="graph-icon"></View20>
              Show graph
            </>
          )}
        </Button>
      </Box>
    </>
  );
};

Graph.propTypes = {
  data: PropTypes.array,
  width: PropTypes.number,
  height: PropTypes.number,
  yDomain: PropTypes.array,
  loading: PropTypes.bool,
};
