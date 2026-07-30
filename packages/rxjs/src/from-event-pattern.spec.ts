import { beforeAll, describe, expect, expectTypeOf, it, vi } from 'vitest';
import '@rxjs/observable-polyfill';

type FromEventPattern = typeof import('./from-event-pattern.js').fromEventPattern;
type EventPatternHandler = (...args: any[]) => void;

let fromEventPattern: FromEventPattern;

beforeAll(async () => {
  ({ fromEventPattern } = await import('./from-event-pattern.js'));
});

describe('fromEventPattern', () => {
  it('preserves its standalone result types', () => {
    const values = fromEventPattern<number>(() => {});
    const selected = fromEventPattern(
      () => {},
      undefined,
      (left: number, right: string) => `${left}:${right}`
    );

    expectTypeOf(values).toEqualTypeOf<Observable<number>>();
    expectTypeOf(selected).toEqualTypeOf<Observable<string>>();
    expect((Observable as ObservableCtor & { fromEventPattern?: unknown }).fromEventPattern).toBeUndefined();
    expect((Observable.prototype as Observable<unknown> & { fromEventPattern?: unknown }).fromEventPattern).toBeUndefined();
  });

  it('emits one argument directly and zero or multiple arguments as arrays', () => {
    let handler: EventPatternHandler | undefined;
    const values: unknown[] = [];
    const controller = new AbortController();

    fromEventPattern<unknown>((registeredHandler) => {
      handler = registeredHandler;
    }).subscribe((value) => values.push(value), { signal: controller.signal });

    handler!();
    handler!('only');
    handler!(1, 'two', true);

    expect(values).toEqual([[], 'only', [1, 'two', true]]);
    controller.abort();
  });

  it('passes the original arguments to the result selector', () => {
    let handler: EventPatternHandler | undefined;
    const calls: any[][] = [];
    const values: string[] = [];
    const controller = new AbortController();

    fromEventPattern(
      (registeredHandler) => {
        handler = registeredHandler;
      },
      undefined,
      (...args: any[]) => {
        calls.push(args);
        return args.join(':');
      }
    ).subscribe((value) => values.push(value), { signal: controller.signal });

    handler!(1, 'two', true);

    expect(calls).toEqual([[1, 'two', true]]);
    expect(values).toEqual(['1:two:true']);
    controller.abort();
  });

  it('shares one handler across concurrent and late platform observers, then restarts', () => {
    const handlers: EventPatternHandler[] = [];
    const tokens = [{ run: 1 }, { run: 2 }];
    const removals: Array<[EventPatternHandler, unknown]> = [];
    const firstValues: number[] = [];
    const lateValues: number[] = [];
    const restartedValues: number[] = [];
    const firstController = new AbortController();
    const lateController = new AbortController();

    const source = fromEventPattern<number>(
      (handler) => {
        handlers.push(handler);
        return tokens[handlers.length - 1];
      },
      (handler, token) => removals.push([handler, token])
    );

    source.subscribe((value) => firstValues.push(value), { signal: firstController.signal });
    handlers[0]!(1);
    source.subscribe((value) => lateValues.push(value), { signal: lateController.signal });
    handlers[0]!(2);

    expect(handlers).toHaveLength(1);
    expect(firstValues).toEqual([1, 2]);
    expect(lateValues).toEqual([2]);

    firstController.abort();
    expect(removals).toEqual([]);
    lateController.abort();
    expect(removals).toEqual([[handlers[0], tokens[0]]]);

    const restartedController = new AbortController();
    source.subscribe((value) => restartedValues.push(value), { signal: restartedController.signal });
    handlers[0]!(3);
    handlers[1]!(4);

    expect(handlers).toHaveLength(2);
    expect(restartedValues).toEqual([4]);

    restartedController.abort();
    expect(removals).toEqual([
      [handlers[0], tokens[0]],
      [handlers[1], tokens[1]],
    ]);
  });

  it('supports synchronous reentrant handler calls without registering again', () => {
    let handler: EventPatternHandler | undefined;
    let registrations = 0;
    const values: string[] = [];
    const controller = new AbortController();

    fromEventPattern<string>((registeredHandler) => {
      registrations++;
      handler = registeredHandler;
    }).subscribe(
      (value) => {
        values.push(value);
        if (value === 'outer') {
          handler!('inner');
        }
      },
      { signal: controller.signal }
    );

    handler!('outer');

    expect(registrations).toBe(1);
    expect(values).toEqual(['outer', 'inner']);
    controller.abort();
  });

  it('removes with the returned token when synchronous delivery cancels during registration', () => {
    const token = { subscription: 1 };
    const removals: Array<[EventPatternHandler, unknown]> = [];
    const controller = new AbortController();
    let registeredHandler: EventPatternHandler | undefined;

    fromEventPattern<string>(
      (handler) => {
        registeredHandler = handler;
        handler('value');
        return token;
      },
      (handler, returnedToken) => removals.push([handler, returnedToken])
    ).subscribe(() => controller.abort(), { signal: controller.signal });

    expect(removals).toEqual([[registeredHandler, token]]);
    controller.abort();
    expect(removals).toHaveLength(1);
  });

  it('errors the result when addHandler throws without calling removeHandler', () => {
    const failure = new Error('registration failed');
    const errors: unknown[] = [];
    const removeHandler = vi.fn();

    fromEventPattern(() => {
      throw failure;
    }, removeHandler).subscribe({ error: (error) => errors.push(error) });

    expect(errors).toEqual([failure]);
    expect(removeHandler).not.toHaveBeenCalled();
  });

  it('errors on selector failure and removes the exact handler and token once', () => {
    const failure = new Error('selection failed');
    const token = { subscription: 1 };
    let handler: EventPatternHandler | undefined;
    const removals: Array<[EventPatternHandler, unknown]> = [];
    const errors: unknown[] = [];

    fromEventPattern(
      (registeredHandler) => {
        handler = registeredHandler;
        return token;
      },
      (registeredHandler, returnedToken) => removals.push([registeredHandler, returnedToken]),
      () => {
        throw failure;
      }
    ).subscribe({ error: (error) => errors.push(error) });

    handler!('value');
    handler!('ignored');

    expect(errors).toEqual([failure]);
    expect(removals).toEqual([[handler, token]]);
  });

  it('removes after a synchronous selector failure with the token returned afterward', () => {
    const failure = new Error('selection failed');
    const token = { subscription: 1 };
    let handler: EventPatternHandler | undefined;
    const removals: Array<[EventPatternHandler, unknown]> = [];
    const errors: unknown[] = [];

    fromEventPattern(
      (registeredHandler) => {
        handler = registeredHandler;
        registeredHandler('value');
        return token;
      },
      (registeredHandler, returnedToken) => removals.push([registeredHandler, returnedToken]),
      () => {
        throw failure;
      }
    ).subscribe({ error: (error) => errors.push(error) });

    expect(errors).toEqual([failure]);
    expect(removals).toEqual([[handler, token]]);
  });

  it('host-reports a removeHandler failure on final cancellation', () => {
    const failure = new Error('removal failed');
    const reportError = vi.fn();
    vi.stubGlobal('reportError', reportError);
    const controller = new AbortController();

    fromEventPattern(
      () => {},
      () => {
        throw failure;
      }
    ).subscribe(() => {}, { signal: controller.signal });

    controller.abort();

    expect(reportError).toHaveBeenCalledTimes(1);
    expect(reportError).toHaveBeenCalledWith(failure);
    vi.unstubAllGlobals();
  });
});
