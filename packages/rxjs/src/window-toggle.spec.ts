import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { Subject } from './subject.js';

type WindowToggleSymbol = typeof import('./window-toggle.js').windowToggle;

let windowToggle: WindowToggleSymbol;
let hadStringMethod: boolean;

beforeAll(async () => {
  hadStringMethod = 'windowToggle' in Observable.prototype;
  ({ windowToggle } = await import('./window-toggle.js'));
});

describe('windowToggle', () => {
  it('installs only its exact unique Symbol and returns typed read-only Observable windows', () => {
    const source = Observable.from([1, 2, 3]);
    const otherKey = Symbol('windowToggle');
    const result = source[windowToggle](Promise.resolve({ id: 1 }), (opening) => {
      expectTypeOf(opening).toEqualTypeOf<{ id: number }>();
      return Promise.resolve();
    });
    const windows: Observable<number>[] = [];
    type HasStringNamedWindowToggle = 'windowToggle' extends keyof Observable<unknown> ? true : false;

    result.subscribe((window) => windows.push(window));

    expectTypeOf(result).toEqualTypeOf<Observable<Observable<number>>>();
    expectTypeOf<HasStringNamedWindowToggle>().toEqualTypeOf<false>();
    expect(hadStringMethod).toBe(false);
    expect('windowToggle' in Observable.prototype).toBe(false);
    expect(windowToggle.description).toBe('windowToggle');
    expect(Symbol.keyFor(windowToggle)).toBeUndefined();
    expect((Observable.prototype as unknown as Record<symbol, unknown>)[otherKey]).toBeUndefined();

    if (false) {
      // @ts-expect-error Both openings and a closing selector are required.
      source[windowToggle]();
      // @ts-expect-error The selector must return an ObservableValue.
      source[windowToggle](['open'], () => 1);
      // @ts-expect-error The selector parameter must match the opening value.
      source[windowToggle](['open'], (opening: number) => [opening]);
    }
  });

  it('emits each synchronous window before its closing input and activates openings before the source', () => {
    const events: string[] = [];
    const observations: string[][] = [];
    const openings = Observable.from(['close', 'empty'] as const);
    const source = new Observable<number>((subscriber) => {
      events.push('source active');
      subscriber.next(1);
      subscriber.complete();
    });

    source
      [windowToggle](openings, (opening) => {
        events.push(`selector ${opening}`);
        return new Observable<void>((subscriber) => {
          events.push(`closing ${opening} active`);
          if (opening === 'close') {
            subscriber.next(undefined);
          } else {
            subscriber.complete();
          }
        });
      })
      .subscribe({
        next: (window) => {
          const index = observations.length;
          const values: string[] = [];
          observations.push(values);
          events.push(`window ${index} emitted`);
          window.subscribe({
            next: (value) => values.push(String(value)),
            complete: () => {
              events.push(`window ${index} complete`);
              values.push('complete');
            },
          });
        },
        complete: () => events.push('outer complete'),
      });

    expect(events).toEqual([
      'selector close',
      'window 0 emitted',
      'closing close active',
      'window 0 complete',
      'selector empty',
      'window 1 emitted',
      'closing empty active',
      'source active',
      'window 1 complete',
      'outer complete',
    ]);
    expect(observations).toEqual([['complete'], ['1', 'complete']]);
  });

  it('maintains overlapping hot windows and closes only on a closing first value', () => {
    const source = controllable<number>();
    const openings = controllable<'first' | 'second'>();
    const firstClosing = controllable<void>();
    const secondClosing = controllable<void>();
    const observations: Array<Array<number | 'complete'>> = [];

    source.observable
      [windowToggle](openings.observable, (opening) =>
        opening === 'first' ? firstClosing.observable : secondClosing.observable
      )
      .subscribe((window) => {
        const values: Array<number | 'complete'> = [];
        observations.push(values);
        window.subscribe({
          next: (value) => values.push(value),
          complete: () => values.push('complete'),
        });
      });

    openings.subscriber.next('first');
    source.subscriber.next(1);
    openings.subscriber.next('second');
    source.subscriber.next(2);
    firstClosing.subscriber.next(undefined);
    firstClosing.subscriber.next(undefined);
    source.subscriber.next(3);
    secondClosing.subscriber.complete();
    source.subscriber.next(4);
    source.subscriber.complete();

    expect(observations).toEqual([
      [1, 2, 'complete'],
      [2, 3, 4, 'complete'],
    ]);
    expect(firstClosing.teardowns).toBe(1);
    expect(secondClosing.teardowns).toBe(1);
  });

  it('terminates every live window before forwarding source completion or error', () => {
    const completingSource = controllable<number>();
    const completingOpenings = controllable<void>();
    const completionEvents: string[] = [];

    completingSource.observable[windowToggle](completingOpenings.observable, () => []).subscribe({
      next: (window) => {
        completionEvents.push('window');
        window.subscribe({ complete: () => completionEvents.push('window complete') });
      },
      complete: () => completionEvents.push('outer complete'),
    });
    completingOpenings.subscriber.next(undefined);
    completingOpenings.subscriber.next(undefined);
    completingSource.subscriber.complete();

    const failure = new Error('source failed');
    const failingSource = controllable<number>();
    const failingOpenings = controllable<void>();
    const errorEvents: unknown[] = [];

    failingSource.observable[windowToggle](failingOpenings.observable, () => []).subscribe({
      next: (window) => {
        errorEvents.push('window');
        window.subscribe({ error: (error) => errorEvents.push(['window error', error]) });
      },
      error: (error) => errorEvents.push(['outer error', error]),
    });
    failingOpenings.subscriber.next(undefined);
    failingOpenings.subscriber.next(undefined);
    failingSource.subscriber.error(failure);

    expect(completionEvents).toEqual([
      'window',
      'window',
      'window complete',
      'window complete',
      'outer complete',
    ]);
    expect(errorEvents).toEqual([
      'window',
      'window',
      ['window error', failure],
      ['window error', failure],
      ['outer error', failure],
    ]);
  });

  it('errors all live windows and cancels sibling work for openings, selector, conversion, and closing failures', () => {
    const openingConversionFailure = new Error('opening conversion failed');
    const invalidOpeningSource = controllable<number>();
    const openingConversionErrors: unknown[] = [];

    invalidOpeningSource.observable[windowToggle](throwingIterable(openingConversionFailure), () => []).subscribe({
      error: (error) => openingConversionErrors.push(error),
    });

    const openingFailure = new Error('openings failed');
    const openingSource = controllable<number>();
    const badOpenings = controllable<void>();
    const openingErrors: unknown[] = [];

    openingSource.observable[windowToggle](badOpenings.observable, () => []).subscribe({
      error: (error) => openingErrors.push(error),
    });
    badOpenings.subscriber.error(openingFailure);

    const selectorFailure = new Error('selector failed');
    const selectorSource = controllable<number>();
    const selectorOpenings = controllable<'valid' | 'invalid'>();
    const selectorClosing = controllable<void>();
    const selectorEvents: unknown[] = [];

    selectorSource.observable[windowToggle](selectorOpenings.observable, (opening) => {
      if (opening === 'invalid') {
        throw selectorFailure;
      }
      return selectorClosing.observable;
    }).subscribe({
      next: (window) => window.subscribe({ error: (error) => selectorEvents.push(['window error', error]) }),
      error: (error) => selectorEvents.push(['outer error', error]),
    });
    selectorOpenings.subscriber.next('valid');
    selectorOpenings.subscriber.next('invalid');

    const conversionFailure = new Error('conversion failed');
    const conversionSource = controllable<number>();
    const conversionOpenings = controllable<void>();
    const conversionEvents: unknown[] = [];

    conversionSource.observable
      [windowToggle](conversionOpenings.observable, () => throwingIterable(conversionFailure))
      .subscribe({
        next: (window) => window.subscribe({ error: (error) => conversionEvents.push(['window error', error]) }),
        error: (error) => conversionEvents.push(['outer error', error]),
      });
    conversionOpenings.subscriber.next(undefined);

    const closingFailure = new Error('closing failed');
    const closingSource = controllable<number>();
    const closingOpenings = controllable<void>();
    const closing = controllable<void>();
    const closingEvents: unknown[] = [];

    closingSource.observable[windowToggle](closingOpenings.observable, () => closing.observable).subscribe({
      next: (window) => {
        window.subscribe({ error: (error) => closingEvents.push(['window error', error]) });
      },
      error: (error) => closingEvents.push(['outer error', error]),
    });
    closingOpenings.subscriber.next(undefined);
    closing.subscriber.error(closingFailure);

    expect(openingConversionErrors).toEqual([openingConversionFailure]);
    expect(invalidOpeningSource.subscriber.active).toBe(false);
    expect(openingErrors).toEqual([openingFailure]);
    expect(openingSource.subscriber.active).toBe(false);
    expect(selectorEvents).toEqual([
      ['window error', selectorFailure],
      ['outer error', selectorFailure],
    ]);
    expect(selectorSource.subscriber.active).toBe(false);
    expect(selectorClosing.subscriber.active).toBe(false);
    expect(conversionEvents).toEqual([
      ['window error', conversionFailure],
      ['outer error', conversionFailure],
    ]);
    expect(conversionSource.subscriber.active).toBe(false);
    expect(closingEvents).toEqual([
      ['window error', closingFailure],
      ['outer error', closingFailure],
    ]);
    expect(closingSource.subscriber.active).toBe(false);
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

    source[windowToggle](openings, () => []).subscribe({
      error: (error) => events.push(['error', error]),
    });

    expect(events).toEqual([
      'openings active',
      ['error', failure],
      'source active: true',
      'source teardown',
    ]);
  });

  it('uses a source-value snapshot for reentrant openings and closings', () => {
    const source = controllable<number>();
    const openings = controllable<'first' | 'second' | 'third'>();
    const closings = {
      first: controllable<void>(),
      second: controllable<void>(),
      third: controllable<void>(),
    };
    const observations: number[][] = [];

    source.observable[windowToggle](openings.observable, (opening) => closings[opening].observable).subscribe((window) => {
      const index = observations.length;
      const values: number[] = [];
      observations.push(values);
      window.subscribe((value) => {
        values.push(value);
        if (index === 0 && value === 1) {
          openings.subscriber.next('third');
          closings.second.subscriber.next(undefined);
        }
      });
    });

    openings.subscriber.next('first');
    openings.subscriber.next('second');
    source.subscriber.next(1);
    source.subscriber.next(2);

    expect(observations).toEqual([
      [1, 2],
      [],
      [2],
    ]);
  });

  it('silently releases live windows and cancels every input when the final outer observer leaves', () => {
    const source = controllable<number>();
    const openings = controllable<0 | 1>();
    const closings = [controllable<void>(), controllable<void>()] as const;
    const controller = new AbortController();
    const windowController = new AbortController();
    const terminals: string[] = [];
    const emitted: Observable<number>[] = [];

    source.observable[windowToggle](openings.observable, (index) => closings[index].observable).subscribe(
      (window) => {
        emitted.push(window);
        window.subscribe(
          {
            complete: () => terminals.push('complete'),
            error: () => terminals.push('error'),
          },
          { signal: windowController.signal }
        );
      },
      { signal: controller.signal }
    );
    openings.subscriber.next(0);
    openings.subscriber.next(1);

    controller.abort();

    expect(terminals).toEqual([]);
    expect(source.subscriber.active).toBe(false);
    expect(openings.subscriber.active).toBe(false);
    expect(closings[0].subscriber.active).toBe(false);
    expect(closings[1].subscriber.active).toBe(false);

    const lateEvents: string[] = [];
    const lateController = new AbortController();
    emitted[0]!.subscribe(
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

  it('shares and ref-counts one activation, then restarts with fresh windows', () => {
    const source = tracked<number>();
    const openings = tracked<void>();
    const closing = tracked<void>();
    const result = source.observable[windowToggle](openings.observable, () => closing.observable);
    const firstController = new AbortController();
    const secondController = new AbortController();
    const restartController = new AbortController();
    const firstWindows: Observable<number>[] = [];
    const secondWindows: Observable<number>[] = [];
    const restartedWindows: Observable<number>[] = [];

    result.subscribe((window) => firstWindows.push(window), { signal: firstController.signal });
    result.subscribe((window) => secondWindows.push(window), { signal: secondController.signal });

    expect(source.activations).toBe(1);
    expect(openings.activations).toBe(1);

    openings.subscribers[0]!.next(undefined);
    expect(firstWindows).toHaveLength(1);
    expect(secondWindows).toHaveLength(1);
    expect(firstWindows[0]).toBe(secondWindows[0]);
    expect(closing.activations).toBe(1);

    firstController.abort();
    expect(source.teardowns).toBe(0);

    secondController.abort();
    expect(source.teardowns).toBe(1);
    expect(openings.teardowns).toBe(1);
    expect(closing.teardowns).toBe(1);

    result.subscribe((window) => restartedWindows.push(window), { signal: restartController.signal });
    expect(source.activations).toBe(2);
    expect(openings.activations).toBe(2);

    openings.subscribers[1]!.next(undefined);
    expect(restartedWindows).toHaveLength(1);
    expect(restartedWindows[0]).not.toBe(firstWindows[0]);

    restartController.abort();
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
