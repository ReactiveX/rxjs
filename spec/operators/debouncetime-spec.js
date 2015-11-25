/* globals describe, it, expect, expectObservable, expectSubscriptions, cold, hot, rxTestScheduler */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.debounceTime()', function () {
  it('should delay all element by the specified time', function () {
    var e1 =   hot('-a--------b------c----|');
    var e1subs =   '^                     !';
    var expected = '------a--------b------(c|)';

    expectObservable(e1.debounceTime(50, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should debounce and delay element by the specified time', function () {
    var e1 =   hot('-a--(bc)-----------d-------|');
    var e1subs =   '^                          !';
    var expected = '---------c--------------d--|';

    expectObservable(e1.debounceTime(50, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete when source does not emit', function () {
    var e1 =   hot('-----|');
    var e1subs =   '^    !';
    var expected = '-----|';

    expectObservable(e1.debounceTime(10, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete when source is empty', function () {
    var e1 =  cold('|');
    var e1subs =   '(^!)';
    var expected = '|';

    expectObservable(e1.debounceTime(10, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error when source does not emit and raises error', function () {
    var e1 =   hot('-----#');
    var e1subs =   '^    !';
    var expected = '-----#';

    expectObservable(e1.debounceTime(10, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error when source throws', function () {
    var e1 =  cold('#');
    var e1subs =   '(^!)';
    var expected = '#';

    expectObservable(e1.debounceTime(10, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should debounce and does not complete when source does not completes', function () {
    var e1 =   hot('-a--(bc)-----------d-------');
    var e1subs =   '^                          ';
    var expected = '---------c--------------d--';

    expectObservable(e1.debounceTime(50, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not completes when source does not completes', function () {
    var e1 =   hot('-');
    var e1subs =   '^';
    var expected = '-';

    expectObservable(e1.debounceTime(10, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not completes when source never completes', function () {
    var e1 =  cold('-');
    var e1subs =   '^';
    var expected = '-';

    expectObservable(e1.debounceTime(10, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should delay all element until source raises error', function () {
    var e1 =   hot('-a--------b------c----#');
    var e1subs =   '^                     !';
    var expected = '------a--------b------#';

    expectObservable(e1.debounceTime(50, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should debounce all elements while source emits within given time', function () {
    var e1 =   hot('--a--b--c--d--e--f--g--h-|');
    var e1subs =   '^                        !';
    var expected = '-------------------------(h|)';

    expectObservable(e1.debounceTime(40, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should debounce all element while source emits within given time until raises error', function () {
    var e1 =   hot('--a--b--c--d--e--f--g--h-#');
    var e1subs =   '^                        !';
    var expected = '-------------------------#';

    expectObservable(e1.debounceTime(40, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});