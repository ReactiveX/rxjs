import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';

type BufferToggleSymbol = typeof import('./buffer-toggle.js').bufferToggle;

let bufferToggle: BufferToggleSymbol;
let hadStringMethod: boolean;

beforeAll(async () => {
  hadStringMethod = 'bufferToggle' in Observable.prototype;
  ({ bufferToggle } = await import('./buffer-toggle.js'));
});

describe('bufferToggle', () => {
  it('installs only its exact unique Symbol and preserves source and opening types', () => {
    const source = Observable.from([1, 2, 3]);
    const otherKey = Symbol('bufferToggle');
    const fromObservable = source[bufferToggle](Observable.from(['open']), (opening) => {
      expectTypeOf(opening).toEqualTypeOf<string>();
      return Observable.from([true]);
    });
    const fromPromise = source[bufferToggle](Promise.resolve({ id: 1 }), (opening) => {
      expectTypeOf(opening).toEqualTypeOf<{ id: number }>();
      return Promise.resolve();
    });
    type HasStringNamedBufferToggle = 'bufferToggle' extends keyof Observable<unknown> ? true : false;

    expectTypeOf(fromObservable).toEqualTypeOf<Observable<number[]>>();
    expectTypeOf(fromPromise).toEqualTypeOf<Observable<number[]>>();
    expectTypeOf<HasStringNamedBufferToggle>().toEqualTypeOf<false>();
    expect(hadStringMethod).toBe(false);
    expect('bufferToggle' in Observable.prototype).toBe(false);
    expect(bufferToggle.description).toBe('bufferToggle');
    expect(Symbol.keyFor(bufferToggle)).toBeUndefined();
    expect((Observable.prototype as unknown as Record<symbol, unknown>)[otherKey]).toBeUndefined();

    if (false) {
      // @ts-expect-error Both openings and a closing selector are required.
      source[bufferToggle]();
      // @ts-expect-error The selector must return an ObservableValue.
      source[bufferToggle](['open'], () => 1);
      // @ts-expect-error The selector parameter must match the opening value.
      source[bufferToggle](['open'], (opening: number) => [opening]);
    }
  });

  it('opens overlapping buffers and closes only the selected buffer on its first closing value', () => {
    const source = controllable<number>();
    const openings = controllable<'first' | 'second'>();
    const firstClosing = controllable<void>();
    const secondClosing = controllable<void>();
    const emitted: number[][] = [];

    source.observable
      [bufferToggle](openings.observable, (opening) =>
        opening === 'first' ? firstClosing.observable : secondClosing.observable
      )
      .subscribe((buffer) => emitted.push(buffer));

    openings.subscriber.next('first');
    source.subscriber.next(1);
    openings.subscriber.next('second');
    source.subscriber.next(2);
    firstClosing.subscriber.next(undefined);
    firstClosing.subscriber.next(undefined);
    source.subscriber.next(3);
    secondClosing.subscriber.next(undefined);

    expect(emitted).toEqual([
      [1, 2],
      [2, 3],
    ]);
    expect(firstClosing.teardowns).toBe(1);
    expect(secondClosing.teardowns).toBe(1);
  });

  it('keeps a buffer live when its closing input completes without a value', () => {
    const source = controllable<number>();
    const openings = controllable<void>();
    const closing = controllable<void>();
    const emitted: number[][] = [];

    source.observable[bufferToggle](openings.observable, () => closing.observable).subscribe((buffer) => emitted.push(buffer));

    openings.subscriber.next(undefined);
    source.subscriber.next(1);
    closing.subscriber.complete();
    source.subscriber.next(2);

    expect(emitted).toEqual([]);

    source.subscriber.complete();

    expect(emitted).toEqual([[1, 2]]);
  });

  it('flushes every live buffer in opening order when the source completes', () => {
    const source = controllable<number>();
    const openings = controllable<'first' | 'second' | 'third'>();
    const closings = {
      first: controllable<void>(),
      second: controllable<void>(),
      third: controllable<void>(),
    };
    const emitted: number[][] = [];
    const events: string[] = [];

    source.observable[bufferToggle](openings.observable, (opening) => closings[opening].observable).subscribe({
      next: (buffer) => {
        events.push('buffer');
        emitted.push(buffer);
      },
      complete: () => events.push('complete'),
    });

    openings.subscriber.next('first');
    source.subscriber.next(1);
    openings.subscriber.next('second');
    source.subscriber.next(2);
    openings.subscriber.next('third');
    source.subscriber.next(3);
    closings.second.subscriber.next(undefined);
    source.subscriber.next(4);
    source.subscriber.complete();

    expect(emitted).toEqual([
      [2, 3],
      [1, 2, 3, 4],
      [3, 4],
    ]);
    expect(events).toEqual(['buffer', 'buffer', 'buffer', 'complete']);
    expect(openings.subscriber.active).toBe(false);
    expect(closings.first.subscriber.active).toBe(false);
    expect(closings.third.subscriber.active).toBe(false);
  });

  it('activates synchronous openings and their closings before the source', () => {
    const events: unknown[] = [];
    const openings = new Observable<string>((subscriber) => {
      events.push('openings active');
      subscriber.next('open');
      subscriber.complete();
    });
    const source = new Observable<number>((subscriber) => {
      events.push('source active');
      subscriber.next(1);
      subscriber.complete();
    });

    source[bufferToggle](openings, (opening) => {
      events.push(['selector', opening]);
      return new Observable<void>((subscriber) => {
        events.push('closing active');
        subscriber.next(undefined);
      });
    }).subscribe({
      next: (buffer) => events.push(['buffer', buffer]),
      complete: () => events.push('complete'),
    });

    expect(events).toEqual([
      'openings active',
      ['selector', 'open'],
      'closing active',
      ['buffer', []],
      'source active',
      'complete',
    ]);
  });

  it('creates the buffer before invoking its selector so reentrant source values are retained', () => {
    const source = controllable<number>();
    const openings = controllable<void>();
    const closing = controllable<void>();
    const emitted: number[][] = [];

    source.observable[bufferToggle](openings.observable, () => {
      source.subscriber.next(1);
      return closing.observable;
    }).subscribe((buffer) => emitted.push(buffer));

    openings.subscriber.next(undefined);
    closing.subscriber.next(undefined);

    expect(emitted).toEqual([[1]]);
  });

  it('activates and immediately cancels the source after a synchronous openings error', () => {
    const failure = new Error('openings failed');
    const events: unknown[] = [];
    const openings = new Observable<never>((subscriber) => {
      events.push('openings active');
      subscriber.error(failure);
    });
    const source = new Observable<number>((subscriber) => {
      events.push(`source active: ${subscriber.active}`);
      subscriber.addTeardown(() => events.push('source teardown'));
    });

    source[bufferToggle](openings, () => []).subscribe({
      error: (error) => events.push(['error', error]),
    });

    expect(events).toEqual([
      'openings active',
      ['error', failure],
      'source active: true',
      'source teardown',
    ]);
  });

  it('discards live buffers on source, openings, and closing errors', () => {
    const sourceFailure = new Error('source failed');
    const source = controllable<number>();
    const sourceOpenings = controllable<void>();
    const sourceClosing = controllable<void>();
    const sourceEvents: unknown[] = [];

    source.observable[bufferToggle](sourceOpenings.observable, () => sourceClosing.observable).subscribe({
      next: (buffer) => sourceEvents.push(buffer),
      error: (error) => sourceEvents.push(error),
    });
    sourceOpenings.subscriber.next(undefined);
    source.subscriber.next(1);
    source.subscriber.error(sourceFailure);

    const openingsFailure = new Error('openings failed');
    const openingSource = controllable<number>();
    const openings = controllable<void>();
    const openingEvents: unknown[] = [];

    openingSource.observable[bufferToggle](openings.observable, () => []).subscribe({
      next: (buffer) => openingEvents.push(buffer),
      error: (error) => openingEvents.push(error),
    });
    openings.subscriber.error(openingsFailure);

    const closingFailure = new Error('closing failed');
    const closingSource = controllable<number>();
    const closingOpenings = controllable<void>();
    const closing = controllable<void>();
    const closingEvents: unknown[] = [];

    closingSource.observable[bufferToggle](closingOpenings.observable, () => closing.observable).subscribe({
      next: (buffer) => closingEvents.push(buffer),
      error: (error) => closingEvents.push(error),
    });
    closingOpenings.subscriber.next(undefined);
    closingSource.subscriber.next(1);
    closing.subscriber.error(closingFailure);

    expect(sourceEvents).toEqual([sourceFailure]);
    expect(sourceOpenings.subscriber.active).toBe(false);
    expect(sourceClosing.subscriber.active).toBe(false);
    expect(openingEvents).toEqual([openingsFailure]);
    expect(openingSource.subscriber.active).toBe(false);
    expect(closingEvents).toEqual([closingFailure]);
    expect(closingSource.subscriber.active).toBe(false);
  });

  it('forwards openings, selector, and closing conversion failures', () => {
    const openingConversionFailure = new Error('opening conversion failed');
    const invalidOpenings = throwingIterable(openingConversionFailure);
    const openingErrors: unknown[] = [];
    const openingSource = new Observable<number>(() => {});

    openingSource[bufferToggle](invalidOpenings, () => []).subscribe({
      error: (error) => openingErrors.push(error),
    });

    const selectorFailure = new Error('selector failed');
    const selectorSource = controllable<number>();
    const selectorOpenings = controllable<void>();
    const selectorErrors: unknown[] = [];

    selectorSource.observable[bufferToggle](selectorOpenings.observable, () => {
      throw selectorFailure;
    }).subscribe({ error: (error) => selectorErrors.push(error) });
    selectorOpenings.subscriber.next(undefined);

    const closingConversionFailure = new Error('closing conversion failed');
    const conversionSource = controllable<number>();
    const conversionOpenings = controllable<void>();
    const conversionErrors: unknown[] = [];

    conversionSource.observable[bufferToggle](conversionOpenings.observable, () =>
      throwingIterable(closingConversionFailure)
    ).subscribe({ error: (error) => conversionErrors.push(error) });
    conversionOpenings.subscriber.next(undefined);

    expect(openingErrors).toEqual([openingConversionFailure]);
    expect(selectorErrors).toEqual([selectorFailure]);
    expect(selectorSource.subscriber.active).toBe(false);
    expect(conversionErrors).toEqual([closingConversionFailure]);
    expect(conversionSource.subscriber.active).toBe(false);
  });

  it('cancels source, openings, and every closing without flushing when the final observer leaves', () => {
    const source = controllable<number>();
    const openings = controllable<0 | 1>();
    const closings = [controllable<void>(), controllable<void>()] as const;
    const controller = new AbortController();
    const emitted: number[][] = [];

    source.observable[bufferToggle](openings.observable, (index) => closings[index].observable).subscribe(
      (buffer) => emitted.push(buffer),
      { signal: controller.signal }
    );
    openings.subscriber.next(0);
    source.subscriber.next(1);
    openings.subscriber.next(1);
    source.subscriber.next(2);

    controller.abort();

    expect(emitted).toEqual([]);
    expect(source.subscriber.active).toBe(false);
    expect(openings.subscriber.active).toBe(false);
    expect(closings[0].subscriber.active).toBe(false);
    expect(closings[1].subscriber.active).toBe(false);
    expect(source.teardowns).toBe(1);
    expect(openings.teardowns).toBe(1);
    expect(closings[0].teardowns).toBe(1);
    expect(closings[1].teardowns).toBe(1);
  });

  it('shares and ref-counts one buffer activation, then restarts with empty state', () => {
    const source = tracked<number>();
    const openings = tracked<void>();
    const closing = tracked<void>();
    const result = source.observable[bufferToggle](openings.observable, () => closing.observable);
    const firstController = new AbortController();
    const secondController = new AbortController();
    const restartController = new AbortController();
    const firstBuffers: number[][] = [];
    const secondBuffers: number[][] = [];
    const restartedBuffers: number[][] = [];

    result.subscribe((buffer) => firstBuffers.push(buffer), { signal: firstController.signal });
    result.subscribe((buffer) => secondBuffers.push(buffer), { signal: secondController.signal });

    expect(source.activations).toBe(1);
    expect(openings.activations).toBe(1);

    openings.subscribers[0]!.next(undefined);
    expect(closing.activations).toBe(1);
    source.subscribers[0]!.next(1);
    firstController.abort();
    source.subscribers[0]!.next(2);
    closing.subscribers[0]!.next(undefined);

    expect(firstBuffers).toEqual([]);
    expect(secondBuffers).toEqual([[1, 2]]);
    expect(source.teardowns).toBe(0);

    secondController.abort();
    expect(source.teardowns).toBe(1);
    expect(openings.teardowns).toBe(1);

    result.subscribe((buffer) => restartedBuffers.push(buffer), { signal: restartController.signal });
    expect(source.activations).toBe(2);
    expect(openings.activations).toBe(2);
    openings.subscribers[1]!.next(undefined);
    source.subscribers[1]!.next(3);
    closing.subscribers[1]!.next(undefined);

    expect(restartedBuffers).toEqual([[3]]);

    restartController.abort();
    expect(source.teardowns).toBe(2);
    expect(openings.teardowns).toBe(2);
  });

  it('converts resolved and rejected Promise openings and closings', async () => {
    const resolvedSource = controllable<number>();
    let resolveClosing: (() => void) | undefined;
    const closingPromise = new Promise<void>((resolve) => {
      resolveClosing = resolve;
    });
    const resolvedBuffers: number[][] = [];

    resolvedSource.observable[bufferToggle](Promise.resolve('open'), () => closingPromise).subscribe((buffer) =>
      resolvedBuffers.push(buffer)
    );
    await Promise.resolve();
    resolvedSource.subscriber.next(1);
    resolveClosing!();
    await Promise.resolve();

    expect(resolvedBuffers).toEqual([[1]]);

    const openingFailure = new Error('Promise openings failed');
    const openingSource = controllable<number>();
    const openingErrors: unknown[] = [];
    openingSource.observable[bufferToggle](Promise.reject(openingFailure), () => []).subscribe({
      error: (error) => openingErrors.push(error),
    });
    await Promise.resolve();

    const closingFailure = new Error('Promise closing failed');
    const closingSource = controllable<number>();
    const closingErrors: unknown[] = [];
    closingSource.observable[bufferToggle](Promise.resolve('open'), () => Promise.reject(closingFailure)).subscribe({
      error: (error) => closingErrors.push(error),
    });
    await Promise.resolve();
    await Promise.resolve();

    expect(openingErrors).toEqual([openingFailure]);
    expect(openingSource.subscriber.active).toBe(false);
    expect(closingErrors).toEqual([closingFailure]);
    expect(closingSource.subscriber.active).toBe(false);
  });
});

