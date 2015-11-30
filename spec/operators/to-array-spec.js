/* globals describe, it, expect, expectObservable, expectSubscriptions, cold, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('toArray', function () {
  it('should be never when source is never', function () {
    var e1 =  cold('-');
    var e1subs =   '^';
    var expected = '-';

    expectObservable(e1.toArray()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should be never when source is empty', function () {
    var e1 =  cold('|');
    var e1subs =   '(^!)';
    var expected = '(w|)';

    expectObservable(e1.toArray()).toBe(expected, { w: [] });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should be never when source doesn\'t complete', function () {
    var e1 = hot('--x--^--y--');
    var e1subs =      '^     ';
    var expected =    '------';

    expectObservable(e1.toArray()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should reduce observable without values into an array of length zero', function () {
    var e1 = hot('-x-^---|');
    var e1subs =    '^   !';
    var expected =  '----(w|)';

    expectObservable(e1.toArray()).toBe(expected, { w: [] });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should reduce the a single value of an observable into an array', function () {
    var e1 = hot('-x-^--y--|');
    var e1subs =    '^     !';
    var expected =  '------(w|)';

    expectObservable(e1.toArray()).toBe(expected, { w: ['y'] });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should reduce the values of an observable into an array', function () {
    var e1 = hot('-x-^--y--z--|');
    var e1subs =    '^        !';
    var expected =  '---------(w|)';

    expectObservable(e1.toArray()).toBe(expected, { w: ['y', 'z'] });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing explicitly and early', function () {
    var e1 =   hot('--a--b----c-----d----e---|');
    var unsub =    '        !                 ';
    var e1subs =   '^       !                 ';
    var expected = '---------                 ';

    expectObservable(e1.toArray(), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should work with error', function () {
    var e1 = hot('-x-^--y--z--#', { x: 1, y: 2, z: 3 }, 'too bad');
    var e1subs =    '^        !';
    var expected =  '---------#';

    expectObservable(e1.toArray()).toBe(expected, null, 'too bad');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should work with throw', function () {
    var e1 =  cold('#');
    var e1subs =   '(^!)';
    var expected = '#';

    expectObservable(e1.toArray()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
