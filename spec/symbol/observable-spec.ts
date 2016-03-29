import {expect} from 'chai';
import {root} from '../../dist/cjs/util/root';
import {$$observable} from '../../dist/cjs/symbol/observable';

describe('rxSubscriber symbol', () => {
  it('should exist in the proper form', () => {
    const Symbol = root.Symbol;
    if (typeof Symbol === 'function') {
      expect(Symbol.observable).exist;
      expect($$observable).to.equal(Symbol.observable);
    } else {
      expect($$observable).to.equal('@@observable');
    }
  });
});