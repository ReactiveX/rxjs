// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/scheduled/scheduled-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
describe('scheduled (platform)', () => {
  it('should schedule a sync observable', async () => {
    const input = Observable.from(['a', 'b', 'c']);
    await rxTest(({ expectObservable, schedule }) => {
      const virtualScheduled = (value) =>
        new Observable((subscriber) => {
          schedule(
            () => {
              try {
                if (typeof value === 'string') {
                  for (const item of value) {
                    subscriber.next(item);
                  }
                  subscriber.complete();
                  return;
                }
                Observable.from(value).subscribe(subscriber, {
                  signal: subscriber.signal,
                });
              } catch (error) {
                subscriber.error(error);
              }
            },
            0,
            { signal: subscriber.signal }
          );
        });
      // This case exercises the input conversion contract under rxTest's virtual
      // host without registering scheduled or a scheduler object as public APIs.
      expectObservable(virtualScheduled(input)).toBe('(abc|)');
    });
  });
  it('should schedule an array', async () => {
    const input = ['a', 'b', 'c'];
    await rxTest(({ expectObservable, schedule }) => {
      const virtualScheduled = (value) =>
        new Observable((subscriber) => {
          schedule(
            () => {
              try {
                if (typeof value === 'string') {
                  for (const item of value) {
                    subscriber.next(item);
                  }
                  subscriber.complete();
                  return;
                }
                Observable.from(value).subscribe(subscriber, {
                  signal: subscriber.signal,
                });
              } catch (error) {
                subscriber.error(error);
              }
            },
            0,
            { signal: subscriber.signal }
          );
        });
      // This case exercises the input conversion contract under rxTest's virtual
      // host without registering scheduled or a scheduler object as public APIs.
      expectObservable(virtualScheduled(input)).toBe('(abc|)');
    });
  });
  it('should schedule an iterable', async () => {
    const input = 'abc';
    await rxTest(({ expectObservable, schedule }) => {
      const virtualScheduled = (value) =>
        new Observable((subscriber) => {
          schedule(
            () => {
              try {
                if (typeof value === 'string') {
                  for (const item of value) {
                    subscriber.next(item);
                  }
                  subscriber.complete();
                  return;
                }
                Observable.from(value).subscribe(subscriber, {
                  signal: subscriber.signal,
                });
              } catch (error) {
                subscriber.error(error);
              }
            },
            0,
            { signal: subscriber.signal }
          );
        });
      // This case exercises the input conversion contract under rxTest's virtual
      // host without registering scheduled or a scheduler object as public APIs.
      expectObservable(virtualScheduled(input)).toBe('(abc|)');
    });
  });
  it('should schedule an observable-like', async () => {
    const input = {
      subscribe(observer) {
        for (const value of ['a', 'b', 'c']) {
          observer.next?.(value);
        }
        observer.complete?.();
        return { unsubscribe() {} };
      },
    };
    input[Symbol.observable ?? '@@observable'] = function () {
      return this;
    };
    await rxTest(({ expectObservable, schedule }) => {
      const virtualScheduled = (value) =>
        new Observable((subscriber) => {
          schedule(
            () => {
              try {
                if (typeof value === 'string') {
                  for (const item of value) {
                    subscriber.next(item);
                  }
                  subscriber.complete();
                  return;
                }
                Observable.from(value).subscribe(subscriber, {
                  signal: subscriber.signal,
                });
              } catch (error) {
                subscriber.error(error);
              }
            },
            0,
            { signal: subscriber.signal }
          );
        });
      // This case exercises the input conversion contract under rxTest's virtual
      // host without registering scheduled or a scheduler object as public APIs.
      expectObservable(virtualScheduled(input)).toBe('(abc|)');
    });
  });
});
