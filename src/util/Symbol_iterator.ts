import {root} from './root';

if (!root.Symbol) {
  root.Symbol = {};
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

export const $$iterator = root.Symbol.iterator;

// // Shim in iterator support
// export var $iterator$ = (typeof Symbol === 'function' && Symbol.iterator) || '_es6shim_iterator_';

// // Bug for mozilla version
// if (root.Set && typeof new root.Set()['@@iterator'] === 'function') {
//     $iterator$ = '@@iterator';
// }
