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
