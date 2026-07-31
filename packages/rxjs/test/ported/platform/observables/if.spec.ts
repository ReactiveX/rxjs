// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/observables/if-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
describe('if (platform)', () => {
  it('should subscribe to thenSource when the conditional returns true', async () => {
    await rxTest(({ expectObservable }) => {
      const e1 = new Observable((subscriber) => {
        Observable.from(true ? Observable.from(['a']) : Observable.from([])).subscribe(subscriber, { signal: subscriber.signal });
      });
      const expected = '(a|)';
      expectObservable(e1).toBe(expected);
    });
  });
  it('should subscribe to elseSource when the conditional returns false', async () => {
    await rxTest(({ expectObservable }) => {
      const e1 = new Observable((subscriber) => {
        Observable.from(false ? Observable.from(['a']) : Observable.from(['b'])).subscribe(subscriber, {
          signal: subscriber.signal,
        });
      });
      const expected = '(b|)';
      expectObservable(e1).toBe(expected);
    });
  });
  it('should complete without an elseSource when the conditional returns false', async () => {
    await rxTest(({ expectObservable }) => {
      const e1 = new Observable((subscriber) => {
        Observable.from(false ? Observable.from(['a']) : Observable.from([])).subscribe(subscriber, {
          signal: subscriber.signal,
        });
      });
      const expected = '|';
      expectObservable(e1).toBe(expected);
    });
  });
  it('should raise error when conditional throws', async () => {
    await rxTest(({ expectObservable }) => {
      const e1 = new Observable((subscriber) => {
        Observable.from(
          (() => {
            throw 'error';
          })()
            ? Observable.from(['a'])
            : Observable.from([])
        ).subscribe(subscriber, { signal: subscriber.signal });
      });
      const expected = '#';
      expectObservable(e1).toBe(expected);
    });
  });
});
