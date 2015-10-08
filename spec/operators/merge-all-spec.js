/* globals describe, it, expect, expectObservable, hot, cold */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.mergeAll()', function () {
  it('should merge all observables in an observable', function () {
    var e1 = Observable.fromArray([
      Observable.of('a'),
      Observable.of('b'),
      Observable.of('c')
    ]);
    var expected = '(abc|)';

    expectObservable(e1.mergeAll()).toBe(expected);
  });

  it('should throw if any child observable throws', function () {
    var e1 = Observable.fromArray([
      Observable.of('a'),
      Observable.throw('error'),
      Observable.of('c')
    ]);
    var expected = '(a#)';

    expectObservable(e1.mergeAll()).toBe(expected);
  });

  it('should handle merging a hot observable of observables', function () {
    var x = cold(     'a---b---c---|');
    var y = cold(        'd---e---f---|');
    var e1 =    hot('--x--y--|', { x: x, y: y });
    var expected =  '--a--db--ec--f---|';

    expectObservable(e1.mergeAll()).toBe(expected);
  });

  it('should handle merging a hot observable of non-overlapped observables', function () {
    var values = {
      x: cold(       'a-b---------|'),
      y: cold(                 'c-d-e-f-|'),
      z: cold(                          'g-h-i-j-k-|')
    };
    var e1 =   hot('--x---------y--------z--------|', values);
    var expected = '--a-b-------c-d-e-f--g-h-i-j-k-|';

    expectObservable(e1.mergeAll()).toBe(expected);
  });

  it('should raise error if inner observable raises error', function () {
    var values = {
      x: cold(       'a-b---------|'),
      y: cold(                 'c-d-e-f-#'),
      z: cold(                          'g-h-i-j-k-|')
    };
    var e1 =   hot('--x---------y--------z--------|', values);
    var expected = '--a-b-------c-d-e-f-#';

    expectObservable(e1.mergeAll()).toBe(expected);
  });

  it('should raise error if outer observable raises error', function () {
    var values = {
      y: cold(       'a-b---------|'),
      z: cold(                 'c-d-e-f-|'),
    };
    var e1 =   hot('--y---------z---#-------------|', values);
    var expected = '--a-b-------c-d-#';

    expectObservable(e1.mergeAll()).toBe(expected);
  });

  it('should merge all promises in an observable', function (done) {
    var e1 = Rx.Observable.fromArray([
      new Promise(function (res) { res('a'); }),
      new Promise(function (res) { res('b'); }),
      new Promise(function (res) { res('c'); }),
      new Promise(function (res) { res('d'); }),
    ]);
    var expected = ['a', 'b', 'c', 'd'];

    var res = [];
    e1.mergeAll().subscribe(
      function (x) { res.push(x); },
      function (err) { throw 'should not be called'; },
      function () {
        expect(res).toEqual(expected);
        done();
      });
  });

  it('should raise error when promise rejects', function (done) {
    var error = 'error';
    var e1 = Rx.Observable.fromArray([
      new Promise(function (res) { res('a'); }),
      new Promise(function (res, rej) { rej(error); }),
      new Promise(function (res) { res('c'); }),
      new Promise(function (res) { res('d'); }),
    ]);

    var res = [];
    e1.mergeAll().subscribe(
      function (x) { res.push(x); },
      function (err) {
        expect(res.length).toEqual(1);
        expect(err).toBe(error);
        done();
      },
      function () { throw 'should not be called'; });
  });
});