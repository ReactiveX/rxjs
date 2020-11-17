import { combineLatest } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {combineLatest} */
describe('combineLatest', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should accept array of observables', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--|');
      const e1subs = '     ^--------!';
      const e2 = hot('---e-^---f--g--|');
      const e2subs = '     ^---------!';
      const e3 = hot('---h-^----i--j-|');
      const e3subs = '     ^---------!';
      const expected = '   -----wxyz-|';

      const result = e1.pipe(combineLatest([e2, e3], (x: string, y: string, z: string) => x + y + z));

      expectObservable(result).toBe(expected, { w: 'bfi', x: 'cfi', y: 'cgi', z: 'cgj' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });
});