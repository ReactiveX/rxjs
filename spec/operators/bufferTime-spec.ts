import { of, throwError, interval } from 'rxjs';
import { bufferTime, mergeMap, take } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { hot, cold, expectObservable, expectSubscriptions, time } from '../helpers/marble-testing';

declare const asDiagram: Function;

declare const rxTestScheduler: TestScheduler;

/** @test {bufferTime} */
describe('bufferTime operator', () => {
  asDiagram('bufferTime(100)')('should emit buffers at intervals', () => {
    const e1 =   hot('---a---b---c---d---e---f---g-----|');
    const subs =     '^                                !';
    const t = time(  '----------|');
    const expected = '----------w---------x---------y--(z|)';
    const values = {
      w: ['a', 'b'],
      x: ['c', 'd', 'e'],
      y: ['f', 'g'],
      z: [] as string[]
    };

    const result = e1.pipe(bufferTime(t, null, Number.POSITIVE_INFINITY, rxTestScheduler));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should emit buffers at intervals test 2', () => {
    const e1 =   hot('---------a---------b---------c---------d---------e---------g--------|');
    const t = time(  '--------------------------------|');
    const expected = '--------------------------------x-------------------------------y---(z|)';
    const values = {
      x: ['a', 'b', 'c'],
      y: ['d', 'e', 'g'],
      z: [] as string[]
    };

    const result = e1.pipe(bufferTime(t, null, Number.POSITIVE_INFINITY, rxTestScheduler));

    expectObservable(result).toBe(expected, values);
  });

  it('should emit buffers at intervals or when the buffer is full', () => {
    const e1 =   hot('---a---b---c---d---e---f---g-----|');
    const subs =     '^                                !';
    const t = time(  '----------|');
    const expected = '-------w-------x-------y---------(z|)';
    const values = {
      w: ['a', 'b'],
      x: ['c', 'd'],
      y: ['e', 'f'],
      z: ['g']
    };

    const result = e1.pipe(bufferTime(t, null, 2, rxTestScheduler));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should emit buffers at intervals or when the buffer is full test 2', () => {
    const e1 =   hot('---a---b---c---d---e---f---g-----|');
    const subs =     '^                                !';
    const t = time(  '----------|');
    const expected = '----------w--------x---------y---(z|)';
    const values = {
      w: ['a', 'b'],
      x: ['c', 'd', 'e'],
      y: ['f', 'g'],
      z: [] as string[]
    };

    const result = e1.pipe(bufferTime(t, null, 3, rxTestScheduler));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should emit buffers that have been created at intervals and close after the specified delay', () => {
    const e1 =   hot('---a---b---c----d----e----f----g----h----i----(k|)');
                 // --------------------*--------------------*----  start interval
                 // ---------------------|                          timespans
                 //                     ---------------------|
                 //                                          -----|
    const t = time(  '---------------------|');
    const interval = time(                '--------------------|');
    const expected = '---------------------x-------------------y----(z|)';
    const values = {
      x: ['a', 'b', 'c', 'd', 'e'],
      y: ['e', 'f', 'g', 'h', 'i'],
      z: ['i', 'k']
    };

    const result = e1.pipe(bufferTime(t, interval, Number.POSITIVE_INFINITY, rxTestScheduler));

    expectObservable(result).toBe(expected, values);
  });

  it('should emit buffers that have been created at intervals and close after the specified delay ' +
  'or when the buffer is full', () => {
    const e1 =   hot('---a---b---c----d----e----f----g----h----i----(k|)');
                 // --------------------*--------------------*----  start interval
                 // ---------------------|                          timespans
                 //                     ---------------------|
                 //                                          -----|
    const t = time(  '---------------------|');
    const interval = time(                '--------------------|');
    const expected = '----------------x-------------------y---------(z|)';
    const values = {
      x: ['a', 'b', 'c', 'd'],
      y: ['e', 'f', 'g', 'h'],
      z: ['i', 'k']
    };

    const result = e1.pipe(bufferTime(t, interval, 4, rxTestScheduler));

    expectObservable(result).toBe(expected, values);
  });

  it('should emit buffers with timeSpan 100 and creationInterval 70', () => {
    const e1 = hot('--1--^2--3---4---5--6--7---8----9------------|');
                    // -------*------*------*------*------*----- creation interval
                    // ----------|                               timespans
                    //        ----------|
                    //               ----------|
                    //                      ----------|
                    //                             ----------|
                    //                                    ----------|
    const e1subs =      '^                                       !';
    const t = time(     '----------|');
    const interval = time(        '-------|');
    const expected =    '----------a------b------c------d------e-(f|)';
    const values = {
      a: ['2', '3', '4'],
      b: ['4', '5', '6'],
      c: ['6', '7', '8'],
      d: ['8', '9'],
      e: [] as string[],
      f: [] as string[]
    };

    const result = e1.pipe(bufferTime(t, interval, Number.POSITIVE_INFINITY, rxTestScheduler));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should emit buffers but handle source ending with an error', () => {
    const e1 = hot('--1--^2--3---4---5--6--7---8----9------------#');
                    // -------*------*------*------*------*----- creation interval
                    // ----------|                               timespans
                    //        ----------|
                    //               ----------|
                    //                      ----------|
                    //                             ----------|
                    //                                    ----------|
    const t = time(     '----------|');
    const interval = time(        '-------|');
    const expected =    '----------a------b------c------d------e-#';
    const values = {
      a: ['2', '3', '4'],
      b: ['4', '5', '6'],
      c: ['6', '7', '8'],
      d: ['8', '9'],
      e: [] as string[]
    };

    const result = e1.pipe(bufferTime(t, interval, Number.POSITIVE_INFINITY, rxTestScheduler));

    expectObservable(result).toBe(expected, values);
  });

  it('should emit buffers and allow result to unsubscribed early', () => {
    const e1 = hot('--1--^2--3---4---5--6--7---8----9------------|');
    const unsub =       '                 !                       ';
    const subs =        '^                !                       ';
                    // -------*------*------*------*------*----- creation interval
                    // ----------|                               timespans
                    //        ----------|
                    //               ----------|
    const t = time(     '----------|');
    const interval = time(        '-------|');
    const expected =    '----------a------                        ';
    const values = {
      a: ['2', '3', '4']
    };

    const result = e1.pipe(bufferTime(t, interval, Number.POSITIVE_INFINITY, rxTestScheduler));

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 = hot('--1--^2--3---4---5--6--7---8----9------------|');
    const subs =        '^               !                        ';
                    // -------*------*------*------*------*----- creation interval
                    // ----------|                               timespans
                    //        ----------|
                    //               ----------|
    const t = time(     '----------|');
    const interval = time(        '-------|');
    const expected =    '----------a------                        ';
    const unsub =       '                !                        ';
    const values = {
      a: ['2', '3', '4']
    };

    const result = e1.pipe(
      mergeMap((x: any) => of(x)),
      bufferTime(t, interval, Number.POSITIVE_INFINITY, rxTestScheduler),
      mergeMap((x: any) => of(x))
    );

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle empty', () => {
    const e1 = cold( '|');
    const e1subs =   '(^!)';
    const expected = '(b|)';
    const values = { b: [] as string[] };
    const t = time('----------|');

    const result = e1.pipe(bufferTime(t, null, Number.POSITIVE_INFINITY, rxTestScheduler));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle never', () => {
    const e1 = cold('-');
    const unsub =    '                                            !';
    const t = time(  '----------|');
    const expected = '----------a---------a---------a---------a----';

    const result = e1.pipe(bufferTime(t, null, Number.POSITIVE_INFINITY, rxTestScheduler));

    expectObservable(result, unsub).toBe(expected, { a: [] });
  });

  it('should handle throw', () => {
    const e1 = throwError(new Error('haha'));
    const expected = '#';
    const t = time('----------|');

    const result = e1.pipe(bufferTime(t, null, Number.POSITIVE_INFINITY, rxTestScheduler));

    expectObservable(result).toBe(expected, undefined, new Error('haha'));
  });

  it('should handle errors', () => {
    const e1 =   hot('---a---b---c---#');
    const e1subs =   '^              !';
    const t = time(  '----------|');
    const expected = '----------w----#';
    const values = {
      w: ['a', 'b']
    };

    const result = e1.pipe(bufferTime(t, null, Number.POSITIVE_INFINITY, rxTestScheduler));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should emit buffers that have been created at intervals and close after ' +
  'the specified delay with errors', () => {
    const e1 =   hot('---a---b---c----d----e----f----g----h----i--#');
                 // --------------------*--------------------*----  start interval
                 // ---------------------|                          timespans
                 //                     ---------------------|
                 //                                          -----|
    const e1subs =   '^                                           !';
    const t = time(  '---------------------|');
    const interval = time(                '--------------------|');
    const expected = '---------------------x-------------------y--#';
    const values = {
      x: ['a', 'b', 'c', 'd', 'e'],
      y: ['e', 'f', 'g', 'h', 'i']
    };

    const result = e1.pipe(bufferTime(t, interval, Number.POSITIVE_INFINITY, rxTestScheduler));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not throw when subscription synchronously unsubscribed after emit', () => {
    const e1 =   hot('---a---b---c---d---e---f---g-----|');
    const subs =     '^                   !';
    const t = time(  '----------|');
    const expected = '----------w---------(x|)';
    const values = {
      w: ['a', 'b'],
      x: ['c', 'd', 'e']
    };

    const result = e1.pipe(
      bufferTime(t, null, Number.POSITIVE_INFINITY, rxTestScheduler),
      take(2)
    );

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should not have errors when take follows and maxBufferSize is provided', () => {
    const tick = 10;
    const buffTime = 50;
    const expected = '-----a----b----c----d----(e|)';
    const values = {
      a: [0, 1, 2, 3],
      b: [4, 5, 6, 7, 8],
      c: [9, 10, 11, 12, 13],
      d: [14, 15, 16, 17, 18],
      e: [19, 20, 21, 22, 23]
    };

    const source = interval(tick, rxTestScheduler).pipe(
      bufferTime(buffTime, null, 10, rxTestScheduler),
      take(5)
    );

    expectObservable(source).toBe(expected, values);
  });
});
