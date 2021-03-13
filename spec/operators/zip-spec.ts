/** @prettier */
import { zip } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {zip} */
describe('zip', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should work with non-empty observable and non-empty iterable selector that throws', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const a = hot('---^--1--2--3--|');
      const asubs = '   ^-----!';
      const expected = '---x--#';
      const b = [4, 5, 6];

      const selector = function (x: string, y: number) {
        if (y === 5) {
          throw new Error('too bad');
        } else {
          return x + y;
        }
      };
      expectObservable(a.pipe(zip(b, selector))).toBe(expected, { x: '14' }, new Error('too bad'));
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });
  });
});
