// import get from 'lodash/get';

export class EpochFusion {
  name = undefined;

  part1 = undefined;

  part2 = undefined;

  createdAt = undefined;

  xLatestAbsDiff = undefined;

  yLatestAbsDiff = undefined;

  xEpochAbsDiff = undefined;

  yEpochAbsDiff = undefined;

  constructor(name, part1, part2, createdAt) {
    this.name = name;
    this.part1 = part1;
    this.part2 = part2;
    this.createdAt = createdAt;
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

  // TODO fix plotting performance
  printAbsDifferenceLatestYCoor(state, callback, timeStamp) {
    const copy = [...state];
    copy.push({
      x: timeStamp,
      y: this.absDifferenceLatestYCoor().toFixed(2),
    });
    if (copy.length > 19) {
      const copySliced = copy.slice(copy.length - 20, copy.length);
      callback(copySliced);
    } else {
      callback(copy);
    }
  }

  logData() {
    this.absDifferenceLatestXCoor();
    this.absDifferenceLatestYCoor();
    // eslint-disable-next-line no-console
    console.log({
      name: this.name,
      createdAt: this.createdAt,
      xLatestAbsDiff: this.xLatestAbsDiff,
      yLatestAbsDiff: this.yLatestAbsDiff,
    });
  }
}
