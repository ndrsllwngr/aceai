import get from 'lodash/get';

export class EpochPart {
  part = '';

  x = [];

  y = [];

  xSum = undefined;

  ySum = undefined;

  xMean = undefined;

  yMean = undefined;

  constructor(part, createdAt) {
    this.part = part;
    this.createdAt = createdAt;
  }

  addX(val) {
    this.x.push(val);
  }

  addY(val) {
    this.y.push(val);
  }

  extractCoordinates(data) {
    // console.log('extractCoordinates', data);
    const partData = data.filter(obj => obj.part === this.part)[0];
    this.addX(get(partData, `position.x`));
    this.addY(get(partData, `position.y`));
  }

  getSumX() {
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    // eslint-disable-next-line no-unused-vars
    this.xSum = this.x.reduce(reducer);
    return this.xSum;
  }

  getSumY() {
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    // eslint-disable-next-line no-unused-vars
    this.ySum = this.y.reduce(reducer);
    return this.ySum;
  }

  getMeanX() {
    if (!this.sumX) {
      this.getSumX();
    }
    this.xMean = this.xSum / this.x.length;
    return this.xMean;
  }

  getMeanY() {
    if (!this.sumY) {
      this.getSumY();
    }
    this.yMean = this.ySum / this.y.length;
    return this.yMean;
  }

  logData() {
    this.getMeanX();
    this.getMeanY();
    // eslint-disable-next-line no-console
    console.log({
      part: this.part,
      createdAt: this.createdAt,
      x: this.x,
      y: this.y,
      xSum: this.xSum,
      ySum: this.ySum,
      xMean: this.xMean,
      yMean: this.yMean,
    });
  }
}
