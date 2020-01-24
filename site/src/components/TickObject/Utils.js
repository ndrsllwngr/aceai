/* eslint-disable no-console */
import get from 'lodash/get';
import TickObject from './index';

export function extractPointObj(partName, data) {
  const keypoints = get(data, `poseData.keypoints`);
  const partData = keypoints.filter(obj => obj.part === partName)[0];
  return {
    x: get(partData, `position.x`),
    y: get(partData, `position.y`),
  };
}

function median(array) {
  const values = [...array];
  // console.log(array);
  if (values.length === 0) return 0;

  // eslint-disable-next-line func-names
  values.sort(function(a, b) {
    return a - b;
  });

  const half = Math.floor(values.length / 2);

  if (values.length % 2) return values[half];

  return (values[half - 1] + values[half]) / 2.0;
}

export function getCalibrationMedianTickObject(name, tickArray) {
  const values = [...tickArray];
  const leftPoints = { x: [], y: [] };
  const rightPoints = { x: [], y: [] };
  for (let i = 0; i < values.length; i += 1) {
    leftPoints.x.push(get(values[i], 'leftPoint.x'));
    leftPoints.y.push(get(values[i], 'leftPoint.y'));
    rightPoints.x.push(get(values[i], 'rightPoint.x'));
    rightPoints.y.push(get(values[i], 'rightPoint.y'));
  }
  const leftPoint = { x: median(leftPoints.x), y: median(leftPoints.y) };
  const rightPoint = { x: median(rightPoints.x), y: median(rightPoints.y) };
  return new TickObject(
    name,
    Date.now(),
    values.length,
    leftPoint,
    rightPoint,
    // get(calibrationData, 'shoulder'),
  );
}

export function calcMeanForTimeWindow(
  tickArray,
  timeWindowInMs,
  tickTimeStamp,
) {
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
  // console.log(timeWindowData.length);
  return (
    timeWindowData
      .map(obj => Math.abs(obj.angleOfVector))
      .reduce((pv, cv) => pv + cv, 0) / timeWindowData.length
  );
}

export function calcMedianForTimeWindow(
  tickArray,
  timeWindowInMs,
  tickTimeStamp,
) {
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
