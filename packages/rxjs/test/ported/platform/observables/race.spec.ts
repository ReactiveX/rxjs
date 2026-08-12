// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/observables/race-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { mergeMap } from 'rxjs/merge-map';
import { race } from 'rxjs/race';
describe('race (platform)', () => {
  it('should race a single observable', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---a-----b-----c----|');
      const e1subs = '  ^-------------------!';
      const expected = '---a-----b-----c----|';
      const result = Observable[race]([e1]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should race cold and cold', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---a-----b-----c----|   ');
      const e1subs = '  ^-------------------!   ';
      const e2 = observable(' ------x-----y-----z----|');
      const e2subs = '  ^--!                    ';
      const expected = '---a-----b-----c----|   ';
      const result = Observable[race]([e1, e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should race with array of observable', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---a-----b-----c----|   ');
      const e1subs = '  ^-------------------!   ';
      const e2 = observable(' ------x-----y-----z----|');
      const e2subs = '  ^--!                    ';
      const expected = '---a-----b-----c----|   ';
      const result = Observable[race]([e1, e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should race hot and hot', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a-----b-----c----|   ');
      const e1subs = '  ^-------------------!   ';
      const e2 = hot('  ------x-----y-----z----|');
      const e2subs = '  ^--!                    ';
      const expected = '---a-----b-----c----|   ';
      const result = Observable[race]([e1, e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should race hot and cold', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---a-----b-----c----|   ');
      const e1subs = '  ^-------------------!   ';
      const e2 = hot('  ------x-----y-----z----|');
      const e2subs = '  ^--!                    ';
      const expected = '---a-----b-----c----|   ';
      const result = Observable[race]([e1, e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should race 2nd and 1st', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ------x-----y-----z----|');
      const e1subs = '  ^--!                    ';
      const e2 = observable(' ---a-----b-----c----|   ');
      const e2subs = '  ^-------------------!   ';
      const expected = '---a-----b-----c----|   ';
      const result = Observable[race]([e1, e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should race emit and complete', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -----|                  ');
      const e1subs = '  ^----!                  ';
      const e2 = hot('  ------x-----y-----z----|');
      const e2subs = '  ^----!                  ';
      const expected = '-----|                  ';
      const result = Observable[race]([e1, e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should allow unsubscribing early and explicitly', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---a-----b-----c----|   ');
      const e1subs = '  ^-----------!           ';
      const e2 = hot('  ------x-----y-----z----|');
      const e2subs = '  ^--!                    ';
      const expected = '---a-----b---           ';
      const unsub = '   ------------!           ';
      const result = Observable[race]([e1, e2]);
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should not break unsubscription chains when unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--^--b--c---d-| ');
      const e1subs = '       ^--------!    ';
      const e2 = hot('  ---e-^---f--g---h-|');
      const e2subs = '       ^--!          ';
      const expected = '     ---b--c---    ';
      const unsub = '        ---------!    ';
      const result = Observable[race]([e1[mergeMap]((x) => Observable.from([x])), e2[mergeMap]((x) => Observable.from([x]))])[mergeMap](
        (x) => Observable.from([x])
      );
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should never emit when given non emitting sources', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---|');
      const e2 = observable(' ---|');
      const e1subs = '  ^--!';
      const expected = '---|';
      const source = Observable[race]([e1, e2]);
      expectObservable(source).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should throw when error occurs mid stream', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---a-----#              ');
      const e1subs = '  ^--------!              ';
      const e2 = observable(' ------x-----y-----z----|');
      const e2subs = '  ^--!                    ';
      const expected = '---a-----#              ';
      const result = Observable[race]([e1, e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should throw when error occurs before a winner is found', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' ---#                    ');
      const e1subs = '  ^--!                    ';
      const e2 = observable(' ------x-----y-----z----|');
      const e2subs = '  ^--!                    ';
      const expected = '---#                    ';
      const result = Observable[race]([e1, e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('handle empty', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' |   ');
      const e1subs = '  (^!)';
      const expected = '|   ';
      const source = Observable[race]([e1]);
      expectObservable(source).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('handle never', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -');
      const e1subs = '^!';
      const expected = '-';
      const source = Observable[race]([e1]);
      expectObservable(source, '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('handle throw', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';
      const source = Observable[race]([e1]);
      expectObservable(source).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
