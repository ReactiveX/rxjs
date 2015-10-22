/* globals describe, it, expect, hot, cold, expectObservable */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

// function shortcuts
var throwError = function () { throw new Error(); };

describe('Observable.prototype.mapTo()', function () {
  it('should map one value', function () {
    var a =   cold('--7--|');
    var expected = '--y--|';

    expectObservable(a.mapTo('y')).toBe(expected);
  });

  it('should map multiple values', function () {
    var a =   cold('--1--2--3--|');
    var expected = '--x--x--x--|';

    expectObservable(a.mapTo('x')).toBe(expected);
  });

  it('should propagate errors from observable that emits only errors', function () {
    var a =   cold('--#--', null, 'too bad');
    var expected = '--#';

    expectObservable(a.mapTo(1)).toBe(expected, null, 'too bad');
  });

  it('should propagate errors from observable that emit values', function () {
    var a =   cold('--1--2--#--', undefined, 'too bad');
    var expected = '--x--x--#';

    expectObservable(a.mapTo('x')).toBe(expected, undefined, 'too bad');
  });

  it('should propagate errors from subscribe', function () {
    var r = function () {
      Observable.of(1)
        .mapTo(-1)
        .subscribe(throwError);
    };

    expect(r).toThrow();
  });

  it('should not map an empty observable', function () {
    var a = Observable.empty();
    var expected = '|';

    expectObservable(a.mapTo(-1)).toBe(expected);
  });

  it('should map twice', function () {
    var a = hot('-0----1-^-2---3--4-5--6--7-8-|');
    var expected =      '--h---h--h-h--h--h-h-|';

    var r = a.mapTo(-1).mapTo('h');
    expectObservable(r).toBe(expected);
  });
});
