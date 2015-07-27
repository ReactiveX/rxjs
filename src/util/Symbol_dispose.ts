import {root} from './root';

if (!root.Symbol) {
  root.Symbol = {};
}

if (!root.Symbol.dispose) {
  if (typeof root.Symbol.for === 'function') {
    root.Symbol.dispose = root.Symbol.for('dispose');
  } else {
    root.Symbol.dispose = '@@dispose';
  }  
}

export default root.Symbol.dispose;