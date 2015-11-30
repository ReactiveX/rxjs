/* globals describe, it, expect, expectObservable, expectSubscriptions, cold, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.takeWhile()', function () {
  it('should take all elements with predicate returns true', function () {
    var e1 = hot('--a-^-b--c--d--e--|');
    var e1subs =     '^             !';
    var expected =   '--b--c--d--e--|';

    expectObservable(e1.takeWhile(function () { return true; })).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should take all elements with truthy predicate', function () {
    var e1 = hot('--a-^-b--c--d--e--|');
    var e1subs =     '^             !';
    var expected =   '--b--c--d--e--|';

    expectObservable(e1.takeWhile(function () { return {}; })).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should skip all elements with predicate returns false', function () {
    var e1 = hot('--a-^-b--c--d--e--|');
    var e1subs =     '^ !            ';
    var expected =   '--|            ';

    expectObservable(e1.takeWhile(function () { return false; })).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should skip all elements with falsy predicate', function () {
    var e1 = hot('--a-^-b--c--d--e--|');
    var e1subs =     '^ !            ';
    var expected =   '--|            ';

    expectObservable(e1.takeWhile(function () { return null; })).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should take all elements until predicate return false', function () {
    var e1 = hot('--a-^-b--c--d--e--|');
    var e1subs =     '^       !      ';
    var expected =   '--b--c--|      ';

    function predicate(value) {
      return value !== 'd';
    }

    expectObservable(e1.takeWhile(predicate)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should take elements with predicate when source does not complete', function () {
    var e1 = hot('--a-^-b--c--d--e--');
    var e1subs =     '^             ';
    var expected =   '--b--c--d--e--';

    expectObservable(e1.takeWhile(function () { return true; })).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not complete when source never completes', function () {
    var e1 =  cold('-');
    var e1subs =   '^';
    var expected = '-';

    var result = e1.takeWhile(function () { return true; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete when source does not emit', function () {
    var e1 = hot('--a-^------------|');
    var e1subs =     '^            !';
    var expected =   '-------------|';

    expectObservable(e1.takeWhile(function () { return true; })).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete when source is empty', function () {
    var e1 =  cold('|');
    var e1subs =   '(^!)';
    var expected = '|';

    var result = e1.takeWhile(function () { return true; });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should pass element index to predicate', function () {
    var e1 = hot('--a-^-b--c--d--e--|');
    var e1subs =     '^       !      ';
    var expected =   '--b--c--|      ';

    function predicate(value, index) {
      return index < 2;
    }

    expectObservable(e1.takeWhile(predicate)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error when source raises error', function () {
    var e1 = hot('--a-^-b--c--d--e--#');
    var e1subs =     '^             !';
    var expected =   '--b--c--d--e--#';

    expectObservable(e1.takeWhile(function () { return true; })).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error when source throws', function () {
    var source = cold('#');
    var subs =        '(^!)';
    var expected =    '#';

    expectObservable(source.takeWhile(function () { return true; })).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should invoke predicate until return false', function () {
    var e1 = hot('--a-^-b--c--d--e--|');
    var e1subs =     '^       !      ';
    var expected =   '--b--c--|      ';

    var invoked = 0;
    function predicate(value) {
      invoked++;
      return value !== 'd';
    }

    var source = e1.takeWhile(predicate).do(null, null, function () {
      expect(invoked).toBe(3);
    });
    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error if predicate throws', function () {
    var e1 = hot('--a-^-b--c--d--e--|');
    var e1subs =     '^ !            ';
    var expected =   '--#            ';

    function predicate(value) {
      throw 'error';
    }

    expectObservable(e1.takeWhile(predicate)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should pass element thisArg to predicate', function () {
    var e1 = hot('--a-^-b--c--d--e--|');
    var e1subs =     '^       !      ';
    var expected =   '--b--c--|      ';

    function predicate() {
      this.take = function (value) {
        return value !== 'd';
      };
    }

    var result = e1.takeWhile(function (v) { return this.take(v); }, new predicate());

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should take elements until unsubscribed', function () {
    var e1 = hot('--a-^-b--c--d--e--|');
    var unsub =      '-----!         ';
    var e1subs =     '^    !         ';
    var expected =   '--b---         ';

    function predicate(value) {
      return value !== 'd';
    }

    expectObservable(e1.takeWhile(predicate), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
