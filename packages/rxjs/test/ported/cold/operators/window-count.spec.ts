// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/windowCount-spec.ts
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { mergeMap } from 'rxjs/merge-map';
import { windowCount } from 'rxjs/window-count';
describe('windowCount (cold)', () => {
  it('should emit windows with count 3, no skip specified', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('---a---b---c---d---e---f---g---h---i---|');
      const sourceSubs = '^--------------------------------------!';
      const expected = '  x----------y-----------z-----------w---|';
      const x = cold('    ---a---b---(c|)                         ');
      const y = cold('               ----d---e---(f|)             ');
      const z = cold('                           ----g---h---(i|) ');
      const w = cold('                                       ----|');
      const expectedValues = { x: x, y: y, z: z, w: w };
      const result = source[windowCount](3);
      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should emit windows with count 2 and skip 1', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('^-a--b--c--d--|');
      const subs = '      ^-------------!';
      const expected = '  u-v--x--y--z--|';
      const u = cold('    --a--(b|)      ');
      const v = cold('      ---b--(c|)   ');
      const x = cold('         ---c--(d|)');
      const y = cold('            ---d--|');
      const z = cold('               ---|');
      const values = { u: u, v: v, x: x, y: y, z: z };
      const result = source[windowCount](2, 1);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should emit windows with count 2, and skip unspecified', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--d--e--f--|');
      const subs = '      ^-------------------!';
      const expected = '  x----y-----z-----w--|';
      const x = cold('    --a--(b|)            ');
      const y = cold('         ---c--(d|)      ');
      const z = cold('               ---e--(f|)');
      const w = cold('                     ---|');
      const values = { x: x, y: y, z: z, w: w };
      const result = source[windowCount](2);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should return empty if source is empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('|');
      const subs = '       (^!)';
      const expected = '   (w|)';
      const w = cold('     |');
      const values = { w: w };
      const result = source[windowCount](2, 1);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should return Never if source if Never', async () => {
    await rxTest(async ({ cold, expectSubscriptions, flush, schedule }) => {
      const source = cold('-');
      const outerController = new AbortController();
      const innerController = new AbortController();
      const outerEvents = [];
      const innerEvents = [];
      let snapshot;
      const result = source[windowCount](2, 1);
      result.subscribe(
        {
          next: (window) => {
            outerEvents.push('window');
            window.subscribe(
              {
                next: (value) => innerEvents.push({ kind: 'N', value }),
                error: (error) => innerEvents.push({ kind: 'E', error }),
                complete: () => innerEvents.push({ kind: 'C' }),
              },
              { signal: innerController.signal }
            );
          },
          error: (error) => outerEvents.push({ kind: 'E', error }),
          complete: () => outerEvents.push({ kind: 'C' }),
        },
        { signal: outerController.signal }
      );
      schedule(() => {
        snapshot = {
          outerEvents: [...outerEvents],
          innerEvents: [...innerEvents],
        };
        // Bound the independently observed window before cancelling the outer
        // result so teardown cannot turn this never-window assertion into a
        // terminal-notification assertion.
        innerController.abort();
        outerController.abort();
      }, 1);
      expectSubscriptions(source.subscriptions).toBe('^!');
      await flush();
      expect(snapshot).toEqual({
        outerEvents: ['window'],
        innerEvents: [],
      });
      expect(outerEvents).toEqual(['window']);
      expect(innerEvents).toEqual([]);
    });
  });
  it('should propagate error from a just-throw source', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('  #');
      const subs = '         (^!)';
      const expected = '     (w#)';
      const w = cold('       #');
      const expectedValues = { w: w };
      const result = source[windowCount](2, 1);
      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should raise error if source raises error', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('--a--b--c--d--e--f--#');
      const subs = '      ^-------------------!';
      const expected = '  u-v--w--x--y--z--q--#';
      const u = cold('    --a--b--(c|)         ');
      const v = cold('      ---b--c--(d|)      ');
      const w = cold('         ---c--d--(e|)   ');
      const x = cold('            ---d--e--(f|)');
      const y = cold('               ---e--f--#');
      const z = cold('                  ---f--#');
      const q = cold('                     ---#');
      const values = { u: u, v: v, w: w, x: x, y: y, z: z, q: q };
      const result = source[windowCount](3, 1);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should dispose of inner windows once outer is unsubscribed early', async () => {
    await rxTest(async ({ expectSubscriptions, flush, hot, now, schedule }) => {
      const source = hot('^-a--b--c--d--|');
      const outerController = new AbortController();
      const innerControllers = [];
      const actual = [];
      const result = source[windowCount](2, 1);
      result.subscribe(
        {
          next: (window) => {
            const outerFrame = now();
            const messages = [];
            const innerController = new AbortController();
            innerControllers.push(innerController);
            actual.push({
              frame: outerFrame,
              notification: { kind: 'N', value: messages },
            });
            window.subscribe(
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
        // The RxJS 7 expectation materializes each emitted window independently.
        // Bound those inner observations before the original outer-unsubscribe
        // frame releases the still-live windows without completing them.
        for (const innerController of innerControllers) {
          innerController.abort();
        }
        outerController.abort();
      }, 9);
      expectSubscriptions(source.subscriptions).toBe('^--------!');
      await flush();
      expect(actual).toEqual([
        {
          frame: 0,
          notification: {
            kind: 'N',
            value: [
              { frame: 2, notification: { kind: 'N', value: 'a' } },
              { frame: 5, notification: { kind: 'N', value: 'b' } },
              { frame: 5, notification: { kind: 'C' } },
            ],
          },
        },
        {
          frame: 2,
          notification: {
            kind: 'N',
            value: [
              { frame: 3, notification: { kind: 'N', value: 'b' } },
              { frame: 6, notification: { kind: 'N', value: 'c' } },
              { frame: 6, notification: { kind: 'C' } },
            ],
          },
        },
        {
          frame: 5,
          notification: {
            kind: 'N',
            value: [{ frame: 3, notification: { kind: 'N', value: 'c' } }],
          },
        },
        {
          frame: 8,
          notification: {
            kind: 'N',
            value: [],
          },
        },
      ]);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(async ({ expectSubscriptions, flush, hot, now, schedule }) => {
      const source = hot('^-a--b--c--d--|');
      const outerController = new AbortController();
      const innerControllers = [];
      const actual = [];
      const result = source[mergeMap]((value) => ColdObservable.from([value]))
        [windowCount](2, 1)
        [mergeMap]((window) => ColdObservable.from([window]));
      result.subscribe(
        {
          next: (window) => {
            const outerFrame = now();
            const messages = [];
            const innerController = new AbortController();
            innerControllers.push(innerController);
            actual.push({
              frame: outerFrame,
              notification: { kind: 'N', value: messages },
            });
            window.subscribe(
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
        // The RxJS 7 expectation materializes each emitted window independently.
        // Bound those inner observations before the original outer-unsubscribe
        // frame releases the still-live windows without completing them.
        for (const innerController of innerControllers) {
          innerController.abort();
        }
        outerController.abort();
      }, 9);
      expectSubscriptions(source.subscriptions).toBe('^--------!');
      await flush();
      expect(actual).toEqual([
        {
          frame: 0,
          notification: {
            kind: 'N',
            value: [
              { frame: 2, notification: { kind: 'N', value: 'a' } },
              { frame: 5, notification: { kind: 'N', value: 'b' } },
              { frame: 5, notification: { kind: 'C' } },
            ],
          },
        },
        {
          frame: 2,
          notification: {
            kind: 'N',
            value: [
              { frame: 3, notification: { kind: 'N', value: 'b' } },
              { frame: 6, notification: { kind: 'N', value: 'c' } },
              { frame: 6, notification: { kind: 'C' } },
            ],
          },
        },
        {
          frame: 5,
          notification: {
            kind: 'N',
            value: [{ frame: 3, notification: { kind: 'N', value: 'c' } }],
          },
        },
        {
          frame: 8,
          notification: {
            kind: 'N',
            value: [],
          },
        },
      ]);
    });
  });
});
