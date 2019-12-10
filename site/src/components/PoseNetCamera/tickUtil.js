import get from 'lodash/get';

export function extractPointObj(partName, data) {
  const keypoints = get(data, `poseData.keypoints`);
  const partData = keypoints.filter(obj => obj.part === partName)[0];
  return {
    x: get(partData, `position.x`),
    y: get(partData, `position.y`),
  };
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
  // eslint-disable-next-line no-console
  // console.log(timeWindowData.length);
  return (
    timeWindowData
      .map(obj => Math.abs(obj.angleOfVector))
      .reduce((pv, cv) => pv + cv, 0) / timeWindowData.length
  );
}
