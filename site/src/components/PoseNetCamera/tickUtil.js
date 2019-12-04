import get from 'lodash/get';

export function extractPointObj(partName, data) {
  const keypoints = get(data, `poseData.keypoints`);
  const partData = keypoints.filter(obj => obj.part === partName)[0];
  return {
    x: get(partData, `position.x`),
    y: get(partData, `position.y`),
  };
}
