// import get from 'lodash/get';
// import find from 'lodash/find';
// import * as time from 'd3-time';
// import { timeFormat } from 'd3-time-format';
// import set from 'lodash/set';
// import remove from 'lodash/remove';

export class EpochFusion {
  name = undefined;

  part1 = undefined;

  part2 = undefined;

  createdAt = undefined;

  xLatestAbsDiff = undefined;

  yLatestAbsDiff = undefined;

  xEpochAbsDiff = undefined;

  yEpochAbsDiff = undefined;

  createdAt = undefined;

  tick = undefined;

  constructor(name, part1, part2, createdAt, tick) {
    this.name = name;
    this.part1 = part1;
    this.part2 = part2;
    this.createdAt = createdAt;
    this.tick = tick;
  }

  absDifferenceLatestXCoor() {
    this.xLatestAbsDiff = Math.abs(
      this.part1.x[this.part1.x.length - 1] -
        this.part2.x[this.part2.x.length - 1],
    );
    return this.xLatestAbsDiff;
  }

  absDifferenceLatestYCoor() {
    this.yLatestAbsDiff = Math.abs(
      this.part1.y[this.part1.y.length - 1] -
        this.part2.y[this.part2.y.length - 1],
    );
    return this.yLatestAbsDiff;
  }

  absDifferenceEpochXCoor() {
    this.xEpochAbsDiff = Math.abs(
      this.part1.getMeanX() - this.part2.getMeanX(),
    );
    return this.xEpochAbsDiff;
  }

  absDifferenceEpochYCoor() {
    this.yEpochAbsDiff = Math.abs(
      this.part1.getMeanY() - this.part2.getMeanY(),
    );
    return this.yEpochAbsDiff;
  }

  absDifferenceLatestYThreshold(threshold, callback) {
    if (this.absDifferenceLatestYCoor() > threshold) {
      callback({
        msg: `Bad (${this.name})`,
        value: this.yLatestAbsDiff.toFixed(2),
        status: 'bad',
      });
    } else {
      callback({
        msg: `Good (${this.name})`,
        value: this.yLatestAbsDiff.toFixed(2),
        status: 'good',
      });
    }
  }

  absDifferenceEpochYThreshold(threshold, callback) {
    if (this.absDifferenceEpochYCoor() > threshold) {
      callback({
        msg: `Bad (${this.name}) EPOCH MODE`,
        value: this.yEpochAbsDiff.toFixed(2),
        status: 'bad',
      });
    } else {
      callback({
        msg: `Good (${this.name}) EPOCH MODE`,
        value: this.yEpochAbsDiff.toFixed(2),
        status: 'good',
      });
    }
  }

  // data looks like
  // const data = [
  //   {x: 0, y: 8},
  //        ...
  //   {x: 9, y: 0}
  // ];
  printAbsDifferenceLatestYCoor(state, callback, chartTime) {
    const copyArr = [...state];
    // eslint-disable-next-line no-console
    if (copyArr.length >= 50) {
      copyArr.shift();
    }
    copyArr.push({
      x: chartTime,
      y: this.absDifferenceLatestYCoor().toFixed(2),
    });
    callback(copyArr);
  }

  logData() {
    this.absDifferenceLatestXCoor();
    this.absDifferenceLatestYCoor();
    // eslint-disable-next-line no-console
    console.log({
      name: this.name,
      createdAt: new Date(this.createdAt).toISOString(),
      tick: this.tick,
      xLatestAbsDiff: this.xLatestAbsDiff,
      yLatestAbsDiff: this.yLatestAbsDiff,
    });
  }
}
