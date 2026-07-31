// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/raceWith-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { mergeMap } from 'rxjs/merge-map';
import { race } from 'rxjs/race';
describe('raceWith (cold)', () => {
  it('should race cold and cold', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' ---a-----b-----c----|   ');
      const e1subs = '  ^-------------------!   ';
      const e2 = cold(' ------x-----y-----z----|');
      const e2subs = '  ^--!                    ';
      const expected = '---a-----b-----c----|   ';
      const result = e1[race]([e2]);
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
      const result = e1[race]([e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should race hot and cold', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' ---a-----b-----c----|   ');
      const e1subs = '  ^-------------------!   ';
      const e2 = hot('  ------x-----y-----z----|');
      const e2subs = '  ^--!                    ';
      const expected = '---a-----b-----c----|   ';
      const result = e1[race]([e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should race 2nd and 1st', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' ------x-----y-----z----|');
      const e1subs = '  ^--!                    ';
      const e2 = cold(' ---a-----b-----c----|   ');
      const e2subs = '  ^-------------------!   ';
      const expected = '---a-----b-----c----|   ';
      const result = e1[race]([e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should race emit and complete', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -----|                  ');
      const e1subs = '  ^----!                  ';
      const e2 = hot('  ------x-----y-----z----|');
      const e2subs = '  ^----!                  ';
      const expected = '-----|                  ';
      const result = e1[race]([e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should allow unsubscribing early and explicitly', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' ---a-----b-----c----|   ');
      const e1subs = '  ^-----------!           ';
      const e2 = hot('  ------x-----y-----z----|');
      const e2subs = '  ^--!                    ';
      const expected = '---a-----b---           ';
      const unsub = '   ------------!           ';
      const result = e1[race]([e2]);
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
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [race]([e2])
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should never emit when given non emitting sources', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' ---|');
      const e2 = cold(' ---|');
      const e1subs = '  ^--!';
      const expected = '---|';
      const source = e1[race]([e2]);
      expectObservable(source).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should throw when error occurs mid stream', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' ---a-----#              ');
      const e1subs = '  ^--------!              ';
      const e2 = cold(' ------x-----y-----z----|');
      const e2subs = '  ^--!                    ';
      const expected = '---a-----#              ';
      const result = e1[race]([e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should throw when error occurs before a winner is found', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' ---#                    ');
      const e1subs = '  ^--!                    ';
      const e2 = cold(' ------x-----y-----z----|');
      const e2subs = '  ^--!                    ';
      const expected = '---#                    ';
      const result = e1[race]([e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
});
