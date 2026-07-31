import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { Subject } from './subject.js';

type WindowSymbol = typeof import('./window.js').window;

let window: WindowSymbol;
let hadStringMethod: boolean;

beforeAll(async () => {
  hadStringMethod = 'window' in Observable.prototype;
  ({ window } = await import('./window.js'));
});

describe('window', () => {
  it('installs only its exact unique Symbol and returns read-only Observable windows', () => {
    const source = new Observable<number>(() => {});
    const boundaries = new Observable<void>(() => {});
    const result = source[window](boundaries);
    const emitted: Observable<number>[] = [];
    const otherKey = Symbol('window');
    const controller = new AbortController();
    type HasStringNamedWindow = 'window' extends keyof Observable<unknown> ? true : false;

    result.subscribe((inner) => emitted.push(inner), { signal: controller.signal });

    expectTypeOf(result).toEqualTypeOf<Observable<Observable<number>>>();
    expectTypeOf<HasStringNamedWindow>().toEqualTypeOf<false>();
    expect(emitted).toHaveLength(1);
    expect(emitted[0]).toBeInstanceOf(Observable);
    expect(emitted[0]).not.toBeInstanceOf(Subject);
    expect('next' in emitted[0]!).toBe(false);
    expect('error' in emitted[0]!).toBe(false);
    expect('complete' in emitted[0]!).toBe(false);
    expect(hadStringMethod).toBe(false);
    expect('window' in Observable.prototype).toBe(false);
    expect(window.description).toBe('window');
    expect(Symbol.keyFor(window)).toBeUndefined();
    expect((Observable.prototype as unknown as Record<symbol, unknown>)[otherKey]).toBeUndefined();

    if (false) {
      // @ts-expect-error A boundary input is required.
      source[window]();
      // @ts-expect-error A number is not an ObservableValue.
      source[window](1);
    }

    controller.abort();
  });

  it('emits the initial window, activates the source before boundaries, and rotates on boundary values', () => {
    const events: string[] = [];
    const observations: string[][] = [];
    let sourceSubscriber: Subscriber<number> | undefined;
    let boundarySubscriber: Subscriber<void> | undefined;
    const source = new Observable<number>((subscriber) => {
      events.push('source active');
      sourceSubscriber = subscriber;
    });
    const boundaries = new Observable<void>((subscriber) => {
      events.push('boundaries active');
      boundarySubscriber = subscriber;
    });

    source[window](boundaries).subscribe((inner) => {
      const index = observations.length;
      events.push(`open ${index}`);
      const values: string[] = [];
      observations.push(values);
      inner.subscribe({
        next: (value) => values.push(String(value)),
        complete: () => {
          events.push(`close ${index}`);
          values.push('complete');
        },
      });
    });

    expect(events).toEqual(['open 0', 'source active', 'boundaries active']);

    sourceSubscriber!.next(1);
    boundarySubscriber!.next(undefined);
    sourceSubscriber!.next(2);
    boundarySubscriber!.next(undefined);
    sourceSubscriber!.next(3);
    sourceSubscriber!.complete();

    expect(observations).toEqual([
      ['1', 'complete'],
      ['2', 'complete'],
      ['3', 'complete'],
    ]);
    expect(events).toEqual([
      'open 0',
      'source active',
      'boundaries active',
      'close 0',
      'open 1',
      'close 1',
      'open 2',
      'close 2',
    ]);
  });

  it('activates an immediately cancelled boundary only after a synchronous source completes', () => {
    const events: string[] = [];
    const source = new Observable<number>((subscriber) => {
      events.push('source active');
      subscriber.complete();
    });
    const boundaries = new Observable<void>((subscriber) => {
      events.push(`boundaries active: ${subscriber.active}`);
      subscriber.addTeardown(() => events.push('boundaries teardown'));
    });

    source[window](boundaries).subscribe({
      next: (inner) => {
        events.push('open');
        inner.subscribe({
          complete: () => events.push('window complete'),
        });
      },
      complete: () => events.push('outer complete'),
    });

    expect(events).toEqual([
      'open',
      'source active',
      'window complete',
      'outer complete',
      'boundaries active: true',
      'boundaries teardown',
    ]);
  });

  it('leaves the current window and source active when boundaries complete', () => {
    const source = controllable<number>();
    const boundaries = controllable<void>();
    const observations: Array<number | 'window complete' | 'outer complete'> = [];

    source.observable[window](boundaries.observable).subscribe({
      next: (inner) => {
        inner.subscribe({
          next: (value) => observations.push(value),
          complete: () => observations.push('window complete'),
        });
      },
      complete: () => observations.push('outer complete'),
    });

    boundaries.subscriber.complete();
    source.subscriber.next(1);

    expect(source.subscriber.active).toBe(true);
    expect(observations).toEqual([1]);

    source.subscriber.complete();

    expect(observations).toEqual([1, 'window complete', 'outer complete']);
  });

  it('completes the current window before the outer result and cancels boundary work', () => {
    const source = controllable<number>();
    const boundaries = controllable<void>();
    const events: string[] = [];

    source.observable[window](boundaries.observable).subscribe({
      next: (inner) => {
        events.push('open');
        inner.subscribe({
          next: (value) => events.push(String(value)),
          complete: () => events.push('window complete'),
        });
      },
      complete: () => events.push('outer complete'),
    });

    source.subscriber.next(1);
    source.subscriber.complete();

    expect(events).toEqual(['open', '1', 'window complete', 'outer complete']);
    expect(source.teardowns).toBe(1);
    expect(boundaries.teardowns).toBe(1);
    expect(boundaries.subscriber.active).toBe(false);
  });

  it('errors the current window before the outer result for source and boundary failures', () => {
    const sourceFailure = new Error('source failed');
    const source = controllable<number>();
    const sourceBoundaries = controllable<void>();
    const sourceEvents: unknown[] = [];

    source.observable[window](sourceBoundaries.observable).subscribe({
      next: (inner) => inner.subscribe({ error: (error) => sourceEvents.push(['window', error]) }),
      error: (error) => sourceEvents.push(['outer', error]),
    });
    source.subscriber.error(sourceFailure);

    const boundaryFailure = new Error('boundary failed');
    const boundarySource = controllable<number>();
    const boundaries = controllable<void>();
    const boundaryEvents: unknown[] = [];

    boundarySource.observable[window](boundaries.observable).subscribe({
      next: (inner) => inner.subscribe({ error: (error) => boundaryEvents.push(['window', error]) }),
      error: (error) => boundaryEvents.push(['outer', error]),
    });
    boundaries.subscriber.error(boundaryFailure);

    expect(sourceEvents).toEqual([
      ['window', sourceFailure],
      ['outer', sourceFailure],
    ]);
    expect(sourceBoundaries.subscriber.active).toBe(false);
    expect(boundaryEvents).toEqual([
      ['window', boundaryFailure],
      ['outer', boundaryFailure],
    ]);
    expect(boundarySource.subscriber.active).toBe(false);
  });

  it('reports boundary conversion errors after source activation and cancels the source', () => {
    const failure = new Error('conversion failed');
    const events: unknown[] = [];
    const source = controllable<number>();
    const invalidBoundaries = Object.defineProperty({}, Symbol.iterator, {
      get() {
        events.push('convert boundaries');
        throw failure;
      },
    });

    source.observable[window](invalidBoundaries as ObservableValue<never>).subscribe({
      next: (inner) => {
        events.push('open');
        inner.subscribe({ error: (error) => events.push(['window error', error]) });
      },
      error: (error) => events.push(['outer error', error]),
    });

    expect(events).toEqual([
      'open',
      'convert boundaries',
      ['window error', failure],
      ['outer error', failure],
    ]);
    expect(source.subscriber.active).toBe(false);
    expect(source.teardowns).toBe(1);
  });

  it('silently releases the current window and cancels both inputs when the outer result is cancelled', () => {
    const source = controllable<number>();
    const boundaries = controllable<void>();
    const outerController = new AbortController();
    const innerController = new AbortController();
    const terminalEvents: string[] = [];

    source.observable[window](boundaries.observable).subscribe(
      (inner) => {
        inner.subscribe(
          {
            complete: () => terminalEvents.push('complete'),
            error: () => terminalEvents.push('error'),
          },
          { signal: innerController.signal }
        );
      },
      { signal: outerController.signal }
    );

    outerController.abort();

    expect(source.subscriber.active).toBe(false);
    expect(boundaries.subscriber.active).toBe(false);
    expect(source.teardowns).toBe(1);
    expect(boundaries.teardowns).toBe(1);
    expect(terminalEvents).toEqual([]);

    innerController.abort();
  });

  it('shares and ref-counts one run, then restarts with a fresh initial window', () => {
    const source = tracked<number>();
    const boundaries = tracked<void>();
    const result = source.observable[window](boundaries.observable);
    const firstController = new AbortController();
    const secondController = new AbortController();
    const restartController = new AbortController();
    const firstWindows: Observable<number>[] = [];
    const secondWindows: Observable<number>[] = [];
    const restartedWindows: Observable<number>[] = [];

    result.subscribe((inner) => firstWindows.push(inner), { signal: firstController.signal });
    result.subscribe((inner) => secondWindows.push(inner), { signal: secondController.signal });

    expect(source.activations).toBe(1);
    expect(boundaries.activations).toBe(1);
    expect(firstWindows).toHaveLength(1);
    expect(secondWindows).toHaveLength(0);

    boundaries.subscribers[0]!.next(undefined);

    expect(firstWindows).toHaveLength(2);
    expect(secondWindows).toHaveLength(1);
    expect(firstWindows[1]).toBe(secondWindows[0]);

    firstController.abort();
    expect(source.teardowns).toBe(0);
    expect(boundaries.teardowns).toBe(0);

    secondController.abort();
    expect(source.teardowns).toBe(1);
    expect(boundaries.teardowns).toBe(1);

    result.subscribe((inner) => restartedWindows.push(inner), { signal: restartController.signal });

    expect(source.activations).toBe(2);
    expect(boundaries.activations).toBe(2);
    expect(restartedWindows).toHaveLength(1);
    expect(restartedWindows[0]).not.toBe(firstWindows[0]);

    restartController.abort();
    expect(source.teardowns).toBe(2);
    expect(boundaries.teardowns).toBe(2);
  });

  it('converts iterable and Promise boundary inputs', async () => {
    const iterableSource = controllable<number>();
    const iterableObservations: string[][] = [];

    iterableSource.observable[window](['rotate']).subscribe((inner) => {
      const values: string[] = [];
      iterableObservations.push(values);
      inner.subscribe({
        next: (value) => values.push(String(value)),
        complete: () => values.push('complete'),
      });
    });

    expect(iterableObservations).toEqual([['complete'], []]);
    iterableSource.subscriber.next(1);
    iterableSource.subscriber.complete();
    expect(iterableObservations).toEqual([['complete'], ['1', 'complete']]);

    const promiseSource = controllable<number>();
    const promiseObservations: string[][] = [];
    let resolveBoundary: (() => void) | undefined;
    const promiseBoundary = new Promise<void>((resolve) => {
      resolveBoundary = resolve;
    });

    promiseSource.observable[window](promiseBoundary).subscribe((inner) => {
      const values: string[] = [];
      promiseObservations.push(values);
      inner.subscribe({
        next: (value) => values.push(String(value)),
        complete: () => values.push('complete'),
      });
    });

    promiseSource.subscriber.next(1);
    resolveBoundary!();
    await Promise.resolve();
    promiseSource.subscriber.next(2);
    promiseSource.subscriber.complete();

    expect(promiseObservations).toEqual([
      ['1', 'complete'],
      ['2', 'complete'],
    ]);
  });

  it('forwards a rejected Promise boundary to the current window before the outer result', async () => {
    const failure = new Error('Promise boundary failed');
    const source = controllable<number>();
    const events: unknown[] = [];

    source.observable[window](Promise.reject(failure)).subscribe({
      next: (inner) => inner.subscribe({ error: (error) => events.push(['window', error]) }),
      error: (error) => events.push(['outer', error]),
    });

    await Promise.resolve();

    expect(events).toEqual([
      ['window', failure],
      ['outer', failure],
    ]);
    expect(source.subscriber.active).toBe(false);
    expect(source.teardowns).toBe(1);
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