function controllable<T>(): {
  readonly observable: Observable<T>;
  readonly subscriber: Subscriber<T>;
  readonly teardowns: number;
} {
  let sourceSubscriber: Subscriber<T> | undefined;
  let teardowns = 0;
  const observable = new Observable<T>((subscriber) => {
    sourceSubscriber = subscriber;
    subscriber.addTeardown(() => {
      teardowns++;
    });
  });
  return {
    observable,
    get subscriber() {
      if (!sourceSubscriber) {
        throw new Error('Expected source activation.');
      }
      return sourceSubscriber;
    },
    get teardowns() {
      return teardowns;
    },
  };
}

function tracked<T>(): {
  readonly observable: Observable<T>;
  readonly subscribers: Subscriber<T>[];
  readonly activations: number;
  readonly teardowns: number;
} {
  const subscribers: Subscriber<T>[] = [];
  let activations = 0;
  let teardowns = 0;
  const observable = new Observable<T>((subscriber) => {
    activations++;
    subscribers.push(subscriber);
    subscriber.addTeardown(() => {
      teardowns++;
    });
  });
  return {
    observable,
    subscribers,
    get activations() {
      return activations;
    },
    get teardowns() {
      return teardowns;
    },
  };
}

function throwingIterable(error: unknown): ObservableValue<never> {
  return Object.defineProperty({}, Symbol.iterator, {
    get() {
      throw error;
    },
  }) as ObservableValue<never>;
}
