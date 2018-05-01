import { of } from "./of";
import { expect } from "chai";
import { defer } from './defer';

describe('defer', () => {
  it('should create an observable from a deferred call to a function', () => {
    const results: any[] = [];
    let called = false;

    const source = defer(() => {
      called = true;
      return of(1, 2, 3);
    });

    expect(called).to.be.false;

    source.subscribe({
      next(value) { results.push(value); },
      complete() { results.push('done'); },
    });

    expect(results).to.deep.equal([1, 2, 3, 'done']);
    expect(called).to.be.true;
  });
});
