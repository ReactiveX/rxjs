// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/expand-spec.ts
import { describe, expect, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { EMPTY } from 'rxjs/empty';
import { expand } from 'rxjs/expand';
import { map } from 'rxjs/map';
import { mergeMap } from 'rxjs/merge-map';
describe('expand (platform)', () => {
  it('should recursively map-and-flatten each item to an Observable', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --x----|  ', { x: 1 });
      const e1subs = '  ^------!  ';
      const e2 = observable('   --c|    ', { c: 2 });
      //                    --c|
      //                      --c|
      const expected = '--a-b-c-d|';
      const values = { a: 1, b: 2, c: 4, d: 8 };
      const result = e1[expand]((x) => (x === 8 ? EMPTY : e2[map]((c) => c * x)));
      expectObservable(result).toBe(
        [
          { frame: 2, notification: { kind: 'N', value: 1 } },
          { frame: 4, notification: { kind: 'N', value: 2 } },
          { frame: 7, notification: { kind: 'C' } },
        ],
        values
      );
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should work with scheduler', async () => {
    await rxTest(async ({ observable, hot, expectObservable, expectSubscriptions, flush, now, schedule }) => {
      const source = hot('--x----|', { x: 1 });
      const ordering = [];
      const scheduleSubscription = (input) =>
        new Observable((subscriber) => {
          schedule(
            () => {
              ordering.push(`subscribe:${now()}`);
              Observable.from(input).subscribe(subscriber, {
                signal: subscriber.signal,
              });
            },
            0,
            { signal: subscriber.signal }
          );
        });
      const result = source[expand](
        (value) => {
          ordering.push(`project:${now()}`);
          return scheduleSubscription(value === 8 ? EMPTY : observable('--c|', { c: 2 })[map]((innerValue) => innerValue * value));
        },
        { concurrent: Infinity }
      );
      // RxJS 7 deprecated the scheduler argument in favor of scheduling each
      // projected subscription. Model that replacement with rxTest.schedule.
      // Create each projected cold producer per recursion because platform-mode
      // fixtures otherwise join one shared run, unlike the RxJS 7 cold fixture.
      // This retains the original breadth-first timing plus source lifecycle.
      expectObservable(result).toBe('--a-b-c-d|', {
        a: 1,
        b: 2,
        c: 4,
        d: 8,
      });
      expectSubscriptions(source.subscriptions).toBe('^------!');
      await flush();
      expect(ordering).toEqual([
        'project:2',
        'subscribe:2',
        'project:4',
        'subscribe:4',
        'project:6',
        'subscribe:6',
        'project:8',
        'subscribe:8',
      ]);
    });
  });
  it('should map and recursively flatten', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: 1,
        b: 1 + 1, // a + a,
        c: 2 + 2, // b + b,
        d: 4 + 4, // c + c,
        e: 8 + 8, // d + d
      };
      const e1 = hot('  (a|)            ', values);
      const e1subs = '  (^!)            ';
      const e2shape = ' ---(z|)         ';
      const expected = 'a--b--c--d--(e|)';
      /*
                expectation explanation: (conjunction junction?) ...

                since `cold('---(z|)')` emits `x + x` and completes on frame 30
                but the next "expanded" return value is synchronously subscribed to in
                that same frame, it stacks like so:

                a
                ---(b|)
                   ---(c|)
                      ---(d|)
                         ---(e|)      (...which flattens into:)
                a--b--c--d--(e|)
              */
      const result = e1[expand]((x, index) => {
        if (x === 16) {
          return EMPTY;
        } else {
          return observable(e2shape, { z: x + x });
        }
      });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should map and recursively flatten, and handle event raised error', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: 1,
        b: 1 + 1, // a + a,
        c: 2 + 2, // b + b,
        d: 4 + 4, // c + c,
        e: 8 + 8, // d + d
      };
      const e1 = hot('  (a|)         ', values);
      const e1subs = '  (^!)         ';
      const e2shape = ' ---(z|)      ';
      const expected = 'a--b--c--(d#)';
      const result = e1[expand]((x) => {
        if (x === 8) {
          return observable('#');
        }
        return observable(e2shape, { z: x + x });
      });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should map and recursively flatten, and propagate error thrown from projection', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: 1,
        b: 1 + 1, // a + a,
        c: 2 + 2, // b + b,
        d: 4 + 4, // c + c,
        e: 8 + 8, // d + d
      };
      const e1 = hot('  (a|)         ', values);
      const e1subs = '  (^!)         ';
      const e2shape = ' ---(z|)      ';
      const expected = 'a--b--c--(d#)';
      const result = e1[expand]((x) => {
        if (x === 8) {
          throw 'error';
        }
        return observable(e2shape, { z: x + x });
      });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow unsubscribing early', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: 1,
        b: 1 + 1, // a + a,
        c: 2 + 2, // b + b,
        d: 4 + 4, // c + c,
        e: 8 + 8, // d + d
      };
      const e1 = hot('  (a|)    ', values);
      const unsub = '   -------!';
      const e1subs = '  (^!)    ';
      const e2shape = ' ---(z|) ';
      const expected = 'a--b--c-';
      const result = e1[expand]((x) => {
        if (x === 16) {
          return EMPTY;
        }
        return observable(e2shape, { z: x + x });
      });
      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: 1,
        b: 1 + 1, // a + a,
        c: 2 + 2, // b + b,
        d: 4 + 4, // c + c,
        e: 8 + 8, // d + d
      };
      const e1 = hot('  (a|)    ', values);
      const e1subs = '  (^!)    ';
      const e2shape = ' ---(z|) ';
      const expected = 'a--b--c-';
      const unsub = '   -------!';
      const result = e1[mergeMap]((x) => Observable.from([x]))
        [expand]((x) => {
          if (x === 16) {
            return EMPTY;
          }
          return observable(e2shape, { z: x + x });
        })
        [mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow concurrent expansions', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: 1,
        b: 1 + 1, // a + a,
        c: 2 + 2, // b + b,
        d: 4 + 4, // c + c,
        e: 8 + 8, // d + d
      };
      const e1 = hot('  a-a|              ', values);
      const e1subs = '  ^--!              ';
      const e2shape = ' ---(z|)           ';
      const expected = 'a-ab-bc-cd-de-(e|)';
      const result = e1[expand]((x) => {
        if (x === 16) {
          return EMPTY;
        }
        return observable(e2shape, { z: x + x });
      });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow configuring the concurrency limit parameter to 1', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: 1,
        b: 1 + 1, // a + a,
        c: 2 + 2, // b + b,
        d: 4 + 4, // c + c,
        e: 8 + 8, // d + d
        u: 10,
        v: 20, // u + u
        x: 40, // v + v
        y: 80, // x + x
        z: 160, // y + y
      };
      const e1 = hot('  a-u|                         ', values);
      const e1subs = '  ^--!                         ';
      const e2shape = ' ---(z|)                      ';
      //                 ---(z|)
      //                    ---(z|)
      //                       ---(z|)
      //                          ---(z|)
      //                             ---(z|)
      //                                ---(z|)
      //                                   ---(z|)
      // Notice how for each column, there is at most 1 `-` character.
      const expected = 'a--u--b--v--c--x--d--y--(ez|)';
      const concurrencyLimit = 1;
      const result = e1[expand](
        (x) => {
          if (x === 16 || x === 160) {
            return EMPTY;
          }
          return observable(e2shape, { z: x + x });
        },
        { concurrent: concurrencyLimit }
      );
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should allow configuring the concurrency limit parameter to 2', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: 1,
        b: 1 + 1, // a + a,
        c: 2 + 2, // b + b,
        u: 10,
        v: 20, // u + u
        x: 40, // v + v
      };
      const e1 = hot('  a---au|                   ', values);
      const e1subs = '  ^-----!                   ';
      const e2shape = ' ------(z|)                ';
      //                  ------(z|)
      //                    ------(z|)
      //                        ------(z|)
      //                          ------(z|)
      //                              ------(z|)
      //                                ------(z|)
      // Notice how for each column, there is at most 2 `-` characters.
      const expected = 'a---a-u---b-b---v-(cc)(x|)';
      const concurrencyLimit = 2;
      const result = e1[expand](
        (x) => {
          if (x === 4 || x === 40) {
            return EMPTY;
          }
          return observable(e2shape, { z: x + x });
        },
        { concurrent: concurrencyLimit }
      );
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should ignore concurrency limit if it is not passed', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: 1,
        b: 1 + 1, // a + a,
        c: 2 + 2, // b + b,
        d: 4 + 4, // c + c,
        e: 8 + 8, // d + d
        u: 10,
        v: 20, // u + u
        x: 40, // v + v
        y: 80, // x + x
        z: 160, // y + y
      };
      const e1 = hot('  a-u|              ', values);
      const e1subs = '  ^--!              ';
      const e2shape = ' ---(z|)           ';
      const expected = 'a-ub-vc-xd-ye-(z|)';
      const concurrencyLimit = 100;
      const result = e1[expand](
        (x) => {
          if (x === 16 || x === 160) {
            return EMPTY;
          }
          return observable(e2shape, { z: x + x });
        },
        { concurrent: concurrencyLimit }
      );
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should map and recursively flatten with scalars', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: 1,
        b: 1 + 1, // a + a,
        c: 2 + 2, // b + b,
        d: 4 + 4, // c + c,
        e: 8 + 8, // d + d
      };
      const e1 = hot('  (a|)    ', values);
      const e1subs = '  (^!)    ';
      const expected = '(abcde|)';
      const result = e1[expand]((x) => {
        if (x === 16) {
          return EMPTY;
        }
        return Observable.from([x + x]); // scalar
      });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should work when passing undefined for the optional arguments', async () => {
    await rxTest(({ observable, hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: 1,
        b: 1 + 1, // a + a,
        c: 2 + 2, // b + b,
        d: 4 + 4, // c + c,
        e: 8 + 8, // d + d
      };
      const e1 = hot('  (a|)            ', values);
      const e1subs = '  (^!)            ';
      const e2shape = ' ---(z|)         ';
      const expected = 'a--b--c--d--(e|)';
      const project = (x, index) => {
        if (x === 16) {
          return EMPTY;
        }
        return observable(e2shape, { z: x + x });
      };
      const result = e1[expand](project, { concurrent: undefined });
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
