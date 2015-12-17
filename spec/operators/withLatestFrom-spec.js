/* globals describe, it, expect, expectObservable, hot, cold, lowerCaseO */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var Promise = require('promise');

describe('Observable.prototype.withLatestFrom()', function () {
  it.asDiagram('withLatestFrom')('should combine events from cold observables', function () {
    var e1 =   hot('-a--b-----c-d-e-|');
    var e2 =   hot('--1--2-3-4---|   ');
    var expected = '----B-----C-D-E-|';

    var result = e1.withLatestFrom(e2, function (a, b) { return String(a) + String(b); });

    expectObservable(result).toBe(expected, { B: 'b1', C: 'c4', D: 'd4', E: 'e4' });
  });

  it('should merge the value with the latest values from the other observables into arrays', function () {
    var e1 =   hot('--a--^---b---c---d-|');
    var e1subs =        '^             !';
    var e2 =   hot('--e--^-f---g---h------|');
    var e2subs =        '^             !';
    var e3 =   hot('--i--^-j---k---l------|');
    var e3subs =        '^             !';
    var expected =      '----x---y---z-|';
    var values = {
      x: ['b', 'f', 'j'],
      y: ['c', 'g', 'k'],
      z: ['d', 'h', 'l']
    };

    var result = e1.withLatestFrom(e2, e3);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should merge the value with the latest values from the other observables into ' +
  'arrays and a project argument', function () {
    var e1 =   hot('--a--^---b---c---d-|');
    var e1subs =        '^             !';
    var e2 =   hot('--e--^-f---g---h------|');
    var e2subs =        '^             !';
    var e3 =   hot('--i--^-j---k---l------|');
    var e3subs =        '^             !';
    var expected =      '----x---y---z-|';
    var values = {
      x: 'bfj',
      y: 'cgk',
      z: 'dhl'
    };
    var project = function (a, b, c) { return a + b + c; };

    var result = e1.withLatestFrom(e2, e3, project);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should allow unsubscribing early and explicitly', function () {
    var e1 =   hot('--a--^---b---c---d-|');
    var e1subs =        '^          !   ';
    var e2 =   hot('--e--^-f---g---h------|');
    var e2subs =        '^          !   ';
    var e3 =   hot('--i--^-j---k---l------|');
    var e3subs =        '^          !   ';
    var expected =      '----x---y---   ';
    var unsub =         '           !   ';
    var values = {
      x: 'bfj',
      y: 'cgk',
      z: 'dhl'
    };
    var project = function (a, b, c) { return a + b + c; };

    var result = e1.withLatestFrom(e2, e3, project);

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
    var e1 =   hot('--a--^---b---c---d-|');
    var e1subs =        '^          !   ';
    var e2 =   hot('--e--^-f---g---h------|');
    var e2subs =        '^          !   ';
    var e3 =   hot('--i--^-j---k---l------|');
    var e3subs =        '^          !   ';
    var expected =      '----x---y---   ';
    var unsub =         '           !   ';
    var values = {
      x: 'bfj',
      y: 'cgk',
      z: 'dhl'
    };
    var project = function (a, b, c) { return a + b + c; };

    var result = e1
      .mergeMap(function (x) { return Observable.of(x); })
      .withLatestFrom(e2, e3, project)
      .mergeMap(function (x) { return Observable.of(x); });

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should handle empty', function () {
    var e1 =   cold(    '|');
    var e1subs =        '(^!)';
    var e2 =   hot('--e--^-f---g---h----|');
    var e2subs =        '(^!)';
    var e3 =   hot('--i--^-j---k---l----|');
    var e3subs =        '(^!)';
    var expected =      '|'; // empty

    var result = e1.withLatestFrom(e2, e3);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should handle never', function () {
    var e1 =   cold('-');
    var e1subs =        '^               ';
    var e2 =   hot('--e--^-f---g---h----|');
    var e2subs =        '^              !';
    var e3 =   hot('--i--^-j---k---l----|');
    var e3subs =        '^              !';
    var expected =      '--------------------'; // never

    var result = e1.withLatestFrom(e2, e3);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should handle throw', function () {
    var e1 =   cold('#');
    var e1subs =        '(^!)';
    var e2 =   hot('--e--^-f---g---h----|');
    var e2subs =        '(^!)';
    var e3 =   hot('--i--^-j---k---l----|');
    var e3subs =        '(^!)';
    var expected =      '#'; // throw

    var result = e1.withLatestFrom(e2, e3);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should handle error', function () {
    var e1 =   hot('--a--^---b---#', undefined, new Error('boo-hoo'));
    var e1subs =        '^       !';
    var e2 =   hot('--e--^-f---g---h----|');
    var e2subs =        '^       !';
    var e3 =   hot('--i--^-j---k---l----|');
    var e3subs =        '^       !';
    var expected =      '----x---#'; // throw
    var values = {
      x: ['b','f','j']
    };

    var result = e1.withLatestFrom(e2, e3);

    expectObservable(result).toBe(expected, values, new Error('boo-hoo'));
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should handle error with project argument', function () {
    var e1 =   hot('--a--^---b---#', undefined, new Error('boo-hoo'));
    var e1subs =        '^       !';
    var e2 =   hot('--e--^-f---g---h----|');
    var e2subs =        '^       !';
    var e3 =   hot('--i--^-j---k---l----|');
    var e3subs =        '^       !';
    var expected =      '----x---#'; // throw
    var values = {
      x: 'bfj'
    };
    var project = function (a, b, c) { return a + b + c; };

    var result = e1.withLatestFrom(e2, e3, project);

    expectObservable(result).toBe(expected, values, new Error('boo-hoo'));
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should handle merging with empty', function () {
    var e1 =   hot('--a--^---b---c---d-|   ');
    var e1subs =        '^             !   ';
    var e2 =   cold(    '|'                 );
    var e2subs =        '(^!)';
    var e3 =   hot('--i--^-j---k---l------|');
    var e3subs =        '^             !   ';
    var expected =      '--------------|   ';

    var result = e1.withLatestFrom(e2, e3);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should handle merging with never', function () {
    var e1 =   hot('--a--^---b---c---d-|   ');
    var e1subs =        '^             !   ';
    var e2 =   cold(    '-'                 );
    var e2subs =        '^             !   ';
    var e3 =   hot('--i--^-j---k---l------|');
    var e3subs =        '^             !   ';
    var expected =      '--------------|   ';

    var result = e1.withLatestFrom(e2, e3);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should handle promises', function (done) {
    Observable.of(1).delay(1).withLatestFrom(Promise.resolve(2), Promise.resolve(3))
      .subscribe(function (x) {
        expect(x).toEqual([1,2,3]);
      }, null, done);
  });

  it('should handle arrays', function () {
    Observable.of(1).delay(1).withLatestFrom([2,3,4], [4,5,6])
      .subscribe(function (x) {
        expect(x).toEqual([1,4,6]);
      });
  });

  it('should handle lowercase-o observables', function () {
    Observable.of(1).delay(1).withLatestFrom(lowerCaseO(2, 3, 4), lowerCaseO(4, 5, 6))
      .subscribe(function (x) {
        expect(x).toEqual([1,4,6]);
      });
  });
});