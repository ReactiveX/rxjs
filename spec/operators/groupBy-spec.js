/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;
var GroupedObservable = require('../../dist/cjs/operators/groupBy-support').GroupedObservable;

describe('Observable.prototype.groupBy()', function () {
  function reverseString(str) {
    return str.split('').reverse().join('');
  }

  function mapObject(obj, fn) {
    var out = {};
    for (var p in obj) {
      if (obj.hasOwnProperty(p)) {
        out[p] = fn(obj[p]);
      }
    }
    return out;
  }

  it('should group values', function (done) {
    var expectedGroups = [
      { key: 1, values: [1, 3] },
      { key: 0, values: [2] }
    ];

    Observable.of(1, 2, 3)
      .groupBy(function (x) { return x % 2; })
      .subscribe(function (g) {
        var expectedGroup = expectedGroups.shift();
        expect(g.key).toBe(expectedGroup.key);

        g.subscribe(function (x) {
          expect(x).toBe(expectedGroup.values.shift());
        });
      }, null, done);
  });

  it('should group values with an element selector', function (done) {
    var expectedGroups = [
      { key: 1, values: ['1!', '3!'] },
      { key: 0, values: ['2!'] }
    ];

    Observable.of(1, 2, 3)
      .groupBy(function (x) { return x % 2; }, function (x) { return x + '!'; })
      .subscribe(function (g) {
        var expectedGroup = expectedGroups.shift();
        expect(g.key).toBe(expectedGroup.key);

        g.subscribe(function (x) {
          expect(x).toBe(expectedGroup.values.shift());
        });
      }, null, done);
  });

  it('should group values with a duration selector', function (done) {
    var expectedGroups = [
      { key: 1, values: [1, 3] },
      { key: 0, values: [2, 4] },
      { key: 1, values: [5] },
      { key: 0, values: [6] }
    ];

    Observable.of(1, 2, 3, 4, 5, 6)
      .groupBy(
        function (x) { return x % 2; },
        function (x) { return x; },
        function (g) { return g.skip(1); })
      .subscribe(function (g) {
        var expectedGroup = expectedGroups.shift();
        expect(g.key).toBe(expectedGroup.key);

        g.subscribe(function (x) {
          expect(x).toBe(expectedGroup.values.shift());
        });
      }, null, done);
  });

  it('should group values with a key comparer', function () {
    var values = {
      a: '  foo',
      b: ' FoO ',
      c: 'baR  ',
      d: 'foO ',
      e: ' Baz   ',
      f: '  qux ',
      g: '   bar',
      h: ' BAR  ',
      i: 'FOO ',
      j: 'baz  ',
      k: ' bAZ ',
      l: '    fOo    '
    };
    var e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    var expected =      '--w---x---y-z-------------|';
    var w = cold(         'a-b---d---------i-----l-|', values);
    var x = cold(             'c-------g-h---------|', values);
    var y = cold(                 'e---------j-k---|', values);
    var z = cold(                   'f-------------|', values);
    var expectedValues = { w: w, x: x, y: y, z: z };

    var source = e1
      .groupBy(function (val) { return val.toLowerCase().trim(); });
    expectObservable(source).toBe(expected, expectedValues);
  });

  it('should emit GroupObservables', function () {
    var values = {
      a: '  foo',
      b: ' FoO '
    };
    var e1 = hot('-1--2--^-a-b----|', values);
    var expected =      '--g------|';
    var expectedValues = { g: 'foo' };

    var source = e1
      .groupBy(function (val) { return val.toLowerCase().trim(); })
      .do(function (group) {
        expect(group.key).toBe('foo');
        expect(group instanceof GroupedObservable).toBe(true);
      })
      .map(function (group) { return group.key; });
    expectObservable(source).toBe(expected, expectedValues);
  });

  it('should group values with a key comparer, assert GroupSubject key', function () {
    var values = {
      a: '  foo',
      b: ' FoO ',
      c: 'baR  ',
      d: 'foO ',
      e: ' Baz   ',
      f: '  qux ',
      g: '   bar',
      h: ' BAR  ',
      i: 'FOO ',
      j: 'baz  ',
      k: ' bAZ ',
      l: '    fOo    '
    };
    var e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    var expected =      '--w---x---y-z-------------|';
    var expectedValues = { w: 'foo', x: 'bar', y: 'baz', z: 'qux' };

    var source = e1
      .groupBy(function (val) { return val.toLowerCase().trim(); })
      .map(function (g) { return g.key; });
    expectObservable(source).toBe(expected, expectedValues);
  });

  it('should group values with a key comparer, but outer throws', function () {
    var values = {
      a: '  foo',
      b: ' FoO ',
      c: 'baR  ',
      d: 'foO ',
      e: ' Baz   ',
      f: '  qux ',
      g: '   bar',
      h: ' BAR  ',
      i: 'FOO ',
      j: 'baz  ',
      k: ' bAZ ',
      l: '    fOo    '
    };
    var e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-#', values);
    var expected =      '--w---x---y-z-------------#';
    var expectedValues = { w: 'foo', x: 'bar', y: 'baz', z: 'qux' };

    var source = e1
      .groupBy(function (x) { return x.toLowerCase().trim(); })
      .map(function (g) { return g.key; });
    expectObservable(source).toBe(expected, expectedValues);
  });

  it('should group values with a key comparer, inners propagate error from outer', function () {
    var values = {
      a: '  foo',
      b: ' FoO ',
      c: 'baR  ',
      d: 'foO ',
      e: ' Baz   ',
      f: '  qux ',
      g: '   bar',
      h: ' BAR  ',
      i: 'FOO ',
      j: 'baz  ',
      k: ' bAZ ',
      l: '    fOo    '
    };
    var e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-#', values);
    var expected =      '--w---x---y-z-------------#';
    var w = cold(         'a-b---d---------i-----l-#', values);
    var x = cold(             'c-------g-h---------#', values);
    var y = cold(                 'e---------j-k---#', values);
    var z = cold(                   'f-------------#', values);
    var expectedValues = { w: w, x: x, y: y, z: z };

    var source = e1
      .groupBy(function (val) { return val.toLowerCase().trim(); });
    expectObservable(source).toBe(expected, expectedValues);
  });

  it('should allow outer to be unsubscribed early', function () {
    var values = {
      a: '  foo',
      b: ' FoO ',
      c: 'baR  ',
      d: 'foO ',
      e: ' Baz   ',
      f: '  qux ',
      g: '   bar',
      h: ' BAR  ',
      i: 'FOO ',
      j: 'baz  ',
      k: ' bAZ ',
      l: '    fOo    '
    };
    var e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    var unsub =         '           !';
    var expected =      '--w---x---y-';
    var expectedValues = { w: 'foo', x: 'bar', y: 'baz' };

    var source = e1
      .groupBy(function (x) { return x.toLowerCase().trim(); })
      .map(function (group) { return group.key; });
    expectObservable(source, unsub).toBe(expected, expectedValues);
  });

  it('should group values with a key comparer, but comparer throws', function () {
    var values = {
      a: '  foo',
      b: ' FoO ',
      c: 'baR  ',
      d: 'foO ',
      e: ' Baz   ',
      f: '  qux ',
      g: '   bar',
      h: ' BAR  ',
      i: 'FOO ',
      j: 'baz  ',
      k: ' bAZ ',
      l: '    fOo    '
    };
    var e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    var expected =      '--w---x---y-z-------#';
    var w = cold(         'a-b---d---------i-#', values);
    var x = cold(             'c-------g-h---#', values);
    var y = cold(                 'e---------#', values);
    var z = cold(                   'f-------#', values);
    var expectedValues = { w: w, x: x, y: y, z: z };

    var invoked = 0;
    var source = e1
      .groupBy(function (val) {
        invoked++;
        if (invoked === 10) {
          throw 'error';
        }
        return val.toLowerCase().trim();
      });
    expectObservable(source).toBe(expected, expectedValues);
  });

  it('should group values with a key comparer and elementSelector, ' +
    'but elementSelector throws',
  function () {
    var values = {
      a: '  foo',
      b: ' FoO ',
      c: 'baR  ',
      d: 'foO ',
      e: ' Baz   ',
      f: '  qux ',
      g: '   bar',
      h: ' BAR  ',
      i: 'FOO ',
      j: 'baz  ',
      k: ' bAZ ',
      l: '    fOo    '
    };
    var reversedValues = mapObject(values, reverseString);
    var e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    var expected =      '--w---x---y-z-------#';
    var w = cold(         'a-b---d---------i-#', reversedValues);
    var x = cold(             'c-------g-h---#', reversedValues);
    var y = cold(                 'e---------#', reversedValues);
    var z = cold(                   'f-------#', reversedValues);
    var expectedValues = { w: w, x: x, y: y, z: z };

    var invoked = 0;
    var source = e1
      .groupBy(function (val) {
        return val.toLowerCase().trim();
      }, function (val) {
        invoked++;
        if (invoked === 10) {
          throw 'error';
        }
        return reverseString(val);
      });
    expectObservable(source).toBe(expected, expectedValues);
  });

  it('should allow the outer to be unsubscribed early but inners continue', function () {
    var values = {
      a: '  foo',
      b: ' FoO ',
      c: 'baR  ',
      d: 'foO ',
      e: ' Baz   ',
      f: '  qux ',
      g: '   bar',
      h: ' BAR  ',
      i: 'FOO ',
      j: 'baz  ',
      k: ' bAZ ',
      l: '    fOo    '
    };
    var e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    var unsub =         '         !';
    var expected =      '--w---x---';
    var w = cold(         'a-b---d---------i-----l-|', values);
    var x = cold(             'c-------g-h---------|', values);
    var expectedValues = { w: w, x: x };

    var source = e1
      .groupBy(function (val) { return val.toLowerCase().trim(); });
    expectObservable(source, unsub).toBe(expected, expectedValues);
  });

  it('should allow an inner to be unsubscribed early but other inners continue', function () {
    var values = {
      a: '  foo',
      b: ' FoO ',
      c: 'baR  ',
      d: 'foO ',
      e: ' Baz   ',
      f: '  qux ',
      g: '   bar',
      h: ' BAR  ',
      i: 'FOO ',
      j: 'baz  ',
      k: ' bAZ ',
      l: '    fOo    '
    };
    var e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    var expected =      '--w---x---y-z-------------|';
    var w =             '--a-b---d-';
    var unsubw =        '         !';
    var x =             '------c-------g-h---------|';
    var y =             '----------e---------j-k---|';
    var z =             '------------f-------------|';

    var expectedGroups = {
      w: Rx.TestScheduler.parseMarbles(w, values),
      x: Rx.TestScheduler.parseMarbles(x, values),
      y: Rx.TestScheduler.parseMarbles(y, values),
      z: Rx.TestScheduler.parseMarbles(z, values)
    };

    var fooUnsubscriptionFrame = Rx.TestScheduler.getUnsubscriptionFrame(unsubw);

    var source = e1
      .groupBy(function (val) {
        return val.toLowerCase().trim();
      })
      .map(function (group) {
        var arr = [];

        var subscription = group
          .materialize()
          .map(function (notification) {
            return { frame: rxTestScheduler.frame, notification: notification };
          })
          .subscribe(function (value) {
            arr.push(value);
          });

        if (group.key === 'foo') {
          rxTestScheduler.schedule(function () {
            subscription.unsubscribe();
          }, fooUnsubscriptionFrame - rxTestScheduler.frame);
        }
        return arr;
      });

    expectObservable(source).toBe(expected, expectedGroups);
  });

  it('should allow inners to be unsubscribed early at different times', function () {
    var values = {
      a: '  foo',
      b: ' FoO ',
      c: 'baR  ',
      d: 'foO ',
      e: ' Baz   ',
      f: '  qux ',
      g: '   bar',
      h: ' BAR  ',
      i: 'FOO ',
      j: 'baz  ',
      k: ' bAZ ',
      l: '    fOo    '
    };
    var e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    var expected =      '--w---x---y-z-------------|';
    var w =             '--a-b---d-';
    var unsubw =        '         !';
    var x =             '------c------';
    var unsubx =        '            !';
    var y =             '----------e------';
    var unsuby =        '                !';
    var z =             '------------f-------';
    var unsubz =        '                   !';

    var expectedGroups = {
      w: Rx.TestScheduler.parseMarbles(w, values),
      x: Rx.TestScheduler.parseMarbles(x, values),
      y: Rx.TestScheduler.parseMarbles(y, values),
      z: Rx.TestScheduler.parseMarbles(z, values)
    };

    var unsubscriptionFrames = {
      foo: Rx.TestScheduler.getUnsubscriptionFrame(unsubw),
      bar: Rx.TestScheduler.getUnsubscriptionFrame(unsubx),
      baz: Rx.TestScheduler.getUnsubscriptionFrame(unsuby),
      qux: Rx.TestScheduler.getUnsubscriptionFrame(unsubz)
    };

    var source = e1
      .groupBy(function (val) {
        return val.toLowerCase().trim();
      })
      .map(function (group) {
        var arr = [];

        var subscription = group
          .materialize()
          .map(function (notification) {
            return { frame: rxTestScheduler.frame, notification: notification };
          })
          .subscribe(function (value) {
            arr.push(value);
          });

        rxTestScheduler.schedule(function () {
          subscription.unsubscribe();
        }, unsubscriptionFrames[group.key] - rxTestScheduler.frame);
        return arr;
      });

    expectObservable(source).toBe(expected, expectedGroups);
  });

  it('should allow subscribing late to an inner Observable, outer completes', function () {
    var values = {
      a: '  foo',
      b: ' FoO ',
      d: 'foO ',
      i: 'FOO ',
      l: '    fOo    '
    };
    var e1 = hot(  '--a-b---d---------i-----l-|', values);
    var subs =     '^                         !';
    var expected = '----------------------------|';

    e1.groupBy(function (val) { return val.toLowerCase().trim(); })
      .subscribe(function (group) {
        rxTestScheduler.schedule(function () {
          expectObservable(group).toBe(expected);
        }, 260);
      });
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should allow subscribing late to an inner Observable, outer throws', function () {
    var values = {
      a: '  foo',
      b: ' FoO ',
      d: 'foO ',
      i: 'FOO ',
      l: '    fOo    '
    };
    var e1 = hot(  '--a-b---d---------i-----l-#', values);
    var subs =     '^                         !';
    var expected = '----------------------------#';

    e1.groupBy(function (val) { return val.toLowerCase().trim(); })
      .subscribe(function (group) {
        rxTestScheduler.schedule(function () {
          expectObservable(group).toBe(expected);
        }, 260);
      }, function () {});
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should allow subscribing late to inner, unsubscribe outer early', function () {
    var values = {
      a: '  foo',
      b: ' FoO ',
      d: 'foO ',
      i: 'FOO ',
      l: '    fOo    '
    };
    var e1 = hot(       '--a-b---d---------i-----l-#', values);
    var expectedOuter = '--w----------';
    var unsub =         '            !';
    var expectedInner = '-------------';
    var outerValues = { w: 'foo' };

    var source = e1
      .groupBy(function (val) { return val.toLowerCase().trim(); })
      .do(function (group) {
        rxTestScheduler.schedule(function () {
          expectObservable(group).toBe(expectedInner);
        }, 260);
      })
      .map(function (group) { return group.key; });

    expectObservable(source, unsub).toBe(expectedOuter, outerValues);
  });

  it('should allow using a keySelector, elementSelector, and durationSelector', function () {
    var values = {
      a: '  foo',
      b: ' FoO ',
      c: 'baR  ',
      d: 'foO ',
      e: ' Baz   ',
      f: '  qux ',
      g: '   bar',
      h: ' BAR  ',
      i: 'FOO ',
      j: 'baz  ',
      k: ' bAZ ',
      l: '    fOo    '
    };
    var reversedValues = mapObject(values, reverseString);
    var e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    var expected =      '--v---w---x-y-----z-------|';
    var v = cold(         'a-b---(d|)'               , reversedValues);
    var w = cold(             'c-------g-(h|)'       , reversedValues);
    var x = cold(                 'e---------j-(k|)' , reversedValues);
    var y = cold(                   'f-------------|', reversedValues);
    var z = cold(                         'i-----l-|', reversedValues);
    var expectedValues = { v: v, w: w, x: x, y: y, z: z };

    var source = e1
      .groupBy(
        function (val) { return val.toLowerCase().trim(); },
        function (val) { return reverseString(val); },
        function (group) { return group.skip(2); }
      );
    expectObservable(source).toBe(expected, expectedValues);
  });

  it('should allow using a keySelector and a durationSelector, outer throws', function () {
    var values = {
      a: '  foo',
      b: ' FoO ',
      c: 'baR  ',
      d: 'foO ',
      e: ' Baz   ',
      f: '  qux ',
      g: '   bar',
      h: ' BAR  ',
      i: 'FOO ',
      j: 'baz  ',
      k: ' bAZ ',
      l: '    fOo    '
    };
    var e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-#', values);
    var expected =      '--v---w---x-y-----z-------#';
    var v = cold(         'a-b---(d|)'               , values);
    var w = cold(             'c-------g-(h|)'       , values);
    var x = cold(                 'e---------j-(k|)' , values);
    var y = cold(                   'f-------------#', values);
    var z = cold(                         'i-----l-#', values);
    var expectedValues = { v: v, w: w, x: x, y: y, z: z };

    var source = e1
      .groupBy(
        function (val) { return val.toLowerCase().trim(); },
        function (val) { return val; },
        function (group) { return group.skip(2); }
      );
    expectObservable(source).toBe(expected, expectedValues);
  });

  it('should allow using a durationSelector, and outer unsubscribed early', function () {
    var values = {
      a: '  foo',
      b: ' FoO ',
      c: 'baR  ',
      d: 'foO ',
      e: ' Baz   ',
      f: '  qux ',
      g: '   bar',
      h: ' BAR  ',
      i: 'FOO ',
      j: 'baz  ',
      k: ' bAZ ',
      l: '    fOo    '
    };
    var e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    var unsub =         '           !';
    var expected =      '--v---w---x-';
    var v = cold(         'a-b---(d|)'               , values);
    var w = cold(             'c-------g-(h|)'       , values);
    var x = cold(                 'e---------j-(k|)' , values);
    var expectedValues = { v: v, w: w, x: x };

    var source = e1
      .groupBy(
        function (val) { return val.toLowerCase().trim(); },
        function (val) { return val; },
        function (group) { return group.skip(2); }
      );
    expectObservable(source, unsub).toBe(expected, expectedValues);
  });

  it('should allow using a durationSelector, outer and all inners unsubscribed early',
  function () {
    var values = {
      a: '  foo',
      b: ' FoO ',
      c: 'baR  ',
      d: 'foO ',
      e: ' Baz   ',
      f: '  qux ',
      g: '   bar',
      h: ' BAR  ',
      i: 'FOO ',
      j: 'baz  ',
      k: ' bAZ ',
      l: '    fOo    '
    };
    var e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    var unsub =         '           !';
    var expected =      '--v---w---x-';
    var v =             '--a-b---(d|)';
    var w =             '------c-----';
    var x =             '----------e-';

    var expectedGroups = {
      v: Rx.TestScheduler.parseMarbles(v, values),
      w: Rx.TestScheduler.parseMarbles(w, values),
      x: Rx.TestScheduler.parseMarbles(x, values)
    };

    var unsubscriptionFrame = Rx.TestScheduler
      .parseMarblesAsSubscriptions(unsub)
      .unsubscribedFrame;

    var source = e1
      .groupBy(
        function (val) { return val.toLowerCase().trim(); },
        function (val) { return val; },
        function (group) { return group.skip(2); }
      )
      .map(function (group) {
        var arr = [];

        var subscription = group
          .materialize()
          .map(function (notification) {
            return { frame: rxTestScheduler.frame, notification: notification };
          })
          .subscribe(function (value) {
            arr.push(value);
          });

        rxTestScheduler.schedule(function () {
          subscription.unsubscribe();
        }, unsubscriptionFrame - rxTestScheduler.frame);
        return arr;
      });

    expectObservable(source, unsub).toBe(expected, expectedGroups);
  });

  it('should allow using a durationSelector, but keySelector throws', function () {
    var values = {
      a: '  foo',
      b: ' FoO ',
      c: 'baR  ',
      d: 'foO ',
      e: ' Baz   ',
      f: '  qux ',
      g: '   bar',
      h: ' BAR  ',
      i: 'FOO ',
      j: 'baz  ',
      k: ' bAZ ',
      l: '    fOo    '
    };
    var e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    var expected =      '--v---w---x-y-----z-#'      ;
    var v = cold(         'a-b---(d|)'               , values);
    var w = cold(             'c-------g-(h|)'       , values);
    var x = cold(                 'e---------#'      , values);
    var y = cold(                   'f-------#'      , values);
    var z = cold(                         'i-#'      , values);
    var expectedValues = { v: v, w: w, x: x, y: y, z: z };

    var invoked = 0;
    var source = e1
      .groupBy(
        function (val) {
          invoked++;
          if (invoked === 10) {
            throw 'error';
          }
          return val.toLowerCase().trim();
        },
        function (val) { return val; },
        function (group) { return group.skip(2); }
      );
    expectObservable(source).toBe(expected, expectedValues);
  });

  it('should allow using a durationSelector, but elementSelector throws', function () {
    var values = {
      a: '  foo',
      b: ' FoO ',
      c: 'baR  ',
      d: 'foO ',
      e: ' Baz   ',
      f: '  qux ',
      g: '   bar',
      h: ' BAR  ',
      i: 'FOO ',
      j: 'baz  ',
      k: ' bAZ ',
      l: '    fOo    '
    };
    var e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    var expected =      '--v---w---x-y-----z-#'      ;
    var v = cold(         'a-b---(d|)'               , values);
    var w = cold(             'c-------g-(h|)'       , values);
    var x = cold(                 'e---------#'      , values);
    var y = cold(                   'f-------#'      , values);
    var z = cold(                         'i-#'      , values);
    var expectedValues = { v: v, w: w, x: x, y: y, z: z };

    var invoked = 0;
    var source = e1
      .groupBy(
        function (val) { return val.toLowerCase().trim(); },
        function (val) {
          invoked++;
          if (invoked === 10) {
            throw 'error';
          }
          return val;
        },
        function (group) { return group.skip(2); }
      );
    expectObservable(source).toBe(expected, expectedValues);
  });

  it('should allow using a durationSelector which eventually throws', function () {
    var values = {
      a: '  foo',
      b: ' FoO ',
      c: 'baR  ',
      d: 'foO ',
      e: ' Baz   ',
      f: '  qux ',
      g: '   bar',
      h: ' BAR  ',
      i: 'FOO ',
      j: 'baz  ',
      k: ' bAZ ',
      l: '    fOo    '
    };
    var e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    var expected =      '--v---w---x-#'              ;
    var v = cold(         'a-b---(d|)'               , values);
    var w = cold(             'c-----#'              , values);
    var x = cold(                 'e-#'              , values);
    var y = cold(                   '#'              , values);
    var expectedValues = { v: v, w: w, x: x, y: y };

    var invoked = 0;
    var source = e1
      .groupBy(
        function (val) { return val.toLowerCase().trim(); },
        function (val) { return val; },
        function (group) {
          invoked++;
          if (invoked === 4) {
            throw 'error';
          }
          return group.skip(2);
        }
      );
    expectObservable(source).toBe(expected, expectedValues);
  });

  it('should allow an inner to be unsubscribed early but other inners continue, ' +
  'with durationSelector', function () {
    var values = {
      a: '  foo',
      b: ' FoO ',
      c: 'baR  ',
      d: 'foO ',
      e: ' Baz   ',
      f: '  qux ',
      g: '   bar',
      h: ' BAR  ',
      i: 'FOO ',
      j: 'baz  ',
      k: ' bAZ ',
      l: '    fOo    '
    };
    var reversedValues = mapObject(values, reverseString);
    var e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    var expected =      '--v---w---x-y-----z-------|';
    var v =             '--a-b---'                   ;
    var unsubv =        '       !';
    var w =             '------c-------g-(h|)'       ;
    var x =             '----------e---------j-(k|)' ;
    var y =             '------------f-------------|';
    var z =             '------------------i-----l-|';

    var expectedGroups = {
      v: Rx.TestScheduler.parseMarbles(v, reversedValues),
      w: Rx.TestScheduler.parseMarbles(w, reversedValues),
      x: Rx.TestScheduler.parseMarbles(x, reversedValues),
      y: Rx.TestScheduler.parseMarbles(y, reversedValues),
      z: Rx.TestScheduler.parseMarbles(z, reversedValues)
    };

    var fooUnsubscriptionFrame = Rx.TestScheduler
      .parseMarblesAsSubscriptions(unsubv)
      .unsubscribedFrame;

    var source = e1
      .groupBy(
        function (val) { return val.toLowerCase().trim(); },
        function (val) { return reverseString(val); },
        function (group) { return group.skip(2); }
      )
      .map(function (group, index) {
        var arr = [];

        var subscription = group
          .materialize()
          .map(function (notification) {
            return { frame: rxTestScheduler.frame, notification: notification };
          })
          .subscribe(function (value) {
            arr.push(value);
          });

        if (group.key === 'foo' && index === 0) {
          rxTestScheduler.schedule(function () {
            subscription.unsubscribe();
          }, fooUnsubscriptionFrame - rxTestScheduler.frame);
        }
        return arr;
      });
    expectObservable(source).toBe(expected, expectedGroups);
  });

  it('should allow inners to be unsubscribed early at different times, with durationSelector',
  function () {
    var values = {
      a: '  foo',
      b: ' FoO ',
      c: 'baR  ',
      d: 'foO ',
      e: ' Baz   ',
      f: '  qux ',
      g: '   bar',
      h: ' BAR  ',
      i: 'FOO ',
      j: 'baz  ',
      k: ' bAZ ',
      l: '    fOo    '
    };
    var e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    var expected =      '--v---w---x-y-----z-------|';
    var v =             '--a-b---'                   ;
    var unsubv =        '       !'                   ;
    var w =             '------c---'                 ;
    var unsubw =        '         !'                 ;
    var x =             '----------e---------j-'     ;
    var unsubx =        '                     !'     ;
    var y =             '------------f----'          ;
    var unsuby =        '                !'          ;
    var z =             '------------------i----'    ;
    var unsubz =        '                      !'    ;

    var expectedGroups = {
      v: Rx.TestScheduler.parseMarbles(v, values),
      w: Rx.TestScheduler.parseMarbles(w, values),
      x: Rx.TestScheduler.parseMarbles(x, values),
      y: Rx.TestScheduler.parseMarbles(y, values),
      z: Rx.TestScheduler.parseMarbles(z, values)
    };

    var unsubscriptionFrames = {
      foo: Rx.TestScheduler.parseMarblesAsSubscriptions(unsubv).unsubscribedFrame,
      bar: Rx.TestScheduler.parseMarblesAsSubscriptions(unsubw).unsubscribedFrame,
      baz: Rx.TestScheduler.parseMarblesAsSubscriptions(unsubx).unsubscribedFrame,
      qux: Rx.TestScheduler.parseMarblesAsSubscriptions(unsuby).unsubscribedFrame,
      foo2: Rx.TestScheduler.parseMarblesAsSubscriptions(unsubz).unsubscribedFrame
    };
    var hasUnsubscribed = {};

    var source = e1
      .groupBy(
        function (val) { return val.toLowerCase().trim(); },
        function (val) { return val; },
        function (group) { return group.skip(2); }
      )
      .map(function (group) {
        var arr = [];

        var subscription = group
          .materialize()
          .map(function (notification) {
            return { frame: rxTestScheduler.frame, notification: notification };
          })
          .subscribe(function (value) {
            arr.push(value);
          });

        var unsubscriptionFrame = hasUnsubscribed[group.key] ?
          unsubscriptionFrames[group.key + '2'] :
          unsubscriptionFrames[group.key];
        rxTestScheduler.schedule(function () {
          subscription.unsubscribe();
          hasUnsubscribed[group.key] = true;
        }, unsubscriptionFrame - rxTestScheduler.frame);
        return arr;
      });

    expectObservable(source).toBe(expected, expectedGroups);
  });

  it('should return inners that when subscribed late exhibit hot behavior', function () {
    var values = {
      a: '  foo',
      b: ' FoO ',
      c: 'baR  ',
      d: 'foO ',
      e: ' Baz   ',
      f: '  qux ',
      g: '   bar',
      h: ' BAR  ',
      i: 'FOO ',
      j: 'baz  ',
      k: ' bAZ ',
      l: '    fOo    '
    };
    var e1 = hot('-1--2--^-a-b-c-d-e-f-g-h-i-j-k-l-|', values);
    var expected =      '--v---w---x-y-----z-------|';
    var subv =          '       ^                   ';
    var v =             '--------(d|)'               ;
    var subw =          '               ^           ';
    var w =             '----------------(h|)'       ;
    var subx =          '                     ^     ';
    var x =             '----------------------(k|)' ;
    var suby =          '                              ^';
    var y =             '------------------------------|';
    var subz =          '                                ^';
    var z =             '--------------------------------|';

    var expectedGroups = {
      v: Rx.TestScheduler.parseMarbles(v, values),
      w: Rx.TestScheduler.parseMarbles(w, values),
      x: Rx.TestScheduler.parseMarbles(x, values),
      y: Rx.TestScheduler.parseMarbles(y, values),
      z: Rx.TestScheduler.parseMarbles(z, values)
    };

    var subscriptionFrames = {
      foo: Rx.TestScheduler.parseMarblesAsSubscriptions(subv).subscribedFrame,
      bar: Rx.TestScheduler.parseMarblesAsSubscriptions(subw).subscribedFrame,
      baz: Rx.TestScheduler.parseMarblesAsSubscriptions(subx).subscribedFrame,
      qux: Rx.TestScheduler.parseMarblesAsSubscriptions(suby).subscribedFrame,
      foo2: Rx.TestScheduler.parseMarblesAsSubscriptions(subz).subscribedFrame
    };
    var hasSubscribed = {};

    var source = e1
      .groupBy(
      function (val) { return val.toLowerCase().trim(); },
      function (val) { return val; },
      function (group) { return group.skip(2); }
    )
      .map(function (group) {
        var arr = [];

        var subscriptionFrame = hasSubscribed[group.key] ?
          subscriptionFrames[group.key + '2'] :
          subscriptionFrames[group.key];

        rxTestScheduler.schedule(function () {
          group
            .materialize()
            .map(function (notification) {
              return { frame: rxTestScheduler.frame, notification: notification };
            })
            .subscribe(function (value) {
              arr.push(value);
            });
          hasSubscribed[group.key] = true;
        }, subscriptionFrame - rxTestScheduler.frame);

        return arr;
      });

    expectObservable(source).toBe(expected, expectedGroups);
  });

  it('should return inner group that when subscribed late emits complete()', function () {
    var values = {
      a: '  foo',
      b: ' FoO ',
      d: 'foO ',
      i: 'FOO ',
      l: '    fOo    '
    };
    var e1 = hot('-1--2--^-a-b---d---------i-----l-|', values);
    var expected =      '--g-----------------------|';
    var innerSub =      '                                ^';
    var g =             '--------------------------------|';

    var expectedGroups = {
      g: Rx.TestScheduler.parseMarbles(g, values)
    };

    var innerSubscriptionFrame = Rx.TestScheduler
      .parseMarblesAsSubscriptions(innerSub)
      .subscribedFrame;

    var source = e1
      .groupBy(
        function (val) { return val.toLowerCase().trim(); },
        function (val) { return val; },
        function (group) { return group.skip(7); }
      )
      .map(function (group) {
        var arr = [];

        rxTestScheduler.schedule(function () {
          group
            .materialize()
            .map(function (notification) {
              return { frame: rxTestScheduler.frame, notification: notification };
            })
            .subscribe(function (value) {
              arr.push(value);
            });
        }, innerSubscriptionFrame - rxTestScheduler.frame);

        return arr;
      });

    expectObservable(source).toBe(expected, expectedGroups);
  });

  it('should return inner group that when subscribed late emits error()', function () {
    var values = {
      a: '  foo',
      b: ' FoO ',
      d: 'foO ',
      i: 'FOO ',
      l: '    fOo    '
    };
    var e1 = hot('-1--2--^-a-b---d---------i-----l-#', values);
    var expected =      '--g-----------------------#';
    var innerSub =      '                                ^';
    var g =             '--------------------------------#';

    var expectedGroups = {
      g: Rx.TestScheduler.parseMarbles(g, values)
    };

    var innerSubscriptionFrame = Rx.TestScheduler
      .parseMarblesAsSubscriptions(innerSub)
      .subscribedFrame;

    var source = e1
      .groupBy(
        function (val) { return val.toLowerCase().trim(); },
        function (val) { return val; },
        function (group) { return group.skip(7); }
      )
      .map(function (group) {
        var arr = [];

        rxTestScheduler.schedule(function () {
          group
            .materialize()
            .map(function (notification) {
              return { frame: rxTestScheduler.frame, notification: notification };
            })
            .subscribe(function (value) {
              arr.push(value);
            });
        }, innerSubscriptionFrame - rxTestScheduler.frame);

        return arr;
      });

    expectObservable(source).toBe(expected, expectedGroups);
  });

  it('should return inner that does not throw when faulty outer is unsubscribed early',
  function () {
    var values = {
      a: '  foo',
      b: ' FoO ',
      d: 'foO ',
      i: 'FOO ',
      l: '    fOo    '
    };
    var e1 = hot('-1--2--^-a-b---d---------i-----l-#', values);
    var unsub =         '      !';
    var expectedSubs =  '^     !';
    var expected =      '--g----';
    var innerSub =      '                                ^';
    var g =                                             '-';

    var expectedGroups = {
      g: Rx.TestScheduler.parseMarbles(g, values)
    };

    var innerSubscriptionFrame = Rx.TestScheduler
      .parseMarblesAsSubscriptions(innerSub)
      .subscribedFrame;

    var source = e1
      .groupBy(
        function (val) { return val.toLowerCase().trim(); },
        function (val) { return val; },
        function (group) { return group.skip(7); }
      )
      .map(function (group) {
        var arr = [];

        rxTestScheduler.schedule(function () {
          group
            .materialize()
            .map(function (notification) {
              return { frame: rxTestScheduler.frame, notification: notification };
            })
            .subscribe(function (value) {
              arr.push(value);
            });
        }, innerSubscriptionFrame - rxTestScheduler.frame);

        return arr;
      });

    expectObservable(source, unsub).toBe(expected, expectedGroups);
    expectSubscriptions(e1.subscriptions).toBe(expectedSubs);
  });
});