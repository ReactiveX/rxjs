import { of, concat } from 'rxjs';
import { delay, repeatWhen, skip, take, tap, mergeMap, ignoreElements } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { observableMatcher } from '../helpers/observableMatcher';

declare const asDiagram: Function;

/** @test {delay} */
describe('delay operator', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(observableMatcher);
  });

  asDiagram('delay(20)')('should delay by specified timeframe', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
    const e1 =   hot('---a--b--|');
    const t = 2; //      --|
    const expected = '-----a--b|';
    const subs =     '^--------!';

      const result = e1.pipe(delay(t, testScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });

  it('should delay by absolute time period', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--|   ');
      const t = 3; //     ---|
      const expected = '-----a--(b|)';
      const subs = '    ^-------!   ';

      const absoluteDelay = new Date(testScheduler.now() + t);
      const result = e1.pipe(delay(absoluteDelay, testScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });

  it('should delay by absolute time period after subscription', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---^--a--b--|   ');
      const t = 3; //         ---|
      const expected = '   ------a--(b|)';
      const subs = '       ^--------!   ';

      const absoluteDelay = new Date(testScheduler.now() + t);
      const result = e1.pipe(delay(absoluteDelay, testScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });

  it('should raise error when source raises error', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a---b---#');
      const t = 3; //      ---|
      const expected = '------a---b#';
      const subs = '    ^----------!';

      const result = e1.pipe(delay(t, testScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });

  it('should raise error when source raises error', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--#');
      const t = 3; //     ---|
      const expected = '-----a--#';
      const subs = '    ^-------!';

      const absoluteDelay = new Date(testScheduler.now() + t);
      const result = e1.pipe(delay(absoluteDelay, testScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });

  it('should raise error when source raises error after subscription', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---^---a---b---#');
      const t = 3; //          ---|
      const expected = '   -------a---b#';
      const e1Sub = '      ^-----------!';

      const absoluteDelay = new Date(testScheduler.now() + t);
      const result = e1.pipe(delay(absoluteDelay, testScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1Sub);
    });
  });

  it('should delay when source does not emits', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----|   ');
      const t = 3; //       ---|
      const expected = '----|';
      const subs = '    ^---!   ';

      const result = e1.pipe(delay(t, testScheduler));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });

  it('should not delay when source is empty', () => {
    testScheduler.run(({ cold, expectObservable }) => {
    const e1 =  cold('|');
    const t =  3; // ---|
    const expected = '|';

    const result = e1.pipe(delay(t, testScheduler));

    expectObservable(result).toBe(expected);
  }); });

  it('should delay complete when a value is scheduled', () => {
    testScheduler.run(({ cold, expectObservable }) => {
    const e1 =  cold('-a-|');
    const t = 3; //    ---|
    const expected = '----(a|)';

      const result = e1.pipe(delay(t, testScheduler));

      expectObservable(result).toBe(expected);
    });
  });

  it('should not complete when source does not completes', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a---b---------');
      const t = 3; //      ---|
      const expected = '------a---b------';
      const unsub = '   ----------------!';
      const subs = '    ^---------------!';

      const result = e1.pipe(delay(t, testScheduler));

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a---b----');
      const t = 3; //      ---|
      const e1subs = '  ^-------!   ';
      const expected = '------a--   ';
      const unsub = '   --------!   ';

      const result = e1.pipe(
        mergeMap((x: any) => of(x)),
        delay(t, testScheduler),
        mergeMap((x: any) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not complete when source never completes', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const e1 = cold(' -');
      const t = 3; //   ---|
      const expected = '-';

      const result = e1.pipe(delay(t, testScheduler));

      expectObservable(result).toBe(expected);
    });
  });

  it('should unsubscribe scheduled actions after execution', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      let subscribeSpy: any = null;
      const counts: number[] = [];

      const e1 = cold('      a|');
      const expected = '     --a-(a|)';
      const duration = 1; // -|
      const result = e1.pipe(
        repeatWhen(notifications => {
          const delayed = notifications.pipe(delay(duration, testScheduler));
          subscribeSpy = sinon.spy((delayed as any)['source'], 'subscribe');
          return delayed;
        }),
        skip(1),
        take(2),
        tap({
          next() {
            const [[subscriber]] = subscribeSpy.args;
            counts.push(subscriber._subscriptions.length);
          },
          complete() {
            expect(counts).to.deep.equal([1, 1]);
          }
        })
      );

      expectObservable(result).toBe(expected);
    });
  });

  it('should be possible to delay complete by composition', () => {
    testScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 =   hot('---a--b--|');
      const t = 2; //      --|--|
      const expected = '-----a--b--|';
      const subs = '    ^--------!';

      const result = concat(
        e1.pipe(delay(t, testScheduler)),
        of(undefined).pipe(delay(t, testScheduler), ignoreElements()),
      );

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
});
