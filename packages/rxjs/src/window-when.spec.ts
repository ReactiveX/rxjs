import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { Subject } from './subject.js';

type WindowWhenSymbol = typeof import('./window-when.js').windowWhen;

let windowWhen: WindowWhenSymbol;
let hadStringMethod: boolean;

beforeAll(async () => {
  hadStringMethod = 'windowWhen' in Observable.prototype;
  ({ windowWhen } = await import('./window-when.js'));
});

describe('windowWhen', () => {
  it('installs only its exact unique Symbol and returns typed read-only Observable windows', () => {
    const source = Observable.from([1, 2, 3]);
    const otherKey = Symbol('windowWhen');
    const result = source[windowWhen](() => new Observable<never>(() => {}));
    const windows: Observable<number>[] = [];
    type HasStringNamedWindowWhen = 'windowWhen' extends keyof Observable<unknown> ? true : false;

    result.subscribe((window) => windows.push(window));

    expectTypeOf(result).toEqualTypeOf<Observable<Observable<number>>>();
    expectTypeOf<HasStringNamedWindowWhen>().toEqualTypeOf<false>();
    expect(windows[0]).toBeInstanceOf(Observable);
    expect(windows[0]).not.toBeInstanceOf(Subject);
    expect('next' in windows[0]!).toBe(false);
    expect('error' in windows[0]!).toBe(false);
    expect('complete' in windows[0]!).toBe(false);
    expect(hadStringMethod).toBe(false);
    expect('windowWhen' in Observable.prototype).toBe(false);
    expect(windowWhen.description).toBe('windowWhen');
    expect(Symbol.keyFor(windowWhen)).toBeUndefined();
    expect((Observable.prototype as unknown as Record<symbol, unknown>)[otherKey]).toBeUndefined();

    if (false) {
      // @ts-expect-error A closing selector is required.
      source[windowWhen]();
      // @ts-expect-error The selector must return an ObservableValue.
      source[windowWhen](() => 1);
      // @ts-expect-error The closing selector does not receive source values.
      source[windowWhen]((value: number) => [value]);
    }
  });

  it('emits the first window before invoking its selector or activating the source', () => {
    const events: string[] = [];
    const source = new Observable<number>((subscriber) => {
      events.push('source active');
      subscriber.next(1);
      subscriber.complete();
    });
    const closing = new Observable<void>(() => {
      events.push('closing active');
    });

    source[windowWhen](() => {
      events.push('selector');
      return closing;
    }).subscribe({
      next: (window) => {
        events.push('window');
        window.subscribe({
          next: (value) => events.push(`value ${value}`),
          complete: () => events.push('window complete'),
        });
      },
      complete: () => events.push('outer complete'),
    });

    expect(events).toEqual(['window', 'selector', 'closing active', 'source active', 'value 1', 'window complete', 'outer complete']);
  });

  it('rotates on the first closing value or completion and cancels each prior closing before window completion', () => {
    const events: string[] = [];
    const source = controllable<number>();
    const closings = [
      controllable<void>(() => events.push('closing 0 teardown')),
      controllable<void>(() => events.push('closing 1 teardown')),
      controllable<void>(() => events.push('closing 2 teardown')),
    ];
    const observations: Array<Array<number | 'complete'>> = [];
    let selectorIndex = 0;

    source.observable[windowWhen](() => closings[selectorIndex++]!.observable).subscribe((window) => {
      const index = observations.length;
      const values: Array<number | 'complete'> = [];
      observations.push(values);
      events.push(`window ${index}`);
      window.subscribe({
        next: (value) => values.push(value),
        complete: () => {
          events.push(`window ${index} complete`);
          values.push('complete');
        },
      });
    });

    source.subscriber.next(1);
    closings[0]!.subscriber.next(undefined);
    source.subscriber.next(2);
    closings[1]!.subscriber.complete();
    source.subscriber.next(3);
    source.subscriber.complete();

    expect(observations).toEqual([
      [1, 'complete'],
      [2, 'complete'],
      [3, 'complete'],
    ]);
    expect(events).toEqual([
      'window 0',
      'closing 0 teardown',
      'window 0 complete',
      'window 1',
      'closing 1 teardown',
      'window 1 complete',
      'window 2',
      'window 2 complete',
      'closing 2 teardown',
    ]);
  });

  it('drains long finite chains of synchronous empty closings without stack growth or timing deferral', () => {
    const source = tracked<number>();
    const never = new Observable<never>(() => {});
    const synchronousRotations = 10_000;
    let selectors = 0;
    let windows = 0;

    source.observable[windowWhen](() => {
      selectors++;
      return selectors <= synchronousRotations ? [] : never;
    }).subscribe(() => {
      windows++;
    });

    expect(selectors).toBe(synchronousRotations + 1);
    expect(windows).toBe(synchronousRotations + 1);
    expect(source.activations).toBe(1);
  });

  it('preserves reentrant source delivery to a newly emitted window before invoking its selector', () => {
    const events: string[] = [];
    const source = controllable<number>();
    const closings = [controllable<void>(), controllable<void>()];
    let selectorIndex = 0;
    let windowIndex = 0;

    source.observable[windowWhen](() => {
      events.push(`selector ${selectorIndex}`);
      return closings[selectorIndex++]!.observable;
    }).subscribe((window) => {
      const index = windowIndex++;
      events.push(`window ${index}`);
      window.subscribe((value) => events.push(`window ${index}: ${value}`));
      if (index === 1) {
        source.subscriber.next(2);
      }
    });

    source.subscriber.next(1);
    closings[0]!.subscriber.next(undefined);

    expect(events).toEqual(['window 0', 'selector 0', 'window 0: 1', 'window 1', 'window 1: 2', 'selector 1']);
  });

  it('terminates the live window before forwarding source completion or error', () => {
    const completingSource = controllable<number>();
    const completionEvents: string[] = [];

    completingSource.observable[windowWhen](() => new Observable<never>(() => {})).subscribe({
      next: (window) => {
        if (completionEvents.length === 0) {
          completionEvents.push('window');
          window.subscribe({ complete: () => completionEvents.push('window complete') });
        }
      },
      complete: () => completionEvents.push('outer complete'),
    });
    completingSource.subscriber.complete();

    const failure = new Error('source failed');
    const failingSource = controllable<number>();
    const errorEvents: unknown[] = [];

    failingSource.observable[windowWhen](() => new Observable<never>(() => {})).subscribe({
      next: (window) => {
        errorEvents.push('window');
        window.subscribe({ error: (error) => errorEvents.push(['window error', error]) });
      },
      error: (error) => errorEvents.push(['outer error', error]),
    });
    failingSource.subscriber.error(failure);

    expect(completionEvents).toEqual(['window', 'window complete', 'outer complete']);
    expect(errorEvents).toEqual(['window', ['window error', failure], ['outer error', failure]]);
  });

  it('errors the live window before the outer for selector, conversion, and closing failures', () => {
    const selectorFailure = new Error('selector failed');
    const selectorEvents: unknown[] = [];

    new Observable<number>(() => {})
      [windowWhen](() => {
        throw selectorFailure;
      })
      .subscribe({
        next: (window) => {
          selectorEvents.push('window');
          window.subscribe({ error: (error) => selectorEvents.push(['window error', error]) });
        },
        error: (error) => selectorEvents.push(['outer error', error]),
      });

    const conversionFailure = new Error('conversion failed');
    const conversionEvents: unknown[] = [];

    new Observable<number>(() => {})
      [windowWhen](() => throwingIterable(conversionFailure))
      .subscribe({
        next: (window) => {
          conversionEvents.push('window');
          window.subscribe({ error: (error) => conversionEvents.push(['window error', error]) });
        },
        error: (error) => conversionEvents.push(['outer error', error]),
      });

    const closingFailure = new Error('closing failed');
    const source = controllable<number>();
    const closing = controllable<void>();
    const closingEvents: unknown[] = [];

    source.observable[windowWhen](() => closing.observable).subscribe({
      next: (window) => {
        closingEvents.push('window');
        window.subscribe({ error: (error) => closingEvents.push(['window error', error]) });
      },
      error: (error) => closingEvents.push(['outer error', error]),
    });
    closing.subscriber.error(closingFailure);

    expect(selectorEvents).toEqual(['window', ['window error', selectorFailure], ['outer error', selectorFailure]]);
    expect(conversionEvents).toEqual(['window', ['window error', conversionFailure], ['outer error', conversionFailure]]);
    expect(closingEvents).toEqual(['window', ['window error', closingFailure], ['outer error', closingFailure]]);
    expect(source.subscriber.active).toBe(false);
  });

  it('silently releases the live window and cancels source and closing work on final outer cancellation', () => {
    const source = controllable<number>();
    const closing = controllable<void>();
    const outerController = new AbortController();
    const windowController = new AbortController();
    const terminals: string[] = [];
    let window: Observable<number> | undefined;

    source.observable[windowWhen](() => closing.observable).subscribe(
      (nextWindow) => {
        window = nextWindow;
        nextWindow.subscribe(
          {
            complete: () => terminals.push('complete'),
            error: () => terminals.push('error'),
          },
          { signal: windowController.signal }
        );
      },
      { signal: outerController.signal }
    );

    outerController.abort();

    expect(terminals).toEqual([]);
    expect(source.subscriber.active).toBe(false);
    expect(closing.subscriber.active).toBe(false);

    const lateEvents: string[] = [];
    const lateController = new AbortController();
    window!.subscribe(
      {
        complete: () => lateEvents.push('complete'),
        error: () => lateEvents.push('error'),
      },
      { signal: lateController.signal }
    );
    expect(lateEvents).toEqual([]);

    lateController.abort();
    windowController.abort();
  });

  it('shares and ref-counts one activation, then restarts with a fresh initial window', () => {
    const source = tracked<number>();
    const closing = tracked<void>();
    const result = source.observable[windowWhen](() => closing.observable);
    const firstController = new AbortController();
    const secondController = new AbortController();
    const restartController = new AbortController();
    const firstWindows: Observable<number>[] = [];
    const secondWindows: Observable<number>[] = [];
    const restartedWindows: Observable<number>[] = [];

    result.subscribe((window) => firstWindows.push(window), { signal: firstController.signal });
    result.subscribe((window) => secondWindows.push(window), { signal: secondController.signal });

    expect(source.activations).toBe(1);
    expect(closing.activations).toBe(1);
    expect(firstWindows).toHaveLength(1);
    expect(secondWindows).toHaveLength(0);

    closing.subscribers[0]!.next(undefined);
    expect(firstWindows).toHaveLength(2);
    expect(secondWindows).toHaveLength(1);
    expect(firstWindows[1]).toBe(secondWindows[0]);

    firstController.abort();
    expect(source.teardowns).toBe(0);

    secondController.abort();
    expect(source.teardowns).toBe(1);
    expect(closing.teardowns).toBe(2);

    result.subscribe((window) => restartedWindows.push(window), { signal: restartController.signal });
    expect(source.activations).toBe(2);
    expect(closing.activations).toBe(3);
    expect(restartedWindows).toHaveLength(1);
    expect(restartedWindows[0]).not.toBe(firstWindows[0]);

    restartController.abort();
  });
});

function controllable<T>(onTeardown?: () => void): {
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
      onTeardown?.();
    });
  });
  return {
    observable,
    get subscriber() {
      if (!sourceSubscriber) {
        throw new Error('Expected activation.');
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

function throwingIterable(error: unknown): Iterable<never> {
  return {
    [Symbol.iterator]() {
      throw error;
    },
  };
}
