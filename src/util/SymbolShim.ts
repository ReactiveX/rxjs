import {root} from './root';

export function polyfillSymbol(root) {
  const Symbol = ensureSymbol(root);
  ensureIterator(Symbol, root);
  ensureObservable(Symbol);
  ensureFor(Symbol);
  return Symbol;
}

export function ensureFor(Symbol) {
  if (!Symbol.for) {
    Symbol.for = symbolForPolyfill;
  }
}

let id = 0;

export function ensureSymbol(root) {
  if (!root.Symbol) {
    root.Symbol = function symbolFuncPolyfill(description) {
      return `@@Symbol(${description}):${id++}`;
    };
  }
  return root.Symbol;
}

export function symbolForPolyfill(key) {
  return '@@' + key;
}

export function ensureIterator(Symbol, root) {
  if (!Symbol.iterator) {
    if (typeof Symbol.for === 'function') {
      Symbol.iterator = Symbol.for('iterator');
    } else if (root.Set && typeof new root.Set()['@@iterator'] === 'function') {
      // Bug for mozilla version
      Symbol.iterator = '@@iterator';
    } else if (root.Map) {
      // es6-shim specific logic
      let keys = Object.getOwnPropertyNames(root.Map.prototype);
      for (let i = 0; i < keys.length; ++i) {
        let key = keys[i];
        if (key !== 'entries' && key !== 'size' && root.Map.prototype[key] === root.Map.prototype['entries']) {
          Symbol.iterator = key;
          break;
        }
      }
    } else {
      Symbol.iterator = '@@iterator';
    }
  }
}

export function ensureObservable(Symbol) {
  if (!Symbol.observable) {
    if (typeof Symbol.for === 'function') {
      Symbol.observable = Symbol.for('observable');
    } else {
      Symbol.observable = '@@observable';
    }
  }
}

export const SymbolShim = polyfillSymbol(root);