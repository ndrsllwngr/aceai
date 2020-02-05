import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  FlexibleXYPlot,
  // XAxis,
  // YAxis,
  // HorizontalGridLines,
  // VerticalGridLines,
  LineSeries,
  AreaSeries,
} from 'react-vis';

export const Graph = ({
  data,
  // width, height,
  yDomain,
  loading,
}) => {
  const [showGraph] = useState(true);
  return (
    <>
      {showGraph === true &&
        (loading ? (
          <>Loading...</>
        ) : (
          <FlexibleXYPlot
            yDomain={yDomain}
            margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
          >
            {/* <HorizontalGridLines />
            <VerticalGridLines /> */}
            {/* <XAxis
              attr="x"
              attrAxis="y"
              orientation="bottom"
              // eslint-disable-next-line react/jsx-no-bind
              tickFormat={function tickFormat(d) {
                return new Date(d).toLocaleTimeString();
              }}
              tickLabelAngle={-60}
            />
            <YAxis /> */}
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
          </FlexibleXYPlot>
        ))}
    </>
  );
};

Graph.propTypes = {
  data: PropTypes.array,
  // width: PropTypes.number,
  // height: PropTypes.number,
  yDomain: PropTypes.array,
  loading: PropTypes.bool,
};
