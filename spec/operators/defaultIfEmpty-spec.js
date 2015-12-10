/* globals describe, it, expect, expectObservable, expectSubscriptions, cold, hot */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.defaultIfEmpty()', function () {
  it.asDiagram('defaultIfEmpty(\'x\')')('should return the argument if the Observable eventually completes empty', function () {
    var e1 =   hot('--------|   ');
    var e1subs =   '^       !   ';
    var expected = '--------(x|)';

    expectObservable(e1.defaultIfEmpty('x')).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should return the argument if Observable is empty', function () {
    var e1 =  cold('|');
    var e1subs =   '(^!)';
    var expected = '(x|)';

    expectObservable(e1.defaultIfEmpty('x')).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should return null if the Observable is empty and no arguments', function () {
    var e1 =  cold('|');
    var e1subs =   '(^!)';
    var expected = '(x|)';

    expectObservable(e1.defaultIfEmpty()).toBe(expected, { x: null });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should return the Observable if not empty with a default value', function () {
    var e1 =   hot('--a--b--|');
    var e1subs =   '^       !';
    var expected = '--a--b--|';

    expectObservable(e1.defaultIfEmpty('x')).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should return the Observable if not empty with no default value', function () {
    var e1 =   hot('--a--b--|');
    var e1subs =   '^       !';
    var expected = '--a--b--|';

    expectObservable(e1.defaultIfEmpty()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should error if the Observable errors', function () {
    var e1 =  cold('#');
    var e1subs =   '(^!)';
    var expected = '#';

    expectObservable(e1.defaultIfEmpty('x')).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});