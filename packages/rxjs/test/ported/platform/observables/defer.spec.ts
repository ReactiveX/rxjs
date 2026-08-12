// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/observables/defer-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { mergeMap } from 'rxjs/merge-map';
describe('defer (platform)', () => {
  it('should defer the creation of a simple Observable', async () => {
    await rxTest(({ observable, expectObservable }) => {
      const expected = '-a--b--c--|';
      const e1 = new Observable((subscriber) => {
        Observable.from(observable('-a--b--c--|')).subscribe(subscriber, { signal: subscriber.signal });
      });
      expectObservable(e1).toBe(expected);
    });
  });
  it('should create an observable from the provided observable factory', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--|');
      const sourceSubs = '^----------!';
      const expected = '  --a--b--c--|';
      const e1 = new Observable((subscriber) => {
        Observable.from(source).subscribe(subscriber, { signal: subscriber.signal });
      });
      expectObservable(e1).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should create an observable from completed', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('|');
      const sourceSubs = '(^!)';
      const expected = '  |';
      const e1 = new Observable((subscriber) => {
        Observable.from(source).subscribe(subscriber, { signal: subscriber.signal });
      });
      expectObservable(e1).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should create an observable from error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('#');
      const sourceSubs = '(^!)';
      const expected = '  #';
      const e1 = new Observable((subscriber) => {
        Observable.from(source).subscribe(subscriber, { signal: subscriber.signal });
      });
      expectObservable(e1).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should create an observable when factory does not throw', async () => {
    await rxTest(({ expectObservable }) => {
      const e1 = new Observable((subscriber) => {
        Observable.from(
          (() => {
            if (1 !== Infinity) {
              throw 'error';
            }
            return Observable.from([]);
          })()
        ).subscribe(subscriber, { signal: subscriber.signal });
      });
      const expected = '#';
      expectObservable(e1).toBe(expected);
    });
  });
  it('should allow unsubscribing early and explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--|');
      const sourceSubs = '^-----!     ';
      const expected = '  --a--b-     ';
      const unsub = '     ------!     ';
      const e1 = new Observable((subscriber) => {
        Observable.from(source).subscribe(subscriber, { signal: subscriber.signal });
      });
      expectObservable(e1, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--|');
      const sourceSubs = '^-----!     ';
      const expected = '  --a--b-     ';
      const unsub = '     ------!     ';
      const e1 = new Observable((subscriber) => {
        Observable.from(source[mergeMap]((x) => Observable.from([x]))[mergeMap]((x) => Observable.from([x]))).subscribe(subscriber, {
          signal: subscriber.signal,
        });
      });
      expectObservable(e1, unsub).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
});
