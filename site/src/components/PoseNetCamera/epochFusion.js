// import get from 'lodash/get';

export class EpochFusion {
  name = undefined;

  part1 = undefined;

  part2 = undefined;

  createdAt = undefined;

  xLatestDiff = undefined;

  yLatestDiff = undefined;

  constructor(name, part1, part2, createdAt) {
    this.name = name;
    this.part1 = part1;
    this.part2 = part2;
    this.createdAt = createdAt;
  }

  absDifferenceLatestXCoor() {
    this.xLatestDiff = Math.abs(
      this.part1.x[this.part1.x.length - 1] -
        this.part2.x[this.part2.x.length - 1],
    );
    return this.xLatestDiff;
  }

  absDifferenceLatestYCoor() {
    this.yLatestDiff = Math.abs(
      this.part1.y[this.part1.y.length - 1] -
        this.part2.y[this.part2.y.length - 1],
    );
    return this.yLatestDiff;
  }

  absDifferenceLatestYThreshold(threshold, callback) {
    if (this.absDifferenceLatestYCoor() > threshold) {
      callback({
        msg: `Bad (${this.name})`,
        value: this.yLatestDiff.toFixed(2),
        status: 'bad',
      });
    } else {
      callback({
        msg: `Good (${this.name})`,
        value: this.yLatestDiff.toFixed(2),
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
}
