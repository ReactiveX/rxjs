/** @prettier */
import { expect } from 'chai';
import { TestScheduler } from 'rxjs/testing';
import { pairs } from 'rxjs';
import { observableMatcher } from '../helpers/observableMatcher';

describe('pairs', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should create an observable emits key-value pair', () => {
    rxTestScheduler.run(({ expectObservable }) => {
      const e1 = pairs({ a: 1, b: 2 });
      const expected = '(ab|)';
      const values = {
        a: ['a', 1],
        b: ['b', 2],
      };

      expectObservable(e1).toBe(expected, values);
    });
  });

  it('should create an observable without scheduler', (done) => {
    let expected = [
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ];

    pairs({ a: 1, b: 2, c: 3 }).subscribe({
      next: (x) => {
        expect(x).to.deep.equal(expected.shift());
      },
      error: (x) => {
        done(new Error('should not be called'));
      },
      complete: () => {
        expect(expected).to.be.empty;
        done();
      },
    });
  });

  it('should work with empty object', () => {
    rxTestScheduler.run(({ expectObservable }) => {
      const e1 = pairs({});
      const expected = '|';

      expectObservable(e1).toBe(expected);
    });
  });
});
