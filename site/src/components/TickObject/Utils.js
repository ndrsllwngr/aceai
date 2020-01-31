/* eslint-disable no-console */
import get from 'lodash/get';

export function extractPointObj(partName, data) {
  const keypoints = get(data, `poseData.keypoints`);
  const partData = keypoints.filter(obj => obj.part === partName)[0];
  return {
    x: get(partData, `position.x`),
    y: get(partData, `position.y`),
  };
}

export function getTimeWindowData(tickArray, timeWindowInMs, tickTimeStamp) {
  let timeWindowData = [];
  const momentInPast = new Date(tickTimeStamp - timeWindowInMs);
  // eslint-disable-next-line no-plusplus
  for (let i = tickArray.length - 1; i >= 0; i--) {
    const object = tickArray[i];
    const momentOfObject = new Date(object.createdAt);
    if (momentOfObject < momentInPast) {
      timeWindowData = tickArray.slice(i + 1);
      break;
    }
  }
  return timeWindowData;
}

export function calcMeanForTimeWindow(timeWindowData) {
  return (
    timeWindowData
      .map(obj => Math.abs(obj.angleOfVector))
      .reduce((pv, cv) => pv + cv, 0) / timeWindowData.length
  );
}

export function calcMedianForTimeWindow(timeWindowData) {
  const revisedData = timeWindowData.map(obj => Math.abs(obj.angleOfVector));
  let result = 0;
  if (revisedData.length === 0) {
    // console.log(result);
    return result;
  }

  // eslint-disable-next-line func-names
  revisedData.sort(function(a, b) {
    return a - b;
  });

  const half = Math.floor(revisedData.length / 2);
  if (revisedData.length % 2) {
    result = revisedData[half];
    // console.log(result);
    return result;
  }
  result = (revisedData[half - 1] + revisedData[half]) / 2.0;
  // console.log(result);
  return result;
}
