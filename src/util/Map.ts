import { root } from './root';

export default root.Map || (function() {
    function Map() {
      this.size = 0;
      this._values = [];
      this._keys = [];
    }

    Map.prototype['delete'] = function (key) {
      let i = this._keys.indexOf(key);
      if (i === -1) { return false; }
      this._values.splice(i, 1);
      this._keys.splice(i, 1);
      this.size--;
      return true;
    };

    Map.prototype.get = function (key) {
      let i = this._keys.indexOf(key);
      return i === -1 ? undefined : this._values[i];
    };

    Map.prototype.set = function (key, value) {
      let i = this._keys.indexOf(key);
      if (i === -1) {
        this._keys.push(key);
        this._values.push(value);
        this.size++;
      } else {
        this._values[i] = value;
      }
      return this;
    };

    Map.prototype.forEach = function (cb, thisArg) {
      for (let i = 0; i < this.size; i++) {
        cb.call(thisArg, this._values[i], this._keys[i]);
      }
    };

    return Map;
  }());