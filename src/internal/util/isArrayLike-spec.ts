import { expect } from "chai";
import { isArrayLike } from "./isArrayLike";

describe('isArrayLike', () => {
  it('should pass for an ArrayLike', () => {
    const obj = {
      length: 1
    };
    expect(isArrayLike(obj)).to.be.true;
  });

  it('should fail for any object without a length', () => {
    const obj = {};
    expect(isArrayLike(obj)).to.be.false;
  });

  it('should fail for functions', () => {
    const fn = () => {/* noop */};
    expect(isArrayLike(fn)).to.be.false;
  });

  it('should fail for null', () => {
    expect(isArrayLike(null)).to.be.false;
  });

  it('should pass for strings', () => {
    expect(isArrayLike('test')).to.be.true;
  });

  it('should fail for numbers', () => {
    expect(isArrayLike(1337)).to.be.false;
  });
})
