import { isInteropObservable } from "rxjs/internal/util/isInteropObservable";
import { expect } from "chai";

describe('isInteropObservable', () => {
  before(() => {
    if (!Symbol.observable) {
      (Symbol as any).observable = Symbol('test polyfill observable');
    }
  });

  it('should pass for objects with Symbol.observable', () => {
    const obj = {
      [Symbol.observable]() { /* noop */ },
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
