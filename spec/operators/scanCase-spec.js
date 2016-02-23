/* globals describe, it, fit, expect, expectObservable, expectSubscriptions, cold, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.scanCase()', function () {
  var concatSelect = function () {
    return 'concat';
  };

  var addSelect = function () {
    return 'add';
  };

  var strategy = {
    concat: function (acc, x) {
      return [].concat(acc, x);
    },
    add: function (acc, x) {
      return acc + x;
    },
    addVal: function (acc, x) {
      return acc + x.value;
    },
    subtract: function (acc, x) {
      return acc - x.value | x;
    },
    throw: function () {
      throw 'bad!';
    }
  };

  it.asDiagram(
    'scanCase((curr) => curr.op,' +
    '{ add: (acc, curr) => acc + curr.value, substract: (acc, curr) => acc - curr.value },' +
    '0)')('should scanCase', function () {
      var values = {
        a: { op: 'addVal', value: 1 }, b: { op: 'addVal', value: 3 }, c: { op: 'subtract', value: 2 },
        x: 1, y: 4, z: 2
      };
      var e1 =        hot('--a--b--c|', values);
      var e1subs =        '^        !';
      var expected = '--x--y--z|';

      var select = function (v) {
        return v.op;
      };

      expectObservable(e1.scanCase(select, strategy, 0)).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });

  it('shoud scanCase things', function () {
    var e1 = hot('--a--^--b--c--d--e--f--g--|');
    var e1subs =      '^                    !';
    var expected =    '---u--v--w--x--y--z--|';

    var values = {
      u: ['b'],
      v: ['b', 'c'],
      w: ['b', 'c', 'd'],
      x: ['b', 'c', 'd', 'e'],
      y: ['b', 'c', 'd', 'e', 'f'],
      z: ['b', 'c', 'd', 'e', 'f', 'g']
    };

    var source = e1.scanCase(concatSelect, strategy, []);

    expectObservable(source).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should scanCase without seed', function () {
    var e1 = hot('--a--^--b--c--d--|');
    var e1subs =      '^           !';
    var expected =    '---x--y--z--|';

    var values = {
      x: 'b',
      y: 'bc',
      z: 'bcd'
    };

    var source = e1.scanCase(addSelect, strategy);

    expectObservable(source).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle errors', function () {
    var e1 = hot('--a--^--b--c--d--#');
    var e1subs =      '^           !';
    var expected =    '---u--v--w--#';

    var values = {
      u: ['b'],
      v: ['b', 'c'],
      w: ['b', 'c', 'd']
    };

    var source = e1.scanCase(concatSelect, strategy, []);

    expectObservable(source).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle errors in the accumation functions', function () {
    var e1 = hot('--a--^--b--c--d--e--f--g--|');
    var e1subs =      '^        !            ';
    var expected =    '---u--v--#            ';

    var values = {
      u: ['b'],
      v: ['b', 'c'],
      w: ['b', 'c', 'd'],
      x: ['b', 'c', 'd', 'e'],
      y: ['b', 'c', 'd', 'e', 'f'],
      z: ['b', 'c', 'd', 'e', 'f', 'g']
    };

    var source = e1.scanCase(function (x) {
      return x === 'd' ? 'throw' : 'concat';
    }, strategy, []);

    expectObservable(source).toBe(expected, values, 'bad!');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle errors in the select function', function () {
    var e1 = hot('--a--^--b--c--d--e--f--g--|');
    var e1subs =      '^        !            ';
    var expected =    '---u--v--#            ';

    var values = {
      u: ['b'],
      v: ['b', 'c'],
      w: ['b', 'c', 'd'],
      x: ['b', 'c', 'd', 'e'],
      y: ['b', 'c', 'd', 'e', 'f'],
      z: ['b', 'c', 'd', 'e', 'f', 'g']
    };

    var source = e1.scanCase(function (x) {
      if (x === 'd') {
        throw 'bad!';
      }
      return 'concat';
    }, strategy, []);

    expectObservable(source).toBe(expected, values, 'bad!');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('handle missing accumulator', function () {
    var e1 = hot('--a--^--b--c--d--|');
    var e1subs =      '^           !';
    var expected =    '---x--y--z--|';

    var values = {
      x: 'b',
      y: 'b',
      z: 'bd'
    };

    var source = e1.scanCase(function (x) {
      return x === 'c' ? 'missing' : 'add';
    }, strategy);

    expectObservable(source).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('handle empty', function () {
    var e1 =  cold('|');
    var e1subs =   '(^!)';
    var expected = '|';

    var source = e1.scanCase(concatSelect, strategy, []);

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('handle never', function () {
    var e1 =  cold('-');
    var e1subs =   '^';
    var expected = '-';

    var source = e1.scanCase(concatSelect, strategy, []);

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('handle throw', function () {
    var e1 =  cold('#');
    var e1subs =   '(^!)';
    var expected = '#';

    var source = e1.scanCase(concatSelect, strategy, []);

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing explicitly and early', function () {
    var e1 = hot('--a--^--b--c--d--e--f--g--|');
    var unsub =       '              !       ';
    var e1subs =      '^             !       ';
    var expected =    '---u--v--w--x--       ';
    var values = {
      u: ['b'],
      v: ['b', 'c'],
      w: ['b', 'c', 'd'],
      x: ['b', 'c', 'd', 'e'],
      y: ['b', 'c', 'd', 'e', 'f'],
      z: ['b', 'c', 'd', 'e', 'f', 'g']
    };

    var source = e1.scanCase(concatSelect, strategy, []);

    expectObservable(source, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
    var e1 = hot('--a--^--b--c--d--e--f--g--|');
    var e1subs =      '^             !       ';
    var expected =    '---u--v--w--x--       ';
    var unsub =       '              !       ';
    var values = {
      u: ['b'],
      v: ['b', 'c'],
      w: ['b', 'c', 'd'],
      x: ['b', 'c', 'd', 'e'],
      y: ['b', 'c', 'd', 'e', 'f'],
      z: ['b', 'c', 'd', 'e', 'f', 'g']
    };

    var source = e1
      .mergeMap(function (x) { return Observable.of(x); })
      .scanCase(concatSelect, strategy, [])
      .mergeMap(function (x) { return Observable.of(x); });

    expectObservable(source, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
