/* globals describe, it, expect, expectObservable, expectSubscriptions, hot, cold, Symbol */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var immediateScheduler = Rx.Scheduler.immediate;

describe('Observable.zip', function () {
  it('should combine a source with a second', function () {
    var a =    hot('---1---2---3---');
    var asubs =    '^';
    var b =    hot('--4--5--6--7--8--');
    var bsubs =    '^';
    var expected = '---x---y---z';

    expectObservable(Observable.zip(a, b))
      .toBe(expected, { x: ['1', '4'], y: ['2', '5'], z: ['3', '6'] });
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should zip the provided observables', function (done) {
    var expected = ['a1', 'b2', 'c3'];
    var i = 0;

    Observable.zip(
      Observable.fromArray(['a','b','c']),
      Observable.fromArray([1,2,3]),
      function (a, b) {
        return a + b;
      }
    )
    .subscribe(function (x) {
      expect(x).toBe(expected[i++]);
    }, null, done);
  });

  it('should end once one observable completes and its buffer is empty', function () {
    var e1 =   hot('---a--b--c--|               ');
    var e1subs =   '^           !               ';
    var e2 =   hot('------d----e----f--------|  ');
    var e2subs =   '^                 !         ';
    var e3 =   hot('--------h----i----j---------'); // doesn't complete
    var e3subs =   '^                 !         ';
    var expected = '--------x----y----(z|)      '; // e1 complete and buffer empty
    var values = {
      x: ['a','d','h'],
      y: ['b','e','i'],
      z: ['c','f','j']
    };

    expectObservable(Observable.zip(e1,e2,e3)).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should end once one observable nexts and zips value from completed other ' +
  'observable whose buffer is empty', function () {
    var e1 =   hot('---a--b--c--|             ');
    var e1subs =   '^           !             ';
    var e2 =   hot('------d----e----f|        ');
    var e2subs =   '^                !        ';
    var e3 =   hot('--------h----i----j-------'); // doesn't complete
    var e3subs =   '^                 !       ';
    var expected = '--------x----y----(z|)    '; // e2 buffer empty and signaled complete
    var values = {
      x: ['a','d','h'],
      y: ['b','e','i'],
      z: ['c','f','j']
    };

    expectObservable(Observable.zip(e1,e2,e3)).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  describe('with iterables', function () {
    it('should zip them with values', function () {
      var myIterator = {
        count: 0,
        next: function () {
          return { value: this.count++, done: false };
        }
      };
      myIterator[Symbol.iterator] = function () { return this; };

      var e1 =   hot('---a---b---c---d---|');
      var e1subs =   '^                  !';
      var expected = '---w---x---y---z---|';

      var values = {
        w: ['a', 0],
        x: ['b', 1],
        y: ['c', 2],
        z: ['d', 3]
      };

      expectObservable(Observable.zip(e1, myIterator)).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });

    it('should only call `next` as needed', function () {
      var nextCalled = 0;
      var myIterator = {
        count: 0,
        next: function () {
          nextCalled++;
          return { value: this.count++, done: false };
        }
      };
      myIterator[Symbol.iterator] = function () { return this; };

      Observable.zip(Observable.of(1,2,3), myIterator)
        .subscribe();

      // since zip will call `next()` in advance, total calls when
      // zipped with 3 other values should be 4.
      expect(nextCalled).toBe(4);
    });

    it('should work with never observable and empty iterable', function () {
      var a = cold(  '-');
      var asubs =    '^';
      var b = [];
      var expected = '-';

      expectObservable(Observable.zip(a,b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });

    it('should work with empty observable and empty iterable', function () {
      var a = cold('|');
      var asubs = '(^!)';
      var b = [];
      var expected = '|';

      expectObservable(Observable.zip(a,b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });

    it('should work with empty observable and non-empty iterable', function () {
      var a = cold('|');
      var asubs = '(^!)';
      var b = [1];
      var expected = '|';

      expectObservable(Observable.zip(a,b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });

    it('should work with non-empty observable and empty iterable', function () {
      var a = hot('---^----a--|');
      var asubs =    '^       !';
      var b = [];
      var expected = '--------|';

      expectObservable(Observable.zip(a,b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });

    it('should work with never observable and non-empty iterable', function () {
      var a = cold('-');
      var asubs = '^';
      var b = [1];
      var expected = '-';

      expectObservable(Observable.zip(a,b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });

    it('should work with non-empty observable and non-empty iterable', function () {
      var a = hot('---^----1--|');
      var asubs =    '^    !   ';
      var b = [2];
      var expected = '-----(x|)';

      expectObservable(Observable.zip(a,b)).toBe(expected, { x: ['1', 2] });
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });

    it('should work with non-empty observable and empty iterable', function () {
      var a = hot('---^----#--|');
      var asubs =    '^    !   ';
      var b = [];
      var expected = '-----#   ';

      expectObservable(Observable.zip(a,b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });

    it('should work with observable which raises error and non-empty iterable', function () {
      var a = hot('---^----#--|');
      var asubs =    '^    !   ';
      var b = [1];
      var expected = '-----#   ';

      expectObservable(Observable.zip(a,b)).toBe(expected);
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });

    it('should work with non-empty many observable and non-empty many iterable', function () {
      var a = hot('---^--1--2--3--|');
      var asubs =    '^        !   ';
      var b = [4, 5, 6];
      var expected = '---x--y--(z|)';

      expectObservable(Observable.zip(a,b)).toBe(expected,
        { x: ['1', 4], y: ['2', 5], z: ['3', 6] });
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });

    it('should work with non-empty observable and non-empty iterable selector that throws', function () {
      var a = hot('---^--1--2--3--|');
      var asubs =    '^     !';
      var b = [4, 5, 6];
      var expected = '---x--#';

      var selector = function (x, y) {
        if (y === 5) {
          throw new Error('too bad');
        } else {
          return x + y;
        }};
      expectObservable(Observable.zip(a,b,selector)).toBe(expected,
        { x: '14' }, new Error('too bad'));
      expectSubscriptions(a.subscriptions).toBe(asubs);
    });
  });

  it('should combine two observables and selector', function () {
    var a =    hot('---1---2---3---');
    var asubs =    '^';
    var b =    hot('--4--5--6--7--8--');
    var bsubs =    '^';
    var expected = '---x---y---z';

    expectObservable(Observable.zip(a,b, function (e1,e2) { return e1 + e2; }))
      .toBe(expected, { x: '14', y: '25', z: '36' });
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with n-ary symmetric', function () {
    var a = hot('---1-^-1----4----|');
    var asubs =      '^         !  ';
    var b = hot('---1-^--2--5----| ');
    var bsubs =      '^         !  ';
    var c = hot('---1-^---3---6-|  ');
    var expected =   '----x---y-|  ';

    expectObservable(Observable.zip(a,b,c)).toBe(expected,
      { x: ['1','2','3'], y: ['4','5','6'] });
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with n-ary symmetric selector', function () {
    var a = hot('---1-^-1----4----|');
    var asubs =      '^         !  ';
    var b = hot('---1-^--2--5----| ');
    var bsubs =      '^         !  ';
    var c = hot('---1-^---3---6-|  ');
    var expected =   '----x---y-|  ';

    var observable = Observable.zip(a,b,c,
      function (r0, r1, r2) { return [r0, r1, r2]; });
    expectObservable(observable).toBe(expected,
      { x: ['1','2','3'], y: ['4','5','6'] });
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with n-ary symmetric array selector', function () {
    var a = hot('---1-^-1----4----|');
    var asubs =      '^         !  ';
    var b = hot('---1-^--2--5----| ');
    var bsubs =      '^         !  ';
    var c = hot('---1-^---3---6-|  ');
    var expected =   '----x---y-|  ';

    var observable = Observable.zip(a,b,c,
      function (r0, r1, r2) { return [r0, r1, r2]; });
    expectObservable(observable).toBe(expected,
      { x: ['1','2','3'], y: ['4','5','6'] });
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with some data asymmetric 1', function () {
    var a = hot('---1-^-1-3-5-7-9-x-y-z-w-u-|');
    var asubs =      '^                 !    ';
    var b = hot('---1-^--2--4--6--8--0--|    ');
    var bsubs =      '^                 !    ';
    var expected =   '---a--b--c--d--e--|    ';

    expectObservable(Observable.zip(a,b, function (r1,r2) { return r1 + r2; }))
      .toBe(expected, { a: '12', b: '34', c: '56', d: '78', e: '90' });
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with some data asymmetric 2', function () {
    var a = hot('---1-^--2--4--6--8--0--|    ');
    var asubs =      '^                 !    ';
    var b = hot('---1-^-1-3-5-7-9-x-y-z-w-u-|');
    var bsubs =      '^                 !    ';
    var expected =   '---a--b--c--d--e--|    ';

    expectObservable(Observable.zip(a,b, function (r1,r2) { return r1 + r2; }))
      .toBe(expected, { a: '21', b: '43', c: '65', d: '87', e: '09' });
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with some data symmetric', function () {
    var a = hot('---1-^-1-3-5-7-9------| ');
    var asubs =      '^                ! ';
    var b = hot('---1-^--2--4--6--8--0--|');
    var bsubs =      '^                ! ';
    var expected =   '---a--b--c--d--e-| ';

    expectObservable(Observable.zip(a,b, function (r1,r2) { return r1 + r2; }))
      .toBe(expected, { a: '12', b: '34', c: '56', d: '78', e: '90' });
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with selector throws', function () {
    var a = hot('---1-^-2---4----|  ');
    var asubs =      '^       !     ';
    var b = hot('---1-^--3----5----|');
    var bsubs =      '^       !     ';
    var expected =   '---x----#     ';

    var selector = function (x, y) {
      if (y === '5') {
        throw new Error('too bad');
      } else {
        return x + y;
      }};
    var observable = Observable.zip(a,b,selector);
    expectObservable(observable).toBe(expected,
      { x: '23' }, new Error('too bad'));
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with right completes first', function () {
    var a = hot('---1-^-2-----|');
    var asubs =      '^     !';
    var b = hot('---1-^--3--|');
    var bsubs =      '^     !';
    var expected =   '---x--|';

    expectObservable(Observable.zip(a,b)).toBe(expected, { x: ['2', '3'] });
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with two nevers', function () {
    var a = cold(  '-');
    var asubs =    '^';
    var b = cold(  '-');
    var bsubs =    '^';
    var expected = '-';

    expectObservable(Observable.zip(a,b)).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with never and empty', function () {
    var a = cold(  '-');
    var asubs =    '(^!)';
    var b = cold(  '|');
    var bsubs =    '(^!)';
    var expected = '|';

    expectObservable(Observable.zip(a,b)).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with empty and never', function () {
    var a = cold(  '|');
    var asubs =    '(^!)';
    var b = cold(  '-');
    var bsubs =    '(^!)';
    var expected = '|';

    expectObservable(Observable.zip(a,b)).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with empty and empty', function () {
    var a = cold(  '|');
    var asubs =    '(^!)';
    var b = cold(  '|');
    var bsubs =    '(^!)';
    var expected = '|';

    expectObservable(Observable.zip(a,b)).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with empty and non-empty', function () {
    var a = cold(  '|');
    var asubs =    '(^!)';
    var b = hot(   '---1--|');
    var bsubs =    '(^!)';
    var expected = '|';

    expectObservable(Observable.zip(a,b)).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with non-empty and empty', function () {
    var a = hot(   '---1--|');
    var asubs =    '(^!)';
    var b = cold(  '|');
    var bsubs =    '(^!)';
    var expected = '|';

    expectObservable(Observable.zip(a,b)).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with never and non-empty', function () {
    var a = cold(  '-');
    var asubs =    '^';
    var b = hot(   '---1--|');
    var bsubs =    '^     !';
    var expected = '-';

    expectObservable(Observable.zip(a,b)).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with non-empty and never', function () {
    var a = hot(   '---1--|');
    var asubs =    '^     !';
    var b = cold(  '-');
    var bsubs =    '^';
    var expected = '-';

    expectObservable(Observable.zip(a,b)).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with empty and error', function () {
    var a = cold(  '|');
    var asubs =    '(^!)';
    var b = hot(   '------#', null, 'too bad');
    var bsubs =    '(^!)';
    var expected = '|';

    expectObservable(Observable.zip(a,b)).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with error and empty', function () {
    var a = hot(   '------#', null, 'too bad');
    var asubs =    '(^!)';
    var b = cold(  '|');
    var bsubs =    '(^!)';
    var expected = '|';

    expectObservable(Observable.zip(a,b)).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with error', function () {
    var a =    hot('----------|');
    var asubs =    '^     !    ';
    var b =    hot('------#    ');
    var bsubs =    '^     !    ';
    var expected = '------#    ';

    expectObservable(Observable.zip(a,b)).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with never and error', function () {
    var a = cold(  '-');
    var asubs =    '^     !';
    var b =    hot('------#');
    var bsubs =    '^     !';
    var expected = '------#';

    expectObservable(Observable.zip(a,b)).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with error and never', function () {
    var a =    hot('------#');
    var asubs =    '^     !';
    var b = cold(  '-');
    var bsubs =    '^     !';
    var expected = '------#';

    expectObservable(Observable.zip(a,b)).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with error and error', function () {
    var a =    hot('------#', null, 'too bad');
    var asubs =    '^     !';
    var b =    hot('----------#', null, 'too bad 2');
    var bsubs =    '^     !';
    var expected = '------#';

    expectObservable(Observable.zip(a,b)).toBe(expected, null, 'too bad');
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with two sources that eventually raise errors', function () {
    var a =    hot('--w-----#----', { w: 1 }, 'too bad');
    var asubs =    '^       !';
    var b =    hot('-----z-----#-', { z: 2 }, 'too bad 2');
    var bsubs =    '^       !';
    var expected = '-----x--#';

    expectObservable(Observable.zip(a,b)).toBe(expected, { x: [1, 2] }, 'too bad');
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with two sources that eventually raise errors (swapped)', function () {
    var a =    hot('-----z-----#-', { z: 2 }, 'too bad 2');
    var asubs =    '^       !';
    var b =    hot('--w-----#----', { w: 1 }, 'too bad');
    var bsubs =    '^       !';
    var expected = '-----x--#';

    expectObservable(Observable.zip(a,b)).toBe(expected, { x: [2, 1] }, 'too bad');
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should work with error and some', function () {
    var a = cold(  '#');
    var asubs =    '(^!)';
    var b = hot(   '--1--2--3--');
    var bsubs =    '(^!)';
    var expected = '#';

    expectObservable(Observable.zip(a,b)).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
    expectSubscriptions(b.subscriptions).toBe(bsubs);
  });

  it('should combine an immediately-scheduled source with an immediately-scheduled second', function (done) {
    var a = Observable.of(1, 2, 3, immediateScheduler);
    var b = Observable.of(4, 5, 6, 7, 8, immediateScheduler);
    var r = [[1, 4], [2, 5], [3, 6]];
    var i = 0;

    Observable.zip(a,b).subscribe(function (vals) {
      expect(vals).toDeepEqual(r[i++]);
    }, null, done);
  });
});