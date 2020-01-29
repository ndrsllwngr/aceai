import get from 'lodash/get';

export class TickObject {
  name = undefined;

  createdAt = undefined;

  tick = undefined;

  leftPoint = {
    x: undefined,
    y: undefined,
  };

  rightPoint = {
    x: undefined,
    y: undefined,
  };

  angleOfVector = undefined;

  lengthOfVector = undefined;

  differenceX = undefined;

  differenceY = undefined;

  meanX = undefined;

  meanY = undefined;

  // deviationToCalibratedDifferenceX = undefined;

  constructor(name, createdAt, tick, leftPoint, rightPoint) {
    this.name = name;
    this.createdAt = createdAt;
    this.tick = tick;
    this.leftPoint = leftPoint;
    this.rightPoint = rightPoint;
    this.angleOfVector = this.calcAngleOfVector();
    this.lengthOfVector = this.calcLenghtOfVector();
    this.differenceX = this.calcDifferenceX();
    this.differenceY = this.calcDifferenceY();
    this.meanX = this.calcMeanX();
    this.meanY = this.calcMeanY();
    // if (calibrationData) {
    //   this.deviationToCalibratedDifferenceX = this.calcDeviationToCalibratedDifferenceX(
    //     calibrationData,
    //   );
    // }
  }

  calcAngleOfVector() {
    return (
      (Math.atan2(
        this.rightPoint.y - this.leftPoint.y,
        this.rightPoint.x - this.leftPoint.x,
      ) *
        180) /
      Math.PI
    );
  }

  calcMeanX() {
    return (this.leftPoint.x + this.rightPoint.x) / 2;
  }

  calcMeanY() {
    return (this.leftPoint.y + this.rightPoint.y) / 2;
  }

  calcLenghtOfVector() {
    let xs = this.rightPoint.x - this.leftPoint.x;
    let ys = this.rightPoint.y - this.leftPoint.y;

    xs *= xs;
    ys *= ys;

    return Math.sqrt(xs + ys);
  }

  calcDifferenceX() {
    return this.rightPoint.x - this.leftPoint.x;
  }

  calcDifferenceY() {
    return this.rightPoint.y - this.leftPoint.y;
  }

  // can be used as testimony for a change in sitting distance
  // calcDeviationToCalibratedDifferenceX(calibrationData) {
  //   return this.differenceX - calibrationData.differenceX;
  // }

  logData() {
    // this.absDifferenceLatestXCoor();
    // this.absDifferenceLatestYCoor();
    // eslint-disable-next-line no-console
    console.log(this);
  }
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
