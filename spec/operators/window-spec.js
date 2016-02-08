/* globals describe, it, expect, hot, cold, expectObservable, expectSubscriptions, rxTestScheduler */
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;

describe('Observable.prototype.window', function () {
  it.asDiagram('window')('should emit windows that close and reopen', function () {
    var source =   hot('---a---b---c---d---e---f---g---h---i---|    ');
    var sourceSubs =   '^                                      !    ';
    var closings = hot('-------------w------------w----------------|');
    var closingSubs =  '^                                      !    ';
    var expected =     'x------------y------------z------------|    ';
    var x = cold(      '---a---b---c-|                              ');
    var y = cold(                   '--d---e---f--|                 ');
    var z = cold(                                '-g---h---i---|    ');
    var expectedValues = { x: x, y: y, z: z };

    var result = source.window(closings);

    expectObservable(result).toBe(expected, expectedValues);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    expectSubscriptions(closings.subscriptions).toBe(closingSubs);
  });

  it('should return a single empty window if source is empty and closings are basic', function () {
    var source =   cold('|');
    var sourceSubs =    '(^!)';
    var closings = cold('--x--x--|');
    var closingSubs =   '(^!)';
    var expected =      '(w|)';
    var w =         cold('|');
    var expectedValues = { w: w };

    var result = source.window(closings);

    expectObservable(result).toBe(expected, expectedValues);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    expectSubscriptions(closings.subscriptions).toBe(closingSubs);
  });

  it('should return a single empty window if source is empty and closing is empty', function () {
    var source =   cold('|');
    var sourceSubs =    '(^!)';
    var closings = cold('|');
    var closingSubs =   '(^!)';
    var expected =      '(w|)';
    var w =        cold('|');
    var expectedValues = { w: w };

    var result = source.window(closings);

    expectObservable(result).toBe(expected, expectedValues);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    expectSubscriptions(closings.subscriptions).toBe(closingSubs);
  });

  it('should split a Just source into a single window identical to source, using a Never closing',
  function () {
    var source =   cold('(a|)');
    var sourceSubs =    '(^!)';
    var closings = cold('-');
    var closingSubs =   '(^!)';
    var expected =      '(w|)';
    var w =        cold('(a|)');
    var expectedValues = { w: w };

    var result = source.window(closings);

    expectObservable(result).toBe(expected, expectedValues);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    expectSubscriptions(closings.subscriptions).toBe(closingSubs);
  });

  it('should return a single Never window if source is Never', function () {
    var source =   cold('------');
    var sourceSubs =    '^     ';
    var closings = cold('------');
    var closingSubs =   '^     ';
    var expected =      'w-----';
    var w =        cold('------');
    var expectedValues = { w: w };

    var result = source.window(closings);

    expectObservable(result).toBe(expected, expectedValues);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    expectSubscriptions(closings.subscriptions).toBe(closingSubs);
  });

  it('should be able to split a never Observable into timely empty windows', function () {
    var source =    hot('^--------');
    var sourceSubs =    '^       !';
    var closings = cold('--x--x--|');
    var closingSubs =   '^       !';
    var expected =      'a-b--c--|';
    var a =        cold('--|      ');
    var b =        cold(  '---|   ');
    var c =        cold(     '---|');
    var expectedValues = { a: a, b: b, c: c };

    var result = source.window(closings);

    expectObservable(result).toBe(expected, expectedValues);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    expectSubscriptions(closings.subscriptions).toBe(closingSubs);
  });

  it('should emit an error-only window if outer is a simple throw-Observable', function () {
    var source =   cold('#');
    var sourceSubs =    '(^!)';
    var closings = cold('--x--x--|');
    var closingSubs =   '(^!)';
    var expected =      '(w#)';
    var w =        cold('#');
    var expectedValues = { w: w };

    var result = source.window(closings);

    expectObservable(result).toBe(expected, expectedValues);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    expectSubscriptions(closings.subscriptions).toBe(closingSubs);
  });

  it('should handle basic case with window closings', function () {
    var source = hot('-1-2-^3-4-5-6-7-8-9-|         ');
    var subs =            '^              !         ';
    var closings = hot('---^---x---x---x---x---x---|');
    var closingSubs =     '^              !         ';
    var expected =        'a---b---c---d--|         ';
    var a = cold(         '-3-4|                    ');
    var b = cold(             '-5-6|                ');
    var c = cold(                 '-7-8|            ');
    var d = cold(                     '-9-|         ');
    var expectedValues = { a: a, b: b, c: c, d: d };

    var result = source.window(closings);

    expectObservable(result).toBe(expected, expectedValues);
    expectSubscriptions(source.subscriptions).toBe(subs);
    expectSubscriptions(closings.subscriptions).toBe(closingSubs);
  });

  it('should handle basic case with window closings, but outer throws', function () {
    var source = hot('-1-2-^3-4-5-6-7-8-9-#         ');
    var subs =            '^              !         ';
    var closings = hot('---^---x---x---x---x---x---|');
    var closingSubs =     '^              !         ';
    var expected =        'a---b---c---d--#         ';
    var a = cold(         '-3-4|                    ');
    var b = cold(             '-5-6|                ');
    var c = cold(                 '-7-8|            ');
    var d = cold(                     '-9-#         ');
    var expectedValues = { a: a, b: b, c: c, d: d };

    var result = source.window(closings);

    expectObservable(result).toBe(expected, expectedValues);
    expectSubscriptions(source.subscriptions).toBe(subs);
    expectSubscriptions(closings.subscriptions).toBe(closingSubs);
  });

  it('should stop emitting windows when outer is unsubscribed early', function () {
    var source = hot('-1-2-^3-4-5-6-7-8-9-|         ');
    var subs =            '^       !                ';
    var closings = hot('---^---x---x---x---x---x---|');
    var closingSubs =     '^       !                ';
    var expected =        'a---b----                ';
    var a = cold(         '-3-4|                    ');
    var b = cold(             '-5-6                 ');
    var unsub =           '        !                ';
    var expectedValues = { a: a, b: b };

    var result = source.window(closings);

    expectObservable(result, unsub).toBe(expected, expectedValues);
    expectSubscriptions(source.subscriptions).toBe(subs);
    expectSubscriptions(closings.subscriptions).toBe(closingSubs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
    var source = hot('-1-2-^3-4-5-6-7-8-9-|         ');
    var subs =            '^       !                ';
    var closings = hot('---^---x---x---x---x---x---|');
    var closingSubs =     '^       !                ';
    var expected =        'a---b----                ';
    var a = cold(         '-3-4|                    ');
    var b = cold(             '-5-6-                ');
    var unsub =           '        !                ';
    var expectedValues = { a: a, b: b };

    var result = source
      .mergeMap(function (x) { return Observable.of(x); })
      .window(closings)
      .mergeMap(function (x) { return Observable.of(x); });

    expectObservable(result, unsub).toBe(expected, expectedValues);
    expectSubscriptions(source.subscriptions).toBe(subs);
    expectSubscriptions(closings.subscriptions).toBe(closingSubs);
  });

  it('should dispose window Subjects if the outer is unsubscribed early', function () {
    var source = hot('--a--b--c--d--e--f--g--h--|');
    var sourceSubs = '^        !                 ';
    var expected =   'x---------                 ';
    var x = cold(    '--a--b--c-                 ');
    var unsub =      '         !                 ';
    var late =  time('---------------|           ');
    var values = { x: x };

    var window;
    var result = source.window(Observable.never())
      .do(function (w) { window = w; });

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    rxTestScheduler.schedule(function () {
      expect(function () {
        window.subscribe();
      }).toThrow(new Rx.ObjectUnsubscribedError());
    }, late);
  });

  it('should make outer emit error when closing throws', function () {
    var source = hot('-1-2-^3-4-5-6-7-8-9-#');
    var subs =            '^   !           ';
    var closings = hot('---^---#           ');
    var closingSubs =     '^   !           ';
    var expected =        'a---#           ';
    var a = cold(         '-3-4#           ');
    var expectedValues = { a: a };

    var result = source.window(closings);

    expectObservable(result).toBe(expected, expectedValues);
    expectSubscriptions(source.subscriptions).toBe(subs);
    expectSubscriptions(closings.subscriptions).toBe(closingSubs);
  });

  it('should complete the resulting Observable when window closings completes', function () {
    var source = hot('-1-2-^3-4-5-6-7-8-9-|');
    var subs =            '^           !   ';
    var closings = hot('---^---x---x---|   ');
    var closingSubs =     '^           !   ';
    var expected =        'a---b---c---|   ';
    var a = cold(         '-3-4|           ');
    var b = cold(             '-5-6|       ');
    var c = cold(                 '-7-8|   ');
    var expectedValues = { a: a, b: b, c: c };

    var result = source.window(closings);

    expectObservable(result).toBe(expected, expectedValues);
    expectSubscriptions(source.subscriptions).toBe(subs);
    expectSubscriptions(closings.subscriptions).toBe(closingSubs);
  });
});