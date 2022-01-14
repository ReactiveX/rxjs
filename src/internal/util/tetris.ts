export class Tetris<T extends any> {
  private readonly arrays: Array<Array<T>>;
  private readonly lastEmissionIndices: Array<number>;

  constructor(readonly columns: number = 2) {
    this.arrays = new Array<Array<T>>();
    this.lastEmissionIndices = new Array<number>(columns);
    for (let i = 0; i < columns; i++) {
      this.arrays[i] = new Array<T>();
      this.lastEmissionIndices[i] = -1;
    }
  }

  getNext(): Array<T> {
    const next = new Array<T>();
    if (!this.hasNext()) {
      return [];
    }
    for (let column = 0; column < this.columns; column++) {
      if (this._hasNewIn(column)) {
        delete this.arrays[column][this.lastEmissionIndices[column]];
        this.lastEmissionIndices[column] += 1;
      }
      next.push(this.arrays[column][this.lastEmissionIndices[column]]);
    }
    return next;
  }

  private _hasNewIn(column: number): boolean {
    if (this.lastEmissionIndices[column] < this.arrays[column].length - 1) {
      return true;
    }
    return false;
  }

  hasNext(): boolean {
    let hasNext: boolean = false;
    for (let column = 0; column < this.columns; column++) {
      if (this.arrays[column].length === 0) {
        return false;
      }
      hasNext = hasNext || this._hasNewIn(column);
    }
    return hasNext;
  }

  pushToColumn(column: number, value: T): Tetris<T> {
    this.arrays[column].push(value);
    return this;
  }
}
