import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
declare const {hot, cold, asDiagram, time, expectObservable, expectSubscriptions};

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
    const values = { x: x, y: y, z: z };

    const result = source.windowTime(50, 100, rxTestScheduler);

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
    const values = { x: x, y: y, z: z };

    const result = source.windowTime(timeSpan, null, rxTestScheduler);

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
    const values = { x: x, y: y, z: z };

    const result = source.windowTime(timeSpan, interval, rxTestScheduler);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return a single empty window if source is empty', () => {
    const source =   cold('|');
    const subs =          '(^!)';
    const expected =      '(w|)';
    const w =        cold('|');
    const expectedValues = { w: w };
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
    const expectedValues = { w: w };
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
    const expectedValues = { a: a, b: b, c: c, d: d };

    const result = source.windowTime(timeSpan, interval, rxTestScheduler);

    expectObservable(result, unsub).toBe(expected, expectedValues);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should emit an error-only window if outer is a simple throw-Observable', () => {
    const source =   cold('#');
    const subs =          '(^!)';
    const expected =      '(w#)';
    const w =        cold('#');
    const expectedValues = { w: w };
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
    const values = { x: x, y: y, z: z };

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
    const values = { x: x, y: y };

    const result = source.windowTime(timeSpan, interval, rxTestScheduler);

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should dispose window Subjects if the outer is unsubscribed early', () => {
    const source = hot('--a--b--c--d--e--f--g--h--|');
    const sourceSubs = '^        !                 ';
    const expected =   'x---------                 ';
    const x = cold(    '--a--b--c-                 ');
    const unsub =      '         !                 ';
    const values = { x: x };

    let window;
    const result = source.windowTime(1000, 1000, rxTestScheduler)
      .do((w: any) => { window = w; });

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    rxTestScheduler.schedule(() => {
      expect(() => {
        window.subscribe();
      }).to.throw(Rx.ObjectUnsubscribedError);
    }, 150);
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
    const values = { x: x, y: y };

    const result = source
      .mergeMap((x: string) => Observable.of(x))
      .windowTime(timeSpan, interval, rxTestScheduler)
      .mergeMap((x: Rx.Observable<string>) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(sourcesubs);
  });
});