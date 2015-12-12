/* globals describe, it, expect, expectObservable, expectSubscriptions, cold, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.pairwise()', function () {
  it('should pairwise things', function () {
    var e1 = hot('--a--^--b--c--d--e--f--g--|');
    var e1subs =      '^                    !';
    var expected =    '------v--w--x--y--z--|';

    var values = {
      v: ['b', 'c'],
      w: ['c', 'd'],
      x: ['d', 'e'],
      y: ['e', 'f'],
      z: ['f', 'g']
    };

    var source = e1.pairwise();

    expectObservable(source).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not emit on single-element streams', function () {
    var e1 = hot('-----^--b----|');
    var e1subs =      '^       !';
    var expected =    '--------|';

    var values = {
    };

    var source = e1.pairwise();

    expectObservable(source).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle mid-stream throw', function () {
    var e1 = hot('--a--^--b--c--d--e--#');
    var e1subs =      '^              !';
    var expected =    '------v--w--x--#';

    var values = {
      v: ['b', 'c'],
      w: ['c', 'd'],
      x: ['d', 'e']
    };

    var source = e1.pairwise();

    expectObservable(source).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle empty', function () {
    var e1 =  cold('|');
    var e1subs =   '(^!)';
    var expected = '|';

    var source = e1.pairwise();

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle never', function () {
    var e1 =  cold('-');
    var e1subs =   '^';
    var expected = '-';

    var source = e1.pairwise();

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle throw', function () {
    var e1 =  cold('#');
    var e1subs =   '(^!)';
    var expected = '#';

    var source = e1.pairwise();

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
