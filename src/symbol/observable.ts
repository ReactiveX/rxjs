import {root} from '../util/root';

const Symbol = root.Symbol;

export let $$observable: symbol;

if (typeof Symbol === 'function') {
  if (Symbol.observable) {
    $$observable = Symbol.observable;
  } else {
    if (typeof Symbol.for === 'function') {
      $$observable = Symbol.for('observable');
    } else {
      $$observable = Symbol('observable');
    }
    Symbol.observable = $$observable;
  }
} else {
  $$observable = <any>'@@observable';
}
