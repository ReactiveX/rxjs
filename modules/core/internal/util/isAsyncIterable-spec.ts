import { isAsyncIterable } from "./isAsyncIterable";
import { expect } from "chai";

describe('isAsyncIterable', () => {
  before(() => {
    if (!Symbol.asyncIterator) {
      (Symbol as any).asyncIterator = Symbol('test polyfill asyncIterator');
    }
  });

  it('should pass for any object with an Symbol.asyncIterator', () => {
    const obj = {
      [Symbol.asyncIterator]() {}
    };

    expect(isAsyncIterable(obj)).to.be.true;
  });

  it('should pass for async generators', () => {
    async function* createGen() {
      yield 'wee';
    }
    const gennifer = createGen();

    expect(isAsyncIterable(gennifer));
  });

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
