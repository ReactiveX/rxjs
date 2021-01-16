/** @prettier */
import { ignoreElements, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of } from 'rxjs';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {ignoreElements} */
describe('ignoreElements', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should ignore all the elements of the source', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--|');
      const e1subs = '  ^-------------!';
      const expected = '--------------|';

      expectObservable(e1.pipe(ignoreElements())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing early and explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--|');
      const e1subs = '  ^------!       ';
      const expected = '--------       ';
      const unsub = '   -------!       ';

      const result = e1.pipe(ignoreElements());

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing early and explicitly with higher order', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--d--|');
      const e1subs = '  ^------!       ';
      const expected = '--------       ';
      const unsub = '   -------!       ';

      const result = e1.pipe(
        mergeMap((x) => of(x)),
        ignoreElements(),
        mergeMap((x) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should propagate errors from the source', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--#');
      const e1subs = '  ^----!';
      const expected = '-----#';

      expectObservable(e1.pipe(ignoreElements())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle empty', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';

      expectObservable(e1.pipe(ignoreElements())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle never', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '  ^';
      const expected = '-';

      expectObservable(e1.pipe(ignoreElements())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should handle throw', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('  #  ');
      const e1subs = '  (^!)';
      const expected = '#   ';

      expectObservable(e1.pipe(ignoreElements())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
