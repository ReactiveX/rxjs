/* globals describe, it, expect, hot, cold, expectObservable, expectSubscriptions */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

// function shortcuts
var throwError = function () { throw new Error(); };

describe('Observable.prototype.mapTo()', function () {
  it('should map one value', function () {
    var a =   cold('--7--|');
    var asubs =    '^    !';
    var expected = '--y--|';

    expectObservable(a.mapTo('y')).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should map multiple values', function () {
    var a =   cold('--1--2--3--|');
    var asubs =    '^          !';
    var expected = '--x--x--x--|';

    expectObservable(a.mapTo('x')).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should allow unsubscribing explicitly and early', function () {
    var a =   cold('--1--2--3--|');
    var unsub =    '      !     ';
    var asubs =    '^     !     ';
    var expected = '--x--x-     ';

    expectObservable(a.mapTo('x'), unsub).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should propagate errors from observable that emits only errors', function () {
    var a =   cold('--#', null, 'too bad');
    var asubs =    '^ !';
    var expected = '--#';

    expectObservable(a.mapTo(1)).toBe(expected, null, 'too bad');
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should propagate errors from observable that emit values', function () {
    var a =   cold('--1--2--#', undefined, 'too bad');
    var asubs =    '^       !';
    var expected = '--x--x--#';

    expectObservable(a.mapTo('x')).toBe(expected, undefined, 'too bad');
    expectSubscriptions(a.subscriptions).toBe(asubs);
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
    var a =   cold('|');
    var asubs =    '(^!)';
    var expected = '|';

    expectObservable(a.mapTo(-1)).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should map twice', function () {
    var a = hot('-0----1-^-2---3--4-5--6--7-8-|');
    var asubs =         '^                    !';
    var expected =      '--h---h--h-h--h--h-h-|';

    var r = a.mapTo(-1).mapTo('h');

    expectObservable(r).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should not break unsubscription chain when unsubscribed explicitly', function () {
    var a =   cold('--1--2--3--|');
    var unsub =    '      !     ';
    var asubs =    '^     !     ';
    var expected = '--x--x-     ';

    var r = a
      .mergeMap(function (x) { return Observable.of(x); })
      .mapTo('x')
      .mergeMap(function (x) { return Observable.of(x); });

    expectObservable(r, unsub).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });
});
