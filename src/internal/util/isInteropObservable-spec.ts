import { isInteropObservable } from "rxjs/internal/util/isInteropObservable";
import { expect } from "chai";
import { symbolObservable } from 'rxjs/internal/util/symbolObservable';

describe('isInteropObservable', () => {
  it('should pass for objects with Symbol.observable', () => {
    const obj = {
      [symbolObservable]() { /* noop */ },
    };

    expect(isInteropObservable(obj)).to.be.true;
  });

  it('should fail for objects that are just subscribables', () => {
    const obj = {
      subscribe() { /* noop */ },
    };

    expect(isInteropObservable(obj)).to.be.false;
  });
});
