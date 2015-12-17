/* globals describe, it, expect, hot, cold, expectObservable, expectSubscriptions */
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;

describe('Observable.prototype.windowCount', function () {
  it.asDiagram('windowCount(3)')('should emit windows with count 3, no skip specified', function () {
    var source =   hot('---a---b---c---d---e---f---g---h---i---|');
    var sourceSubs =   '^                                      !';
    var expected =     'x----------y-----------z-----------w---|';
    var x = cold(      '---a---b---(c|)                         ');
    var y = cold(                 '----d---e---(f|)             ');
    var z = cold(                             '----g---h---(i|) ');
    var w = cold(                                         '----|');
    var expectedValues = { x: x, y: y, z: z, w: w };

    var result = source.windowCount(3);

    expectObservable(result).toBe(expected, expectedValues);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should emit windows with count 2 and skip 1', function () {
    var source = hot('^-a--b--c--d--|');
    var subs =       '^             !';
    var expected =   'u-v--x--y--z--|';
    var u = cold(    '--a--(b|)      ');
    var v = cold(      '---b--(c|)   ');
    var x = cold(         '---c--(d|)');
    var y = cold(            '---d--|');
    var z = cold(               '---|');
    var values = { u: u, v: v, x: x, y: y, z: z };

    var result = source.windowCount(2, 1);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should emit windows with count 2, and skip unspecified', function () {
    var source = hot('--a--b--c--d--e--f--|');
    var subs =       '^                   !';
    var expected =   'x----y-----z-----w--|';
    var x = cold(    '--a--(b|)            ');
    var y = cold(         '---c--(d|)      ');
    var z = cold(               '---e--(f|)');
    var w = cold(                     '---|');
    var values = { x: x, y: y, z: z, w: w };

    var result = source.windowCount(2);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return empty if source is empty', function () {
    var source = cold('|');
    var subs =        '(^!)';
    var expected =    '(w|)';
    var w =      cold('|');
    var values = { w: w };

    var result = source.windowCount(2, 1);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return Never if source if Never', function () {
    var source = cold('-');
    var subs =        '^';
    var expected =    'w';
    var w =      cold('-');
    var expectedValues = { w: w };

    var result = source.windowCount(2, 1);

    expectObservable(result).toBe(expected, expectedValues);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should propagate error from a just-throw source', function () {
    var source =   cold('#');
    var subs =          '(^!)';
    var expected =      '(w#)';
    var w =        cold('#');
    var expectedValues = { w: w };

    var result = source.windowCount(2, 1);

    expectObservable(result).toBe(expected, expectedValues);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should raise error if source raises error', function () {
    var source = hot('--a--b--c--d--e--f--#');
    var subs =       '^                   !';
    var expected =   'u-v--w--x--y--z--q--#';
    var u = cold(    '--a--b--(c|)         ');
    var v = cold(      '---b--c--(d|)      ');
    var w = cold(         '---c--d--(e|)   ');
    var x = cold(            '---d--e--(f|)');
    var y = cold(               '---e--f--#');
    var z = cold(                  '---f--#');
    var q = cold(                     '---#');
    var values = { u: u, v: v, w: w, x: x, y: y, z: z, q: q };

    var result = source.windowCount(3, 1);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should dispose of inner windows once outer is unsubscribed early', function () {
    var source = hot('^-a--b--c--d--|');
    var subs =       '^        !     ';
    var expected =   'w-x--y--z-     ';
    var w = cold(    '--a--(b|)      ');
    var x = cold(      '---b--(c|)   ');
    var y = cold(         '---c-     ');
    var z = cold(            '--     ');
    var unsub =      '         !     ';
    var values = { w: w, x: x, y: y, z: z };

    var result = source.windowCount(2, 1);

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(subs);
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
    var result = source.windowCount(10, 10)
      .do(function (w) { window = w; });

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    rxTestScheduler.schedule(function () {
      expect(function () {
        window.subscribe();
      }).toThrowError('Cannot subscribe to a disposed Subject.');
    }, late);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
    var source = hot('^-a--b--c--d--|');
    var subs =       '^        !     ';
    var expected =   'w-x--y--z-     ';
    var w = cold(    '--a--(b|)      ');
    var x = cold(      '---b--(c|)   ');
    var y = cold(         '---c-     ');
    var z = cold(            '--     ');
    var unsub =      '         !     ';
    var values = { w: w, x: x, y: y, z: z };

    var result = source
      .mergeMap(function (i) { return Observable.of(i); })
      .windowCount(2, 1)
      .mergeMap(function (i) { return Observable.of(i); });

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });
});