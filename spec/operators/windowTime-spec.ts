import * as Rx from '../../dist/package/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram, time };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;
declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;

/** @test {windowTime} */
describe('Observable.prototype.windowTime', () => {
  asDiagram('windowTime(50, 100)')('should emit windows given windowTimeSpan ' +
  'and windowCreationInterval', () => {
    const source = hot('--1--2--^-a--b--c--d--e---f--g--h-|');
    const subs =               '^                         !';
    //  100 frames            0---------1---------2-----|
    //  50                     ----|
    //  50                               ----|
    //  50                                         ----|
    const expected =           'x---------y---------z-----|';
    const x = cold(            '--a--(b|)                  ');
    const y = cold(                      '-d--e|           ');
    const z = cold(                                '-g--h| ');
    const values = { x, y, z };

    const result = source.windowTime(50, 100, rxTestScheduler);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should close windows after max count is reached', () => {
    const source = hot('--1--2--^--a--b--c--d--e--f--g-----|');
    const subs =               '^                          !';
    const timeSpan = time(     '----------|');
    //  100 frames              0---------1---------2------|
    const expected =           'x---------y---------z------|';
    const x = cold(            '---a--(b|)                  ');
    const y = cold(                      '--d--(e|)         ');
    const z = cold(                                '-g-----|');
    const values = { x, y, z };

    const result = source.windowTime(timeSpan, null, 2, rxTestScheduler);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should close window after max count is reached with' +
  'windowCreationInterval', () => {
    const source = hot('--1--2--^-a--b--c--de-f---g--h--i-|');
    const subs =               '^                         !';
    //  100 frames              0---------1---------2-----|
    //  50                      ----|
    //  50                                ----|
    //  50                                          ----|
    const expected =           'x---------y---------z-----|';
    const x = cold(            '--a--(b|)                  ');
    const y = cold(                      '-de-(f|)         ');
    const z = cold(                                '-h--i| ');
    const values = { x, y, z };

    const result = source.windowTime(50, 100, 3, rxTestScheduler);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should emit windows given windowTimeSpan', () => {
    const source = hot('--1--2--^--a--b--c--d--e--f--g--h--|');
    const subs =               '^                          !';
    const timeSpan = time(     '----------|');
    //  100 frames            0---------1---------2------|
    const expected =           'x---------y---------z------|';
    const x = cold(            '---a--b--c|                 ');
    const y = cold(                      '--d--e--f-|       ');
    const z = cold(                                '-g--h--|');
    const values = { x, y, z };

    const result = source.windowTime(timeSpan, rxTestScheduler);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should emit windows given windowTimeSpan and windowCreationInterval', () => {
    const source = hot('--1--2--^--a--b--c--d--e--f--g--h--|');
    const subs =               '^                          !';
    const timeSpan = time(     '-----|');
    const interval = time(               '----------|');
    //  100 frames            0---------1---------2------|
    //  50                     ----|
    //  50                               ----|
    //  50                                         ----|
    const expected =           'x---------y---------z------|';
    const x = cold(            '---a-|                      ');
    const y = cold(                      '--d--(e|)         ');
    const z = cold(                                '-g--h|  ');
    const values = { x, y, z };

    const result = source.windowTime(timeSpan, interval, rxTestScheduler);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return a single empty window if source is empty', () => {
    const source =   cold('|');
    const subs =          '(^!)';
    const expected =      '(w|)';
    const w =        cold('|');
    const expectedValues = { w };
    const timeSpan = time('-----|');
    const interval = time('----------|');

    const result = source.windowTime(timeSpan, interval, rxTestScheduler);

    expectObservable(result).toBe(expected, expectedValues);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should split a Just source into a single window identical to source', () => {
    const source =   cold('(a|)');
    const subs =          '(^!)';
    const expected =      '(w|)';
    const w =        cold('(a|)');
    const expectedValues = { w };
    const timeSpan = time('-----|');
    const interval = time('----------|');

    const result = source.windowTime(timeSpan, interval, rxTestScheduler);

    expectObservable(result).toBe(expected, expectedValues);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should be able to split a never Observable into timely empty windows', () => {
    const source =    hot('^----------');
    const subs =          '^         !';
    const expected =      'a--b--c--d-';
    const timeSpan = time('---|');
    const interval = time(   '---|');
    const a =        cold('---|       ');
    const b =        cold(   '---|    ');
    const c =        cold(      '---| ');
    const d =        cold(         '--');
    const unsub =         '          !';
    const expectedValues = { a, b, c, d };

    const result = source.windowTime(timeSpan, interval, rxTestScheduler);

    expectObservable(result, unsub).toBe(expected, expectedValues);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should emit an error-only window if outer is a simple throw-Observable', () => {
    const source =   cold('#');
    const subs =          '(^!)';
    const expected =      '(w#)';
    const w =        cold('#');
    const expectedValues = { w };
    const timeSpan = time('-----|');
    const interval = time('----------|');

    const result = source.windowTime(timeSpan, interval, rxTestScheduler);

    expectObservable(result).toBe(expected, expectedValues);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should handle source Observable which eventually emits an error', () => {
    const source = hot('--1--2--^--a--b--c--d--e--f--g--h--#');
    const subs =               '^                          !';
    const timeSpan = time(     '-----|');
    const interval = time(               '----------|');
    //  100 frames            0---------1---------2------|
    //  50                     ----|
    //  50                               ----|
    //  50                                         ----|
    const expected =           'x---------y---------z------#';
    const x = cold(            '---a-|                      ');
    const y = cold(                      '--d--(e|)         ');
    const z = cold(                                '-g--h|  ');
    const values = { x, y, z };

    const result = source.windowTime(timeSpan, interval, rxTestScheduler);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should emit windows given windowTimeSpan and windowCreationInterval, ' +
  'but outer is unsubscribed early', () => {
    const source = hot('--1--2--^--a--b--c--d--e--f--g--h--|');
    const subs =               '^          !                ';
    const timeSpan = time(     '-----|');
    const interval = time(               '----------|');
    //  100 frames            0---------1---------2------|
    //  50                     ----|
    //  50                               ----|
    //  50                                         ----|
    const expected =           'x---------y-                ';
    const x = cold(            '---a-|                      ');
    const y = cold(                      '--                ');
    const unsub =              '           !                ';
    const values = { x, y };

    const result = source.windowTime(timeSpan, interval, rxTestScheduler);

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const source = hot('--1--2--^--a--b--c--d--e--f--g--h--|');
    const sourcesubs =         '^             !             ';
    const timeSpan = time(     '-----|');
    const interval = time(               '----------|');
    //  100 frames            0---------1---------2------|
    //  50                     ----|
    //  50                               ----|
    //  50                                         ----|
    const expected =           'x---------y----             ';
    const x = cold(            '---a-|                      ');
    const y = cold(                      '--d--             ');
    const unsub =              '              !             ';
    const values = { x, y };

    const result = source
      .mergeMap((x: string) => Observable.of(x))
      .windowTime(timeSpan, interval, rxTestScheduler)
      .mergeMap((x: Rx.Observable<string>) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(sourcesubs);
  });
});
