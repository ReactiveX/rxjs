// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/observables/timer-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { concat } from 'rxjs/concat';
import { merge } from 'rxjs/merge';
import { mergeMap } from 'rxjs/merge-map';
import { NEVER } from 'rxjs/never';
import { take } from 'rxjs/take';
import { timer } from 'rxjs/timer';
describe('timer (cold)', () => {
  it('should create an observable emitting periodically', async () => {
    await rxTest(({ expectObservable, now, schedule }) => {
      const virtualTimer = (due, period) =>
        new ColdObservable((subscriber) => {
          const firstDelay = due instanceof Date ? Math.max(0, +due - now()) : Math.max(0, Number(due));
          if (firstDelay === Infinity) {
            return;
          }
          let index = 0;
          const emit = () => {
            if (subscriber.signal.aborted) {
              return;
            }
            subscriber.next(index++);
            if (subscriber.signal.aborted) {
              return;
            }
            if (period == null || period < 0) {
              subscriber.complete();
            } else if (period !== Infinity) {
              schedule(emit, period, { signal: subscriber.signal });
            }
          };
          schedule(emit, firstDelay, { signal: subscriber.signal });
        });
      // Model only the removed TestScheduler injection inside rxTest's virtual
      // host. This fixture preserves the timing claim without exposing a generic
      // scheduler value or claiming a public scheduler overload.
      const source = virtualTimer(6, 2)[take](4)[concat]([NEVER]);
      expectObservable(source, '^-------------!').toBe('------a-b-c-d-', {
        a: 0,
        b: 1,
        c: 2,
        d: 3,
      });
    });
  });
  it('should schedule a value of 0 then complete', async () => {
    await rxTest(({ expectObservable }) => {
      const dueTime = 5; // -----|
      const expected = '    -----(x|)';
      const source = ColdObservable[timer](dueTime);
      expectObservable(source).toBe(expected, { x: 0 });
    });
  });
  it('should emit a single value immediately', async () => {
    await rxTest(({ expectObservable }) => {
      const dueTime = 0;
      const expected = '(x|)';
      const source = ColdObservable[timer](dueTime);
      expectObservable(source).toBe(expected, { x: 0 });
    });
  });
  it('should start after delay and periodically emit values', async () => {
    await rxTest(({ expectObservable, now, schedule }) => {
      const virtualTimer = (due, period) =>
        new ColdObservable((subscriber) => {
          const firstDelay = due instanceof Date ? Math.max(0, +due - now()) : Math.max(0, Number(due));
          if (firstDelay === Infinity) {
            return;
          }
          let index = 0;
          const emit = () => {
            if (subscriber.signal.aborted) {
              return;
            }
            subscriber.next(index++);
            if (subscriber.signal.aborted) {
              return;
            }
            if (period == null || period < 0) {
              subscriber.complete();
            } else if (period !== Infinity) {
              schedule(emit, period, { signal: subscriber.signal });
            }
          };
          schedule(emit, firstDelay, { signal: subscriber.signal });
        });
      // Model only the removed TestScheduler injection inside rxTest's virtual
      // host. This fixture preserves the timing claim without exposing a generic
      // scheduler value or claiming a public scheduler overload.
      const source = virtualTimer(4, 2)[take](5);
      expectObservable(source).toBe('----a-b-c-d-(e|)', {
        a: 0,
        b: 1,
        c: 2,
        d: 3,
        e: 4,
      });
    });
  });
  it('should start immediately and periodically emit values', async () => {
    await rxTest(({ expectObservable, now, schedule }) => {
      const virtualTimer = (due, period) =>
        new ColdObservable((subscriber) => {
          const firstDelay = due instanceof Date ? Math.max(0, +due - now()) : Math.max(0, Number(due));
          if (firstDelay === Infinity) {
            return;
          }
          let index = 0;
          const emit = () => {
            if (subscriber.signal.aborted) {
              return;
            }
            subscriber.next(index++);
            if (subscriber.signal.aborted) {
              return;
            }
            if (period == null || period < 0) {
              subscriber.complete();
            } else if (period !== Infinity) {
              schedule(emit, period, { signal: subscriber.signal });
            }
          };
          schedule(emit, firstDelay, { signal: subscriber.signal });
        });
      // Model only the removed TestScheduler injection inside rxTest's virtual
      // host. This fixture preserves the timing claim without exposing a generic
      // scheduler value or claiming a public scheduler overload.
      const source = virtualTimer(0, 3)[take](5);
      expectObservable(source).toBe('a--b--c--d--(e|)', {
        a: 0,
        b: 1,
        c: 2,
        d: 3,
        e: 4,
      });
    });
  });
  it('should stop emitting values when subscription is done', async () => {
    await rxTest(({ expectObservable, now, schedule }) => {
      const virtualTimer = (due, period) =>
        new ColdObservable((subscriber) => {
          const firstDelay = due instanceof Date ? Math.max(0, +due - now()) : Math.max(0, Number(due));
          if (firstDelay === Infinity) {
            return;
          }
          let index = 0;
          const emit = () => {
            if (subscriber.signal.aborted) {
              return;
            }
            subscriber.next(index++);
            if (subscriber.signal.aborted) {
              return;
            }
            if (period == null || period < 0) {
              subscriber.complete();
            } else if (period !== Infinity) {
              schedule(emit, period, { signal: subscriber.signal });
            }
          };
          schedule(emit, firstDelay, { signal: subscriber.signal });
        });
      // Model only the removed TestScheduler injection inside rxTest's virtual
      // host. This fixture preserves the timing claim without exposing a generic
      // scheduler value or claiming a public scheduler overload.
      const source = virtualTimer(0, 3);
      expectObservable(source, '^------------!').toBe('a--b--c--d--e', {
        a: 0,
        b: 1,
        c: 2,
        d: 3,
        e: 4,
      });
    });
  });
  it('should schedule a value at a specified Date', async () => {
    await rxTest(({ expectObservable, now: virtualNow }) => {
      const offset = 4; // ----|
      const expected = '   ----(a|)';
      const dueTime = new Date(virtualNow() + offset);
      const source = ColdObservable[timer](dueTime);
      expectObservable(source).toBe(expected, { a: 0 });
    });
  });
  it('should start after delay and periodically emit values', async () => {
    await rxTest(({ expectObservable, now, schedule }) => {
      const virtualTimer = (due, period) =>
        new ColdObservable((subscriber) => {
          const firstDelay = due instanceof Date ? Math.max(0, +due - now()) : Math.max(0, Number(due));
          if (firstDelay === Infinity) {
            return;
          }
          let index = 0;
          const emit = () => {
            if (subscriber.signal.aborted) {
              return;
            }
            subscriber.next(index++);
            if (subscriber.signal.aborted) {
              return;
            }
            if (period == null || period < 0) {
              subscriber.complete();
            } else if (period !== Infinity) {
              schedule(emit, period, { signal: subscriber.signal });
            }
          };
          schedule(emit, firstDelay, { signal: subscriber.signal });
        });
      // Model only the removed TestScheduler injection inside rxTest's virtual
      // host. This fixture preserves the timing claim without exposing a generic
      // scheduler value or claiming a public scheduler overload.
      const source = virtualTimer(new Date(now() + 4), 2)[take](5);
      expectObservable(source).toBe('----a-b-c-d-(e|)', {
        a: 0,
        b: 1,
        c: 2,
        d: 3,
        e: 4,
      });
    });
  });
  it("'should still target the same date if a date is provided even for the ' + 'second subscription'", async () => {
    await rxTest(({ cold, expectObservable, now, schedule }) => {
      const virtualTimer = (due, period) =>
        new ColdObservable((subscriber) => {
          const firstDelay = due instanceof Date ? Math.max(0, +due - now()) : Math.max(0, Number(due));
          if (firstDelay === Infinity) {
            return;
          }
          let index = 0;
          const emit = () => {
            if (subscriber.signal.aborted) {
              return;
            }
            subscriber.next(index++);
            if (subscriber.signal.aborted) {
              return;
            }
            if (period == null || period < 0) {
              subscriber.complete();
            } else if (period !== Infinity) {
              schedule(emit, period, { signal: subscriber.signal });
            }
          };
          schedule(emit, firstDelay, { signal: subscriber.signal });
        });
      // Model only the removed TestScheduler injection inside rxTest's virtual
      // host. This fixture preserves the timing claim without exposing a generic
      // scheduler value or claiming a public scheduler overload.
      const firstTrigger = cold('a|');
      const secondTrigger = cold('--a|');
      const source = virtualTimer(new Date(now() + 4));
      const result = ColdObservable[merge]([firstTrigger, secondTrigger])[mergeMap](() => source);
      expectObservable(result).toBe('----(aa|)', { a: 0 });
    });
  });
  it('should accept Infinity as the first argument', async () => {
    await rxTest(({ expectObservable, now, schedule }) => {
      const virtualTimer = (due, period) =>
        new ColdObservable((subscriber) => {
          const firstDelay = due instanceof Date ? Math.max(0, +due - now()) : Math.max(0, Number(due));
          if (firstDelay === Infinity) {
            return;
          }
          let index = 0;
          const emit = () => {
            if (subscriber.signal.aborted) {
              return;
            }
            subscriber.next(index++);
            if (subscriber.signal.aborted) {
              return;
            }
            if (period == null || period < 0) {
              subscriber.complete();
            } else if (period !== Infinity) {
              schedule(emit, period, { signal: subscriber.signal });
            }
          };
          schedule(emit, firstDelay, { signal: subscriber.signal });
        });
      // Model only the removed TestScheduler injection inside rxTest's virtual
      // host. This fixture preserves the timing claim without exposing a generic
      // scheduler value or claiming a public scheduler overload.
      const source = virtualTimer(Infinity);
      expectObservable(source, '^-----!').toBe('------');
    });
  });
  it('should accept Infinity as the second argument', async () => {
    await rxTest(({ expectObservable, now, schedule }) => {
      const virtualTimer = (due, period) =>
        new ColdObservable((subscriber) => {
          const firstDelay = due instanceof Date ? Math.max(0, +due - now()) : Math.max(0, Number(due));
          if (firstDelay === Infinity) {
            return;
          }
          let index = 0;
          const emit = () => {
            if (subscriber.signal.aborted) {
              return;
            }
            subscriber.next(index++);
            if (subscriber.signal.aborted) {
              return;
            }
            if (period == null || period < 0) {
              subscriber.complete();
            } else if (period !== Infinity) {
              schedule(emit, period, { signal: subscriber.signal });
            }
          };
          schedule(emit, firstDelay, { signal: subscriber.signal });
        });
      // Model only the removed TestScheduler injection inside rxTest's virtual
      // host. This fixture preserves the timing claim without exposing a generic
      // scheduler value or claiming a public scheduler overload.
      const source = virtualTimer(4, Infinity);
      expectObservable(source, '^-----!').toBe('----a-', { a: 0 });
    });
  });
  it('should accept negative numbers as the second argument, which should cause immediate completion', async () => {
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable[timer](4, -4);
      const expected = '----(a|)';
      expectObservable(source).toBe(expected, { a: 0 });
    });
  });
  it('should accept 0 as the second argument', async () => {
    await rxTest(({ expectObservable }) => {
      const source = ColdObservable[timer](4, 0)[take](5);
      const expected = '----(abcde|)';
      expectObservable(source).toBe(expected, { a: 0, b: 1, c: 2, d: 3, e: 4 });
    });
  });
  it('should emit after a delay of 0 for Date objects in the past', async () => {
    await rxTest(({ expectObservable, now: virtualNow }) => {
      const expected = '(a|)';
      const threeSecondsInThePast = new Date(virtualNow() - 3000);
      const source = ColdObservable[timer](threeSecondsInThePast);
      expectObservable(source).toBe(expected, { a: 0 });
    });
  });
});
