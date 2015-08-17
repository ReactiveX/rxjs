export default class FastMap {
  size: number = 0;
  private _values: Object = {};
  
  delete(key: string): boolean {
    this._values[key] = null;
    return true;
  }
  
  set(key: string, value: any): FastMap {
    this._values[key] = value;
    return this;
  }
  
  get(key: string): any {
    return this._values[key];
  }
  
  forEach(cb, thisArg) {
    const values = this._values;
    for (let key in values) {
      if (values.hasOwnProperty(key)) {
        cb.call(thisArg, values[key], key);
      }
    }
  }
  
  clear() {
    this._values = {};
  }
}