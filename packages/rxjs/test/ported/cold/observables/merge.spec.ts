// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/observables/merge-spec.ts
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { merge } from 'rxjs/merge';
describe('merge (cold)', () => {
  it('should merge cold and cold', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' ---a-----b-----c----|   ');
      const e1subs = '  ^-------------------!   ';
      const e2 = cold(' ------x-----y-----z----|');
      const e2subs = '  ^----------------------!';
      const expected = '---a--x--b--y--c--z----|';
      const result = ColdObservable[merge]([e1, e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should merge hot and hot', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot(' ---a---^-b-----c----|   ');
      const e1subs = '        ^------------!   ';
      const e2 = hot(' -----x-^----y-----z----|');
      const e2subs = '        ^---------------!';
      const expected = '      --b--y--c--z----|';
      const result = ColdObservable[merge]([e1, e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should merge hot and cold', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot(' ---a-^---b-----c----|    ');
      const e1subs = '      ^--------------!    ';
      const e2 = cold('     --x-----y-----z----|');
      const e2subs = '      ^------------------!';
      const expected = '    --x-b---y-c---z----|';
      const result = ColdObservable[merge]([e1, e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should merge parallel emissions', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a----b----c----|');
      const e1subs = '  ^-----------------!';
      const e2 = hot('  ---x----y----z----|');
      const e2subs = '  ^-----------------!';
      const expected = '---(ax)-(by)-(cz)-|';
      const result = ColdObservable[merge]([e1, e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should merge empty and empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('|   ');
      const e1subs = ' (^!)';
      const e2 = cold('|   ');
      const e2subs = ' (^!)';
      const expected = '|  ';
      const result = ColdObservable[merge]([e1, e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should merge three empties', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('|   ');
      const e1subs = ' (^!)';
      const e2 = cold('|   ');
      const e2subs = ' (^!)';
      const e3 = cold('|   ');
      const e3subs = ' (^!)';
      const expected = '|  ';
      const result = ColdObservable[merge]([e1, e2, e3]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });
  it('should merge never and empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold('-   ');
      const e1subs = '^!';
      const e2 = cold('|   ');
      const e2subs = ' (^!)';
      const expected = '-  ';
      const result = ColdObservable[merge]([e1, e2]);
      expectObservable(result, '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should merge never and never', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '^!';
      const e2 = cold(' -');
      const e2subs = '^!';
      const expected = '-';
      const result = ColdObservable[merge]([e1, e2]);
      expectObservable(result, '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should merge empty and throw', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const e2 = cold(' #   ');
      const e2subs = '  (^!)';
      const expected = '#';
      const result = ColdObservable[merge]([e1, e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should merge hot and throw', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  (^!)        ';
      const e2 = cold(' #           ');
      const e2subs = '  (^!)        ';
      const expected = '#           ';
      const result = ColdObservable[merge]([e1, e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should merge never and throw', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -   ');
      const e1subs = '  (^!)';
      const e2 = cold(' #   ');
      const e2subs = '  (^!)';
      const expected = '#   ';
      const result = ColdObservable[merge]([e1, e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should merge empty and eventual error', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |       ');
      const e1subs = '  (^!)    ';
      const e2 = hot('  -------#');
      const e2subs = '  ^------!';
      const expected = '-------#';
      const result = ColdObservable[merge]([e1, e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should merge hot and error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b--c--|');
      const e1subs = '  ^------!    ';
      const e2 = hot('  -------#    ');
      const e2subs = '  ^------!    ';
      const expected = '--a--b-#    ';
      const result = ColdObservable[merge]([e1, e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should merge never and error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --------');
      const e1subs = '  ^------!';
      const e2 = hot('  -------#');
      const e2subs = '  ^------!';
      const expected = '-------#';
      const result = ColdObservable[merge]([e1, e2]);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should merge single lowerCaseO into RxJS Observable', async () => {
    const lowerCaseO = (...values) => {
      const source = {
        subscribe(observer) {
          const destination = typeof observer === 'function' ? { next: observer } : observer;
          for (const value of values) destination.next?.(value);
          destination.complete?.();
          return { unsubscribe() {} };
        },
      };
      const observableKey = Symbol.observable ?? '@@observable';
      source[observableKey] = function () {
        return this;
      };
      return source;
    };
    await rxTest(({ expectObservable }) => {
      const e1 = lowerCaseO('a', 'b', 'c');
      const result = ColdObservable[merge]([e1]);
      expect(result).toBeInstanceOf(ColdObservable);
      expectObservable(result).toBe('(abc|)');
    });
  });
  it('should merge two lowerCaseO into RxJS Observable', async () => {
    const lowerCaseO = (...values) => {
      const source = {
        subscribe(observer) {
          const destination = typeof observer === 'function' ? { next: observer } : observer;
          for (const value of values) destination.next?.(value);
          destination.complete?.();
          return { unsubscribe() {} };
        },
      };
      const observableKey = Symbol.observable ?? '@@observable';
      source[observableKey] = function () {
        return this;
      };
      return source;
    };
    await rxTest(({ expectObservable }) => {
      const e1 = lowerCaseO('a', 'b', 'c');
      const e2 = lowerCaseO('d', 'e', 'f');
      const result = ColdObservable[merge]([e1, e2]);
      expect(result).toBeInstanceOf(ColdObservable);
      expectObservable(result).toBe('(abcdef|)');
    });
  });
  it('should merge single lowerCaseO into RxJS Observable', async () => {
    await rxTest(({ expectObservable, schedule }) => {
      const observableKey = Symbol.observable ?? '@@observable';
      const source = {
        subscribe(observer) {
          const task = schedule(
            () => {
              observer.next?.('a');
              observer.next?.('b');
              observer.next?.('c');
              observer.complete?.();
            },
            0,
            { signal: observer.signal }
          );
          return { unsubscribe: () => task.cancel() };
        },
        [observableKey]() {
          return this;
        },
      };
      // The removed scheduler overload scheduled conversion/subscription at frame
      // zero. Keep that timing in the local interop source and exercise the real
      // merge factory without treating a scheduler object as another source.
      const result = ColdObservable[merge]([source]);
      expect(result instanceof globalThis.Observable).toBe(true);
      expectObservable(result).toBe('(abc|)');
    });
  });
  it('should handle concurrency limits', async () => {
    await rxTest(({ cold, expectObservable }) => {
      const e1 = cold(' ---a---b---c---|            ');
      const e2 = cold(' -d---e---f--|               ');
      const e3 = cold('             ---x---y---z---|');
      const expected = '-d-a-e-b-f-c---x---y---z---|';
      expectObservable(ColdObservable[merge]([e1, e2, e3], { concurrency: 2 })).toBe(expected);
    });
  });
  it('should handle scheduler', async () => {
    await rxTest(({ expectObservable, schedule }) => {
      const scheduledValue = (value, delay) =>
        new globalThis.Observable((subscriber) => {
          schedule(
            () => {
              subscriber.next(value);
              subscriber.complete();
            },
            delay,
            { signal: subscriber.signal }
          );
        });
      // Local scheduled sources preserve the old frame-zero scheduler handoff and
      // the delayed second value while the production merge sees only sources.
      const result = ColdObservable[merge]([scheduledValue('a', 0), scheduledValue('b', 2)]);
      expectObservable(result).toBe('a-(b|)');
    });
  });
  it('should handle scheduler with concurrency limits', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const first = cold('---a---b---c---|');
      const second = cold('-d---e---f--|');
      const third = cold('---x---y---z---|');
      // rxTest owns virtual subscription time. Removing only the obsolete
      // TestScheduler argument leaves the exact merge concurrency contract active.
      const result = ColdObservable[merge]([first, second, third], { concurrency: 2 });
      expectObservable(result).toBe('-d-a-e-b-f-c---x---y---z---|');
      expectSubscriptions(first.subscriptions).toBe('^--------------!');
      expectSubscriptions(second.subscriptions).toBe('^-----------!');
      expectSubscriptions(third.subscriptions).toBe('------------^--------------!');
    });
  });
  it('should deem a single array argument to be an ObservableInput', async () => {
    await rxTest(({ expectObservable }) => {
      const array = ['foo', 'bar'];
      const expected = '(fb|)';
      expectObservable(ColdObservable[merge]([array])).toBe(expected, { f: 'foo', b: 'bar' });
    });
  });
});
