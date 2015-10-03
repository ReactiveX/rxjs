/* globals describe, it, expect, expectObservable, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var immediateScheduler = Rx.Scheduler.immediate;

describe('zip', function () {
  it('should work with two nevers', function () {
    var a = Observable.never();
    var b = Observable.never();
    var expected = '-';
    expectObservable(a.zip(b)).toBe(expected);
  });

  it('should work with never and empty', function () {
    var a = Observable.never();
    var b = Observable.empty();
    var expected = '|';
    expectObservable(a.zip(b)).toBe(expected);
  });

  it('should work with empty and never', function () {
    var a = Observable.empty();
    var b = Observable.never();
    var expected = '|';
    expectObservable(a.zip(b)).toBe(expected);
  });

  it('should work with empty and empty', function () {
    var a = Observable.empty();
    var b = Observable.empty();
    var expected = '|';
    expectObservable(a.zip(b)).toBe(expected);
  });

  it('should work with empty and non-empty', function () {
    var a = Observable.empty();
    var b = hot('---1--|');
    var expected = '|';
    expectObservable(a.zip(b)).toBe(expected);
  });
  it('should work with non-empty and empty', function () {
    var a = hot('---1--|');
    var b = Observable.empty();
    var expected = '|';
    expectObservable(a.zip(b)).toBe(expected);
  });
  it('should work with never and non-empty', function () {
    var a = Observable.never();
    var b = hot('---1--|');
    var expected = '-';
    expectObservable(a.zip(b)).toBe(expected);
  });
  it('should work with non-empty and never', function () {
    var a = hot('---1--|');
    var b = Observable.never();
    var expected = '-';
    expectObservable(a.zip(b)).toBe(expected);
  });

  it('should combine two observables', function () {
    var a =    hot('---1---2---3---');
    var b =    hot('--4--5--6--7--8--');
    var expected = '---x---y---z';
    expectObservable(Observable.of(a, b).zipAll())
      .toBe(expected, { x: ['1', '4'], y: ['2', '5'], z: ['3', '6'] });
  });

  it('should combine two observables and selector', function () {
    var a =    hot('---1---2---3---');
    var b =    hot('--4--5--6--7--8--');
    var expected = '---x---y---z';
    expectObservable(Observable.zip(a,b, function (e1,e2) { return e1 + e2; }))
      .toBe(expected, { x: '14', y: '25', z: '36' });
  });

  it('should combine a source with a second', function () {
    var a =    hot('---1---2---3---');
    var b =    hot('--4--5--6--7--8--');
    var expected = '---x---y---z';
    expectObservable(a.zip(b))
      .toBe(expected, { x: ['1', '4'], y: ['2', '5'], z: ['3', '6'] });
  });

  it('should combine two immediately-scheduled observables', function (done) {
    var a = Observable.of(1, 2, 3, immediateScheduler);
    var b = Observable.of(4, 5, 6, 7, 8, immediateScheduler);
    var r = [[1, 4], [2, 5], [3, 6]];
    var i = 0;
    Observable.of(a, b, immediateScheduler).zipAll().subscribe(function (vals) {
      expect(vals).toDeepEqual(r[i++]);
    }, null, done);
  });

  it('should combine an immediately-scheduled source with an immediately-scheduled second', function (done) {
    var a = Observable.of(1, 2, 3, immediateScheduler);
    var b = Observable.of(4, 5, 6, 7, 8, immediateScheduler);
    var r = [[1, 4], [2, 5], [3, 6]];
    var i = 0;
    a.zip(b).subscribe(function (vals) {
      expect(vals).toDeepEqual(r[i++]);
    }, null, done);
  });

  it('should combine a source with an immediately-scheduled source', function (done) {
    var a = Observable.of(1, 2, 3, immediateScheduler);
    var b = Observable.of(4, 5, 6, 7, 8);
    var r = [[1, 4], [2, 5], [3, 6]];
    var i = 0;
    Observable.of(a, b, immediateScheduler).zipAll().subscribe(function (vals) {
      expect(vals).toDeepEqual(r[i++]);
    }, null, done);
  });

  it('should work with empty and error', function () {
    var a = Observable.empty();
    var b = hot('------#', null, 'too bad');
    var expected = '|';
    expectObservable(a.zip(b)).toBe(expected);
  });

  it('should work with error and empty', function () {
    var a = hot('------#', null, 'too bad');
    var b = Observable.empty();
    var expected = '|';
    expectObservable(a.zip(b)).toBe(expected);
  });

  it('should work with error', function () {
    var a =    hot('----------|');
    var b =    hot('------#', null, 'too bad');
    var expected = '------#';
    expectObservable(a.zip(b)).toBe(expected, null, 'too bad');
  });

  it('should work with never and error', function () {
    var a = Observable.never();
    var b =    hot('------#', null, 'too bad');
    var expected = '------#';
    expectObservable(a.zip(b)).toBe(expected, null, 'too bad');
  });

  it('should work with error and never', function () {
    var a =    hot('------#', null, 'too bad');
    var b = Observable.never();
    var expected = '------#';
    expectObservable(a.zip(b)).toBe(expected, null, 'too bad');
  });

  it('should work with error and error', function () {
    var a =    hot('------#', null, 'too bad');
    var b =    hot('----------#', null, 'too bad 2');
    var expected = '------#';
    expectObservable(a.zip(b)).toBe(expected, null, 'too bad');
  });

  it('should work with some error', function () {
    var a =    hot('--w-----#----', { w: 1 }, 'too bad');
    var b =    hot('-----z-----#-', { z: 2 }, 'too bad 2');
    var expected = '-----x--#';
    expectObservable(a.zip(b)).toBe(expected, { x: [1, 2] }, 'too bad');
  });

  it('should work with error some', function () {
    var a =    hot('-----z-----#-', { z: 2 }, 'too bad 2');
    var b =    hot('--w-----#----', { w: 1 }, 'too bad');
    var expected = '-----x--#';
    expectObservable(a.zip(b)).toBe(expected, { x: [2, 1] }, 'too bad');
  });

  it('should work with throw', function () {
    var a = Observable.throw(new Error('too bad'));
    var b = hot('--1--2--3--');
    var expected = '#';
    expectObservable(a.zip(b)).toBe(expected, null, new Error('too bad'));
  });

  it('should work with n-ary symmetric', function () {
    var a = hot('---1-^-1----4----|');
    var b = hot('---1-^--2--5----|');
    var c = hot('---1-^---3---6-|');
    var expected =   '----x---y-|';
    expectObservable(Observable.zip(a,b,c)).toBe(expected,
      { x: ['1','2','3'], y: ['4','5','6'] });
  });

  it('should work with n-ary symmetric selector', function () {
    var a = hot('---1-^-1----4----|');
    var b = hot('---1-^--2--5----|');
    var c = hot('---1-^---3---6-|');
    var expected =   '----x---y-|';
    var observable = Observable.zip(a,b,c,
      function (r0, r1, r2) { return [r0, r1, r2]; });
    expectObservable(observable).toBe(expected,
      { x: ['1','2','3'], y: ['4','5','6'] });
  });

  it('should work with n-ary symmetric array selector', function () {
    var a = hot('---1-^-1----4----|');
    var b = hot('---1-^--2--5----|');
    var c = hot('---1-^---3---6-|');
    var expected =   '----x---y-|';
    var observable = Observable.zip(a,b,c,
      function (r0, r1, r2) { return [r0, r1, r2]; });
    expectObservable(observable).toBe(expected,
      { x: ['1','2','3'], y: ['4','5','6'] });
  });

  it('should work with some data asymmetric 1', function () {
    var a = hot('---1-^-1-3-5-7-9-x-y-z-w-u-|');
    var b = hot('---1-^--2--4--6--8--0--|');
    var expected =   '---a--b--c--d--e--|';
    expectObservable(Observable.zip(a,b, function (r1,r2) { return r1 + r2; }))
      .toBe(expected, { a: '12', b: '34', c: '56', d: '78', e: '90' });
  });

  it('should work with some data asymmetric 2', function () {
    var a = hot('---1-^--2--4--6--8--0--|');
    var b = hot('---1-^-1-3-5-7-9-x-y-z-w-u-|');
    var expected =   '---a--b--c--d--e--|';
    expectObservable(Observable.zip(a,b, function (r1,r2) { return r1 + r2; }))
      .toBe(expected, { a: '21', b: '43', c: '65', d: '87', e: '09' });
  });

  it('should work with some data symmetric', function () {
    var a = hot('---1-^-1-3-5-7-9------|');
    var b = hot('---1-^--2--4--6--8--0--|');
    var expected =   '---a--b--c--d--e-|';
    expectObservable(Observable.zip(a,b, function (r1,r2) { return r1 + r2; }))
      .toBe(expected, { a: '12', b: '34', c: '56', d: '78', e: '90' });
  });

  it('should work with selector throws', function () {
    var a = hot('---1-^-2---4----|');
    var b = hot('---1-^--3----5----|');
    var expected =   '---x----#';
    var selector = function (x, y) {
      if (y === '5') {
        throw new Error('too bad');
      } else {
        return x + y;
      }};
    var observable = Observable.zip(a,b,selector);
    expectObservable(observable).toBe(expected,
      { x: '23' }, new Error('too bad'));
  });

  it('should work with right completes first', function () {
    var a = hot('---1-^-2-----|');
    var b = hot('---1-^--3--|');
    var expected =   '---x--|';
    expectObservable(Observable.zip(a,b)).toBe(expected, { x: ['2', '3'] });
  });

  it('should work with with iterable never empty', function () {
    var a = Observable.never();
    var b = [];
    var expected = '-';
    expectObservable(Observable.zip(a,b)).toBe(expected);
  });

  it('should work with with iterable empty empty', function () {
    var a = Observable.empty();
    var b = [];
    var expected = '|';
    expectObservable(Observable.zip(a,b)).toBe(expected);
  });

  it('should work with with iterable empty non-empty', function () {
    var a = Observable.empty();
    var b = [1];
    var expected = '|';
    expectObservable(Observable.zip(a,b)).toBe(expected);
  });

  it('should work with with iterable non-empty empty', function () {
    var a = hot('---^----a--|');
    var b = [];
    var expected = '--------|';
    expectObservable(Observable.zip(a,b)).toBe(expected);
  });

  it('should work with with iterable never non-empty', function () {
    var a = Observable.never();
    var b = [1];
    var expected = '-';
    expectObservable(Observable.zip(a,b)).toBe(expected);
  });

  it('should work with with iterable non-empty non-empty', function () {
    var a = hot('---^----1--|');
    var b = [2];
    var expected = '-----(x|)';
    expectObservable(Observable.zip(a,b)).toBe(expected, { x: ['1', 2] });
  });

  it('should work with with iterable error empty', function () {
    var a = hot('---^----#--|', null, new Error('too bad'));
    var b = [];
    var expected = '-----#';
    expectObservable(Observable.zip(a,b)).toBe(expected, null, new Error('too bad'));
  });

  it('should work with with iterable error some', function () {
    var a = hot('---^----#--|', null, new Error('too bad'));
    var b = [1];
    var expected = '-----#';
    expectObservable(Observable.zip(a,b)).toBe(expected, null, new Error('too bad'));
  });

  it('should work with with iterable some data both sides', function () {
    var a = hot('---^--1--2--3--|');
    var b = [4, 5, 6];
    var expected = '---x--y--(z|)';
    expectObservable(Observable.zip(a,b)).toBe(expected,
      { x: ['1', 4], y: ['2', 5], z: ['3', 6] });
  });

  it('should work with with iterable selector throws', function () {
    var a = hot('---^--1--2--3--|');
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
  });
});
