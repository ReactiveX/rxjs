import {root} from './root';

export class SymbolDefinition {
  observable: symbol = null;
  iterator: symbol = null;

  private applyObservable(): symbol {
    const root = this.root;

    if (!root.Symbol.observable) {
      if (typeof root.Symbol.for === 'function') {
        root.Symbol.observable = root.Symbol.for('observable');
      } else {
        root.Symbol.observable = '@@observable';
      }
    }

    return root.Symbol.observable;
  }

  private applyIterator(): symbol {
    const root = this.root;

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

    return root.Symbol.iterator;
  }

  constructor(private root: any) {
    if (!root.Symbol) {
      root.Symbol = {};
    }

    this.observable = this.applyObservable();
    this.iterator = this.applyIterator();
  }
}
export const SymbolShim = new SymbolDefinition(root);