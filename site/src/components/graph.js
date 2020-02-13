import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FlexibleXYPlot, LineSeries, AreaSeries } from 'react-vis';

export const Graph = React.memo(({ data, yDomain, loading, color }) => {
  const [showGraph] = useState(true);
  return (
    <>
      {showGraph === true &&
        (loading ? (
          <></>
        ) : (
          <FlexibleXYPlot
            yDomain={yDomain}
            margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
          >
            <AreaSeries
              data={data}
              opacity={0.25}
              stroke="transparent"
              color={color}
              style={{}}
            />
            <LineSeries
              curve={null}
              data={data}
              opacity={1}
              stroke={color}
              strokeStyle="solid"
              style={{}}
            />
          </FlexibleXYPlot>
        ))}
    </>
  );
});

Graph.propTypes = {
  data: PropTypes.array,
  yDomain: PropTypes.array,
  loading: PropTypes.bool,
  color: PropTypes.string,
};
