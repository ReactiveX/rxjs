import {root} from '../../dist/cjs/util/root';
import {$$observable} from '../../dist/cjs/symbol/observable';

describe('rxSubscriber symbol', () => {
  it('should exist in the proper form', () => {
    const Symbol = root.Symbol;
    if (typeof Symbol === 'function') {
      expect(Symbol.observable).toBeDefined();
      expect($$observable).toBe(Symbol.observable);
    } else {
      expect($$observable).toBe('@@observable');
    }
  });
});