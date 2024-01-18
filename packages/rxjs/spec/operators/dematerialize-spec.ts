import { expect } from 'chai';
import type { ObservableNotification} from 'rxjs';
import { of, Observable } from 'rxjs';
import { COMPLETE_NOTIFICATION, errorNotification, nextNotification } from '@rxjs/observable';
import { dematerialize, map, mergeMap, materialize, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {dematerialize} */
describe('dematerialize', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should dematerialize an Observable', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: '{x}',
        b: '{y}',
        c: '{z}',
        d: '|',
      };

      const e1 = hot('  --a--b--c--d-|', values);
      const e1subs = '  ^----------!  ';
      const expected = '--x--y--z--|  ';

      const result = e1.pipe(
        map((x: string) => {
          if (x === '|') {
            return COMPLETE_NOTIFICATION;
          } else {
            return nextNotification(x.replace('{', '').replace('}', ''));
          }
        }),
        dematerialize()
      );

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should dematerialize a happy stream', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: nextNotification('w'),
        b: nextNotification('x'),
        c: nextNotification('y'),
        d: COMPLETE_NOTIFICATION,
      };

      const e1 = hot('  --a--b--c--d--|', values);
      const e1subs = '  ^----------!   ';
      const expected = '--w--x--y--|   ';

      expectObservable(e1.pipe(dematerialize())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should dematerialize a sad stream', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: nextNotification('w'),
        b: nextNotification('x'),
        c: nextNotification('y'),
        d: errorNotification('error'),
      };

      const e1 = hot('  --a--b--c--d--|', values);
      const e1subs = '  ^----------!   ';
      const expected = '--w--x--y--#   ';

      expectObservable(e1.pipe(dematerialize())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should dematerialize stream does not completes', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot<ObservableNotification<any>>('------');
      const e1subs = '                             ^';
      const expected = '                           -';

      expectObservable(e1.pipe(dematerialize())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should dematerialize stream never completes', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold<ObservableNotification<any>>('-');
      const e1subs = '                              ^';
      const expected = '                            -';

      expectObservable(e1.pipe(dematerialize())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should dematerialize stream does not emit', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot<ObservableNotification<any>>('----|');
      const e1subs = '                             ^---!';
      const expected = '                           ----|';

      expectObservable(e1.pipe(dematerialize())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should dematerialize empty stream', () => {
    testScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold<ObservableNotification<any>>('|   ');
      const e1subs = '                              (^!)';
      const expected = '                            |   ';

      expectObservable(e1.pipe(dematerialize())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should dematerialize stream throws', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const error = 'error';
      const e1 = hot('  (x|)', { x: errorNotification(error) });
      const e1subs = '  (^!)';
      const expected = '#   ';

      expectObservable(e1.pipe(dematerialize())).toBe(expected, null, error);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow unsubscribing early and explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: nextNotification('w'),
        b: nextNotification('x'),
      };

      const e1 = hot('  --a--b--c--d--|', values);
      const e1subs = '  ^------!       ';
      const expected = '--w--x--       ';
      const unsub = '   -------!       ';

      const result = e1.pipe(dematerialize());

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when unsubscribed explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: nextNotification('w'),
        b: nextNotification('x'),
      };

      const e1 = hot('  --a--b--c--d--|', values);
      const e1subs = '  ^------!       ';
      const expected = '--w--x--       ';
      const unsub = '   -------!       ';

      const result = e1.pipe(
        mergeMap((x: any) => of(x)),
        dematerialize(),
        mergeMap((x: any) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should dematerialize and completes when stream completes with complete notification', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----(a|)', { a: COMPLETE_NOTIFICATION });
      const e1subs = '  ^---!   ';
      const expected = '----|   ';

      expectObservable(e1.pipe(dematerialize())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should dematerialize and completes when stream emits complete notification', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----a--|', { a: COMPLETE_NOTIFICATION });
      const e1subs = '  ^---!   ';
      const expected = '----|   ';

      expectObservable(e1.pipe(dematerialize())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should work with materialize', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----a--b---c---d---e----f--|');
      const e1subs = '  ^--------------------------!';
      const expected = '----a--b---c---d---e----f--|';

      const result = e1.pipe(materialize(), dematerialize());

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
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

    synchronousObservable.pipe(materialize(), dematerialize(), take(3)).subscribe(() => {
      /* noop */
    });

    expect(sideEffects).to.deep.equal([0, 1, 2]);
  });
});
