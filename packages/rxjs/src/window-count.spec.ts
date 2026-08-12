import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { Subject } from './subject.js';

type WindowCountSymbol = typeof import('./window-count.js').windowCount;

let windowCount: WindowCountSymbol;
let hadStringMethod: boolean;

beforeAll(async () => {
  hadStringMethod = 'windowCount' in Observable.prototype;
  ({ windowCount } = await import('./window-count.js'));
});

describe('windowCount', () => {
  it('installs only its exact unique Symbol and returns read-only Observable windows', () => {
    const source = new Observable<number>(() => {});
    const windows = source[windowCount](2);
    const emitted: Observable<number>[] = [];
    const otherKey = Symbol('windowCount');
    const controller = new AbortController();

    windows.subscribe((window) => emitted.push(window), { signal: controller.signal });

    expectTypeOf(windows).toEqualTypeOf<Observable<Observable<number>>>();
    expect(emitted).toHaveLength(1);
    expect(emitted[0]).toBeInstanceOf(Observable);
    expect(emitted[0]).not.toBeInstanceOf(Subject);
    expect('next' in emitted[0]!).toBe(false);
    expect('error' in emitted[0]!).toBe(false);
    expect('complete' in emitted[0]!).toBe(false);
    expect(hadStringMethod).toBe(false);
    expect('windowCount' in Observable.prototype).toBe(false);
    expect(windowCount.description).toBe('windowCount');
    expect(Symbol.keyFor(windowCount)).toBeUndefined();
    expect((Observable.prototype as unknown as Record<symbol, unknown>)[otherKey]).toBeUndefined();

    controller.abort();
  });

  it('emits the initial window before source activation and opens each next window before its boundary value', () => {
    const events: string[] = [];
    const innerEvents: string[][] = [];
    let sourceSubscriber: Subscriber<number> | undefined;
    const source = new Observable<number>((subscriber) => {
      events.push('source active');
      sourceSubscriber = subscriber;
    });

    source[windowCount](2).subscribe((window) => {
      const index = innerEvents.length;
      events.push(`open ${index}`);
      const values: string[] = [];
      innerEvents.push(values);
      window.subscribe({
        next: (value) => {
          events.push(`window ${index}: ${value}`);
          values.push(String(value));
        },
        complete: () => {
          events.push(`close ${index}`);
          values.push('complete');
        },
      });
    });

    expect(events).toEqual(['open 0', 'source active']);

    sourceSubscriber!.next(1);
    sourceSubscriber!.next(2);

    expect(events).toEqual(['open 0', 'source active', 'window 0: 1', 'window 0: 2', 'close 0', 'open 1']);

    sourceSubscriber!.next(3);
    sourceSubscriber!.complete();

    expect(innerEvents).toEqual([
      ['1', '2', 'complete'],
      ['3', 'complete'],
    ]);
  });

  it('supports overlapping windows, closes each at its size, and completes every live window', () => {
    const observations = collectWindows(Observable.from(['a', 'b', 'c', 'd', 'e']), 3, 1);

    expect(observations).toEqual([
      ['a', 'b', 'c', 'complete'],
      ['b', 'c', 'd', 'complete'],
      ['c', 'd', 'e', 'complete'],
      ['d', 'e', 'complete'],
      ['e', 'complete'],
      ['complete'],
    ]);
  });

  it('supports gaps between windows', () => {
    const observations = collectWindows(Observable.from(['a', 'b', 'c', 'd', 'e', 'f', 'g']), 2, 3);

    expect(observations).toEqual([
      ['a', 'b', 'complete'],
      ['d', 'e', 'complete'],
      ['g', 'complete'],
    ]);
  });

  it('errors every live window before forwarding the source error to the outer observer', () => {
    const failure = new Error('source failed');
    const source = controllable<number>();
    const events: unknown[] = [];

    source.observable[windowCount](3, 1).subscribe({
      next: (window) => {
        const index = events.filter((event) => typeof event === 'string' && event.startsWith('open')).length;
        events.push(`open ${index}`);
        window.subscribe({
          next: (value) => events.push(`window ${index}: ${value}`),
          error: (error) => events.push(['window error', index, error]),
        });
      },
      error: (error) => events.push(['outer error', error]),
    });

    source.subscriber.next(1);
    source.subscriber.next(2);
    source.subscriber.error(failure);

    expect(events).toEqual([
      'open 0',
      'window 0: 1',
      'open 1',
      'window 0: 2',
      'window 1: 2',
      'open 2',
      ['window error', 0, failure],
      ['window error', 1, failure],
      ['window error', 2, failure],
      ['outer error', failure],
    ]);
  });

  it('tears down the source and silently releases live windows when the outer result is cancelled', () => {
    const source = controllable<number>();
    const controller = new AbortController();
    const windowControllers: AbortController[] = [];
    const windowTerminals: string[] = [];

    source.observable[windowCount](3, 1).subscribe(
      (window) => {
        const index = windowTerminals.length;
        const windowController = new AbortController();
        windowControllers.push(windowController);
        windowTerminals.push('active');
        window.subscribe(
          {
            complete: () => {
              windowTerminals[index] = 'complete';
            },
          },
          { signal: windowController.signal }
        );
      },
      { signal: controller.signal }
    );

    source.subscriber.next(1);
    expect(windowTerminals).toEqual(['active', 'active']);

    controller.abort();

    expect(source.subscriber.active).toBe(false);
    expect(source.teardowns).toBe(1);
    expect(windowTerminals).toEqual(['active', 'active']);

    for (const windowController of windowControllers) {
      windowController.abort();
    }
  });

  it('shares and ref-counts one run across outer observers, then restarts with fresh windows', () => {
    const source = tracked<number>();
    const windows = source.observable[windowCount](2, 1);
    const firstController = new AbortController();
    const secondController = new AbortController();
    const restartedController = new AbortController();
    const firstWindows: Observable<number>[] = [];
    const secondWindows: Observable<number>[] = [];
    const restartedWindows: Observable<number>[] = [];
    const sharedWindowTerminals: string[] = [];
    const sharedWindowController = new AbortController();

    windows.subscribe((window) => firstWindows.push(window), { signal: firstController.signal });
    windows.subscribe((window) => secondWindows.push(window), { signal: secondController.signal });

    expect(source.activations).toBe(1);
    expect(firstWindows).toHaveLength(1);
    expect(secondWindows).toHaveLength(0);

    source.subscribers[0]!.next(1);

    expect(firstWindows).toHaveLength(2);
    expect(secondWindows).toHaveLength(1);
    expect(firstWindows[1]).toBe(secondWindows[0]);

    firstWindows[0]!.subscribe(
      { complete: () => sharedWindowTerminals.push('initial complete') },
      { signal: sharedWindowController.signal }
    );
    firstWindows[1]!.subscribe(
      { complete: () => sharedWindowTerminals.push('shared complete') },
      { signal: sharedWindowController.signal }
    );

    firstController.abort();
    expect(source.teardowns).toBe(0);

    secondController.abort();
    expect(source.teardowns).toBe(1);
    expect(sharedWindowTerminals).toEqual([]);
    sharedWindowController.abort();

    windows.subscribe((window) => restartedWindows.push(window), { signal: restartedController.signal });

    expect(source.activations).toBe(2);
    expect(restartedWindows).toHaveLength(1);
    expect(restartedWindows[0]).not.toBe(firstWindows[0]);

    restartedController.abort();
    expect(source.teardowns).toBe(2);
  });

  it('preserves the pinned 7.x behavior for nonpositive start intervals', () => {
    const defaulted = collectWindows(Observable.from([1, 2, 3]), 2, 0);
    const negative = collectWindows(Observable.from([1, 2, 3]), 2, -5);

    expect(defaulted).toEqual([
      [1, 2, 'complete'],
      [3, 'complete'],
    ]);
    expect(negative).toEqual(defaulted);
  });

  it('preserves the pinned 7.x modulo behavior for nonpositive window sizes', () => {
    const zeroSize = collectWindows(Observable.from([1, 2, 3]), 0);
    const negativeSize = collectWindows(Observable.from([1, 2, 3, 4, 5]), -2);

    expect(zeroSize).toEqual([[1, 2, 3, 'complete']]);
    expect(negativeSize).toEqual([
      [1, 2, 'complete'],
      [3, 4, 'complete'],
      [5, 'complete'],
    ]);
  });
});

function collectWindows<T>(
  source: Observable<T>,
  windowSize: number,
  startWindowEvery?: number
): Array<Array<T | 'complete'>> {
  const observations: Array<Array<T | 'complete'>> = [];
  source[windowCount](windowSize, startWindowEvery).subscribe((window) => {
    const values: Array<T | 'complete'> = [];
    observations.push(values);
    window.subscribe({
      next: (value) => values.push(value),
      complete: () => values.push('complete'),
    });
  });
  return observations;
}

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
