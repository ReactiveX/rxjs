/* globals describe, it, expect, expectObservable, expectSubscriptions, cold, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.skipWhile()', function () {
  it('should skip all elements with a true predicate', function () {
    var source = hot('-1-^2--3--4--5--6--|');
    var sourceSubs =    '^               !';
    var expected =      '----------------|';

    expectObservable(source.skipWhile(function () { return true; })).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should skip all elements with a truthy predicate', function () {
    var source = hot('-1-^2--3--4--5--6--|');
    var sourceSubs =    '^               !';
    var expected =      '----------------|';

    expectObservable(source.skipWhile(function () { return {}; })).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should not skip any element with a false predicate', function () {
    var source = hot('-1-^2--3--4--5--6--|');
    var sourceSubs =    '^               !';
    var expected =      '-2--3--4--5--6--|';

    expectObservable(source.skipWhile(function () { return false; })).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should not skip any elements with a falsy predicate', function () {
    var source = hot('-1-^2--3--4--5--6--|');
    var sourceSubs =    '^               !';
    var expected =      '-2--3--4--5--6--|';

    expectObservable(source.skipWhile(function () { return undefined; })).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should skip all elements until predicate is false', function () {
    var source = hot('-1-^2--3--4--5--6--|');
    var sourceSubs =    '^               !';
    var expected =      '-------4--5--6--|';

    var predicate = function (v) {
      return +v < 4;
    };

    expectObservable(source.skipWhile(predicate)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should skip elements on hot source', function () {
    var source = hot('--1--2-^-3--4--5--6--7--8--');
    var sourceSubs =        '^                   ';
    var expected =          '--------5--6--7--8--';

    var predicate = function (v) {
      return +v < 5;
    };

    expectObservable(source.skipWhile(predicate)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should be possible to skip using the element\'s index', function () {
    var source = hot('--a--b-^-c--d--e--f--g--h--|');
    var sourceSubs =        '^                   !';
    var expected =          '--------e--f--g--h--|';

    var predicate = function (v, index) {
      return index < 2;
    };

    expectObservable(source.skipWhile(predicate)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should skip using index with source unsubscribes early', function () {
    var source = hot('--a--b-^-c--d--e--f--g--h--|');
    var sourceSubs =        '^          !';
    var unsub =             '-----------!';
    var expected =          '-----d--e---';

    var predicate = function (v, index) {
      return index < 1;
    };

    expectObservable(source.skipWhile(predicate), unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
    var source = hot('--a--b-^-c--d--e--f--g--h--|');
    var sourceSubs =        '^          !';
    var expected =          '-----d--e---';
    var unsub =             '           !';

    var predicate = function (v, index) {
      return index < 1;
    };

    var result = source
      .mergeMap(function (x) { return Observable.of(x); })
      .skipWhile(predicate)
      .mergeMap(function (x) { return Observable.of(x); });

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should skip using value with source throws', function () {
    var source = hot('--a--b-^-c--d--e--f--g--h--#');
    var sourceSubs =        '^                   !';
    var expected =          '-----d--e--f--g--h--#';

    var predicate = function (v) {
      return v !== 'd';
    };

    expectObservable(source.skipWhile(predicate)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should invoke predicate while its false and never again', function () {
    var source = hot('--a--b-^-c--d--e--f--g--h--|');
    var sourceSubs =        '^                   !';
    var expected =          '--------e--f--g--h--|';

    var invoked = 0;
    var predicate = function (v) {
      invoked++;
      return v !== 'e';
    };

    expectObservable(
      source.skipWhile(predicate).do(null, null, function () {
        expect(invoked).toBe(3);
      })
    ).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should handle predicate that throws', function () {
    var source = hot('--a--b-^-c--d--e--f--g--h--|');
    var sourceSubs =        '^       !';
    var expected =          '--------#';

    var predicate = function (v) {
      if (v === 'e') {
        throw new Error('nom d\'une pipe !');
      }

      return v !== 'f';
    };

    expectObservable(source.skipWhile(predicate)).toBe(expected, undefined, new Error('nom d\'une pipe !'));
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should accept a thisArg', function () {
    var source = hot('-1-^--2--3--4--5--6--|');
    var sourceSubs =    '^                 !';
    var expected =      '---------4--5--6--|';

    function Skiper() {
      this.doSkip = function (v) { return +v < 4; };
    }

    var skiper = new Skiper();

    expectObservable(
      source.skipWhile(function (v) { return this.doSkip(v); }, skiper)
    ).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should handle Observable.empty', function () {
    var source = cold('|');
    var subs =        '(^!)';
    var expected =    '|';

    expectObservable(source.skipWhile(function () { return true; })).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should handle Observable.never', function () {
    var source = cold('-');
    var subs =        '^';
    var expected =    '-';

    expectObservable(source.skipWhile(function () { return true; })).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should handle Observable.throw', function () {
    var source = cold('#');
    var subs =        '(^!)';
    var expected =    '#';

    expectObservable(source.skipWhile(function () { return true; })).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });
});
