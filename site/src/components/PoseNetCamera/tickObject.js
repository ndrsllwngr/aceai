// import get from 'lodash/get';
// import find from 'lodash/find';
// import * as time from 'd3-time';
// import { timeFormat } from 'd3-time-format';
// import set from 'lodash/set';
// import remove from 'lodash/remove';

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

  logData() {
    // this.absDifferenceLatestXCoor();
    // this.absDifferenceLatestYCoor();
    // eslint-disable-next-line no-console
    console.log({
      tick: this.tick,
      name: this.name,
      angleOfVector: this.angleOfVector,
      lengthOfVector: this.lengthOfVector,
      differenceX: this.differenceX,
      differenceY: this.differenceY,
      rightPoint: this.rightPoint,
      leftPoint: this.leftPoint,
      createdAt: this.createdAt,
    });
    // console.log({
    //   name: this.name,
    //   createdAt: new Date(this.createdAt).toISOString(),
    //   tick: this.tick,
    //   point1: this.point1,
    //   point2: this.point2,
    //   angle: this.angle,
    // });
  }
}
