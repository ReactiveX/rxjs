// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/window-spec.ts
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { EMPTY } from 'rxjs/empty';
import { mergeMap } from 'rxjs/merge-map';
import { window } from 'rxjs/window';
describe('window (cold)', () => {
  it('should emit windows that close and reopen', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('  ---a---b---c---d---e---f---g---h---i---|    ');
      const sourceSubs = '  ^--------------------------------------!    ';
      const closings = hot('-------------w------------w----------------|');
      const closingSubs = ' ^--------------------------------------!    ';
      const expected = '    x------------y------------z------------|    ';
      const x = cold('      ---a---b---c-|                              ');
      const y = cold('                   --d---e---f--|                 ');
      const z = cold('                                -g---h---i---|    ');
      const expectedValues = { x: x, y: y, z: z };
      const result = source[window](closings);
      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(closings.subscriptions).toBe(closingSubs);
    });
  });
  it('should return a single empty window if source is empty and closings are basic', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('  |        ');
      const sourceSubs = '   (^!)     ';
      const closings = cold('--x--x--|');
      const closingSubs = '  (^!)     ';
      const expected = '     (w|)     ';
      const w = cold('       |        ');
      const expectedValues = { w: w };
      const result = source[window](closings);
      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(closings.subscriptions).toBe(closingSubs);
    });
  });
  it('should return a single empty window if source is empty and closing is empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('  |   ');
      const sourceSubs = '   (^!)';
      const closings = cold('|   ');
      const closingSubs = '  (^!)';
      const expected = '     (w|)';
      const w = cold('       |   ');
      const expectedValues = { w: w };
      const result = source[window](closings);
      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(closings.subscriptions).toBe(closingSubs);
    });
  });
  it('should return a single empty window if source is sync empty and closing is sync empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('  (|) ');
      const sourceSubs = '   (^!)';
      const expected = '     (w|)';
      const w = cold('       |   ');
      const expectedValues = { w: w };
      const result = source[window](EMPTY);
      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      // expectSubscriptions(closings.subscriptions).toBe(closingSubs);
    });
  });
  it('should split a Just source into a single window identical to source, using a Never closing', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('  (a|)');
      const sourceSubs = '   (^!)';
      const closings = cold('-   ');
      const closingSubs = '  (^!)';
      const expected = '     (w|)';
      const w = cold('       (a|)');
      const expectedValues = { w: w };
      const result = source[window](closings);
      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(closings.subscriptions).toBe(closingSubs);
    });
  });
  it('should return a single Never window if source is Never', async () => {
    await rxTest(async ({ cold, expectSubscriptions, flush, now, schedule }) => {
      const source = cold('------');
      const closings = cold('------');
      const outerController = new AbortController();
      const innerControllers = [];
      const actual = [];
      const result = source[window](closings);
      result.subscribe(
        {
          next: (inner) => {
            const outerFrame = now();
            const messages = [];
            const innerController = new AbortController();
            innerControllers.push(innerController);
            actual.push({
              frame: outerFrame,
              notification: { kind: 'N', value: messages },
            });
            inner.subscribe(
              {
                next: (value) =>
                  messages.push({
                    frame: now() - outerFrame,
                    notification: { kind: 'N', value },
                  }),
                error: (error) =>
                  messages.push({
                    frame: now() - outerFrame,
                    notification: { kind: 'E', error },
                  }),
                complete: () =>
                  messages.push({
                    frame: now() - outerFrame,
                    notification: { kind: 'C' },
                  }),
              },
              { signal: innerController.signal }
            );
          },
          error: (error) =>
            actual.push({
              frame: now(),
              notification: { kind: 'E', error },
            }),
          complete: () =>
            actual.push({
              frame: now(),
              notification: { kind: 'C' },
            }),
        },
        { signal: outerController.signal }
      );
      schedule(() => {
        // The pinned diagrams assert silence through frame 5. End the harness-only
        // observations at frame 6 without adding a terminal notification.
        for (const innerController of innerControllers) {
          innerController.abort();
        }
        outerController.abort();
      }, 6);
      expectSubscriptions(source.subscriptions).toBe('^-----!');
      expectSubscriptions(closings.subscriptions).toBe('^-----!');
      await flush();
      expect(actual).toEqual([
        {
          frame: 0,
          notification: { kind: 'N', value: [] },
        },
      ]);
    });
  });
  it('should be able to split a never Observable into timely empty windows', async () => {
    await rxTest(async ({ cold, expectSubscriptions, flush, hot, now, schedule }) => {
      const source = hot('^--------');
      const closings = cold('--x--x--|');
      const outerController = new AbortController();
      const innerControllers = [];
      const actual = [];
      const result = source[window](closings);
      result.subscribe(
        {
          next: (inner) => {
            const outerFrame = now();
            const messages = [];
            const innerController = new AbortController();
            innerControllers.push(innerController);
            actual.push({
              frame: outerFrame,
              notification: { kind: 'N', value: messages },
            });
            inner.subscribe(
              {
                next: (value) =>
                  messages.push({
                    frame: now() - outerFrame,
                    notification: { kind: 'N', value },
                  }),
                error: (error) =>
                  messages.push({
                    frame: now() - outerFrame,
                    notification: { kind: 'E', error },
                  }),
                complete: () =>
                  messages.push({
                    frame: now() - outerFrame,
                    notification: { kind: 'C' },
                  }),
              },
              { signal: innerController.signal }
            );
          },
          error: (error) =>
            actual.push({
              frame: now(),
              notification: { kind: 'E', error },
            }),
          complete: () =>
            actual.push({
              frame: now(),
              notification: { kind: 'C' },
            }),
        },
        { signal: outerController.signal }
      );
      schedule(() => {
        // Preserve the original open outer result and final open window through
        // frame 8, then release both observations at the finite evidence horizon.
        for (const innerController of innerControllers) {
          innerController.abort();
        }
        outerController.abort();
      }, 9);
      expectSubscriptions(source.subscriptions).toBe('^--------!');
      expectSubscriptions(closings.subscriptions).toBe('^-------!');
      await flush();
      expect(actual).toEqual([
        {
          frame: 0,
          notification: {
            kind: 'N',
            value: [{ frame: 2, notification: { kind: 'C' } }],
          },
        },
        {
          frame: 2,
          notification: {
            kind: 'N',
            value: [{ frame: 3, notification: { kind: 'C' } }],
          },
        },
        {
          frame: 5,
          notification: { kind: 'N', value: [] },
        },
      ]);
    });
  });
  it('should emit an error-only window if outer is a simple throw-Observable', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('  #        ');
      const sourceSubs = '   (^!)     ';
      const closings = cold('--x--x--|');
      const closingSubs = '  (^!)     ';
      const expected = '     (w#)     ';
      const w = cold('       #        ');
      const expectedValues = { w: w };
      const result = source[window](closings);
      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(closings.subscriptions).toBe(closingSubs);
    });
  });
  it('should handle basic case with window closings', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('-1-2-^3-4-5-6-7-8-9-|         ');
      const subs = '           ^--------------!         ';
      const closings = hot('---^---x---x---x---x---x---|');
      const closingSubs = '    ^--------------!         ';
      const expected = '       a---b---c---d--|         ';
      const a = cold('         -3-4|                    ');
      const b = cold('             -5-6|                ');
      const c = cold('                 -7-8|            ');
      const d = cold('                     -9-|         ');
      const expectedValues = { a: a, b: b, c: c, d: d };
      const result = source[window](closings);
      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(subs);
      expectSubscriptions(closings.subscriptions).toBe(closingSubs);
    });
  });
  it('should handle basic case with window closings, but outer throws', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('-1-2-^3-4-5-6-7-8-9-#         ');
      const subs = '           ^--------------!         ';
      const closings = hot('---^---x---x---x---x---x---|');
      const closingSubs = '    ^--------------!         ';
      const expected = '       a---b---c---d--#         ';
      const a = cold('         -3-4|                    ');
      const b = cold('             -5-6|                ');
      const c = cold('                 -7-8|            ');
      const d = cold('                     -9-#         ');
      const expectedValues = { a: a, b: b, c: c, d: d };
      const result = source[window](closings);
      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(subs);
      expectSubscriptions(closings.subscriptions).toBe(closingSubs);
    });
  });
  it('should stop emitting windows when outer is unsubscribed early', async () => {
    await rxTest(async ({ expectSubscriptions, flush, hot, now, schedule }) => {
      const outerController = new AbortController();
      const innerControllers = [];
      const actual = [];
      schedule(() => {
        // Bound materialized inner windows before applying the pinned outer
        // unsubscription, so cancellation is not misreported as completion.
        for (const innerController of innerControllers) {
          innerController.abort();
        }
        outerController.abort();
      }, 8);
      const source = hot('-1-2-^3-4-5-6-7-8-9-|');
      const closings = hot('---^---x---x---x---x---x---|');
      const result = source[window](closings);
      // Match expectObservable's frame-zero observation: pre-subscription hot
      // values are dispatched before the result is observed.
      schedule(
        () =>
          result.subscribe(
            {
              next: (inner) => {
                const outerFrame = now();
                const messages = [];
                const innerController = new AbortController();
                innerControllers.push(innerController);
                actual.push({
                  frame: outerFrame,
                  notification: { kind: 'N', value: messages },
                });
                inner.subscribe(
                  {
                    next: (value) =>
                      messages.push({
                        frame: now() - outerFrame,
                        notification: { kind: 'N', value },
                      }),
                    error: (error) =>
                      messages.push({
                        frame: now() - outerFrame,
                        notification: { kind: 'E', error },
                      }),
                    complete: () =>
                      messages.push({
                        frame: now() - outerFrame,
                        notification: { kind: 'C' },
                      }),
                  },
                  { signal: innerController.signal }
                );
              },
              error: (error) =>
                actual.push({
                  frame: now(),
                  notification: { kind: 'E', error },
                }),
              complete: () =>
                actual.push({
                  frame: now(),
                  notification: { kind: 'C' },
                }),
            },
            { signal: outerController.signal }
          ),
        0
      );
      expectSubscriptions(source.subscriptions).toBe('^-------!');
      expectSubscriptions(closings.subscriptions).toBe('^-------!');
      await flush();
      expect(actual).toEqual([
        {
          frame: 0,
          notification: {
            kind: 'N',
            value: [
              { frame: 1, notification: { kind: 'N', value: '3' } },
              { frame: 3, notification: { kind: 'N', value: '4' } },
              { frame: 4, notification: { kind: 'C' } },
            ],
          },
        },
        {
          frame: 4,
          notification: {
            kind: 'N',
            value: [
              { frame: 1, notification: { kind: 'N', value: '5' } },
              { frame: 3, notification: { kind: 'N', value: '6' } },
            ],
          },
        },
      ]);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(async ({ expectSubscriptions, flush, hot, now, schedule }) => {
      const outerController = new AbortController();
      const innerControllers = [];
      const actual = [];
      schedule(() => {
        // Bound materialized inner windows before applying the pinned outer
        // unsubscription, so cancellation is not misreported as completion.
        for (const innerController of innerControllers) {
          innerController.abort();
        }
        outerController.abort();
      }, 8);
      const source = hot('-1-2-^3-4-5-6-7-8-9-|');
      const closings = hot('---^---x---x---x---x---x---|');
      const result = source[mergeMap]((value) => ColdObservable.from([value]))
        [window](closings)
        [mergeMap]((inner) => ColdObservable.from([inner]));
      // Match expectObservable's frame-zero observation: pre-subscription hot
      // values are dispatched before the result is observed.
      schedule(
        () =>
          result.subscribe(
            {
              next: (inner) => {
                const outerFrame = now();
                const messages = [];
                const innerController = new AbortController();
                innerControllers.push(innerController);
                actual.push({
                  frame: outerFrame,
                  notification: { kind: 'N', value: messages },
                });
                inner.subscribe(
                  {
                    next: (value) =>
                      messages.push({
                        frame: now() - outerFrame,
                        notification: { kind: 'N', value },
                      }),
                    error: (error) =>
                      messages.push({
                        frame: now() - outerFrame,
                        notification: { kind: 'E', error },
                      }),
                    complete: () =>
                      messages.push({
                        frame: now() - outerFrame,
                        notification: { kind: 'C' },
                      }),
                  },
                  { signal: innerController.signal }
                );
              },
              error: (error) =>
                actual.push({
                  frame: now(),
                  notification: { kind: 'E', error },
                }),
              complete: () =>
                actual.push({
                  frame: now(),
                  notification: { kind: 'C' },
                }),
            },
            { signal: outerController.signal }
          ),
        0
      );
      expectSubscriptions(source.subscriptions).toBe('^-------!');
      expectSubscriptions(closings.subscriptions).toBe('^-------!');
      await flush();
      expect(actual).toEqual([
        {
          frame: 0,
          notification: {
            kind: 'N',
            value: [
              { frame: 1, notification: { kind: 'N', value: '3' } },
              { frame: 3, notification: { kind: 'N', value: '4' } },
              { frame: 4, notification: { kind: 'C' } },
            ],
          },
        },
        {
          frame: 4,
          notification: {
            kind: 'N',
            value: [
              { frame: 1, notification: { kind: 'N', value: '5' } },
              { frame: 3, notification: { kind: 'N', value: '6' } },
            ],
          },
        },
      ]);
    });
  });
  it('should make outer emit error when closing throws', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('-1-2-^3-4-5-6-7-8-9-#');
      const subs = '           ^---!           ';
      const closings = hot('---^---#           ');
      const closingSubs = '    ^---!           ';
      const expected = '       a---#           ';
      const a = cold('         -3-4#           ');
      const expectedValues = { a: a };
      const result = source[window](closings);
      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(subs);
      expectSubscriptions(closings.subscriptions).toBe(closingSubs);
    });
  });
  it('should complete the resulting Observable when window closings completes', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('-1-2-^3-4-5-6-7-8-9-|');
      const subs = '           ^--------------!';
      const closings = hot('---^---x---x---|   ');
      const closingSubs = '    ^-----------!   ';
      const expected = '       a---b---c------|';
      const a = cold('         -3-4|           ');
      const b = cold('             -5-6|       ');
      const c = cold('                 -7-8-9-|');
      const expectedValues = { a: a, b: b, c: c };
      const result = source[window](closings);
      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(subs);
      expectSubscriptions(closings.subscriptions).toBe(closingSubs);
    });
  });
});
