/* globals describe, it, expect, expectObservable, hot, cold */
var Rx = require('../../dist/cjs/Rx');

describe('Observable.prototype.concatAll()', function () {
  it('should concat sources from promise', function (done) {
    var sources = Rx.Observable.fromArray([
      new Promise(function (res) { res(0); }),
      new Promise(function (res) { res(1); }),
      new Promise(function (res) { res(2); }),
      new Promise(function (res) { res(3); }),
    ]);

    var res = [];
    sources.concatAll().subscribe(
      function (x) { res.push(x); },
      function (err) { done.fail('should not be called.'); },
      function () {
        expect(res).toEqual([0,1,2,3]);
        done();
      });
  }, 2000);

  it('should concat and raise error from promise', function (done) {
    var sources = Rx.Observable.fromArray([
      new Promise(function (res) { res(0); }),
      new Promise(function (res, rej) { rej(1); }),
      new Promise(function (res) { res(2); }),
      new Promise(function (res) { res(3); }),
    ]);

    var res = [];
    sources.concatAll().subscribe(
      function (x) { res.push(x); },
      function (err) {
        expect(res.length).toBe(1);
        expect(err).toBe(1);
        done();
      },
      function () { done.fail('should not be called.'); });
  }, 2000);

  it('should concat all observables in an observable', function () {
    var e1 = Rx.Observable.fromArray([
      Rx.Observable.of('a'),
      Rx.Observable.of('b'),
      Rx.Observable.of('c')
    ]);
    var expected = '(abc|)';

    expectObservable(e1.concatAll()).toBe(expected);
  });

  it('should throw if any child observable throws', function () {
    var e1 = Rx.Observable.fromArray([
      Rx.Observable.of('a'),
      Rx.Observable.throw('error'),
      Rx.Observable.of('c')
    ]);
    var expected = '(a#)';

    expectObservable(e1.concatAll()).toBe(expected);
  });

  it('should concat a hot observable of observables', function () {
    var x = cold(     'a---b---c---|');
    var y = cold(        'd---e---f---|');
    var e1 =    hot('--x--y--|', { x: x, y: y });
    var expected =  '--a---b---c---d---e---f---|';

    expectObservable(e1.concatAll()).toBe(expected);
  });

  it('should concat merging a hot observable of non-overlapped observables', function () {
    var values = {
      x: cold(       'a-b---------|'),
      y: cold(                 'c-d-e-f-|'),
      z: cold(                          'g-h-i-j-k-|')
    };

    var e1 =   hot('--x---------y--------z--------|', values);
    var expected = '--a-b---------c-d-e-f-g-h-i-j-k-|';

    expectObservable(e1.concatAll()).toBe(expected);
  });

  it('should raise error if inner observable raises error', function () {
    var values = {
      x: cold(       'a-b---------|'),
      y: cold(                 'c-d-e-f-#'),
      z: cold(                          'g-h-i-j-k-|')
    };
    var e1 =   hot('--x---------y--------z--------|', values);
    var expected = '--a-b---------c-d-e-f-#';

    expectObservable(e1.concatAll()).toBe(expected);
  });

  it('should raise error if outer observable raises error', function () {
    var values = {
      y: cold(       'a-b---------|'),
      z: cold(                 'c-d-e-f-|'),
    };
    var e1 =   hot('--y---------z---#-------------|', values);
    var expected = '--a-b---------c-#';

    expectObservable(e1.concatAll()).toBe(expected);
  });
});