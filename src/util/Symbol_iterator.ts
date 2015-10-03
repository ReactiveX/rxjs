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
  } else {
    root.Symbol.iterator = '_es6shim_iterator_';
  }
}

export default root.Symbol.iterator;

// // Shim in iterator support
// export var $iterator$ = (typeof Symbol === 'function' && Symbol.iterator) || '_es6shim_iterator_';

// // Bug for mozilla version
// if (root.Set && typeof new root.Set()['@@iterator'] === 'function') {
//     $iterator$ = '@@iterator';
// }
