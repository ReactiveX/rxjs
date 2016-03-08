import {root} from '../../dist/cjs/util/root';
import {$$iterator} from '../../dist/cjs/symbol/iterator';

describe('rxSubscriber symbol', () => {
  it('should exist in the proper form', () => {
    const Symbol = root.Symbol;
    if (typeof Symbol === 'function') {
      if (Symbol.iterator) {
        expect($$iterator).toBe(Symbol.iterator);
      } else if (root.Set && typeof (new root.Set()['@@iterator']) === 'function') {
        // FF bug coverage
        expect($$iterator).toBe('@@iterator');
      } else if (root.Map) {
        // es6-shim specific logic
        let keys = Object.getOwnPropertyNames(root.Map.prototype);
        for (let i = 0; i < keys.length; ++i) {
          let key = keys[i];
          if (key !== 'entries' && key !== 'size' && root.Map.prototype[key] === root.Map.prototype['entries']) {
            expect($$iterator).toBe(key);
            break;
          }
        }
      } else if (typeof Symbol.for === 'function') {
        expect($$iterator).toBe(Symbol.for('iterator'));
      }
    } else {
      expect($$iterator).toBe('@@iterator');
    }
  });
});