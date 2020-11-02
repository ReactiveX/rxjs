/** @prettier */
import { of, concat } from 'rxjs';
import { delay, repeatWhen, skip, take, tap, mergeMap, ignoreElements } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {delay} */
describe('delay', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  it('should delay by specified timeframe', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a--b--|');
      const e1subs = '  ^--------!';
      const t = time('     --|    ');
      //                      --|
      const expected = '-----a--b|';

      const result = e1.pipe(delay(t));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not delay at all if the delay number is negative', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a--b--|');
      const e1subs = '  ^--------!';
      const t = -1;
      const expected = '---a--b--|';

      const result = e1.pipe(delay(t));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should delay by absolute time period', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--a---a----a----a------------b---b---b---b--|');
      const e1subs = '  ^----------------------------------------------!';
      const t = time('  --------------------|                           ');
      const expected = '--------------------(aaaaa)-----b---b---b---b--|';

      const absoluteDelay = new Date(testScheduler.now() + t);
      const result = e1.pipe(delay(absoluteDelay));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not delay at all if the absolute time is in the past', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--a---a----a----a------------b---b---b---b--|');
      const e1subs = '  ^----------------------------------------------!';
      const t = -10000;
      const expected = '--a--a---a----a----a------------b---b---b---b--|';

      const absoluteDelay = new Date(testScheduler.now() + t);
      const result = e1.pipe(delay(absoluteDelay));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should delay by absolute time period after source ends', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^--a-----a---a-----a---|             ');
      const e1subs = '   ^----------------------!             ';
      const t = time('   ------------------------------|      ');
      const expected = ' ------------------------------(aaaa|)';

      const absoluteDelay = new Date(testScheduler.now() + t);
      const result = e1.pipe(delay(absoluteDelay));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error when source raises error', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a---b---#');
      const e1subs = '  ^----------!';
      const t = time('     ---|     ');
      //                       ---|
      const expected = '------a---b#';

      const result = e1.pipe(delay(t));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error when source raises error before absolute delay fires', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--a---a-----#     ');
      const e1subs = '  ^--------------!     ';
      const t = time('  --------------------|');
      const expected = '---------------#     ';

      const absoluteDelay = new Date(testScheduler.now() + t);
      const result = e1.pipe(delay(absoluteDelay));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should raise error when source raises error after absolute delay fires', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^---a--a---a---a--------b---b---b--#');
      const e1subs = '   ^----------------------------------!';
      const t = time('   -----------------|                  ');
      const expected = ' -----------------(aaaa)-b---b---b--#';

      const absoluteDelay = new Date(testScheduler.now() + t);
      const result = e1.pipe(delay(absoluteDelay));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should delay when source does not emit', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----|');
      const e1subs = '  ^---!';
      const t = time('  ---| ');
      const expected = '----|';

      const result = e1.pipe(delay(t));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not delay when source is empty', () => {
    testScheduler.run(({ cold, time, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const t = time('  ---|');
      const expected = '|   ';

      const result = e1.pipe(delay(t));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should delay complete when a value is scheduled', () => {
    testScheduler.run(({ cold, time, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -a-|    ');
      const e1subs = '  ^--!    ';
      const t = time('   ---|   ');
      const expected = '----(a|)';

      const result = e1.pipe(delay(t));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not complete when source does not complete', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a---b---------');
      const e1subs = '  ^---------------!';
      const t = time('     ---|          ');
      //                       ---|
      const expected = '------a---b------';
      const unsub = '   ----------------!';

      const result = e1.pipe(delay(t));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a---b----');
      const e1subs = '  ^-------!   ';
      const t = time('     ---|     ');
      //                       ---|
      const expected = '------a--   ';
      const unsub = '   --------!   ';

      const result = e1.pipe(
        mergeMap((x: any) => of(x)),
        delay(t),
        mergeMap((x: any) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not complete when source never completes', () => {
    testScheduler.run(({ cold, time, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -   ');
      const e1subs = '  ^   ';
      const t = time('  ---|');
      const expected = '-   ';

      const result = e1.pipe(delay(t));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should unsubscribe scheduled actions after execution', () => {
    testScheduler.run(({ cold, time, expectObservable, expectSubscriptions }) => {
      let subscribeSpy: any = null;
      const counts: number[] = [];

      const e1 = cold(' a|      ');
      const t = time('  -|      ');
      const expected = '--a-(a|)';

      const result = e1.pipe(
        repeatWhen((notifications) => {
          const delayed = notifications.pipe(delay(t));
          subscribeSpy = sinon.spy((delayed as any)['source'], 'subscribe');
          return delayed;
        }),
        skip(1),
        take(2),
        tap({
          next() {
            const [[subscriber]] = subscribeSpy.args;
            counts.push(subscriber._teardowns.length);
          },
          complete() {
            expect(counts).to.deep.equal([1, 1]);
          },
        })
      );

      expectObservable(result).toBe(expected);
    });
  });

  it('should be possible to delay complete by composition', () => {
    testScheduler.run(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a--b---|  ');
      const e1subs = '  ^---------!  ';
      const t = time('     --|       ');
      //                      --|
      //                          --|
      const expected = '-----a--b---|';

      const result = concat(e1.pipe(delay(t)), of(undefined).pipe(delay(t), ignoreElements()));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
