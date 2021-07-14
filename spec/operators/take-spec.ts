/** @prettier */
import { expect } from 'chai';
import { merge, Observable, of, Subject } from 'rxjs';
import { mergeMap, take, tap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {take} */
describe('take', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should take two values of an observable with many values', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --a-----b----c---d--|');
      const e1subs = '  ^-------!------------';
      const expected = '--a-----(b|)         ';

      expectObservable(e1.pipe(take(2))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should work with empty', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |');
      const e1subs = '  (^!)';
      const expected = '|';

      expectObservable(e1.pipe(take(42))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should go on forever on never', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '  ^';
      const expected = '-';

      expectObservable(e1.pipe(take(42))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should be empty on take(0)', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b----c---d--|');
      const e1subs: string[] = []; // Don't subscribe at all
      const expected = '   |';

      expectObservable(e1.pipe(take(0))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should be empty if provided with negative value', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --a-----b----c---d--|');
      const expected = '|';
      const e1subs: string[] = []; // Don't subscribe at all

      expectObservable(e1.pipe(take(-42))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should take one value of an observable with one value', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---(a|)');
      const e1subs = '  ^--!---';
      const expected = '---(a|)';

      expectObservable(e1.pipe(take(1))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should take one values of an observable with many values', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b----c---d--|');
      const e1subs = '     ^--!------------';
      const expected = '   ---(b|)         ';

      expectObservable(e1.pipe(take(1))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should error on empty', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^----|');
      const e1subs = '     ^----!';
      const expected = '   -----|';

      expectObservable(e1.pipe(take(42))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should propagate error from the source observable', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^---#', undefined, 'too bad');
      const e1subs = '   ^---!';
      const expected = ' ----#';

      expectObservable(e1.pipe(take(42))).toBe(expected, null, 'too bad');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should propagate error from an observable with values', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^--a--b--#');
      const e1subs = '   ^--------!';
      const expected = ' ---a--b--#';

      expectObservable(e1.pipe(take(42))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^--a--b-----c--d--e--|');
      const unsub = '    ---------!------------';
      const e1subs = '   ^--------!------------';
      const expected = ' ---a--b---            ';

      expectObservable(e1.pipe(take(42)), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should work with throw', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #');
      const e1subs = '  (^!)';
      const expected = '#';

      expectObservable(e1.pipe(take(42))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^--a--b-----c--d--e--|');
      const unsub = '    ---------!            ';
      const e1subs = '   ^--------!            ';
      const expected = ' ---a--b---            ';

      const result = e1.pipe(
        mergeMap((x: string) => of(x)),
        take(42),
        mergeMap((x: string) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should unsubscribe from the source when it reaches the limit', () => {
    const source = new Observable<number>((observer) => {
      expect(observer.closed).to.be.false;
      observer.next(42);
      expect(observer.closed).to.be.true;
    }).pipe(take(1));

    source.subscribe();
  });

  it('should complete when the source is reentrant', () => {
    let completed = false;
    const source = new Subject<void>();
    source.pipe(take(5)).subscribe({
      next() {
        source.next();
      },
      complete() {
        completed = true;
      },
    });
    source.next();
    expect(completed).to.be.true;
  });

  it('should stop listening to a synchronous observable when unsubscribed', () => {
    const sideEffects: number[] = [];
    const synchronousObservable = new Observable<number>((subscriber) => {
      // This will check to see if the subscriber was closed on each loop
      // when the unsubscribe hits (from the `take`), it should be closed
      for (let i = 0; !subscriber.closed && i < 10; i++) {
        sideEffects.push(i);
        subscriber.next(i);
      }
    });

    synchronousObservable.pipe(take(3)).subscribe(() => {
      /* noop */
    });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });

  it('should complete even if the parameter is a string', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' --a-----b----c---d--|');
      const e1subs = '  ^-------!------------';
      const expected = '--a-----(b|)         ';

      expectObservable(e1.pipe(take('2' as any))).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  // This is related to a PR with discussion here: https://github.com/ReactiveX/rxjs/pull/6396
  // We can't fix this until version 8.
  it.skip('should unsubscribe from the source when it reaches the limit before a recursive synchronous upstream error is notified', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const subject = new Subject();
      const e1 = cold(' (a|)');
      const e1subs = '  (^!)';
      const expected = '(a|)';

      const result = merge(e1, subject).pipe(
        take(1),
        tap(() => subject.error('error'))
      );

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
