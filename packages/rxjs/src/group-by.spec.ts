import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';
import { Subject } from './subject.js';
import type { KeyedGroupObservable } from './group-by.js';
import { skip } from './skip.js';

type GroupBySymbol = typeof import('./group-by.js').groupBy;

let groupBy: GroupBySymbol;
let hadStringMethod: boolean;

beforeAll(async () => {
  hadStringMethod = 'groupBy' in Observable.prototype;
  ({ groupBy } = await import('./group-by.js'));
});

describe('groupBy', () => {
  it('installs only its exact unique Symbol and emits read-only keyed Observable views', () => {
    const groups: Array<KeyedGroupObservable<unknown, unknown>> = [];
    const otherKey = Symbol('groupBy');

    Observable.from([1])
      [groupBy]((value) => value % 2)
      .subscribe((group) => groups.push(group));

    expect(hadStringMethod).toBe(false);
    expect('groupBy' in Observable.prototype).toBe(false);
    expect(groupBy.description).toBe('groupBy');
    expect(Symbol.keyFor(groupBy)).toBeUndefined();
    expect((Observable.prototype as unknown as Record<symbol, unknown>)[otherKey]).toBeUndefined();
    expect(groups[0]).toBeInstanceOf(Observable);
    expect(groups[0]).not.toBeInstanceOf(Subject);
    expect(groups[0]?.key).toBe(1);
    expect('next' in groups[0]!).toBe(false);
    expect('error' in groups[0]!).toBe(false);
    expect('complete' in groups[0]!).toBe(false);
  });

  it('groups by key, selects elements, and completes every group before the outer result', () => {
    const events: unknown[] = [];

    Observable.from([1, 2, 3, 4])
      [groupBy]((value) => value % 2, { element: (value) => `value:${value}` })
      .subscribe({
        next: (group) => {
          events.push(['open', group.key]);
          group.subscribe({
            next: (value) => events.push([group.key, value]),
            complete: () => events.push(['group complete', group.key]),
          });
        },
        complete: () => events.push('outer complete'),
      });

    expect(events).toEqual([
      ['open', 1],
      [1, 'value:1'],
      ['open', 0],
      [0, 'value:2'],
      [1, 'value:3'],
      [0, 'value:4'],
      ['group complete', 1],
      ['group complete', 0],
      'outer complete',
    ]);
  });

  it('supports legacy element and duration arguments and reopens a closed key', () => {
    const source = controllable<number>();
    const durations = new Map<number, Subject<void>>();
    const observations: Array<{ key: number; values: string[] }> = [];

    source.observable[groupBy](
      (value) => value % 2,
      (value) => `value:${value}`,
      (group) => {
        const duration = new Subject<void>();
        durations.set(group.key, duration);
        return duration;
      }
    ).subscribe((group) => {
      const observation = { key: group.key, values: [] as string[] };
      observations.push(observation);
      group.subscribe({
        next: (value) => observation.values.push(value),
        complete: () => observation.values.push('complete'),
      });
    });

    source.subscriber.next(1);
    source.subscriber.next(3);
    durations.get(1)?.next();
    source.subscriber.next(5);
    source.subscriber.complete();

    expect(observations).toEqual([
      { key: 1, values: ['value:1', 'value:3', 'complete'] },
      { key: 1, values: ['value:5', 'complete'] },
    ]);
  });

  it('uses one connector per group and keeps the connector hidden behind a keyed view', () => {
    const connectors: Subject<string>[] = [];
    const groups: Array<KeyedGroupObservable<unknown, unknown>> = [];
    const values: string[] = [];

    Observable.from([1, 3])
      [groupBy]((value) => value % 2, {
        element: (value) => String(value),
        connector: () => {
          const connector = new Subject<string>();
          connectors.push(connector);
          return connector;
        },
      })
      .subscribe((group) => {
        groups.push(group);
        group.subscribe((value) => values.push(value));
      });

    expect(connectors).toHaveLength(1);
    expect(groups).toHaveLength(1);
    expect(groups[0]).not.toBe(connectors[0]);
    expect(values).toEqual(['1', '3']);
  });

  it('makes groups hot so late observers receive only future values and the terminal event', () => {
    const source = controllable<number>();
    let oddGroup: KeyedGroupObservable<number, number> | undefined;
    const values: Array<number | 'complete'> = [];

    source.observable[groupBy]((value) => value % 2).subscribe((group) => {
      oddGroup = group;
    });

    source.subscriber.next(1);
    source.subscriber.next(3);
    oddGroup?.subscribe({
      next: (value) => values.push(value as number),
      complete: () => values.push('complete'),
    });
    source.subscriber.next(5);
    source.subscriber.complete();

    expect(values).toEqual([5, 'complete']);
  });

  it('errors every active group before the outer result when key or element selection fails', () => {
    const keyFailure = new Error('key failed');
    const elementFailure = new Error('element failed');
    const keyEvents: unknown[] = [];
    const elementEvents: unknown[] = [];

    Observable.from([1, 2])
      [groupBy]((value) => {
        if (value === 2) {
          throw keyFailure;
        }
        return value % 2;
      })
      .subscribe({
        next: (group) => group.subscribe({ error: (error) => keyEvents.push(['group', error]) }),
        error: (error) => keyEvents.push(['outer', error]),
      });

    Observable.from([1, 2])
      [groupBy]((value) => value % 2, {
        element: (value) => {
          if (value === 2) {
            throw elementFailure;
          }
          return value;
        },
      })
      .subscribe({
        next: (group) => group.subscribe({ error: (error) => elementEvents.push(['group', error]) }),
        error: (error) => elementEvents.push(['outer', error]),
      });

    expect(keyEvents).toEqual([
      ['group', keyFailure],
      ['outer', keyFailure],
    ]);
    expect(elementEvents).toEqual([
      ['group', elementFailure],
      ['group', elementFailure],
      ['outer', elementFailure],
    ]);
  });

  it('keeps duration-stream errors local to their group but errors everything if duration selection throws', () => {
    const localFailure = new Error('duration stream failed');
    const selectorFailure = new Error('duration selector failed');
    const source = controllable<number>();
    const durations: Subject<void>[] = [];
    const localEvents: unknown[] = [];
    const selectorEvents: unknown[] = [];

    source.observable[groupBy]((value) => value % 2, {
      duration: () => {
        const duration = new Subject<void>();
        durations.push(duration);
        return duration;
      },
    }).subscribe({
      next: (group) => {
        localEvents.push(['open', group.key]);
        group.subscribe({
          next: (value) => localEvents.push(value),
          error: (error) => localEvents.push(['group error', error]),
        });
      },
      error: (error) => localEvents.push(['outer error', error]),
    });

    source.subscriber.next(1);
    durations[0]?.error(localFailure);
    source.subscriber.next(3);
    source.subscriber.complete();

    Observable.from([1])
      [groupBy]((value) => value, {
        duration: () => {
          throw selectorFailure;
        },
      })
      .subscribe({
        next: (group) => {
          selectorEvents.push(['open', group.key]);
          group.subscribe({ error: (error) => selectorEvents.push(['group error', error]) });
        },
        error: (error) => selectorEvents.push(['outer error', error]),
      });

    expect(localEvents).toEqual([['open', 1], 1, ['group error', localFailure], ['open', 1], 3]);
    expect(selectorEvents).toEqual([
      ['open', 1],
      ['group error', selectorFailure],
      ['outer error', selectorFailure],
    ]);
  });

  it('lets active group observers retain source work after the outer observer aborts', () => {
    const source = tracked<number>();
    const grouped = source.observable[groupBy]((value) => value % 2);
    const outerController = new AbortController();
    const innerController = new AbortController();
    const innerValues: number[] = [];
    let oddGroup: KeyedGroupObservable<number, number> | undefined;

    grouped.subscribe(
      (group) => {
        oddGroup = group;
        group.subscribe((value) => innerValues.push(value as number), { signal: innerController.signal });
      },
      { signal: outerController.signal }
    );

    source.subscribers[0]?.next(1);
    outerController.abort();

    expect(source.subscribers[0]?.active).toBe(true);
    expect(source.teardowns).toBe(0);

    source.subscribers[0]?.next(3);
    expect(innerValues).toEqual([1, 3]);
    expect(oddGroup?.key).toBe(1);

    innerController.abort();
    expect(source.subscribers[0]?.active).toBe(false);
    expect(source.teardowns).toBe(1);
  });

  it('does not let duration observation retain source work after the outer and user group observers abort', () => {
    const source = tracked<number>();
    const outerController = new AbortController();
    const innerController = new AbortController();

    source.observable[groupBy]((value) => value % 2, {
      duration: (group) => group[skip](2),
    }).subscribe(
      (group) => {
        group.subscribe(() => {}, { signal: innerController.signal });
      },
      { signal: outerController.signal }
    );

    source.subscribers[0]?.next(1);
    outerController.abort();

    expect(source.subscribers[0]?.active).toBe(true);
    expect(source.teardowns).toBe(0);

    innerController.abort();
    expect(source.subscribers[0]?.active).toBe(false);
    expect(source.teardowns).toBe(1);
  });

  it('finishes routing a value when outer and inner observers cancel during a new-group handoff', () => {
    const source = tracked<number>();
    const outerController = new AbortController();
    const innerController = new AbortController();
    const values: number[] = [];

    source.observable[groupBy]((value) => value % 2).subscribe(
      (group) => {
        group.subscribe(
          (value) => {
            values.push(value as number);
            innerController.abort();
          },
          { signal: innerController.signal }
        );
        outerController.abort();
      },
      { signal: outerController.signal }
    );

    source.subscribers[0]?.next(1);

    expect(values).toEqual([1]);
    expect(source.subscribers[0]?.active).toBe(false);
    expect(source.teardowns).toBe(1);
  });

  it('keeps source work active when one group observer aborts while the outer result remains observed', () => {
    const source = tracked<number>();
    const innerController = new AbortController();
    let group: KeyedGroupObservable<number, number> | undefined;

    source.observable[groupBy]((value) => value % 2).subscribe((nextGroup) => {
      group = nextGroup;
      nextGroup.subscribe(() => {}, { signal: innerController.signal });
    });

    source.subscribers[0]?.next(1);
    innerController.abort();
    expect(source.subscribers[0]?.active).toBe(true);
    expect(source.teardowns).toBe(0);

    const values: number[] = [];
    group?.subscribe((value) => values.push(value as number));
    source.subscribers[0]?.next(3);
    expect(values).toEqual([3]);
  });

  it('shares one grouping state among outer observers and restarts after all outer and group observers leave', () => {
    const source = tracked<number>();
    const grouped = source.observable[groupBy]((value) => value % 2);
    const firstController = new AbortController();
    const secondController = new AbortController();
    const restartController = new AbortController();
    const firstGroups: Array<KeyedGroupObservable<number, number>> = [];
    const secondGroups: Array<KeyedGroupObservable<number, number>> = [];
    const restartedGroups: Array<KeyedGroupObservable<number, number>> = [];

    grouped.subscribe((group) => firstGroups.push(group), { signal: firstController.signal });
    grouped.subscribe((group) => secondGroups.push(group), { signal: secondController.signal });

    expect(source.activations).toBe(1);
    source.subscribers[0]?.next(1);
    expect(firstGroups).toHaveLength(1);
    expect(secondGroups).toHaveLength(1);
    expect(firstGroups[0]).toBe(secondGroups[0]);

    firstController.abort();
    expect(source.teardowns).toBe(0);
    secondController.abort();
    expect(source.teardowns).toBe(1);

    grouped.subscribe((group) => restartedGroups.push(group), { signal: restartController.signal });
    expect(source.activations).toBe(2);
    source.subscribers[1]?.next(1);
    expect(restartedGroups).toHaveLength(1);
    expect(restartedGroups[0]).not.toBe(firstGroups[0]);

    restartController.abort();
    expect(source.teardowns).toBe(2);
  });

  it('preserves keyed-group and element-selector types without introducing a group class', () => {
    type Value = { kind: 'number'; value: number } | { kind: 'text'; value: string };
    const source = Observable.from<Value>([
      { kind: 'number', value: 1 },
      { kind: 'text', value: 'one' },
    ]);
    const selected = source[groupBy]((value) => value.kind, {
      element: (value) => String(value.value),
    });
    const narrowed = source[groupBy]((value): value is Extract<Value, { kind: 'number' }> => value.kind === 'number');

    expectTypeOf(selected).toEqualTypeOf<Observable<KeyedGroupObservable<'number' | 'text', string>>>();
    expectTypeOf(narrowed).toEqualTypeOf<
      Observable<
        KeyedGroupObservable<true, Extract<Value, { kind: 'number' }>> | KeyedGroupObservable<false, Extract<Value, { kind: 'text' }>>
      >
    >();
  });
});

function controllable<T>(): {
  readonly observable: Observable<T>;
  readonly subscriber: Subscriber<T>;
} {
  let subscriber: Subscriber<T> | undefined;
  const observable = new Observable<T>((nextSubscriber) => {
    subscriber = nextSubscriber;
  });
  return {
    observable,
    get subscriber() {
      if (!subscriber) {
        throw new Error('Expected source activation.');
      }
      return subscriber;
    },
  };
}

function tracked<T>(): {
  observable: Observable<T>;
  readonly activations: number;
  readonly teardowns: number;
  readonly subscribers: Subscriber<T>[];
} {
  const state = {
    activations: 0,
    teardowns: 0,
    subscribers: [] as Subscriber<T>[],
  };
  const observable = new Observable<T>((subscriber) => {
    state.activations++;
    state.subscribers.push(subscriber);
    subscriber.addTeardown(() => state.teardowns++);
  });
  return {
    observable,
    get activations() {
      return state.activations;
    },
    get teardowns() {
      return state.teardowns;
    },
    subscribers: state.subscribers,
  };
}
