/* globals describe, it, expect, expectObservable, expectSubscriptions, hot, cold */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var Promise = require('promise');

describe('Observable.prototype.concatMapTo()', function () {
  it('should concatMapTo many outer values to many inner values', function () {
    var values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    var e1 =     hot('-a---b---c---d---|                        ');
    var e1subs =     '^                                        !';
    var inner =  cold('--i-j-k-l-|                              ', values);
    var innersubs = [' ^         !                              ',
                     '           ^         !                    ',
                     '                     ^         !          ',
                     '                               ^         !'];
    var expected =   '---i-j-k-l---i-j-k-l---i-j-k-l---i-j-k-l-|';

    var result = e1.concatMapTo(inner);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should handle an empty source', function () {
    var e1 = cold( '|');
    var e1subs =   '(^!)';
    var inner = cold('-1-2-3|');
    var innersubs = [];
    var expected = '|';

    var result = e1.concatMapTo(inner);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should handle a never source', function () {
    var e1 = cold( '-');
    var e1subs =   '^';
    var inner = cold('-1-2-3|');
    var innersubs = [];
    var expected = '-';

    var result = e1.concatMapTo(inner);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should error immediately if given a just-throw source', function () {
    var e1 = cold( '#');
    var e1subs =   '(^!)';
    var inner = cold('-1-2-3|');
    var innersubs = [];
    var expected = '#';

    var result = e1.concatMapTo(inner);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should return a silenced version of the source if the mapped inner is empty', function () {
    var e1 =    cold('--a-b--c-|');
    var e1subs =     '^        !';
    var inner = cold('|');
    var innersubs = ['  (^!)     ',
                     '    (^!)   ',
                     '       (^!)'];
    var expected =   '---------|';

    var result = e1.concatMapTo(inner);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should return a never if the mapped inner is never', function () {
    var e1 =    cold('--a-b--c-|');
    var e1subs =     '^         ';
    var inner = cold('-');
    var innersubs =  '  ^       ';
    var expected =   '----------';

    var result = e1.concatMapTo(inner);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should propagate errors if the mapped inner is a just-throw Observable', function () {
    var e1 =    cold('--a-b--c-|');
    var e1subs =     '^ !       ';
    var inner = cold('#');
    var innersubs =  '  (^!)    ';
    var expected =   '--#';

    var result = e1.concatMapTo(inner);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should concatMapTo many outer to many inner, complete late', function () {
    var values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    var e1 =     hot('-a---b---c---d----------------------------------|');
    var e1subs =     '^                                               !';
    var inner =  cold('--i-j-k-l-|                                     ', values);
    var innersubs = [' ^         !                                     ',
                     '           ^         !                           ',
                     '                     ^         !                 ',
                     '                               ^         !       '];
    var expected =   '---i-j-k-l---i-j-k-l---i-j-k-l---i-j-k-l--------|';

    var result = e1.concatMapTo(inner);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should concatMapTo many outer to many inner, outer never completes', function () {
    var values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    var e1 =     hot('-a---b---c---d-----------------------------------');
    var e1subs =     '^                                                ';
    var inner =  cold('--i-j-k-l-|                                     ', values);
    var innersubs = [' ^         !                                     ',
                     '           ^         !                           ',
                     '                     ^         !                 ',
                     '                               ^         !       '];
    var expected =   '---i-j-k-l---i-j-k-l---i-j-k-l---i-j-k-l---------';

    var result = e1.concatMapTo(inner);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should concatMapTo many outer to many inner, inner never completes', function () {
    var values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    var e1 =     hot('-a---b---c---d---|');
    var e1subs =     '^                 ';
    var inner =  cold('--i-j-k-l-       ', values);
    var innersubs =  ' ^                ';
    var expected =   '---i-j-k-l--------';

    var result = e1.concatMapTo(inner);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should concatMapTo many outer to many inner, and inner throws', function () {
    var values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    var e1 =     hot('-a---b---c---d---|');
    var e1subs =     '^          !      ';
    var inner =  cold('--i-j-k-l-#      ', values);
    var innersubs =  ' ^         !      ';
    var expected =   '---i-j-k-l-#      ';

    var result = e1.concatMapTo(inner);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should concatMapTo many outer to many inner, and outer throws', function () {
    var values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    var e1 =     hot('-a---b---c---d---#');
    var e1subs =     '^                !';
    var inner =  cold('--i-j-k-l-|      ', values);
    var innersubs = [' ^         !      ',
                     '           ^     !'];
    var expected =   '---i-j-k-l---i-j-#';

    var result = e1.concatMapTo(inner);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should concatMapTo many outer to many inner, both inner and outer throw', function () {
    var values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    var e1 =     hot('-a---b---c---d---#');
    var e1subs =     '^          !      ';
    var inner =  cold('--i-j-k-l-#      ', values);
    var innersubs =  ' ^         !      ';
    var expected =   '---i-j-k-l-#      ';

    var result = e1.concatMapTo(inner);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
  });

  it('should concatMapTo many outer to an array', function () {
    var e1 =   hot('2-----4--------3--------2-------|');
    var expected = '(0123)(0123)---(0123)---(0123)--|';

    var result = e1.concatMapTo(['0', '1', '2', '3']);

    expectObservable(result).toBe(expected);
  });

  it('should concatMapTo many outer to inner arrays, using resultSelector', function () {
    var e1 =   hot('2-----4--------3--------2-------|');
    var expected = '(2345)(4567)---(3456)---(2345)--|';

    var result = e1.concatMapTo(['0', '1', '2', '3'], function (x, y) {
      return String(parseInt(x) + parseInt(y));
    });

    expectObservable(result).toBe(expected);
  });

  it('should concatMapTo many outer to inner arrays, and outer throws', function () {
    var e1 =   hot('2-----4--------3--------2-------#');
    var expected = '(0123)(0123)---(0123)---(0123)--#';

    var result = e1.concatMapTo(['0', '1', '2', '3']);

    expectObservable(result).toBe(expected);
  });

  it('should concatMapTo many outer to inner arrays, resultSelector, outer throws', function () {
    var e1 =   hot('2-----4--------3--------2-------#');
    var expected = '(2345)(4567)---(3456)---(2345)--#';

    var result = e1.concatMapTo(['0', '1', '2', '3'], function (x, y) {
      return String(parseInt(x) + parseInt(y));
    });

    expectObservable(result).toBe(expected);
  });

  it('should mergeMap many outer to inner arrays, outer unsubscribed early', function () {
    var e1 =   hot('2-----4--------3--------2-------|');
    var unsub =    '             !';
    var expected = '(0123)(0123)--';

    var result = e1.concatMapTo(['0', '1', '2', '3']);

    expectObservable(result, unsub).toBe(expected);
  });

  it('should concatMapTo many outer to inner arrays, resultSelector, outer unsubscribed', function () {
    var e1 =   hot('2-----4--------3--------2-------|');
    var unsub =    '             !';
    var expected = '(2345)(4567)--';

    var result = e1.concatMapTo(['0', '1', '2', '3'], function (x, y) {
      return String(parseInt(x) + parseInt(y));
    });

    expectObservable(result, unsub).toBe(expected);
  });

  it('should concatMapTo many outer to inner arrays, resultSelector throws', function () {
    var e1 =   hot('2-----4--------3--------2-------|');
    var expected = '(2345)(4567)---#';

    var result = e1.concatMapTo(['0', '1', '2', '3'], function (x, y) {
      if (x === '3') {
        throw 'error';
      }
      return String(parseInt(x) + parseInt(y));
    });

    expectObservable(result).toBe(expected);
  });

  it('should map values to constant resolved promises and concatenate', function (done) {
    var source = Rx.Observable.from([4,3,2,1]);

    var results = [];
    source.concatMapTo(Observable.from(Promise.resolve(42))).subscribe(
      function next(x) {
        results.push(x);
      },
      function error(err) {
        done.fail('Subscriber error handler not supposed to be called.');
      },
      function complete() {
        expect(results).toEqual([42,42,42,42]);
        done();
      });
  });

  it('should map values to constant rejected promises and concatenate', function (done) {
    var source = Rx.Observable.from([4,3,2,1]);

    source.concatMapTo(Observable.from(Promise.reject(42))).subscribe(
      function next(x) {
        done.fail('Subscriber next handler not supposed to be called.');
      },
      function error(err) {
        expect(err).toEqual(42);
        done();
      },
      function complete() {
        done.fail('Subscriber complete handler not supposed to be called.');
      });
  });

  it('should concatMapTo values to resolved promises with resultSelector', function (done) {
    var source = Rx.Observable.from([4,3,2,1]);
    var resultSelectorCalledWith = [];
    var inner = Observable.from(Promise.resolve(42));
    var resultSelector = function (outerVal, innerVal, outerIndex, innerIndex) {
      resultSelectorCalledWith.push([].slice.call(arguments));
      return 8;
    };

    var results = [];
    var expectedCalls = [
      [4, 42, 0, 0],
      [3, 42, 1, 0],
      [2, 42, 2, 0],
      [1, 42, 3, 0]
    ];
    source.concatMapTo(inner, resultSelector).subscribe(
      function next(x) {
        results.push(x);
      },
      function error(err) {
        done.fail('Subscriber error handler not supposed to be called.');
      },
      function complete() {
        expect(results).toEqual([8,8,8,8]);
        expect(resultSelectorCalledWith).toDeepEqual(expectedCalls);
        done();
      });
  });

  it('should concatMapTo values to rejected promises with resultSelector', function (done) {
    var source = Rx.Observable.from([4,3,2,1]);
    var inner = Observable.from(Promise.reject(42));
    var resultSelector = function () {
      throw 'this should not be called';
    };

    source.concatMapTo(inner, resultSelector).subscribe(
      function next(x) {
        done.fail('Subscriber next handler not supposed to be called.');
      },
      function error(err) {
        expect(err).toEqual(42);
        done();
      },
      function complete() {
        done.fail('Subscriber complete handler not supposed to be called.');
      });
  });
});