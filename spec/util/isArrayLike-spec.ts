import { expect } from 'chai';
import { isArrayLike } from 'rxjs/internal/util/isArrayLike';

describe('isArrayLike', () => {
  it('should return true for new Array', () => {
    const a = new Array();
    expect(isArrayLike(a)).to.be.true;
    expect(isArrayLike([])).to.be.true;
  });

  it('should return false for a function', () => {
    expect(isArrayLike(() => {
      // noop
    })).to.be.false;
  });

  it('should return false for a string', () => {
    expect(isArrayLike('1')).to.be.false;
  });

  it('should return false for null', () => {
    expect(isArrayLike(null)).to.be.false;
  });

  it('should return false for undefined', () => {
    expect(isArrayLike(undefined)).to.be.false;
  });

  it('should return false for boolean', () => {
    expect(isArrayLike(true)).to.be.false;
    expect(isArrayLike(false)).to.be.false;
  });

  it('should return false for an object where property length is NOT of type number', () => {
    const o = {length: "foo"};
    expect(isArrayLike(o)).to.be.false;
  });
});
