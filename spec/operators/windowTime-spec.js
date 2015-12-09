/* globals describe, it, expect, hot, cold, expectObservable, expectSubscriptions, rxTestScheduler */
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;

describe('Observable.prototype.windowTime', function () {
  it('should emit windows given windowTimeSpan', function () {
    var source = hot('--1--2--^--a--b--c--d--e--f--g--h--|');
    var subs =               '^                          !';
    //  100 frames            0---------1---------2------|
    var expected =           'x---------y---------z------|';
    var x = cold(            '---a--b--c|                 ');
    var y = cold(                      '--d--e--f-|       ');
    var z = cold(                                '-g--h--|');
    var values = { x: x, y: y, z: z };

    var result = source.windowTime(100, null, rxTestScheduler);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should emit windows given windowTimeSpan and windowCreationInterval', function () {
    var source = hot('--1--2--^--a--b--c--d--e--f--g--h--|');
    var subs =               '^                          !';
    //  100 frames            0---------1---------2------|
    //  50                     ----|
    //  50                               ----|
    //  50                                         ----|
    var expected =           'x---------y---------z------|';
    var x = cold(            '---a-|                      ');
    var y = cold(                      '--d--(e|)         ');
    var z = cold(                                '-g--h|  ');
    var values = { x: x, y: y, z: z };

    var result = source.windowTime(50, 100, rxTestScheduler);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return a single empty window if source is empty', function () {
    var source =   cold('|');
    var subs =          '(^!)';
    var expected =      '(w|)';
    var w =        cold('|');
    var expectedValues = { w: w };

    var result = source.windowTime(50, 100, rxTestScheduler);

    expectObservable(result).toBe(expected, expectedValues);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should split a Just source into a single window identical to source', function () {
    var source =   cold('(a|)');
    var subs =          '(^!)';
    var expected =      '(w|)';
    var w =        cold('(a|)');
    var expectedValues = { w: w };

    var result = source.windowTime(50, 100, rxTestScheduler);

    expectObservable(result).toBe(expected, expectedValues);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should be able to split a never Observable into timely empty windows', function () {
    var source =    hot('^----------');
    var subs =          '^         !';
    var expected =      'a--b--c--d-';
    var a =        cold('---|       ');
    var b =        cold(   '---|    ');
    var c =        cold(      '---| ');
    var d =        cold(         '--');
    var unsub =         '          !';
    var expectedValues = { a: a, b: b, c: c, d: d };

    var result = source.windowTime(30, 30, rxTestScheduler);

    expectObservable(result, unsub).toBe(expected, expectedValues);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should emit an error-only window if outer is a simple throw-Observable', function () {
    var source =   cold('#');
    var subs =          '(^!)';
    var expected =      '(w#)';
    var w =        cold('#');
    var expectedValues = { w: w };

    var result = source.windowTime(50, 100, rxTestScheduler);

    expectObservable(result).toBe(expected, expectedValues);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should handle source Observable which eventually emits an error', function () {
    var source = hot('--1--2--^--a--b--c--d--e--f--g--h--#');
    var subs =               '^                          !';
    //  100 frames            0---------1---------2------|
    //  50                     ----|
    //  50                               ----|
    //  50                                         ----|
    var expected =           'x---------y---------z------#';
    var x = cold(            '---a-|                      ');
    var y = cold(                      '--d--(e|)         ');
    var z = cold(                                '-g--h|  ');
    var values = { x: x, y: y, z: z };

    var result = source.windowTime(50, 100, rxTestScheduler);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should emit windows given windowTimeSpan and windowCreationInterval, ' +
  'but outer is unsubscribed early', function () {
    var source = hot('--1--2--^--a--b--c--d--e--f--g--h--|');
    var subs =               '^          !                ';
    //  100 frames            0---------1---------2------|
    //  50                     ----|
    //  50                               ----|
    //  50                                         ----|
    var expected =           'x---------y-                ';
    var x = cold(            '---a-|                      ');
    var y = cold(                      '--                ');
    var unsub =              '           !                ';
    var values = { x: x, y: y };

    var result = source.windowTime(50, 100, rxTestScheduler);

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should dispose window Subjects if the outer is unsubscribed early', function () {
    var source = hot('--a--b--c--d--e--f--g--h--|');
    var sourceSubs = '^        !                 ';
    var expected =   'x---------                 ';
    var x = cold(    '--a--b--c-                 ');
    var unsub =      '         !                 ';
    var values = { x: x };

    var window;
    var result = source.windowTime(1000, 1000, rxTestScheduler)
      .do(function (w) { window = w; });

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    rxTestScheduler.schedule(function () {
      try {
        window.subscribe();
      }
      catch (err) {
        expect(err.message).toBe('Cannot subscribe to a disposed Subject.');
      }
    }, 150);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
    var source = hot('--1--2--^--a--b--c--d--e--f--g--h--|');
    var sourcesubs =         '^             !             ';
    //  100 frames            0---------1---------2------|
    //  50                     ----|
    //  50                               ----|
    //  50                                         ----|
    var expected =           'x---------y----             ';
    var x = cold(            '---a-|                      ');
    var y = cold(                      '--d--             ');
    var unsub =              '              !             ';
    var values = { x: x, y: y };

    var result = source
      .mergeMap(function (i) { return Observable.of(i); })
      .windowTime(50, 100, rxTestScheduler)
      .mergeMap(function (i) { return Observable.of(i); });

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(sourcesubs);
  });
});