import { isObservableLike } from 'rxjs/internal/util/isObservableLike';
import { expect } from 'chai';

describe('isObservableLike', () => {
  it('should pass for subscribable objects', () => {
    const o = {
      subscribe() { /* noop */ },
    };
    expect(isObservableLike(o)).to.be.true;
  });

  it('should fail for null', () => {
    expect(isObservableLike(null)).to.be.false;
  });

  it('should fail for undefined', () => {
    expect(isObservableLike(undefined)).to.be.false;
  });
});
