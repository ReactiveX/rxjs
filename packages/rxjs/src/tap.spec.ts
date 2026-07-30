import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';

type TapSymbol = typeof import('./tap.js').tap;

let tap: TapSymbol;
let hadStringTap: boolean;

beforeAll(async () => {
  hadStringTap = 'tap' in Observable.prototype;
  ({ tap } = await import('./tap.js'));
});

describe('tap', () => {
  it('installs only an exact Symbol-keyed operator', () => {
    expect(hadStringTap).toBe(false);
    expect('tap' in Observable.prototype).toBe(false);
    expect(tap.description).toBe('tap');
    expect(Symbol.keyFor(tap)).toBeUndefined();
  });

  it('mirrors values and preserves notification ordering for a function callback', () => {
    const events: string[] = [];
    const tapped = fromValues(1, 2)[tap]((value) => events.push(`tap ${value}`));
    expectTypeOf(tapped).toEqualTypeOf<Observable<number>>();

    tapped.subscribe({
      next: (value) => events.push(`next ${value}`),
      complete: () => events.push('downstream complete'),
    });

    expect(events).toEqual(['tap 1', 'next 1', 'tap 2', 'next 2', 'downstream complete']);
  });

  it('supports partial observers and runs error side effects before forwarding the source error', () => {
    const sourceError = new Error('source failed');
    const events: string[] = [];
    const source = new Observable<number>((subscriber) => {
      events.push('source subscribe');
      subscriber.next(1);
      subscriber.error(sourceError);
    });

    source
      [tap]({
        subscribe: () => events.push('tap subscribe'),
        next: (value) => events.push(`tap next ${value}`),
        error: (error) => events.push(`tap error ${(error as Error).message}`),
        unsubscribe: () => events.push('tap unsubscribe'),
        finalize: () => events.push('tap finalize'),
      })
      .subscribe({
        next: (value) => events.push(`downstream next ${value}`),
        error: (error) => events.push(`downstream error ${(error as Error).message}`),
      });

    expect(events).toEqual([
      'tap subscribe',
      'source subscribe',
      'tap next 1',
      'downstream next 1',
      'tap error source failed',
      'downstream error source failed',
      'tap finalize',
    ]);
  });

  it('runs complete and finalize hooks without the explicit-unsubscribe hook on natural completion', () => {
    const events: string[] = [];

    fromValues(1)
      [tap]({
        complete: () => events.push('tap complete'),
        unsubscribe: () => events.push('tap unsubscribe'),
        finalize: () => events.push('tap finalize'),
      })
      .subscribe({
        complete: () => events.push('downstream complete'),
      });

    expect(events).toEqual(['tap complete', 'downstream complete', 'tap finalize']);
  });

  it('supports separate callbacks and runs completion side effects before forwarding completion', () => {
    const events: string[] = [];

    fromValues(1)
      [tap](
        (value) => events.push(`tap next ${value}`),
        (error) => events.push(`tap error ${String(error)}`),
        () => events.push('tap complete')
      )
      .subscribe({
        next: (value) => events.push(`downstream next ${value}`),
        complete: () => events.push('downstream complete'),
      });

    expect(events).toEqual(['tap next 1', 'downstream next 1', 'tap complete', 'downstream complete']);
  });

  it('returns the source unchanged when no observer or callback is supplied', () => {
    const source = fromValues(1);

    expect(source[tap]()).toBe(source);
    expect(source[tap](null, null, null)).toBe(source);
  });

  it('turns an error thrown by a next callback into an error and cancels synchronous source work', () => {
    const callbackError = new Error('next callback failed');
    const produced: number[] = [];
    const errors: unknown[] = [];
    const source = new Observable<number>((subscriber) => {
      for (const value of [1, 2, 3]) {
        if (!subscriber.active) {
          break;
        }
        produced.push(value);
        subscriber.next(value);
      }
    });

    source
      [tap]((value) => {
        if (value === 2) {
          throw callbackError;
        }
      })
      .subscribe({
        error: (error) => errors.push(error),
      });

    expect(errors).toEqual([callbackError]);
    expect(produced).toEqual([1, 2]);
  });

  it('replaces a source error with an error thrown by the error callback', () => {
    const callbackError = new Error('error callback failed');
    const errors: unknown[] = [];
    const source = new Observable<number>((subscriber) => subscriber.error(new Error('source failed')));

    source
      [tap]({
        error: () => {
          throw callbackError;
        },
      })
      .subscribe({
        error: (error) => errors.push(error),
      });

    expect(errors).toEqual([callbackError]);
  });

  it('turns an error thrown by the complete callback into an error', () => {
    const callbackError = new Error('complete callback failed');
    const events: string[] = [];
    const source = new Observable<number>((subscriber) => subscriber.complete());

    source
      [tap]({
        complete: () => {
          throw callbackError;
        },
      })
      .subscribe({
        error: (error) => events.push(`error ${(error as Error).message}`),
        complete: () => events.push('complete'),
      });

    expect(events).toEqual(['error complete callback failed']);
  });

  it('shares side effects, ref-counts explicit cancellation, and restarts lifecycle hooks', () => {
    let sourceSubscriber: Subscriber<number> | undefined;
    let sourceActivations = 0;
    let sourceTeardowns = 0;
    const lifecycle: string[] = [];
    const source = new Observable<number>((subscriber) => {
      sourceActivations++;
      sourceSubscriber = subscriber;
      subscriber.addTeardown(() => sourceTeardowns++);
    });
    const tapped = source[tap]({
      subscribe: () => lifecycle.push('subscribe'),
      next: (value) => lifecycle.push(`next ${value}`),
      unsubscribe: () => lifecycle.push('unsubscribe'),
      finalize: () => lifecycle.push('finalize'),
    });
    const firstResults: number[] = [];
    const secondResults: number[] = [];
    const firstController = new AbortController();
    const secondController = new AbortController();

    tapped.subscribe((value) => firstResults.push(value), { signal: firstController.signal });
    tapped.subscribe((value) => secondResults.push(value), { signal: secondController.signal });
    sourceSubscriber?.next(1);

    expect(firstResults).toEqual([1]);
    expect(secondResults).toEqual([1]);
    expect(lifecycle).toEqual(['subscribe', 'next 1']);
    expect(sourceActivations).toBe(1);

    firstController.abort();
    expect(lifecycle).toEqual(['subscribe', 'next 1']);
    expect(sourceSubscriber?.active).toBe(true);

    secondController.abort();
    expect(sourceSubscriber?.active).toBe(false);
    expect(sourceTeardowns).toBe(1);
    expect(lifecycle).toEqual(['subscribe', 'next 1', 'unsubscribe', 'finalize']);

    tapped.subscribe(() => {});
    sourceSubscriber?.next(2);

    expect(sourceActivations).toBe(2);
    expect(lifecycle).toEqual(['subscribe', 'next 1', 'unsubscribe', 'finalize', 'subscribe', 'next 2']);
  });
});

function fromValues<T>(...values: T[]): Observable<T> {
  return new Observable<T>((subscriber) => {
    for (const value of values) {
      subscriber.next(value);
    }
    subscriber.complete();
  });
}
