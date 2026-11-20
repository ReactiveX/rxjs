import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import '@rxjs/observable-polyfill';
import { takeLast } from './take-last.js';
import { ColdObservable } from './cold-observable.js';
import { Subject } from './subject.js';

describe('takeLast', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([Observable, ColdObservable])('stops draining buffered values when its observer aborts', (Ctor) => {
    const reportError = vi.fn();
    vi.stubGlobal('reportError', reportError);
    const controller = new AbortController();
    const events: Array<number | 'complete'> = [];
    const source = new Ctor<number>((subscriber) => {
      subscriber.next(1);
      subscriber.next(2);
      subscriber.next(3);
      subscriber.complete();
    });

    source[takeLast](3).subscribe(
      {
        next: (value) => {
          events.push(value);
          controller.abort();
        },
        complete: () => events.push('complete'),
      },
      { signal: controller.signal }
    );

    expect(events).toEqual([1]);
    expect(reportError).not.toHaveBeenCalled();
  });

  it('continues draining for another observer after one aborts', () => {
    const controller = new AbortController();
    const first: number[] = [];
    const second: Array<number | 'complete'> = [];
    const source = new Subject<number>();
    const taken = source[takeLast](3);
    taken.subscribe(
      (value) => {
        first.push(value);
        controller.abort();
      },
      { signal: controller.signal }
    );
    taken.subscribe({ next: (value) => second.push(value), complete: () => second.push('complete') });
    source.next(1);
    source.next(2);
    source.next(3);
    source.complete();
    expect(first).toEqual([1]);
    expect(second).toEqual([1, 2, 3, 'complete']);
  });

  it.each([0, -42])('completes without subscribing to the source for a count of %s', (amount) => {
    let subscriptions = 0;
    const results: string[] = [];
    const source = new Observable<string>((subscriber) => {
      subscriptions++;
      subscriber.next('value');
      subscriber.complete();
    });

    const taken = source[takeLast](amount);
    expectTypeOf(taken).toEqualTypeOf<Observable<string>>();

    taken.subscribe({
      next: (value) => results.push(value),
      complete: () => results.push('complete'),
    });

    expect(results).toEqual(['complete']);
    expect(subscriptions).toBe(0);
  });

  it('exposes the extension through the exported Symbol only', () => {
    const source = new Observable<number>(() => {});
    type HasStringNamedTakeLast = Observable<number> extends { takeLast: unknown } ? true : false;

    expectTypeOf<HasStringNamedTakeLast>().toEqualTypeOf<false>();
    expect(source[takeLast]).toBeTypeOf('function');
    expect('takeLast' in source).toBe(false);
  });
});
