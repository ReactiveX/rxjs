import * as Rx from '../../dist/cjs/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram, time };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;

/** @test {bufferTime} */
describe('Observable.prototype.bufferTime', () => {
  asDiagram('bufferTime(100)')('should emit buffers at intervals', () => {
    const e1 =   hot('---a---b---c---d---e---f---g-----|');
    const subs =     '^                                !';
    const t = time(  '----------|');
    const expected = '----------w---------x---------y--(z|)';
    const values = {
      w: ['a', 'b'],
      x: ['c', 'd', 'e'],
      y: ['f', 'g'],
      z: []
    };

    const result = e1.bufferTime(t, null, Number.POSITIVE_INFINITY, rxTestScheduler);

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
      z: []
    };

    const result = e1.bufferTime(t, null, Number.POSITIVE_INFINITY, rxTestScheduler);

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

    const result = e1.bufferTime(t, null, 2, rxTestScheduler);

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
      z: []
    };

    const result = e1.bufferTime(t, null, 3, rxTestScheduler);

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

    const result = e1.bufferTime(t, interval, Number.POSITIVE_INFINITY, rxTestScheduler);

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

    const result = e1.bufferTime(t, interval, 4, rxTestScheduler);

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
      e: [],
      f: []
    };

    const result = e1.bufferTime(t, interval, Number.POSITIVE_INFINITY, rxTestScheduler);

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
      e: []
    };

    const result = e1.bufferTime(t, interval, Number.POSITIVE_INFINITY, rxTestScheduler);

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

    const result = e1.bufferTime(t, interval, Number.POSITIVE_INFINITY, rxTestScheduler);

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

    const result = e1
      .mergeMap((x: any) => Observable.of(x))
      .bufferTime(t, interval, Number.POSITIVE_INFINITY, rxTestScheduler)
      .mergeMap((x: any) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle empty', () => {
    const e1 = cold( '|');
    const e1subs =   '(^!)';
    const expected = '(b|)';
    const values = { b: [] };
    const t = time('----------|');

    const result = e1.bufferTime(t, null, Number.POSITIVE_INFINITY, rxTestScheduler);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle never', () => {
    const e1 = cold('-');
    const unsub =    '                                            !';
    const t = time(  '----------|');
    const expected = '----------a---------a---------a---------a----';

    const result = e1.bufferTime(t, null, Number.POSITIVE_INFINITY, rxTestScheduler);

    expectObservable(result, unsub).toBe(expected, { a: [] });
  });

  it('should handle throw', () => {
    const e1 = Observable.throw(new Error('haha'));
    const expected = '#';
    const t = time('----------|');

    const result = e1.bufferTime(t, null, Number.POSITIVE_INFINITY, rxTestScheduler);

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

    const result = e1.bufferTime(t, null, Number.POSITIVE_INFINITY, rxTestScheduler);

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

    const result = e1.bufferTime(t, interval, Number.POSITIVE_INFINITY, rxTestScheduler);

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

    const result = e1.bufferTime(t, null, Number.POSITIVE_INFINITY, rxTestScheduler).take(2);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should not have errors when take follows and maxBufferSize is provided', () => {
    const tick = 10;
    const bufferTime = 50;
    const expected = '-----a----b----c----d----(e|)';
    const values = {
      a: [0, 1, 2, 3],
      b: [4, 5, 6, 7, 8],
      c: [9, 10, 11, 12, 13],
      d: [14, 15, 16, 17, 18],
      e: [19, 20, 21, 22, 23]
    };

    const source = Rx.Observable.interval(tick, rxTestScheduler)
      .bufferTime(bufferTime, null, 10, rxTestScheduler)
      .take(5);

    expectObservable(source).toBe(expected, values);
  });
});