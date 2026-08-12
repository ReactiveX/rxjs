// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/windowTime-spec.ts
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { mergeMap } from 'rxjs/merge-map';
import { windowTime } from 'rxjs/window-time';
describe('windowTime (cold)', () => {
  it('should emit windows given windowTimeSpan and windowCreationInterval', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('--1--2--^-a--b--c--d--e---f--g--h-|');
      const subs = '              ^-------------------------!';
      //  10 frames               0---------1---------2-----|
      //  5                       -----|
      //  5                                 -----|
      //  5                                           -----|
      const expected = '          x---------y---------z-----|';
      const x = cold('            --a--(b|)                  ');
      const y = cold('                      -d--e|           ');
      const z = cold('                                -g--h| ');
      const values = { x, y, z };
      const result = source[windowTime](5, 10, Infinity);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should close windows after max count is reached', async () => {
    await rxTest(({ hot, time, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('--1--2--^--a--b--c--d--e--f--g-----|');
      const subs = '              ^--------------------------!';
      const timeSpan = time('     ----------|                 ');
      //                                 ----------|
      //                                       ----------|
      //                                             ---------
      const expected = '          w-----x-----y-----z--------|';
      const w = cold('            ---a--(b|)                  ');
      const x = cold('                  ---c--(d|)            ');
      const y = cold('                        ---e--(f|)      ');
      const z = cold('                              ---g-----|');
      const values = { w, x, y, z };
      const result = source[windowTime](timeSpan, null, 2);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should close window after max count is reached with windowCreationInterval', async () => {
    await rxTest(({ hot, cold, expectSubscriptions, expectObservable }) => {
      const source = hot('--1--2--^-a--b--c--de-f---g--h--i-|');
      const subs = '              ^-------------------------!';
      //  10 frames               0---------1---------2-----|
      //  5                       -----|
      //  5                                 -----|
      //  5                                           -----|
      const expected = '          x---------y---------z-----|';
      const x = cold('            --a--(b|)                  ');
      const y = cold('                      -de-(f|)         ');
      const z = cold('                                -h--i| ');
      const values = { x, y, z };
      const result = source[windowTime](5, 10, 3);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should emit windows given windowTimeSpan', async () => {
    await rxTest(({ hot, cold, time, expectSubscriptions, expectObservable }) => {
      const source = hot('--1--2--^--a--b--c--d--e--f--g--h--|');
      const subs = '              ^--------------------------!';
      const timeSpan = time('     ----------|                 ');
      //  10 frames               0---------1---------2------|
      //                                    ----------|
      //                                              ----------|
      const expected = '          x---------y---------z------|';
      const x = cold('            ---a--b--c|                 ');
      const y = cold('                      --d--e--f-|       ');
      const z = cold('                                -g--h--|');
      const values = { x, y, z };
      const result = source[windowTime](timeSpan, null, Infinity);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should emit windows given windowTimeSpan and windowCreationInterval', async () => {
    await rxTest(({ hot, time, cold, expectSubscriptions, expectObservable }) => {
      const source = hot('--1--2--^--a--b--c--d--e--f--g--h--|');
      const subs = '              ^--------------------------!';
      //  10 frames               0---------1---------2------|
      const interval = time('     ----------|                 ');
      //  10                                ----------|
      //  10                                          ----------|
      const timeSpan = time('     -----|                      ');
      //  5                                 ----|
      //  5                                           ----|
      const expected = '          x---------y---------z------|';
      const x = cold('            ---a-|                      ');
      const y = cold('                      --d--(e|)         ');
      const z = cold('                                -g--h|  ');
      const values = { x, y, z };
      const result = source[windowTime](timeSpan, interval, Infinity);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should return a single empty window if source is empty', async () => {
    await rxTest(({ cold, time, expectSubscriptions, expectObservable }) => {
      const source = cold('|');
      const subs = '       (^!)';
      const expected = '   (w|)';
      const w = cold('     |');
      const expectedValues = { w };
      const timeSpan = time('-----|');
      const interval = time('----------|');
      const result = source[windowTime](timeSpan, interval, Infinity);
      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should split a Just source into a single window identical to source', async () => {
    await rxTest(({ cold, time, expectSubscriptions, expectObservable }) => {
      const source = cold('(a|)');
      const subs = '       (^!)';
      const expected = '   (w|)';
      const w = cold('     (a|)');
      const expectedValues = { w };
      const timeSpan = time('-----|');
      const interval = time('----------|');
      const result = source[windowTime](timeSpan, interval, Infinity);
      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should be able to split a never Observable into timely empty windows', async () => {
    await rxTest(async ({ expectSubscriptions, flush, hot, now, schedule }) => {
      const source = hot('^----------');
      const result = source[windowTime](3, 3, Infinity);
      const outerController = new AbortController();
      const innerControllers = [];
      const actual = [];
      schedule(() => {
        for (const innerController of innerControllers) {
          innerController.abort();
        }
        outerController.abort();
      }, 10);
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
                complete: () => {
                  messages.push({
                    frame: now() - outerFrame,
                    notification: { kind: 'C' },
                  });
                  innerController.abort();
                },
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
      await flush();
      expect(actual).toEqual([
        {
          frame: 0,
          notification: {
            kind: 'N',
            value: [
              {
                frame: 3,
                notification: {
                  kind: 'C',
                },
              },
            ],
          },
        },
        {
          frame: 3,
          notification: {
            kind: 'N',
            value: [
              {
                frame: 3,
                notification: {
                  kind: 'C',
                },
              },
            ],
          },
        },
        {
          frame: 6,
          notification: {
            kind: 'N',
            value: [
              {
                frame: 3,
                notification: {
                  kind: 'C',
                },
              },
            ],
          },
        },
        {
          frame: 9,
          notification: {
            kind: 'N',
            value: [],
          },
        },
      ]);
      expectSubscriptions(source.subscriptions).toBe('^---------!');
    });
  });
  it('should emit an error-only window if outer is a simple throw-Observable', async () => {
    await rxTest(({ cold, time, expectSubscriptions, expectObservable }) => {
      const source = cold('#   ');
      const subs = '       (^!)';
      const expected = '   (w#)';
      const w = cold('     #   ');
      const expectedValues = { w };
      const timeSpan = time('-----|');
      const interval = time('----------|');
      const result = source[windowTime](timeSpan, interval, Infinity);
      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should handle source Observable which eventually emits an error', async () => {
    await rxTest(({ hot, cold, time, expectSubscriptions, expectObservable }) => {
      const source = hot('--1--2--^--a--b--c--d--e--f--g--h--#');
      const subs = '              ^--------------------------!';
      const timeSpan = time('     -----|                      ');
      const interval = time('     ----------|                 ');
      //  10 frames               0---------1---------2------|
      //  5                       ----|
      //  5                                 ----|
      //  5                                           ----|
      const expected = '          x---------y---------z------#';
      const x = cold('            ---a-|                      ');
      const y = cold('                      --d--(e|)         ');
      const z = cold('                                -g--h|  ');
      const values = { x, y, z };
      const result = source[windowTime](timeSpan, interval, Infinity);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should emit windows given windowTimeSpan and windowCreationInterval, but outer is unsubscribed early', async () => {
    await rxTest(async ({ expectSubscriptions, flush, hot, now, schedule }) => {
      const source = hot('^--a--b--c--d--e--f--g--h--|');
      const result = source[windowTime](5, 10, Infinity);
      const outerController = new AbortController();
      const innerControllers = [];
      const actual = [];
      schedule(() => {
        for (const innerController of innerControllers) {
          innerController.abort();
        }
        outerController.abort();
      }, 11);
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
                complete: () => {
                  messages.push({
                    frame: now() - outerFrame,
                    notification: { kind: 'C' },
                  });
                  innerController.abort();
                },
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
      await flush();
      expect(actual).toEqual([
        {
          frame: 0,
          notification: {
            kind: 'N',
            value: [
              {
                frame: 3,
                notification: {
                  kind: 'N',
                  value: 'a',
                },
              },
              {
                frame: 5,
                notification: {
                  kind: 'C',
                },
              },
            ],
          },
        },
        {
          frame: 10,
          notification: {
            kind: 'N',
            value: [],
          },
        },
      ]);
      expectSubscriptions(source.subscriptions).toBe('^----------!');
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(async ({ expectSubscriptions, flush, hot, now, schedule }) => {
      const source = hot('^--a--b--c--d--e--f--g--h--|');
      const result = source[mergeMap]((value) => ColdObservable.from([value]))
        [windowTime](5, 10, Infinity)
        [mergeMap]((value) => ColdObservable.from([value]));
      const outerController = new AbortController();
      const innerControllers = [];
      const actual = [];
      schedule(() => {
        for (const innerController of innerControllers) {
          innerController.abort();
        }
        outerController.abort();
      }, 14);
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
                complete: () => {
                  messages.push({
                    frame: now() - outerFrame,
                    notification: { kind: 'C' },
                  });
                  innerController.abort();
                },
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
      await flush();
      expect(actual).toEqual([
        {
          frame: 0,
          notification: {
            kind: 'N',
            value: [
              {
                frame: 3,
                notification: {
                  kind: 'N',
                  value: 'a',
                },
              },
              {
                frame: 5,
                notification: {
                  kind: 'C',
                },
              },
            ],
          },
        },
        {
          frame: 10,
          notification: {
            kind: 'N',
            value: [
              {
                frame: 2,
                notification: {
                  kind: 'N',
                  value: 'd',
                },
              },
            ],
          },
        },
      ]);
      expectSubscriptions(source.subscriptions).toBe('^-------------!');
    });
  });
  it('should not error if maxWindowSize is hit while nexting to other windows.', async () => {
    await rxTest(async ({ cold, flush, now, schedule }) => {
      const source = cold('----a---b---c---d---e---f---g---h---i---j---');
      const result = source[windowTime](12, 8, 4);
      const outerController = new AbortController();
      const innerControllers = [];
      const actual = [];
      schedule(() => {
        for (const innerController of innerControllers) {
          innerController.abort();
        }
        outerController.abort();
      }, 42);
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
                complete: () => {
                  messages.push({
                    frame: now() - outerFrame,
                    notification: { kind: 'C' },
                  });
                  innerController.abort();
                },
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
      await flush();
      expect(actual).toEqual([
        {
          frame: 0,
          notification: {
            kind: 'N',
            value: [
              {
                frame: 4,
                notification: {
                  kind: 'N',
                  value: 'a',
                },
              },
              {
                frame: 8,
                notification: {
                  kind: 'N',
                  value: 'b',
                },
              },
              {
                frame: 12,
                notification: {
                  kind: 'C',
                },
              },
            ],
          },
        },
        {
          frame: 8,
          notification: {
            kind: 'N',
            value: [
              {
                frame: 0,
                notification: {
                  kind: 'N',
                  value: 'b',
                },
              },
              {
                frame: 4,
                notification: {
                  kind: 'N',
                  value: 'c',
                },
              },
              {
                frame: 8,
                notification: {
                  kind: 'N',
                  value: 'd',
                },
              },
              {
                frame: 12,
                notification: {
                  kind: 'N',
                  value: 'e',
                },
              },
              {
                frame: 12,
                notification: {
                  kind: 'C',
                },
              },
            ],
          },
        },
        {
          frame: 16,
          notification: {
            kind: 'N',
            value: [
              {
                frame: 4,
                notification: {
                  kind: 'N',
                  value: 'e',
                },
              },
              {
                frame: 8,
                notification: {
                  kind: 'N',
                  value: 'f',
                },
              },
              {
                frame: 12,
                notification: {
                  kind: 'N',
                  value: 'g',
                },
              },
              {
                frame: 12,
                notification: {
                  kind: 'C',
                },
              },
            ],
          },
        },
        {
          frame: 24,
          notification: {
            kind: 'N',
            value: [
              {
                frame: 4,
                notification: {
                  kind: 'N',
                  value: 'g',
                },
              },
              {
                frame: 8,
                notification: {
                  kind: 'N',
                  value: 'h',
                },
              },
              {
                frame: 12,
                notification: {
                  kind: 'N',
                  value: 'i',
                },
              },
              {
                frame: 12,
                notification: {
                  kind: 'C',
                },
              },
            ],
          },
        },
        {
          frame: 32,
          notification: {
            kind: 'N',
            value: [
              {
                frame: 4,
                notification: {
                  kind: 'N',
                  value: 'i',
                },
              },
              {
                frame: 8,
                notification: {
                  kind: 'N',
                  value: 'j',
                },
              },
            ],
          },
        },
        {
          frame: 40,
          notification: {
            kind: 'N',
            value: [],
          },
        },
      ]);
    });
  });
});
