import { isIterable } from "./isIterable";
import { expect } from 'chai';

describe('isIterable', () => {
  it('should pass for an object with Symbol.iterator', () => {
    const obj = {
      [Symbol.iterator]() { /* noop */ },
    };

    expect(isIterable(obj)).to.be.true;
  });

  it('should pass for a string', () => {
    expect(isIterable('weee')).to.be.true;
  });


  it('should fail for a plain object', () => {
    expect(isIterable({})).to.be.false;
  });
});
