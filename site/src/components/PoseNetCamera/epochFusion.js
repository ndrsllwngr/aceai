// import get from 'lodash/get';
import find from 'lodash/find';
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
  // [
  //   {
  //     "id": "japan",
  //     "color": "hsl(22, 70%, 50%)",
  //     "data": [
  //       {
  //         "x": "plane",
  //         "y": 212
  //       },
  //       ...
  //     ],
  //   },
  // ]
  printAbsDifferenceLatestYCoor(state, callback, timeStamp, color = '#000000') {
    const copy = [...state];
    const date = new Date();
    // eslint-disable-next-line no-console
    // console.log({ copy, state });
    let chartObj = find(copy, { id: this.name });
    if (chartObj === undefined) {
      chartObj = {
        id: `${this.name}`,
        color,
        data: [],
      };
      copy.push(chartObj);
    }
    const dataArr = chartObj.data;
    if (dataArr.length >= 20) {
      dataArr.shift();
    }
    dataArr.push({
      x: date,
      y: this.absDifferenceLatestYCoor().toFixed(2),
    });
    callback(copy);
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
