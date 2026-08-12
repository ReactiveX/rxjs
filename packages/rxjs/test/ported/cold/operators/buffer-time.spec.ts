// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/bufferTime-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { bufferTime } from 'rxjs/buffer-time';
import { ColdObservable } from 'rxjs/cold-observable';
import { interval } from 'rxjs/interval';
import { mergeMap } from 'rxjs/merge-map';
import { Subject } from 'rxjs/subject';
import { take } from 'rxjs/take';
import { tap } from 'rxjs/tap';
describe('bufferTime (cold)', () => {
  it('should emit buffers at intervals', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a---b---c---d---e---f---g-----|   ');
      const subs = '    ^--------------------------------!   ';
      const t = time('  ----------|                          ');
      const expected = '----------w---------x---------y--(z|)';
      const values = {
        w: ['a', 'b'],
        x: ['c', 'd', 'e'],
        y: ['f', 'g'],
        z: [],
      };
      const result = e1[bufferTime](t, null, Infinity);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should emit buffers at intervals test 2', async () => {
    await rxTest(({ hot, time, expectObservable }) => {
      const e1 = hot('  ---------a---------b---------c---------d---------e---------g--------|   ');
      const t = time('  --------------------------------|                                       ');
      const expected = '--------------------------------x-------------------------------y---(z|)';
      const values = {
        x: ['a', 'b', 'c'],
        y: ['d', 'e', 'g'],
        z: [],
      };
      const result = e1[bufferTime](t, null, Infinity);
      expectObservable(result).toBe(expected, values);
    });
  });
  it('should emit buffers at intervals or when the buffer is full', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a---b---c---d---e---f---g-----|   ');
      const subs = '    ^--------------------------------!   ';
      const t = time('  ----------|                          ');
      //                       ----------|
      //                               ----------|
      //                                       ----------|
      const expected = '-------w-------x-------y---------(z|)';
      const values = {
        w: ['a', 'b'],
        x: ['c', 'd'],
        y: ['e', 'f'],
        z: ['g'],
      };
      const result = e1[bufferTime](t, null, 2);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should emit buffers at intervals or when the buffer is full test 2', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a---b---c---d---e---f---g-----|   ');
      const subs = '    ^--------------------------------!   ';
      const t = time('  ----------|                          ');
      //                          ---------|---------|---------|
      const expected = '----------w--------x---------y---(z|)';
      const values = {
        w: ['a', 'b'],
        x: ['c', 'd', 'e'],
        y: ['f', 'g'],
        z: [],
      };
      const result = e1[bufferTime](t, null, 3);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should emit buffers that have been created at intervals and close after the specified delay', async () => {
    await rxTest(({ hot, time, expectObservable }) => {
      const e1 = hot('       ---a---b---c----d----e----f----g----h----i----(k|)');
      //                     --------------------*--------------------*----  start interval
      //                     ---------------------|                          timespans
      //                                         ---------------------|
      //                                                              -----|
      const t = time('       ---------------------|                            ');
      const interval = time('--------------------|                             ');
      const expected = '     ---------------------x-------------------y----(z|)';
      const values = {
        x: ['a', 'b', 'c', 'd', 'e'],
        y: ['e', 'f', 'g', 'h', 'i'],
        z: ['i', 'k'],
      };
      const result = e1[bufferTime](t, interval, Infinity);
      expectObservable(result).toBe(expected, values);
    });
  });
  it('should emit buffers that have been created at intervals and close after the specified delay or when the buffer is full', async () => {
    await rxTest(({ hot, time, expectObservable }) => {
      const e1 = hot('  ---a---b---c----d----e----f----g----h----i----(k|)');
      //                --------------------*--------------------*----  start interval
      //                ---------------------|                          timespans
      //                                    ---------------------|
      //                                                         -----|
      const t = time('  ---------------------|                            ');
      const interval = time('                --------------------|        ');
      const expected = '----------------x-------------------y---------(z|)';
      const values = {
        x: ['a', 'b', 'c', 'd'],
        y: ['e', 'f', 'g', 'h'],
        z: ['i', 'k'],
      };
      const result = e1[bufferTime](t, interval, 4);
      expectObservable(result).toBe(expected, values);
    });
  });
  it('should emit buffers with timeSpan 10 and creationInterval 7', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--1--^2--3---4---5--6--7---8----9------------|   ');
      //                   -------*------*------*------*------*----- creation interval
      //                   ----------|                               timespans
      //                          ----------|
      //                                 ----------|
      //                                        ----------|
      //                                               ----------|
      //                                                      ----------|
      const e1subs = '     ^---------------------------------------!   ';
      const t = time('     ----------|');
      const interval = time('        -------|');
      const expected = '   ----------a------b------c------d------e-(f|)';
      const values = {
        a: ['2', '3', '4'],
        b: ['4', '5', '6'],
        c: ['6', '7', '8'],
        d: ['8', '9'],
        e: [],
        f: [],
      };
      const result = e1[bufferTime](t, interval, Infinity);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit buffers but handle source ending with an error', async () => {
    await rxTest(({ hot, time, expectObservable }) => {
      const e1 = hot('--1--^2--3---4---5--6--7---8----9------------#');
      //                   -------*------*------*------*------*----- creation interval
      //                   ----------|                               timespans
      //                          ----------|
      //                                 ----------|
      //                                        ----------|
      //                                               ----------|
      //                                                      ----------|
      const t = time('     ----------|');
      const interval = time('        -------|');
      const expected = '   ----------a------b------c------d------e-#';
      const values = {
        a: ['2', '3', '4'],
        b: ['4', '5', '6'],
        c: ['6', '7', '8'],
        d: ['8', '9'],
        e: [],
      };
      const result = e1[bufferTime](t, interval, Infinity);
      expectObservable(result).toBe(expected, values);
    });
  });
  it('should emit buffers and allow result to unsubscribed early', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--1--^2--3---4---5--6--7---8----9------------|');
      const unsub = '      -----------------!                       ';
      const subs = '       ^----------------!                       ';
      //                   -------*------*------*------*------*----- creation interval
      //                   ----------|                               timespans
      //                          ----------|
      //                                 ----------|
      const t = time('     ----------|                              ');
      const interval = time('        -------|                       ');
      const expected = '   ----------a------                        ';
      const values = {
        a: ['2', '3', '4'],
      };
      const result = e1[bufferTime](t, interval, Infinity);
      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should not break unsubscription chains when result is unsubscribed explicitly', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--1--^2--3---4---5--6--7---8----9------------|');
      const subs = '       ^---------------!                        ';
      //                   -------*------*------*------*------*----- creation interval
      //                   ----------|                               timespans
      //                          ----------|
      //                                 ----------|
      const t = time('     ----------|');
      const interval = time('        -------|');
      const expected = '   ----------a------                        ';
      const unsub = '      ----------------!                        ';
      const values = {
        a: ['2', '3', '4'],
      };
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [bufferTime](t, interval, Infinity)
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should handle empty', async () => {
    await rxTest(({ cold, time, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |');
      const e1subs = '  (^!)';
      const expected = '(b|)';
      const values = { b: [] };
      const t = time('----------|');
      const result = e1[bufferTime](t, null, Infinity);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should handle never', async () => {
    await rxTest(({ cold, time, expectObservable }) => {
      const e1 = cold('-');
      const unsub = '   --------------------------------------------!';
      const t = time('  ----------|                                  ');
      const expected = '----------a---------a---------a---------a----';
      const result = e1[bufferTime](t, null, Infinity);
      expectObservable(result, unsub).toBe(expected, { a: [] });
    });
  });
  it('should handle throw', async () => {
    await rxTest(({ time, expectObservable }) => {
      const e1 = new ColdObservable((subscriber) => {
        subscriber.error(new Error('haha'));
      });
      const expected = '#';
      const t = time('----------|');
      const result = e1[bufferTime](t, null, Infinity);
      expectObservable(result).toBe(expected, undefined, new Error('haha'));
    });
  });
  it('should handle errors', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a---b---c---#');
      const e1subs = '  ^--------------!';
      const t = time('  ----------|');
      const expected = '----------w----#';
      const values = {
        w: ['a', 'b'],
      };
      const result = e1[bufferTime](t, null, Infinity);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should emit buffers that have been created at intervals and close after the specified delay with errors', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('       ---a---b---c----d----e----f----g----h----i--#');
      //                     --------------------|-------------------|-------------------| interval
      //                     ---------------------|
      //                                         ---------------------|
      //                                                             ---------------------| timespan
      const e1subs = '       ^-------------------------------------------!';
      const t = time('       ---------------------|                       ');
      const interval = time('                --------------------|   ');
      const expected = '     ---------------------x-------------------y--#';
      const values = {
        x: ['a', 'b', 'c', 'd', 'e'],
        y: ['e', 'f', 'g', 'h', 'i'],
      };
      const result = e1[bufferTime](t, interval, Infinity);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
  it('should not throw when subscription synchronously unsubscribed after emit', async () => {
    await rxTest(({ hot, time, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a---b---c---d---e---f---g-----|');
      const subs = '    ^-------------------!             ';
      const t = time('  ----------|                       ');
      const expected = '----------w---------(x|)          ';
      const values = {
        w: ['a', 'b'],
        x: ['c', 'd', 'e'],
      };
      const result = e1[bufferTime](t, null, Infinity)[take](2);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(subs);
    });
  });
  it('should not have errors when take follows and maxBufferSize is provided', async () => {
    await rxTest(({ expectObservable }) => {
      const tick = 1;
      const buffTime = 5;
      const expected = '-----a----b----c----d----(e|)';
      const values = {
        a: [0, 1, 2, 3],
        b: [4, 5, 6, 7, 8],
        c: [9, 10, 11, 12, 13],
        d: [14, 15, 16, 17, 18],
        e: [19, 20, 21, 22, 23],
      };
      const source = ColdObservable[interval](tick)[bufferTime](buffTime, null, 10)[take](5);
      expectObservable(source).toBe(expected, values);
    });
  });
  it('should not mutate the buffer on reentrant next', async () => {
    await rxTest(({ expectObservable, time, schedule: scheduleAt }) => {
      const subject = new Subject();
      const t1 = time(' -|');
      const t2 = time(' --|');
      const expected = '--(a|)';
      const result = subject[bufferTime](t2, null, Infinity)
        [tap](() => subject.next(2))
        [take](1);
      scheduleAt(() => subject.next(1), t1);
      expectObservable(result).toBe(expected, { a: [1] });
    });
  });
});
