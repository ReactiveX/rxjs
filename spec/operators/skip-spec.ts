import { expect } from 'chai';
import { skip, mergeMap, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';
import { of, Observable } from 'rxjs';

/** @test {skip} */
describe('skip', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should skip values before a total', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--d--e--|');
      const subs = '      ^----------------!';
      const expected = '  -----------d--e--|';

      expectObservable(source.pipe(skip(3))).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should skip all values without error if total is more than actual number of values', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--d--e--|');
      const subs = '      ^----------------!';
      const expected = '  -----------------|';

      expectObservable(source.pipe(skip(6))).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should skip all values without error if total is same as actual number of values', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--d--e--|');
      const subs = '      ^----------------!';
      const expected = '  -----------------|';

      expectObservable(source.pipe(skip(5))).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should not skip if count is zero', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--d--e--|');
      const subs = '      ^----------------!';
      const expected = '  --a--b--c--d--e--|';

      expectObservable(source.pipe(skip(0))).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should not skip if count is negative value', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('--a--b--c--d--e--|');
      const subs = '       ^----------------!';
      const expected = '   --a--b--c--d--e--|';

      expectObservable(source.pipe(skip(-42))).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--d--e--|');
      const unsub = '     ----------!       ';
      const subs = '      ^---------!       ';
      const expected = '  --------c--       ';

      expectObservable(source.pipe(skip(2)), unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--d--e--|');
      const subs = '      ^---------!       ';
      const expected = '  --------c--       ';
      const unsub = '     ----------!       ';

      const result = source.pipe(
        mergeMap((x: string) => of(x)),
        skip(2),
        mergeMap((x: string) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should raise error if skip count is more than actual number of emits and source raises error', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--d--#');
      const subs = '      ^-------------!';
      const expected = '  --------------#';

      expectObservable(source.pipe(skip(6))).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should raise error if skip count is same as emits of source and source raises error', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--d--#');
      const subs = '      ^-------------!';
      const expected = '  --------------#';

      expectObservable(source.pipe(skip(4))).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should skip values before a total and raises error if source raises error', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--d--#');
      const subs = '      ^-------------!';
      const expected = '  -----------d--#';

      expectObservable(source.pipe(skip(3))).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });

  it('should complete regardless of skip count if source is empty', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |');
      const e1subs = '  (^!)';
      const expected = '|';

      expectObservable(e1.pipe(skip(3))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not complete if source never completes without emit', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  -');
      const e1subs = '  ^';
      const expected = '-';

      expectObservable(e1.pipe(skip(3))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should skip values before total and never completes if source emits and does not complete', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c-');
      const e1subs = '  ^         ';
      const expected = '-----b--c-';

      expectObservable(e1.pipe(skip(1))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should skip all values and never completes if total is more than numbers of value and source does not complete', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c-');
      const e1subs = '  ^         ';
      const expected = '----------';

      expectObservable(e1.pipe(skip(6))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should skip all values and never completes if total is same asnumbers of value and source does not complete', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c-');
      const e1subs = '  ^         ';
      const expected = '----------';

      expectObservable(e1.pipe(skip(3))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error if source throws', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #');
      const e1subs = '  (^!)';
      const expected = '#';

      expectObservable(e1.pipe(skip(3))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should stop listening to a synchronous observable when unsubscribed', () => {
    const sideEffects: number[] = [];
    const synchronousObservable = new Observable<number>(subscriber => {
      // This will check to see if the subscriber was closed on each loop
      // when the unsubscribe hits (from the `take`), it should be closed
      for (let i = 0; !subscriber.closed && i < 10; i++) {
        sideEffects.push(i);
        subscriber.next(i);
      }
    });

    synchronousObservable.pipe(
      skip(1),
      take(2),
    ).subscribe(() => { /* noop */ });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
