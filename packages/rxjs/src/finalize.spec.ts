import { afterEach, beforeAll, describe, expect, expectTypeOf, it, vi } from 'vitest';
import '@rxjs/observable-polyfill';

type FinalizeSymbol = typeof import('./finalize.js').finalize;

let finalize: FinalizeSymbol;
let platformFinally: Observable<unknown>['finally'];
let stringFinalizeDescriptor: PropertyDescriptor | undefined;

beforeAll(async () => {
  platformFinally = Observable.prototype.finally;
  stringFinalizeDescriptor = Object.getOwnPropertyDescriptor(Observable.prototype, 'finalize');
  ({ finalize } = await import('./finalize.js'));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('finalize', () => {
  it('runs exactly once after completion reaches the observer', () => {
    const events: string[] = [];
    const source = new Observable<number>((subscriber) => {
      subscriber.addTeardown(() => events.push('source teardown'));
      subscriber.next(1);
      subscriber.complete();
    });

    const finalized = source[finalize](() => events.push('finalize'));
    expectTypeOf(finalized).toEqualTypeOf<Observable<number>>();

    finalized.subscribe({
      next: (value) => events.push(`next ${value}`),
      complete: () => events.push('complete'),
    });

    expect(events).toEqual(['next 1', 'source teardown', 'complete', 'finalize']);
  });

  it('runs exactly once after an error reaches the observer', () => {
    const failure = new Error('source failed');
    const events: unknown[] = [];
    const source = new Observable<number>((subscriber) => {
      subscriber.addTeardown(() => events.push('source teardown'));
      subscriber.error(failure);
    });

    source[finalize](() => events.push('finalize')).subscribe({
      error: (error) => events.push(error),
    });

    expect(events).toEqual(['source teardown', failure, 'finalize']);
  });

  it('finalizes only after the last observer cancels and finalizes again after restart', () => {
    const events: string[] = [];
    let activations = 0;
    const source = new Observable<number>((subscriber) => {
      activations++;
      const activation = activations;
      subscriber.addTeardown(() => events.push(`source teardown ${activation}`));
    });
    const finalized = source[finalize](() => events.push('finalize'));
    const firstController = new AbortController();
    const secondController = new AbortController();

    finalized.subscribe(() => {}, { signal: firstController.signal });
    finalized.subscribe(() => {}, { signal: secondController.signal });

    expect(activations).toBe(1);
    expect(events).toEqual([]);

    firstController.abort();
    expect(events).toEqual([]);

    secondController.abort();
    expect(events).toEqual(['source teardown 1', 'finalize']);

    const restartedController = new AbortController();
    finalized.subscribe(() => {}, { signal: restartedController.signal });
    expect(activations).toBe(2);

    restartedController.abort();
    expect(events).toEqual(['source teardown 1', 'finalize', 'source teardown 2', 'finalize']);
  });

  it('host-reports a callback error after completion without changing completion', () => {
    const failure = new Error('finalize failed');
    const reportError = vi.fn();
    vi.stubGlobal('reportError', reportError);
    const events: string[] = [];
    const source = new Observable<void>((subscriber) => subscriber.complete());

    source[finalize](() => {
      throw failure;
    }).subscribe({
      error: () => events.push('error'),
      complete: () => events.push('complete'),
    });

    expect(events).toEqual(['complete']);
    expect(reportError).toHaveBeenCalledTimes(1);
    expect(reportError).toHaveBeenCalledWith(failure);
  });

  it('host-reports a callback error after a source error without replacing that error', () => {
    const sourceFailure = new Error('source failed');
    const finalizeFailure = new Error('finalize failed');
    const reportError = vi.fn();
    vi.stubGlobal('reportError', reportError);
    const receivedErrors: unknown[] = [];
    const source = new Observable<void>((subscriber) => subscriber.error(sourceFailure));

    source[finalize](() => {
      throw finalizeFailure;
    }).subscribe({
      error: (error) => receivedErrors.push(error),
    });

    expect(receivedErrors).toEqual([sourceFailure]);
    expect(reportError).toHaveBeenCalledTimes(1);
    expect(reportError).toHaveBeenCalledWith(finalizeFailure);
  });

  it('host-reports a callback error during last-observer cancellation', () => {
    const failure = new Error('finalize failed');
    const reportError = vi.fn();
    vi.stubGlobal('reportError', reportError);
    const controller = new AbortController();
    const source = new Observable<void>(() => {});

    source[finalize](() => {
      throw failure;
    }).subscribe(() => {}, { signal: controller.signal });

    controller.abort();

    expect(reportError).toHaveBeenCalledTimes(1);
    expect(reportError).toHaveBeenCalledWith(failure);
  });

  it('installs no string-named method and leaves the platform finally method untouched', () => {
    expect(finalize.description).toBe('finalize');
    expect(Symbol.keyFor(finalize)).toBeUndefined();
    expect(Object.getOwnPropertyDescriptor(Observable.prototype, 'finalize')).toEqual(stringFinalizeDescriptor);
    expect(Observable.prototype.finally).toBe(platformFinally);
    expect(Observable.prototype[finalize]).not.toBe(platformFinally);
  });
});
