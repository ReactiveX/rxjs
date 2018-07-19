import { isObserver } from "rxjs/internal/util/isObserver";
import { expect } from "chai";

describe('isObserver', () => {
  it('should pass for fully flushed-out Observers', () => {
    const o = {
      next() { /* noop */ },
      error() { /* noop */ },
      complete() { /* noop */ },
    };

    expect(isObserver(o)).to.be.true;
  });

  it('should fail for partial observers', () => {
    const o = {
      next() { /* noop */ },
      complete() { /* noop */ },
    };

    expect(isObserver(o)).to.be.false;
  });


  it('should fail for partial observers', () => {
    const o = {
      error() { /* noop */ },
    };

    expect(isObserver(o)).to.be.false;
  });

  it('should fail for null', () => {
    expect(isObserver(null)).to.be.false;
  });

  it('should fail for undefined', () => {
    expect(isObserver(null)).to.be.false;
  });
});
