// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/Observable-spec.ts
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { catchError } from 'rxjs/catch-error';
import { combineLatest } from 'rxjs/combine-latest';
import { concat } from 'rxjs/concat';
import { map } from 'rxjs/map';
import { merge } from 'rxjs/merge';
import { race } from 'rxjs/race';
import { zipWith } from 'rxjs/zip-with';
describe('Observable (platform)', () => {
  it('should allow empty ctor, which is effectively a never-observable', async () => {
    let rejection;
    let nextCalled = false;
    let completeCalled = false;
    try {
      const result = new Observable();
      result.subscribe({
        next: () => {
          nextCalled = true;
        },
        error: (error) => {
          rejection = error;
        },
        complete: () => {
          completeCalled = true;
        },
      });
    } catch (error) {
      rejection = error;
    }
    // RxJS 7 treated a missing initializer as NEVER. The platform constructor
    // requires a callback: strict implementations reject construction, while the
    // cold compatibility constructor rejects when the invalid source is activated.
    expect(rejection).toBeInstanceOf(TypeError);
    expect(nextCalled).toBe(false);
    expect(completeCalled).toBe(false);
  });
  it('should handle sync errors within a test scheduler', async () => {
    const controller = new AbortController();
    let sourceAttempts = 0;
    let projectionAttempts = 0;
    let handledErrors = 0;
    const notifications = [];
    const source = new Observable((subscriber) => {
      sourceAttempts++;
      subscriber.next(4);
      subscriber.complete();
    });
    const observable = source[map]((value) => {
      projectionAttempts++;
      throw 'four!';
    })[catchError]((_error, caught) => {
      handledErrors++;
      if (handledErrors === 1000) {
        controller.abort();
      }
      return caught;
    });
    observable.subscribe(
      {
        next: (value) => notifications.push({ kind: 'N', value }),
        error: (error) => notifications.push({ kind: 'E', error }),
        complete: () => notifications.push({ kind: 'C' }),
      },
      { signal: controller.signal }
    );
    expect(sourceAttempts).toBe(1000);
    expect(projectionAttempts).toBe(1000);
    expect(handledErrors).toBe(1000);
    expect(controller.signal.aborted).toBe(true);
    expect(notifications).toEqual([]);
  });
  it('should compose through combineLatest', async () => {
    class MyCustomObservable extends Observable {
      static from(source) {
        return new this((subscriber) => {
          source.subscribe(subscriber, { signal: subscriber.signal });
        });
      }
    }
    await rxTest(({ observable, expectObservable }) => {
      const first = observable('-a--b-----c-d-e-|');
      const other = observable('--1--2-3-4---|   ');
      const source = MyCustomObservable.from(first);
      const result = source[combineLatest]([other], (left, right) => String(left) + String(right));
      // Exact extension Symbols replace the removed RxJS 7
      // empty-constructor/source/operator/lift protocol. The platform construction
      // protocol preserves an ordinary custom subclass; the cold compatibility
      // protocol deliberately normalizes subclasses to a plain ColdObservable.
      expect(result instanceof MyCustomObservable).toBe('polyfill' !== 'cold');
      expect(result instanceof Observable).toBe(true);
      expectObservable(result).toBe('--A-BC-D-EF-G-H-|', {
        A: 'a1',
        B: 'b1',
        C: 'b2',
        D: 'b3',
        E: 'b4',
        F: 'c4',
        G: 'd4',
        H: 'e4',
      });
    });
  });
  it('should compose through concat', async () => {
    class MyCustomObservable extends Observable {
      static from(source) {
        return new this((subscriber) => {
          source.subscribe(subscriber, { signal: subscriber.signal });
        });
      }
    }
    await rxTest(({ observable, expectObservable }) => {
      const first = observable('--a--b-|');
      const other = observable('--x---y--|');
      const source = MyCustomObservable.from(first);
      const result = source[concat]([other]);
      // Exact extension Symbols replace the removed RxJS 7
      // empty-constructor/source/operator/lift protocol. The platform construction
      // protocol preserves an ordinary custom subclass; the cold compatibility
      // protocol deliberately normalizes subclasses to a plain ColdObservable.
      expect(result instanceof MyCustomObservable).toBe('polyfill' !== 'cold');
      expect(result instanceof Observable).toBe(true);
      expectObservable(result).toBe('--a--b---x---y--|');
    });
    let schedulerError;
    let schedulerCalls = 0;
    await rxTest(async ({ observable, flush }) => {
      const first = observable('--a--b-|');
      const other = observable('--x---y--|');
      const legacyScheduler = {
        schedule() {
          schedulerCalls++;
        },
      };
      const result = MyCustomObservable.from(first)[concat]([other, legacyScheduler]);
      result.subscribe({
        error: (error) => {
          schedulerError = error;
        },
      });
      await flush();
    });
    // The source case supplied the removed trailing SchedulerLike overload. Keep
    // that part of the evidence executable: it is rejected as an unsupported
    // Observable input and is never invoked as a scheduler.
    expect(schedulerCalls).toBe(0);
    expect(schedulerError).toBeInstanceOf(TypeError);
    expect(schedulerError.message).toMatch(/not observable/);
  });
  it('should compose through merge', async () => {
    class MyCustomObservable extends Observable {
      static from(source) {
        return new this((subscriber) => {
          source.subscribe(subscriber, { signal: subscriber.signal });
        });
      }
    }
    await rxTest(({ observable, expectObservable }) => {
      const first = observable('-a--b-| ');
      const other = observable('--x--y-|');
      const source = MyCustomObservable.from(first);
      const result = source[merge]([other]);
      // Exact extension Symbols replace the removed RxJS 7
      // empty-constructor/source/operator/lift protocol. The platform construction
      // protocol preserves an ordinary custom subclass; the cold compatibility
      // protocol deliberately normalizes subclasses to a plain ColdObservable.
      expect(result instanceof MyCustomObservable).toBe('polyfill' !== 'cold');
      expect(result instanceof Observable).toBe(true);
      expectObservable(result).toBe('-ax-by-|');
    });
    let schedulerError;
    let schedulerCalls = 0;
    await rxTest(async ({ observable, flush }) => {
      const first = observable('-a--b-| ');
      const other = observable('--x--y-|');
      const legacyScheduler = {
        schedule() {
          schedulerCalls++;
        },
      };
      const result = MyCustomObservable.from(first)[merge]([other, legacyScheduler]);
      result.subscribe({
        error: (error) => {
          schedulerError = error;
        },
      });
      await flush();
    });
    // The source case supplied the removed trailing SchedulerLike overload. Keep
    // that part of the evidence executable: it is rejected as an unsupported
    // Observable input and is never invoked as a scheduler.
    expect(schedulerCalls).toBe(0);
    expect(schedulerError).toBeInstanceOf(TypeError);
    expect(schedulerError.message).toMatch(/not observable/);
  });
  it('should compose through race', async () => {
    class MyCustomObservable extends Observable {
      static from(source) {
        return new this((subscriber) => {
          source.subscribe(subscriber, { signal: subscriber.signal });
        });
      }
    }
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const first = observable('---a-----b-----c----|');
      const other = observable('------x-----y-----z----|');
      const source = MyCustomObservable.from(first);
      const result = source[race]([other]);
      // Exact extension Symbols replace the removed RxJS 7
      // empty-constructor/source/operator/lift protocol. The platform construction
      // protocol preserves an ordinary custom subclass; the cold compatibility
      // protocol deliberately normalizes subclasses to a plain ColdObservable.
      expect(result instanceof MyCustomObservable).toBe('polyfill' !== 'cold');
      expect(result instanceof Observable).toBe(true);
      expectObservable(result).toBe('---a-----b-----c----|');
      expectSubscriptions(first.subscriptions).toBe('^-------------------!');
      expectSubscriptions(other.subscriptions).toBe('^--!');
    });
  });
  it('should compose through zip', async () => {
    class MyCustomObservable extends Observable {
      static from(source) {
        return new this((subscriber) => {
          source.subscribe(subscriber, { signal: subscriber.signal });
        });
      }
    }
    await rxTest(({ observable, expectObservable }) => {
      const first = observable('-a--b-----c-d-e-|');
      const other = observable('--1--2-3-4---|   ');
      const source = MyCustomObservable.from(first);
      const result = source[zipWith](other)[map](([left, right]) => String(left) + String(right));
      // A valid platform subclass and exact extension Symbol replace the removed
      // RxJS 7 empty-constructor/source/operator/lift protocol. Preserve the
      // original composition identity decision and complete marble evidence.
      expect(result instanceof MyCustomObservable).toBe(false);
      expect(result instanceof Observable).toBe(true);
      expectObservable(result).toBe('--A--B----C-D|', {
        A: 'a1',
        B: 'b2',
        C: 'c3',
        D: 'd4',
      });
    });
  });
});
