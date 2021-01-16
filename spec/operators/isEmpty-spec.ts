/** @prettier */
import { isEmpty, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of } from 'rxjs';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {isEmpty} */
describe('isEmpty', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should return true if source is empty', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -----|   ');
      const e1subs = '  ^----!   ';
      const expected = '-----(T|)';

      expectObservable(e1.pipe(isEmpty())).toBe(expected, { T: true });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should return false if source emits element', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--|');
      const e1subs = '     ^--!   ';
      const expected = '   ---(F|)';

      expectObservable(e1.pipe(isEmpty())).toBe(expected, { F: false });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error if source raises error', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --#');
      const e1subs = '  ^-!';
      const expected = '--#';

      expectObservable(e1.pipe(isEmpty())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not complete if source never emits', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '  ^';
      const expected = '-';

      expectObservable(e1.pipe(isEmpty())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should return true if source is empty', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const expected = '(T|)';

      expectObservable(e1.pipe(isEmpty())).toBe(expected, { T: true });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -----------a--b--|');
      const e1subs = '  ^-----!           ';
      const expected = '-------           ';
      const unsub = '   ------!           ';

      expectObservable(e1.pipe(isEmpty()), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -----------a--b--|');
      const e1subs = '  ^-----!           ';
      const expected = '-------           ';
      const unsub = '   ------!           ';

      const result = e1.pipe(
        mergeMap((x) => of(x)),
        isEmpty(),
        mergeMap((x) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
