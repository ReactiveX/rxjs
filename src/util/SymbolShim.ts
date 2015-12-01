import {root} from './root';

if (!root.Symbol) {
  root.Symbol = {};
}

if (!root.Symbol.observable) {
  if (typeof root.Symbol.for === 'function') {
    root.Symbol.observable = root.Symbol.for('observable');
  } else {
    root.Symbol.observable = '@@observable';
  }
}

if (!root.Symbol.iterator) {
  if (typeof root.Symbol.for === 'function') {
    root.Symbol.iterator = root.Symbol.for('iterator');
  } else if (root.Set && typeof new root.Set()['@@iterator'] === 'function') {
    // Bug for mozilla version
    root.Symbol.iterator = '@@iterator';
  } else if (root.Map) {
    // es6-shim specific logic
    let keys = Object.getOwnPropertyNames(root.Map.prototype);
    for (let i = 0; i < keys.length; ++i) {
      let key = keys[i];
      if (key !== 'entries' && key !== 'size' && root.Map.prototype[key] === root.Map.prototype['entries']) {
        root.Symbol.iterator = key;
        break;
      }
    }
  } else {
    root.Symbol.iterator = '@@iterator';
  }
}

if (!root.Symbol.dispose) {
  if (typeof root.Symbol.for === 'function') {
    root.Symbol.dispose = root.Symbol.for('dispose');
  } else {
    root.Symbol.dispose = '@@dispose';
  }
}

export module SymbolShim {
  export const observable: symbol = root.Symbol.observable;
  export const iterator: symbol = root.Symbol.iterator;
  export const dispose: symbol = root.Symbol.dispose;
};