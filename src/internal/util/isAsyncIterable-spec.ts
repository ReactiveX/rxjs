import { isAsyncIterable } from 'rxjs/internal/util/isAsyncIterable';
import { expect } from 'chai';
import { symbolAsyncIterator } from 'rxjs/internal/util/symbolAsyncIterator';

describe('isAsyncIterable', () => {
  it('should pass for any object with an Symbol.asyncIterator', () => {
    const obj = {
      [symbolAsyncIterator]() {}
    };

    expect(isAsyncIterable(obj)).to.be.true;
  });

  if (Symbol && Symbol.asyncIterator) {
    // Currently still a proposal, but implemented in a few browsers
    // https://github.com/tc39/proposal-async-iteration
    it('should pass for async generators', () => {
      async function* createGen() {
        yield 'wee';
      }
      const gennifer = createGen();

      expect(isAsyncIterable(gennifer));
    });
  }

  it('should fail for plain objects', () => {
    expect(isAsyncIterable({})).to.be.false;
  });

  it('should fail for non-async iterators', () => {
    function* createGen() {
      yield 'whoa';
    }
    const gennette = createGen();

    expect(isAsyncIterable(gennette)).to.be.false;
  });
});
