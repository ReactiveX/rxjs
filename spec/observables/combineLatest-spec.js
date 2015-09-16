/* globals describe, it, expect, expectObservable, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.combineLatest', function () {
  function concat(x, y) { return '' + x + y; }

  it('should be never when sources are never and never', function () {
    var e1 = Observable.never();
    var e2 = Observable.never();
    var expected = '-';
    var combined = Observable.combineLatest(e1, e2, concat);
    expectObservable(combined).toBe(expected);
  });

  it('should be never when one of the sources is never', function () {
    var e1 = Observable.never();
    var e2 = Observable.empty();
    var expected = '-';
    var combined = Observable.combineLatest(e1, e2, concat);
    expectObservable(combined).toBe(expected);
  });

  it('should be never when one of the sources is never and the other has values', function () {
    var e1 = cold('---a--b--c--');
    var e2 = Observable.never();
    var expected = '-';
    var combined = Observable.combineLatest(e1, e2, concat);
    expectObservable(combined).toBe(expected);
  });

  it('should be never when one of the sources is never and the other complete', function () {
    var e1 = cold('---a--b--c--|');
    var e2 = Observable.never();
    var expected = '-';
    var combined = Observable.combineLatest(e1, e2, concat);
    expectObservable(combined).toBe(expected);
  });

  it('should be never when sources are empty and empty', function () {
    var e1 = Observable.empty();
    var e2 = Observable.empty();
    var expected = '-';
    var combined = Observable.combineLatest(e1, e2, concat);
    expectObservable(combined).toBe(expected);
  });

  it('should be never when one of the sources is empty', function () {
    var e1 = Observable.empty();
    var e2 = cold('---a---');
    var expected = '-';
    var combined = Observable.combineLatest(e1, e2, concat);
    expectObservable(combined).toBe(expected);
  });

  it('should be never when one of the sources is empty and the other complete', function () {
    var e1 = hot('--^--a--b--c--|');
    var e2 = Observable.empty();
    var expected = '-';
    var combined = Observable.combineLatest(e1, e2, concat);
    expectObservable(combined).toBe(expected);
  });

  it('should combineLatest the provided observables', function () {
    var e1 =   hot('----a----b----c----|');
    var e2 =   hot('--d--e--f--g--|');
    var expected = '----uv--wx-y--z----|';
    var combined = Observable.combineLatest(e1, e2, concat);
    expectObservable(combined).toBe(expected, {u: 'ad', v: 'ae', w: 'af', x: 'bf', y: 'bg', z: 'cg'});
  });
});
