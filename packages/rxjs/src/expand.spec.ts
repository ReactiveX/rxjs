import { beforeAll, describe, expect, expectTypeOf, it } from 'vitest';
import '@rxjs/observable-polyfill';

type ExpandSymbol = typeof import('./expand.js').expand;

let expand: ExpandSymbol;
let hadStringMethod: boolean;

beforeAll(async () => {
  hadStringMethod = 'expand' in Observable.prototype;
  ({ expand } = await import('./expand.js'));
});

describe('expand', () => {
  it('installs only its exact unique Symbol', () => {
    const source = new Observable<number>(() => {});
    const otherKey = Symbol('expand');
    type HasStringNamedExpand = Observable<number> extends { expand: unknown } ? true : false;

    expectTypeOf<HasStringNamedExpand>().toEqualTypeOf<false>();
    expect(source[expand]).toBeTypeOf('function');
    expect(hadStringMethod).toBe(false);
    expect('expand' in Observable.prototype).toBe(false);
    expect(expand.description).toBe('expand');
    expect(Symbol.keyFor(expand)).toBeUndefined();
    expect((Observable.prototype as unknown as Record<symbol, unknown>)[otherKey]).toBeUndefined();
  });

  it('recursively emits source and projected values with a monotonic projection index', () => {
    const indices: number[] = [];
    const values: number[] = [];
    const expanded = Observable.from([1])[expand]((value, index) => {
      indices.push(index);
      return value < 4 ? [value + 1] : [];
    });

    expectTypeOf(expanded).toEqualTypeOf<Observable<number>>();
    expanded.subscribe((value) => values.push(value));

    expect(values).toEqual([1, 2, 3, 4]);
    expect(indices).toEqual([0, 1, 2, 3]);
  });

  it('buffers work in arrival order at the concurrency limit', () => {
    const source = controllable<string>();
    const first = controllable<string>();
    const second = controllable<string>();
    const third = controllable<string>();
    const inners = new Map([
      ['first', first],
      ['second', second],
      ['third', third],
    ]);
    const values: string[] = [];

    source.observable[expand](
      (value) => {
        const inner = inners.get(value);
        return inner?.observable ?? [];
      },
      { concurrent: 2 }
    ).subscribe((value) => values.push(value));

    source.subscriber.next('first');
    source.subscriber.next('second');
    source.subscriber.next('third');

    expect(values).toEqual(['first', 'second']);
    expect(first.subscriptions).toBe(1);
    expect(second.subscriptions).toBe(1);
    expect(third.subscriptions).toBe(0);

    second.subscriber.next('second-child');
    first.subscriber.complete();

    expect(values).toEqual(['first', 'second', 'third']);
    expect(third.subscriptions).toBe(1);

    third.subscriber.complete();
    expect(values).toEqual(['first', 'second', 'third', 'second-child']);
  });

  it.each([0, -1])('treats a concurrency of %i as unbounded like RxJS 7', (concurrent) => {
    const projected = [controllable<never>(), controllable<never>(), controllable<never>()];
    let projectIndex = 0;
    const values: number[] = [];

    Observable.from([1, 2, 3])
      [expand](
        () => projected[projectIndex++]!.observable,
        { concurrent }
      )
      .subscribe((value) => values.push(value));

    expect(values).toEqual([1, 2, 3]);
    expect(projected.map(({ subscriptions }) => subscriptions)).toEqual([1, 1, 1]);
  });

  it('waits for the source, queued values, and active projections before completing', () => {
    const source = controllable<number>();
    const inner = controllable<number>();
    const events: Array<number | 'complete'> = [];

    source.observable[expand]((value) => (value === 1 ? inner.observable : [])).subscribe({
      next: (value) => events.push(value),
      complete: () => events.push('complete'),
    });

    source.subscriber.next(1);
    source.subscriber.complete();
    expect(events).toEqual([1]);

    inner.subscriber.next(2);
    expect(events).toEqual([1, 2]);

    inner.subscriber.complete();
    expect(events).toEqual([1, 2, 'complete']);
  });

  it('handles long synchronous recursive projection without overflowing the stack', () => {
    const values: number[] = [];

    Observable.from([0])
      [expand]((value) => (value < 10_000 ? [value + 1] : []))
      .subscribe((value) => values.push(value));

    expect(values).toHaveLength(10_001);
    expect(values[0]).toBe(0);
    expect(values.at(-1)).toBe(10_000);
  });

  it('converts iterable projections as ObservableValue inputs', () => {
    const values: number[] = [];

    Observable.from([1])
      [expand]((value) => (value < 3 ? new Set([value + 1]) : new Set<number>()))
      .subscribe((value) => values.push(value));

    expect(values).toEqual([1, 2, 3]);
  });

  it('propagates source errors and cancels active projections', () => {
    const source = controllable<number>();
    const inner = controllable<number>();
    const failure = new Error('source failed');
    const errors: unknown[] = [];

    source.observable[expand](() => inner.observable).subscribe({
      error: (error) => errors.push(error),
    });
    source.subscriber.next(1);
    source.subscriber.error(failure);

    expect(errors).toEqual([failure]);
    expect(inner.subscriber.active).toBe(false);
  });

  it('propagates errors thrown by the projection after emitting the input value', () => {
    const failure = new Error('projection failed');
    const events: unknown[] = [];

    Observable.from([1])
      [expand](() => {
        throw failure;
      })
      .subscribe({
        next: (value) => events.push(value),
        error: (error) => events.push(error),
      });

    expect(events).toEqual([1, failure]);
  });

  it('propagates ObservableValue conversion errors after emitting the input value', () => {
    const events: unknown[] = [];
    const invalidInput = {} as ObservableValue<never>;

    Observable.from([1])
      [expand](() => invalidInput)
      .subscribe({
        next: (value) => events.push(value),
        error: (error) => events.push(error),
      });

    expect(events[0]).toBe(1);
    expect(events[1]).toBeInstanceOf(TypeError);
  });

  it('propagates projected Observable errors and cancels the source', () => {
    const source = controllable<number>();
    const inner = controllable<number>();
    const failure = new Error('inner failed');
    const errors: unknown[] = [];

    source.observable[expand](() => inner.observable).subscribe({
      error: (error) => errors.push(error),
    });
    source.subscriber.next(1);
    inner.subscriber.error(failure);

    expect(errors).toEqual([failure]);
    expect(source.subscriber.active).toBe(false);
  });

  it('cancels the source and every active projection, and discards queued work', () => {
    const source = controllable<number>();
    const first = controllable<never>();
    const second = controllable<never>();
    const third = controllable<never>();
    const projected = [first, second, third];
    const controller = new AbortController();

    source.observable[expand]((value) => projected[value - 1]!.observable, { concurrent: 2 }).subscribe(
      () => {},
      { signal: controller.signal }
    );
    source.subscriber.next(1);
    source.subscriber.next(2);
    source.subscriber.next(3);

    expect(projected.map(({ subscriptions }) => subscriptions)).toEqual([1, 1, 0]);

    controller.abort();

    expect(source.subscriber.active).toBe(false);
    expect(first.subscriber.active).toBe(false);
    expect(second.subscriber.active).toBe(false);
    expect(third.subscriptions).toBe(0);
  });

  it('shares and ref-counts one recursive run, then restarts with fresh state', () => {
    const source = tracked<number>();
    const inner = tracked<number>();
    const projectIndices: number[] = [];
    const expanded = source.observable[expand]((value, index) => {
      projectIndices.push(index);
      return value < 10 ? inner.observable : [];
    });
    const firstController = new AbortController();
    const secondController = new AbortController();
    const restartedController = new AbortController();
    const firstValues: number[] = [];
    const secondValues: number[] = [];
    const restartedValues: number[] = [];

    expanded.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    expanded.subscribe((value) => secondValues.push(value), { signal: secondController.signal });

    expect(source.activations).toBe(1);
    source.subscribers[0]!.next(1);
    expect(inner.activations).toBe(1);
    inner.subscribers[0]!.next(10);
    expect(projectIndices).toEqual([0, 1]);
    expect(firstValues).toEqual([1, 10]);
    expect(secondValues).toEqual([1, 10]);

    firstController.abort();
    expect(source.subscribers[0]!.active).toBe(true);
    expect(inner.subscribers[0]!.active).toBe(true);

    secondController.abort();
    expect(source.subscribers[0]!.active).toBe(false);
    expect(inner.subscribers[0]!.active).toBe(false);

    expanded.subscribe((value) => restartedValues.push(value), { signal: restartedController.signal });
    expect(source.activations).toBe(2);
    source.subscribers[1]!.next(2);
    expect(inner.activations).toBe(2);
    expect(projectIndices.at(-1)).toBe(0);
    expect(restartedValues).toEqual([2]);

    restartedController.abort();
  });

  it('rejects legacy positional concurrency and scheduler arguments', () => {
    const source = Observable.from([1]);
    const project = (value: number) => [value + 1];

    expect(() => Reflect.apply(source[expand], source, [project, Infinity])).toThrow(
      'RxJS Next expand options must be an object.'
    );
    expect(() => Reflect.apply(source[expand], source, [project, { concurrent: 1 }, {}])).toThrow(
      'RxJS Next expand does not support a scheduler argument.'
    );
  });
});

function controllable<T>(): {
  readonly observable: Observable<T>;
  readonly subscriber: Subscriber<T>;
  readonly subscriptions: number;
} {
  let subscriber: Subscriber<T> | undefined;
  let subscriptions = 0;
  const observable = new Observable<T>((nextSubscriber) => {
    subscriptions++;
    subscriber = nextSubscriber;
  });

  return {
    observable,
    get subscriber() {
      if (!subscriber) {
        throw new Error('The controllable source is not active.');
      }
      return subscriber;
    },
    get subscriptions() {
      return subscriptions;
    },
  };
}

function tracked<T>(): {
  readonly observable: Observable<T>;
  readonly subscribers: Subscriber<T>[];
  readonly activations: number;
} {
  const subscribers: Subscriber<T>[] = [];
  const observable = new Observable<T>((subscriber) => {
    subscribers.push(subscriber);
  });

  return {
    observable,
    subscribers,
    get activations() {
      return subscribers.length;
    },
  };
}
