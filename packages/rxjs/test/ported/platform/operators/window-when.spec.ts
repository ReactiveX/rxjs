// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/windowWhen-spec.ts
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { mergeMap } from 'rxjs/merge-map';
import { windowWhen } from 'rxjs/window-when';
describe('windowWhen (platform)', () => {
  it('should emit windows that close and reopen', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const e2 = observable('       -----------|                ');
      //                                 -----------|
      //                                            -----------|
      const e2subs = [
        '                     ^----------!                ',
        '                     -----------^----------!     ',
        '                     ----------------------^----!',
      ];
      const e1 = hot('   --a--^--b--c--d--e--f--g--h--i--|');
      const e1subs = '        ^--------------------------!';
      const expected = '      a----------b----------c----|';
      const a = observable('        ---b--c--d-|                ');
      const b = observable('                   -e--f--g--h|     ');
      const c = observable('                              --i--|');
      const values = { a: a, b: b, c: c };
      const source = e1[windowWhen](() => e2);
      expectObservable(source).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should emit windows using varying cold closings', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const closings = [
        observable('               -----------------s--|                    '),
        observable('                                -----(s|)               '),
        observable('                                     ---------------(s|)'),
      ];
      const closeSubs = [
        '                    ^----------------!                       ',
        '                    -----------------^----!                  ',
        '                    ----------------------^------------!     ',
      ];
      const e1 = hot('  --a--^---b---c---d---e---f---g---h------|     ');
      const e1subs = '       ^----------------------------------!     ';
      const expected = '     x----------------y----z------------|     ';
      const x = observable('       ----b---c---d---e|                       ');
      const y = observable('                        ---f-|                  ');
      const z = observable('                             --g---h------|     ');
      const values = { x: x, y: y, z: z };
      let i = 0;
      const result = e1[windowWhen](() => closings[i++]);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
      expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
      expectSubscriptions(closings[2].subscriptions).toBe(closeSubs[2]);
    });
  });
  it('should emit windows using varying hot closings', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const closings = [
        hot('            -1--^----------------s-|                   '),
        hot('                -----3----4-----------(s|)             '),
        hot('                -------3----4-------5----------------s|'),
      ];
      const closeSubs = [
        '                    ^----------------!                     ',
        '                    -----------------^----!                ',
        '                    ----------------------^------------!   ',
      ];
      const e1 = hot('  --a--^---b---c---d---e---f---g---h------|   ');
      const subs = '         ^----------------------------------!   ';
      const expected = '     x----------------y----z------------|   ';
      const x = observable('       ----b---c---d---e|                     ');
      const y = observable('                        ---f-|                ');
      const z = observable('                             --g---h------|   ');
      const values = { x: x, y: y, z: z };
      let i = 0;
      const result = e1[windowWhen](() => closings[i++]);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
      expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
      expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
      expectSubscriptions(closings[2].subscriptions).toBe(closeSubs[2]);
    });
  });
  it('should emit windows using varying empty delayed closings', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const closings = [
        observable('             -----------------|                    '),
        observable('                              -----|               '),
        observable('                                   ---------------|'),
      ];
      const closeSubs = [
        '                  ^----------------!                    ',
        '                  -----------------^----!               ',
        '                  ----------------------^------------!  ',
      ];
      const e1 = hot('--a--^---b---c---d---e---f---g---h------|  ');
      const e1subs = '     ^----------------------------------!  ';
      const expected = '   x----------------y----z------------|  ';
      const x = observable('     ----b---c---d---e|                    ');
      const y = observable('                      ---f-|               ');
      const z = observable('                           --g---h------|  ');
      const values = { x: x, y: y, z: z };
      let i = 0;
      const result = e1[windowWhen](() => closings[i++]);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
      expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
      expectSubscriptions(closings[2].subscriptions).toBe(closeSubs[2]);
    });
  });
  it('should emit windows using varying cold closings, outer unsubscribed early', async () => {
    await rxTest(async ({ observable, expectSubscriptions, flush, hot, now, schedule }) => {
      const outerController = new AbortController();
      const innerControllers = [];
      const actual = [];
      schedule(() => {
        // Each emitted window is observed independently. End those observations
        // immediately before the pinned outer cancellation so teardown remains
        // silent instead of becoming a completion notification.
        for (const innerController of innerControllers) {
          innerController.abort();
        }
        outerController.abort();
      }, 21);
      const closings = [observable('-----------------s--|'), observable('---------(s|)')];
      const source = hot('--a--^---b---c---d---e---f---g---h------|');
      let closingIndex = 0;
      const result = source[windowWhen](() => closings[closingIndex++]);
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
      expectSubscriptions(source.subscriptions).toBe('^--------------------!');
      expectSubscriptions(closings[0].subscriptions).toBe('^----------------!');
      expectSubscriptions(closings[1].subscriptions).toBe('-----------------^---!');
      await flush();
      expect(actual).toEqual([
        {
          frame: 0,
          notification: {
            kind: 'N',
            value: [
              { frame: 4, notification: { kind: 'N', value: 'b' } },
              { frame: 8, notification: { kind: 'N', value: 'c' } },
              { frame: 12, notification: { kind: 'N', value: 'd' } },
              { frame: 16, notification: { kind: 'N', value: 'e' } },
              { frame: 17, notification: { kind: 'C' } },
            ],
          },
        },
        {
          frame: 17,
          notification: {
            kind: 'N',
            value: [{ frame: 3, notification: { kind: 'N', value: 'f' } }],
          },
        },
      ]);
    });
  });
  it('should not break unsubscription chain when unsubscribed explicitly', async () => {
    await rxTest(async ({ observable, expectSubscriptions, flush, hot, now, schedule }) => {
      const outerController = new AbortController();
      const innerControllers = [];
      const actual = [];
      schedule(() => {
        // Each emitted window is observed independently. End those observations
        // immediately before the pinned outer cancellation so teardown remains
        // silent instead of becoming a completion notification.
        for (const innerController of innerControllers) {
          innerController.abort();
        }
        outerController.abort();
      }, 21);
      const closings = [observable('-----------------s--|'), observable('---------(s|)')];
      const source = hot('--a--^---b---c---d---e---f---g---h------|');
      let closingIndex = 0;
      const result = source[mergeMap]((value) => Observable.from([value]))
        [windowWhen](() => closings[closingIndex++])
        [mergeMap]((inner) => Observable.from([inner]));
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
      expectSubscriptions(source.subscriptions).toBe('^--------------------!');
      expectSubscriptions(closings[0].subscriptions).toBe('^----------------!');
      expectSubscriptions(closings[1].subscriptions).toBe('-----------------^---!');
      await flush();
      expect(actual).toEqual([
        {
          frame: 0,
          notification: {
            kind: 'N',
            value: [
              { frame: 4, notification: { kind: 'N', value: 'b' } },
              { frame: 8, notification: { kind: 'N', value: 'c' } },
              { frame: 12, notification: { kind: 'N', value: 'd' } },
              { frame: 16, notification: { kind: 'N', value: 'e' } },
              { frame: 17, notification: { kind: 'C' } },
            ],
          },
        },
        {
          frame: 17,
          notification: {
            kind: 'N',
            value: [{ frame: 3, notification: { kind: 'N', value: 'f' } }],
          },
        },
      ]);
    });
  });
  it('should propagate error thrown from closingSelector', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const closings = [
        observable('                 -----------------s--|                    '),
        observable('                                  -----(s|)               '),
        observable('                                       ---------------(s|)'),
      ];
      const closeSubs = ['     ^----------------!                       '];
      const e1 = hot('    --a--^---b---c---d---e---f---g---h------|     ');
      const e1subs = '         ^----------------!                       ';
      const expected = '       x----------------(y#)                    ';
      const x = observable('         ----b---c---d---e|                       ');
      const y = observable('                          #                       ');
      const values = { x: x, y: y };
      let i = 0;
      const result = e1[windowWhen](() => {
        if (i === 1) {
          throw 'error';
        }
        return closings[i++];
      });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
    });
  });
  it('should propagate error emitted from a closing', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const closings = [
        observable('               -----------------s--|               '),
        observable('                                #                  '),
      ];
      const closeSubs = [
        '                    ^----------------!                  ',
        '                    -----------------(^!)               ',
      ];
      const e1 = hot('  --a--^---b---c---d---e---f---g---h------|');
      const e1subs = '       ^----------------!                  ';
      const expected = '     x----------------(y#)               ';
      const x = observable('       ----b---c---d---e|                  ');
      const y = observable('                        #                  ');
      const values = { x: x, y: y };
      let i = 0;
      const result = e1[windowWhen](() => closings[i++]);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
      expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
    });
  });
  it('should propagate error emitted late from a closing', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      const closings = [
        observable('               -----------------s--|               '),
        observable('                                -----#             '),
      ];
      const closeSubs = [
        '                    ^----------------!                  ',
        '                    -----------------^----!             ',
      ];
      const e1 = hot('  --a--^---b---c---d---e---f---g---h------|');
      const e1subs = '       ^---------------------!             ';
      const expected = '     x----------------y----#             ';
      const x = observable('       ----b---c---d---e|                  ');
      const y = observable('                        ---f-#             ');
      const values = { x: x, y: y };
      let i = 0;
      const result = e1[windowWhen](() => closings[i++]);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
      expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
    });
  });
  it('should propagate errors emitted from the source', async () => {
    await rxTest(({ hot, observable, expectObservable, expectSubscriptions }) => {
      // prettier-ignore
      const closings = [
                observable('               -----------------s--|       '),
                observable('                                -------(s|)'),
            ];
      // prettier-ignore
      const closeSubs = [
                '                    ^----------------!          ',
                '                    -----------------^----!     ',
            ];
      const e1 = hot('  --a--^---b---c---d---e---f-#     ');
      const e1subs = '       ^---------------------!     ';
      const expected = '     x----------------y----#     ';
      const x = observable('       ----b---c---d---e|          ');
      const y = observable('                        ---f-#     ');
      const values = { x: x, y: y };
      let i = 0;
      const result = e1[windowWhen](() => closings[i++]);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(closings[0].subscriptions).toBe(closeSubs[0]);
      expectSubscriptions(closings[1].subscriptions).toBe(closeSubs[1]);
    });
  });
  it('should handle empty source', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e2 = observable(' -----c--|');
      const e2subs = '  (^!)     ';
      const e1 = observable(' |        ');
      const e1subs = '  (^!)     ';
      const expected = '(w|)     ';
      const win = observable('|        ');
      const values = { w: win };
      const result = e1[windowWhen](() => e2);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should handle a never source', async () => {
    await rxTest(async ({ observable, expectSubscriptions, flush, now, schedule }) => {
      const outerController = new AbortController();
      const innerControllers = [];
      const actual = [];
      schedule(() => {
        // The original evidence horizon ends at frame 17. Bound the final live
        // window first, then cancel the outer observation and its source work.
        for (const innerController of innerControllers) {
          innerController.abort();
        }
        outerController.abort();
      }, 17);
      const closing = observable('-----c--|');
      const source = observable('-');
      const result = source[windowWhen](() => closing);
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
      expectSubscriptions(source.subscriptions).toBe('^----------------!');
      expectSubscriptions(closing.subscriptions).toBe(['^----!', '-----^----!', '----------^----!', '---------------^-!']);
      await flush();
      expect(actual).toEqual([
        {
          frame: 0,
          notification: {
            kind: 'N',
            value: [{ frame: 5, notification: { kind: 'C' } }],
          },
        },
        {
          frame: 5,
          notification: {
            kind: 'N',
            value: [{ frame: 5, notification: { kind: 'C' } }],
          },
        },
        {
          frame: 10,
          notification: {
            kind: 'N',
            value: [{ frame: 5, notification: { kind: 'C' } }],
          },
        },
        {
          frame: 15,
          notification: { kind: 'N', value: [] },
        },
      ]);
    });
  });
  it('should handle throw', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e2 = observable(' -----c--|');
      const e2subs = '  (^!)     ';
      const e1 = observable(' #        ');
      const e1subs = '  (^!)     ';
      const expected = '(w#)     ';
      const win = observable('#        ');
      const values = { w: win };
      const result = e1[windowWhen](() => e2);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should handle a never closing Observable', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e2 = observable('      -                                  ');
      const e2subs = '       ^----------------------------------!';
      const e1 = hot('  --a--^---b---c---d---e---f---g---h------|');
      const e1subs = '       ^----------------------------------!';
      const expected = '     x----------------------------------|';
      const x = observable('       ----b---c---d---e---f---g---h------|');
      const values = { x: x };
      const result = e1[windowWhen](() => e2);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should handle a throw closing Observable', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e2 = observable('      #                                   ');
      const e2subs = '       (^!)                                ';
      const e1 = hot('  --a--^---b---c---d---e---f---g---h------|');
      const e1subs = '       (^!)                                ';
      const expected = '     (x#)                                ';
      const x = observable('       #                                   ');
      const values = { x: x };
      const result = e1[windowWhen](() => e2);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
});
