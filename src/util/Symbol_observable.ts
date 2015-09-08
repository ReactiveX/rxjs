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

export default root.Symbol.observable;