import { of, isObservable } from 'rxjs';
import { expect } from 'chai';

describe('isObservable', () => {
  it('should identify a library Observable', () => {
    expect(isObservable(of(1, 2, 3))).to.be.true;
  });

  it('should return false for plain functions', () => {
    expect(isObservable(() => { /* stub */ })).to.be.false;
  });

  it('should return false for a simple object with subscribe', () => {
    expect(isObservable({ subscribe() { /* stub */ } })).to.be.false;
  });
});
