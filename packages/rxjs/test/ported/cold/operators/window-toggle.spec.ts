// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/windowToggle-spec.ts
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { EMPTY } from 'rxjs/empty';
import { mergeMap } from 'rxjs/merge-map';
import { windowToggle } from 'rxjs/window-toggle';
describe('windowToggle (cold)', () => {
  it('should emit windows governed by openings and closings', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e2 = cold('         ----w--------w--------w--|');
      const e2subs = '          ^------------------------!';
      const e3 = cold('             -----x                ');
      //                                     -----x
      //                                              -----x
      const e3subs = [
        '                       ----^----!                ',
        '                       -------------^----!       ',
        '                       ----------------------^--!',
      ];
      const e1 = hot('  --1--2--^-a--b--c--d--e--f--g--h-|');
      const e1subs = '          ^------------------------!';
      const expected = '        ----x--------y--------z--|';
      const x = cold('              -b--c|                ');
      const y = cold('                       -e--f|       ');
      const z = cold('                                -h-|');
      const values = { x, y, z };
      const result = e1[windowToggle](e2, () => e3);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });
  it('should emit windows that are opened by an observable from the first argument and closed by an observable returned by the function in the second argument', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e2 = cold('       --------x-------x-------x--|');
      const e2subs = '        ^--------------------------!';
      const e3 = cold('               ----------(x|)      ');
      //                                      ----------(x|)
      //                                              ----------(x|)
      const e3subs = [
        '                     --------^---------!         ',
        '                     ----------------^---------! ',
        '                     ------------------------^--!',
      ];
      const e1 = hot('--1--2--^--a--b--c--d--e--f--g--h--|');
      const e1subs = '        ^--------------------------!';
      const expected = '      --------x-------y-------z--|';
      const x = cold('                -c--d--e--(f|)      ');
      const y = cold('                        --f--g--h-| ');
      const z = cold('                                ---|');
      const values = { x, y, z };
      const source = e1[windowToggle](e2, (value) => {
        expect(value).toBe('x');
        return e3;
      });
      expectObservable(source).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });
  it('should emit windows using varying cold closings', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e2 = cold('    --x-----------y--------z---|            ');
      const e2subs = '     ^--------------------------!            ';
      const close = [
        cold('               ---------------s--|                   '),
        cold('                           ----(s|)                  '),
        cold('                                  ---------------(s|)'),
      ];
      const closeSubs = [
        '                  --^--------------!                      ',
        '                  --------------^---!                     ',
        '                  -----------------------^-----------!    ',
      ];
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|    ');
      const e1subs = '     ^----------------------------------!    ';
      const expected = '   --x-----------y--------z-----------|    ';
      const x = cold('       --b---c---d---e|                      ');
      const y = cold('                   --e-|                     ');
      const z = cold('                            -g---h------|    ');
      const values = { x, y, z };
      let i = 0;
      const result = e1[windowToggle](e2, () => close[i++]);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(close[0].subscriptions).toBe(closeSubs[0]);
      expectSubscriptions(close[1].subscriptions).toBe(closeSubs[1]);
      expectSubscriptions(close[2].subscriptions).toBe(closeSubs[2]);
    });
  });
  it('should emit windows using varying hot closings', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e2 = cold('    --x-----------y--------z---|           ');
      const e2subs = '     ^--------------------------!           ';
      const closings = [
        hot('          -1--^----------------s-|                   '),
        hot('              -----3----4-------(s|)                 '),
        hot('              -------3----4-------5----------------s|'),
      ];
      const closingSubs = [
        '                  --^--------------!                     ',
        '                  --------------^---!                    ',
        '                  -----------------------^-----------!   ',
      ];
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|   ');
      const e1subs = '     ^----------------------------------!   ';
      const expected = '   --x-----------y--------z-----------|   ';
      const x = cold('       --b---c---d---e|                     ');
      const y = cold('                   --e-|                    ');
      const z = cold('                            -g---h------|   ');
      const values = { x, y, z };
      let i = 0;
      const result = e1[windowToggle](e2, () => closings[i++]);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(closings[0].subscriptions).toBe(closingSubs[0]);
      expectSubscriptions(closings[1].subscriptions).toBe(closingSubs[1]);
      expectSubscriptions(closings[2].subscriptions).toBe(closingSubs[2]);
    });
  });
  it('should emit windows using varying empty delayed closings', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e2 = cold('    --x-----------y--------z---|           ');
      const e2subs = '     ^--------------------------!           ';
      const close = [
        cold('               ---------------|                     '),
        cold('                           ----|                    '),
        cold('                                    ---------------|'),
      ];
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|   ');
      const e1subs = '     ^----------------------------------!   ';
      const expected = '   --x-----------y--------z-----------|   ';
      const x = cold('       --b---c---d---e---f---g---h------|   ');
      const y = cold('                   --e---f---g---h------|   ');
      const z = cold('                            -g---h------|   ');
      const values = { x, y, z };
      let i = 0;
      const result = e1[windowToggle](e2, () => close[i++]);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should emit windows using varying cold closings, outer unsubscribed early', async () => {
    await rxTest(async ({ cold, expectSubscriptions, flush, hot, now, schedule }) => {
      const outerController = new AbortController();
      const innerControllers = [];
      const actual = [];
      schedule(() => {
        // Materialized windows are independent observations. End them before the
        // pinned outer cancellation so teardown is not reinterpreted as a window
        // completion notification.
        for (const innerController of innerControllers) {
          innerController.abort();
        }
        outerController.abort();
      }, 17);
      const openings = cold('--x-----------y--------z---|');
      const close = [cold('-------------s---|'), cold('-----(s|)'), cold('---------------(s|)')];
      const source = hot('--a--^---b---c---d---e---f---g---h------|');
      let closingIndex = 0;
      const result = source[windowToggle](openings, () => close[closingIndex++]);
      // Match expectObservable's frame-zero priority after pre-subscription hot
      // values and before the first post-zero source event.
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
      expectSubscriptions(source.subscriptions).toBe('^----------------!');
      expectSubscriptions(openings.subscriptions).toBe('^----------------!');
      expectSubscriptions(close[0].subscriptions).toBe('--^------------!');
      expectSubscriptions(close[1].subscriptions).toBe('--------------^--!');
      expectSubscriptions(close[2].subscriptions).toBe([]);
      await flush();
      expect(actual).toEqual([
        {
          frame: 2,
          notification: {
            kind: 'N',
            value: [
              { frame: 2, notification: { kind: 'N', value: 'b' } },
              { frame: 6, notification: { kind: 'N', value: 'c' } },
              { frame: 10, notification: { kind: 'N', value: 'd' } },
              { frame: 13, notification: { kind: 'C' } },
            ],
          },
        },
        {
          frame: 14,
          notification: {
            kind: 'N',
            value: [{ frame: 2, notification: { kind: 'N', value: 'e' } }],
          },
        },
      ]);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(async ({ cold, expectSubscriptions, flush, hot, now, schedule }) => {
      const outerController = new AbortController();
      const innerControllers = [];
      const actual = [];
      schedule(() => {
        // Materialized windows are independent observations. End them before the
        // pinned outer cancellation so teardown is not reinterpreted as a window
        // completion notification.
        for (const innerController of innerControllers) {
          innerController.abort();
        }
        outerController.abort();
      }, 15);
      const openings = cold('--x-----------y--------z---|');
      const close = [cold('---------------s--|'), cold('----(s|)'), cold('---------------(s|)')];
      const source = hot('--a--^---b---c---d---e---f---g---h------|');
      let closingIndex = 0;
      const result = source[mergeMap]((value) => ColdObservable.from([value]))
        [windowToggle](openings, () => close[closingIndex++])
        [mergeMap]((inner) => ColdObservable.from([inner]));
      // Match expectObservable's frame-zero priority after pre-subscription hot
      // values and before the first post-zero source event.
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
      expectSubscriptions(source.subscriptions).toBe('^--------------!');
      expectSubscriptions(openings.subscriptions).toBe('^--------------!');
      expectSubscriptions(close[0].subscriptions).toBe('--^------------!');
      expectSubscriptions(close[1].subscriptions).toBe('--------------^!');
      expectSubscriptions(close[2].subscriptions).toBe([]);
      await flush();
      expect(actual).toEqual([
        {
          frame: 2,
          notification: {
            kind: 'N',
            value: [
              { frame: 2, notification: { kind: 'N', value: 'b' } },
              { frame: 6, notification: { kind: 'N', value: 'c' } },
              { frame: 10, notification: { kind: 'N', value: 'd' } },
            ],
          },
        },
        {
          frame: 14,
          notification: { kind: 'N', value: [] },
        },
      ]);
    });
  });
  it('should dispose window Subjects if the outer is unsubscribed early', async () => {
    await rxTest(async ({ cold, expectSubscriptions, flush, hot, now, schedule }) => {
      const outerController = new AbortController();
      const earlyWindowController = new AbortController();
      const lateWindowController = new AbortController();
      const outerEvents = [];
      const earlyWindowEvents = [];
      const lateWindowEvents = [];
      let releasedWindow;
      let lateObservationError;
      let lateSnapshot;
      // Register cancellation before fixture work at the same timestamp. This
      // preserves the original expectObservable unsubscription priority.
      schedule(() => outerController.abort(), 9);
      const openings = cold('o-------------------------|');
      const closing = cold('-');
      const source = hot('--a--b--c--d--e--f--g--h--|');
      const result = source[windowToggle](openings, () => closing);
      schedule(
        () =>
          result.subscribe(
            {
              next: (inner) => {
                releasedWindow = inner;
                outerEvents.push({
                  frame: now(),
                  notification: { kind: 'N' },
                });
                inner.subscribe(
                  {
                    next: (value) =>
                      earlyWindowEvents.push({
                        frame: now(),
                        notification: { kind: 'N', value },
                      }),
                    error: (error) =>
                      earlyWindowEvents.push({
                        frame: now(),
                        notification: { kind: 'E', error },
                      }),
                    complete: () =>
                      earlyWindowEvents.push({
                        frame: now(),
                        notification: { kind: 'C' },
                      }),
                  },
                  { signal: earlyWindowController.signal }
                );
              },
              error: (error) =>
                outerEvents.push({
                  frame: now(),
                  notification: { kind: 'E', error },
                }),
              complete: () =>
                outerEvents.push({
                  frame: now(),
                  notification: { kind: 'C' },
                }),
            },
            { signal: outerController.signal }
          ),
        0
      );
      schedule(() => {
        try {
          releasedWindow.subscribe(
            {
              next: (value) =>
                lateWindowEvents.push({
                  frame: now(),
                  notification: { kind: 'N', value },
                }),
              error: (error) =>
                lateWindowEvents.push({
                  frame: now(),
                  notification: { kind: 'E', error },
                }),
              complete: () =>
                lateWindowEvents.push({
                  frame: now(),
                  notification: { kind: 'C' },
                }),
            },
            { signal: lateWindowController.signal }
          );
        } catch (error) {
          lateObservationError = error;
        }
      }, 15);
      schedule(() => {
        lateSnapshot = [...lateWindowEvents];
        earlyWindowController.abort();
        lateWindowController.abort();
      }, 16);
      expectSubscriptions(source.subscriptions).toBe('^--------!');
      expectSubscriptions(openings.subscriptions).toBe('^--------!');
      expectSubscriptions(closing.subscriptions).toBe('^--------!');
      await flush();
      expect(outerEvents).toEqual([
        {
          frame: 0,
          notification: { kind: 'N' },
        },
      ]);
      expect(earlyWindowEvents).toEqual([
        { frame: 2, notification: { kind: 'N', value: 'a' } },
        { frame: 5, notification: { kind: 'N', value: 'b' } },
        { frame: 8, notification: { kind: 'N', value: 'c' } },
      ]);
      expect(lateObservationError).toBe(undefined);
      expect(lateSnapshot).toEqual([]);
      expect(lateWindowEvents).toEqual([]);
    });
  });
  it('should propagate error thrown from closingSelector', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e2 = cold('    --x-----------y--------z---|              ');
      const e2subs = '     ^-------------!                           ';
      const close = [
        cold('               ---------------s--|                     '),
        cold('                           ----(s|)                    '),
        cold('                                    ---------------(s|)'),
      ];
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
      const e1subs = '     ^-------------!                           ';
      const expected = '   --x-----------#----                       ';
      const x = cold('       --b---c---d-#                           ');
      const values = { x: x };
      let i = 0;
      const result = e1[windowToggle](e2, () => {
        if (i === 1) {
          throw 'error';
        }
        return close[i++];
      });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should propagate error emitted from a closing', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e2 = cold('    --x-----------y--------z---|        ');
      const e2subs = '     ^-------------!                     ';
      // prettier-ignore
      const close = [
                cold('               ---------------s--|               '),
                cold('                           #                     ')
            ];
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
      const e1subs = '     ^-------------!                     ';
      const expected = '   --x-----------(y#)                  ';
      const x = cold('       --b---c---d-#                     ');
      const y = cold('                   #                     ');
      const values = { x, y };
      let i = 0;
      const result = e1[windowToggle](e2, () => close[i++]);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should propagate error emitted late from a closing', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e2 = cold('    --x-----------y--------z---|        ');
      const e2subs = '     ^------------------!                ';
      // prettier-ignore
      const close = [
                cold('               ---------------s--|               '),
                cold('                           -----#                ')
            ];
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
      const e1subs = '     ^------------------!                ';
      const expected = '   --x-----------y----#                ';
      const x = cold('       --b---c---d---e|                  ');
      const y = cold('                   --e--#                ');
      const values = { x, y };
      let i = 0;
      const result = e1[windowToggle](e2, () => close[i++]);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should handle errors', async () => {
    await rxTest(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const e2 = cold('    --x-----------y--------z---|        ');
      const e2subs = '     ^------------------!                ';
      // prettier-ignore
      const close = [
                cold('               ---------------s--|               '),
                cold('                           -------s|             ')
            ];
      const e1 = hot('--a--^---b---c---d---e--#                ');
      const e1subs = '     ^------------------!                ';
      const expected = '   --x-----------y----#                ';
      const x = cold('       --b---c---d---e|                  ');
      const y = cold('                   --e--#                ');
      const values = { x, y };
      let i = 0;
      const result = e1[windowToggle](e2, () => close[i++]);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should handle empty source', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e2 = cold('--o-----|');
      const e2subs = '   (^!)';
      const e3 = cold('  -----c--|');
      const e1 = cold('  |');
      const e1subs = '   (^!)';
      const expected = ' |';
      const result = e1[windowToggle](e2, () => e3);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should handle throw', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e2 = cold(' --o-----|');
      const e2subs = '  (^!)';
      const e3 = cold(' -----c--|');
      const e1 = cold(' #');
      const e1subs = '  (^!)';
      const expected = '#';
      const result = e1[windowToggle](e2, () => e3);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should handle never', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e2 = cold(' --o-----o------o-----o---o-----|             ');
      const e2subs = '  ^------------------------------!             ';
      const e3 = cold('   --c-|                                      ');
      const e1 = hot('  -                                            ');
      const e1subs = '  ^-------------------------------------------!';
      const expected = '--u-----v------x-----y---z-------------------';
      const u = cold('    --|                                        ');
      const v = cold('          --|                                  ');
      const x = cold('                 --|                           ');
      const y = cold('                       --|                     ');
      const z = cold('                           --|                 ');
      const unsub = '   --------------------------------------------!';
      const values = { u: u, v: v, x, y, z };
      const result = e1[windowToggle](e2, () => e3);
      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should handle a never opening Observable', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e2 = cold('    -                                   ');
      const e2subs = '     ^----------------------------------!';
      const e3 = cold('    --c-|                               ');
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
      const e1subs = '     ^----------------------------------!';
      const expected = '   -----------------------------------|';
      const result = e1[windowToggle](e2, () => e3);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should handle a never closing Observable', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e2 = cold('    ---o---------------o-----------|    ');
      const e2subs = '     ^------------------------------!    ';
      const e3 = cold('       -                                ');
      //                                      -
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
      const e1subs = '     ^----------------------------------!';
      const expected = '   ---x---------------y---------------|';
      const x = cold('        -b---c---d---e---f---g---h------|');
      const y = cold('                        -f---g---h------|');
      const values = { x, y };
      const result = e1[windowToggle](e2, () => e3);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should handle opening Observable that just throws', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e2 = cold('    #                                   ');
      const e2subs = '     (^!)                                ';
      const e3 = cold('    --c-|                               ');
      const subs = '       (^!)                                ';
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
      const e1subs = '     (^!)                                ';
      const expected = '   #                                   ';
      const result = e1[windowToggle](e2, () => e3);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should handle empty closing observable', async () => {
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const e2 = cold('    ---o---------------o-----------|    ');
      const e2subs = '     ^------------------------------!    ';
      const e3 = EMPTY;
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
      const e1subs = '     ^----------------------------------!';
      const expected = '   ---x---------------y---------------|';
      const x = cold('        -b---c---d---e---f---g---h------|');
      const y = cold('                        -f---g---h------|');
      const values = { x, y };
      const result = e1[windowToggle](e2, () => e3);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
});
