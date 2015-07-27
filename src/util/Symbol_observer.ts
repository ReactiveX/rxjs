import {root} from './root';

if (!root.Symbol) {
  root.Symbol = {};
}

if (!root.Symbol.observer) {
  if (typeof root.Symbol.for === 'function') {
    root.Symbol.observer = root.Symbol.for('observer');
  } else {
    root.Symbol.observer = '@@observer';
  }
}

export default root.Symbol.observer;