/* globals describe, it, expect, expectObservable, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.skipUntil()', function () {
  it('should skip values until another observable notifies', function () {
    var e1 =     hot('--a--b--c--d--e--|');
    var skip =   hot('-------------x--|');
    var expected =  ('--------------e--|');

    expectObservable(e1.skipUntil(skip)).toBe(expected);
  });

  it('should skip value and raises error until another observable raises error', function () {
    var e1 =   hot('--a--b--c--d--e--|');
    var skip = hot('-------------#');
    var expected = '-------------#';

    expectObservable(e1.skipUntil(skip)).toBe(expected);
  });

  it('should skip all element when another observable does not emit and completes early', function () {
    var e1 =   hot('--a--b--c--d--e--|');
    var skip = hot('------------|');
    var expected = '-----------------|';

    expectObservable(e1.skipUntil(skip)).toBe(expected);
  });

  it('should skip all element when another observable is empty', function () {
    var e1 =   hot('--a--b--c--d--e--|');
    var skip = Observable.empty();
    var expected = '-----------------|';

    expectObservable(e1.skipUntil(skip)).toBe(expected);
  });

  it('should not complete if source observable does not complete', function () {
    var e1 =   hot('-');
    var skip = hot('-------------x--|');
    var expected = '-';

    expectObservable(e1.skipUntil(skip)).toBe(expected);
  });

  it('should not complete if source observable never completes', function () {
    var e1 = Observable.never();
    var skip = hot('-------------x--|');
    var expected = '-';

    expectObservable(e1.skipUntil(skip)).toBe(expected);
  });

  it('should raise error if source does not completes when another observable raises error', function () {
    var e1 =   hot('-');
    var skip = hot('-------------#');
    var expected = '-------------#';

    expectObservable(e1.skipUntil(skip)).toBe(expected);
  });

  it('should raise error if source never completes when another observable raises error', function () {
    var e1 = Observable.never();
    var skip = hot('-------------#');
    var expected = '-------------#';

    expectObservable(e1.skipUntil(skip)).toBe(expected);
  });

  it('should skip all element and does not complete when another observable never completes', function () {
    var e1 =   hot('--a--b--c--d--e--|');
    var skip = Observable.never();
    var expected = '-';

    expectObservable(e1.skipUntil(skip)).toBe(expected);
  });

  it('should skip all element and does not complete when another observable does not completes', function () {
    var e1 =   hot('--a--b--c--d--e--|');
    var skip = hot('-');
    var expected = '-';

    expectObservable(e1.skipUntil(skip)).toBe(expected);
  });

  it('should skip all element and does not complete when another observable completes after source', function () {
    var e1 =   hot('--a--b--c--d--e--|');
    var skip = hot('------------------------|');
    var expected = '-';

    expectObservable(e1.skipUntil(skip)).toBe(expected);
  });

  it('should not completes if source does not completes when another observable does not emit', function () {
    var e1 =   hot('-');
    var skip = hot('--------------|');
    var expected = '-';

    expectObservable(e1.skipUntil(skip)).toBe(expected);
  });

  it('should not completes if source and another observable both does not complete', function () {
    var e1 =   hot('-');
    var skip = hot('-');
    var expected = '-';

    expectObservable(e1.skipUntil(skip)).toBe(expected);
  });

  it('should skip all element when another observable unsubscribed early before emit', function () {
    var e1 =   hot('--a--b--c--d--e--|');
    var skip = hot('-------------x--|');
    var expected = '-';

    e1.subscribe(function () {
      skip.unsubscribe();
    });

    expectObservable(e1.skipUntil(skip)).toBe(expected);
  });
});