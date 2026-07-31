// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/windowToggle-spec.ts
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { EMPTY } from 'rxjs/empty';
import { mergeMap } from 'rxjs/merge-map';
import { windowToggle } from 'rxjs/window-toggle';
describe('windowToggle (platform)', () => {
  it('should emit windows governed by openings and closings', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const e2 = observable('         ----w--------w--------w--|');
      const e2subs = '          ^------------------------!';
      const e3 = observable('             -----x                ');
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
      const x = observable('              -b--c|                ');
      const y = observable('                       -e--f|       ');
      const z = observable('                                -h-|');
      const values = { x, y, z };
      const result = e1[windowToggle](e2, () => e3);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
  });
  it('should emit windows that are opened by an observable from the first argument and closed by an observable returned by the function in the second argument', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const e2 = observable('       --------x-------x-------x--|');
      const e2subs = '        ^--------------------------!';
      const e3 = observable('               ----------(x|)      ');
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
      const x = observable('                -c--d--e--(f|)      ');
      const y = observable('                        --f--g--h-| ');
      const z = observable('                                ---|');
      const values = { x, y, z };
      const source = e1[windowToggle](e2, (value) => {
        expect(value).toBe('x');
        return e3;
      });
      expectObservable(source).toBe(
        [
          {
            frame: 8,
            notification: {
              kind: 'N',
              value: [
                { frame: 1, notification: { kind: 'N', value: 'c' } },
                { frame: 4, notification: { kind: 'N', value: 'd' } },
                { frame: 7, notification: { kind: 'N', value: 'e' } },
                { frame: 10, notification: { kind: 'N', value: 'f' } },
                { frame: 10, notification: { kind: 'C' } },
              ],
            },
          },
          {
            frame: 16,
            notification: {
              kind: 'N',
              value: [
                { frame: 2, notification: { kind: 'N', value: 'f' } },
                { frame: 2, notification: { kind: 'C' } },
              ],
            },
          },
          { frame: 24, notification: { kind: 'N', value: [{ frame: 3, notification: { kind: 'C' } }] } },
          { frame: 27, notification: { kind: 'C' } },
        ],
        values
      );
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
      expectSubscriptions(e3.subscriptions).toBe(['--------^---------!', '------------------------^--!']);
    });
  });
  it('should emit windows using varying cold closings', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const e2 = observable('    --x-----------y--------z---|            ');
      const e2subs = '     ^--------------------------!            ';
      const close = [
        observable('               ---------------s--|                   '),
        observable('                           ----(s|)                  '),
        observable('                                  ---------------(s|)'),
      ];
      const closeSubs = [
        '                  --^--------------!                      ',
        '                  --------------^---!                     ',
        '                  -----------------------^-----------!    ',
      ];
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|    ');
      const e1subs = '     ^----------------------------------!    ';
      const expected = '   --x-----------y--------z-----------|    ';
      const x = observable('       --b---c---d---e|                      ');
      const y = observable('                   --e-|                     ');
      const z = observable('                            -g---h------|    ');
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
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const e2 = observable('    --x-----------y--------z---|           ');
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
      const x = observable('       --b---c---d---e|                     ');
      const y = observable('                   --e-|                    ');
      const z = observable('                            -g---h------|   ');
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
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const e2 = observable('    --x-----------y--------z---|           ');
      const e2subs = '     ^--------------------------!           ';
      const close = [
        observable('               ---------------|                     '),
        observable('                           ----|                    '),
        observable('                                    ---------------|'),
      ];
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|   ');
      const e1subs = '     ^----------------------------------!   ';
      const expected = '   --x-----------y--------z-----------|   ';
      const x = observable('       --b---c---d---e---f---g---h------|   ');
      const y = observable('                   --e---f---g---h------|   ');
      const z = observable('                            -g---h------|   ');
      const values = { x, y, z };
      let i = 0;
      const result = e1[windowToggle](e2, () => close[i++]);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should emit windows using varying cold closings, outer unsubscribed early', async () => {
    await rxTest(async ({ observable, expectSubscriptions, flush, hot, now, schedule }) => {
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
      const openings = observable('--x-----------y--------z---|');
      const close = [observable('-------------s---|'), observable('-----(s|)'), observable('---------------(s|)')];
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
    await rxTest(async ({ observable, expectSubscriptions, flush, hot, now, schedule }) => {
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
      const openings = observable('--x-----------y--------z---|');
      const close = [observable('---------------s--|'), observable('----(s|)'), observable('---------------(s|)')];
      const source = hot('--a--^---b---c---d---e---f---g---h------|');
      let closingIndex = 0;
      const result = source[mergeMap]((value) => Observable.from([value]))
        [windowToggle](openings, () => close[closingIndex++])
        [mergeMap]((inner) => Observable.from([inner]));
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
    await rxTest(async ({ observable, expectSubscriptions, flush, hot, now, schedule }) => {
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
      const openings = observable('o-------------------------|');
      const closing = observable('-');
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
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const e2 = observable('    --x-----------y--------z---|              ');
      const e2subs = '     ^-------------!                           ';
      const close = [
        observable('               ---------------s--|                     '),
        observable('                           ----(s|)                    '),
        observable('                                    ---------------(s|)'),
      ];
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|      ');
      const e1subs = '     ^-------------!                           ';
      const expected = '   --x-----------#----                       ';
      const x = observable('       --b---c---d-#                           ');
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
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const e2 = observable('    --x-----------y--------z---|        ');
      const e2subs = '     ^-------------!                     ';
      // prettier-ignore
      const close = [
                observable('               ---------------s--|               '),
                observable('                           #                     ')
            ];
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
      const e1subs = '     ^-------------!                     ';
      const expected = '   --x-----------(y#)                  ';
      const x = observable('       --b---c---d-#                     ');
      const y = observable('                   #                     ');
      const values = { x, y };
      let i = 0;
      const result = e1[windowToggle](e2, () => close[i++]);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should propagate error emitted late from a closing', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const e2 = observable('    --x-----------y--------z---|        ');
      const e2subs = '     ^------------------!                ';
      // prettier-ignore
      const close = [
                observable('               ---------------s--|               '),
                observable('                           -----#                ')
            ];
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
      const e1subs = '     ^------------------!                ';
      const expected = '   --x-----------y----#                ';
      const x = observable('       --b---c---d---e|                  ');
      const y = observable('                   --e--#                ');
      const values = { x, y };
      let i = 0;
      const result = e1[windowToggle](e2, () => close[i++]);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should handle errors', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const e2 = observable('    --x-----------y--------z---|        ');
      const e2subs = '     ^------------------!                ';
      // prettier-ignore
      const close = [
                observable('               ---------------s--|               '),
                observable('                           -------s|             ')
            ];
      const e1 = hot('--a--^---b---c---d---e--#                ');
      const e1subs = '     ^------------------!                ';
      const expected = '   --x-----------y----#                ';
      const x = observable('       --b---c---d---e|                  ');
      const y = observable('                   --e--#                ');
      const values = { x, y };
      let i = 0;
      const result = e1[windowToggle](e2, () => close[i++]);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should handle empty source', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e2 = observable('--o-----|');
      const e2subs = '   (^!)';
      const e3 = observable('  -----c--|');
      const e1 = observable('  |');
      const e1subs = '   (^!)';
      const expected = ' |';
      const result = e1[windowToggle](e2, () => e3);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should handle throw', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e2 = observable(' --o-----|');
      const e2subs = '  (^!)';
      const e3 = observable(' -----c--|');
      const e1 = observable(' #');
      const e1subs = '  (^!)';
      const expected = '#';
      const result = e1[windowToggle](e2, () => e3);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should handle never', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e2 = observable(' --o-----o------o-----o---o-----|             ');
      const e2subs = '  ^------------------------------!             ';
      const e3 = observable('   --c-|                                      ');
      const e1 = hot('  -                                            ');
      const e1subs = '  ^-------------------------------------------!';
      const expected = '--u-----v------x-----y---z-------------------';
      const u = observable('    --|                                        ');
      const v = observable('          --|                                  ');
      const x = observable('                 --|                           ');
      const y = observable('                       --|                     ');
      const z = observable('                           --|                 ');
      const unsub = '   --------------------------------------------!';
      const values = { u: u, v: v, x, y, z };
      const result = e1[windowToggle](e2, () => e3);
      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should handle a never opening Observable', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e2 = observable('    -                                   ');
      const e2subs = '     ^----------------------------------!';
      const e3 = observable('    --c-|                               ');
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
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e2 = observable('    ---o---------------o-----------|    ');
      const e2subs = '     ^------------------------------!    ';
      const e3 = observable('       -                                ');
      //                                      -
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
      const e1subs = '     ^----------------------------------!';
      const expected = '   ---x---------------y---------------|';
      const x = observable('        -b---c---d---e---f---g---h------|');
      const y = observable('                        -f---g---h------|');
      const values = { x, y };
      const result = e1[windowToggle](e2, () => e3);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should handle opening Observable that just throws', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e2 = observable('    #                                   ');
      const e2subs = '     (^!)                                ';
      const e3 = observable('    --c-|                               ');
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
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e2 = observable('    ---o---------------o-----------|    ');
      const e2subs = '     ^------------------------------!    ';
      const e3 = EMPTY;
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|');
      const e1subs = '     ^----------------------------------!';
      const expected = '   ---x---------------y---------------|';
      const x = observable('        -b---c---d---e---f---g---h------|');
      const y = observable('                        -f---g---h------|');
      const values = { x, y };
      const result = e1[windowToggle](e2, () => e3);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
});
