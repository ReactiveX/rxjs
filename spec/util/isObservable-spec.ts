import { Observable, isObservable } from 'rxjs';
import { expect } from 'chai';

describe('isObservable', () => {
  it('should return true for RxJS Observable', () => {
    const o = new Observable<any>();
    expect(isObservable(o)).to.be.true;
  });

  it('should return true for an observable that comes from another RxJS 5+ library', () => {
    const o: any = {
      lift() { /* noop */ },
      subscribe() { /* noop */ },
    };

    expect(isObservable(o)).to.be.true;
  });

  it('should NOT return true for any old subscribable', () => {
    const o: any = {
      subscribe() { /* noop */ },
    };

    expect(isObservable(o)).to.be.false;
  });

  it('should return false for null', () => {
    expect(isObservable(null)).to.be.false;
  });

  it('should return false for a number', () => {
    expect(isObservable(1)).to.be.false;
  });

});
