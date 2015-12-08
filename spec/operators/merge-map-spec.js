/* globals describe, it, expect, hot, cold, expectObservable, expectSubscriptions */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var Promise = require('promise');

describe('Observable.prototype.mergeMap()', function () {
  it('should mergeMap many regular interval inners', function () {
    var a =   cold('----a---a---a---(a|)                    ');
    var b =   cold(    '----b---b---(b|)                    ');
    var c =   cold(                '----c---c---c---c---(c|)');
    var d =   cold(                        '----(d|)        ');
    var e1 =   hot('a---b-----------c-------d-------|       ');
    var e1subs =   '^                                   !   ';
    var expected = '----a---(ab)(ab)(ab)c---c---(cd)c---(c|)';

    var observableLookup = { a: a, b: b, c: c, d: d };
    var source = e1.mergeMap(function (value) {
      return observableLookup[value];
    });

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should map values to constant resolved promises and merge', function (done) {
    var source = Rx.Observable.from([4,3,2,1]);
    var project = function (value) {
      return Observable.from(Promise.resolve(42));
    };

    var results = [];
    source.mergeMap(project).subscribe(
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

  it('should map values to constant rejected promises and merge', function (done) {
    var source = Rx.Observable.from([4,3,2,1]);
    var project = function (value) {
      return Observable.from(Promise.reject(42));
    };

    source.mergeMap(project).subscribe(
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

  it('should map values to resolved promises and merge', function (done) {
    var source = Rx.Observable.from([4,3,2,1]);
    var project = function (value, index) {
      return Observable.from(Promise.resolve(value + index));
    };

    var results = [];
    source.mergeMap(project).subscribe(
      function next(x) {
        results.push(x);
      },
      function error(err) {
        done.fail('Subscriber error handler not supposed to be called.');
      },
      function complete() {
        expect(results).toEqual([4,4,4,4]);
        done();
      });
  });

  it('should map values to rejected promises and merge', function (done) {
    var source = Rx.Observable.from([4,3,2,1]);
    var project = function (value, index) {
      return Observable.from(Promise.reject('' + value + '-' + index));
    };

    source.mergeMap(project).subscribe(
      function next(x) {
        done.fail('Subscriber next handler not supposed to be called.');
      },
      function error(err) {
        expect(err).toEqual('4-0');
        done();
      },
      function complete() {
        done.fail('Subscriber complete handler not supposed to be called.');
      });
  });

  it('should mergeMap values to resolved promises with resultSelector', function (done) {
    var source = Rx.Observable.from([4,3,2,1]);
    var resultSelectorCalledWith = [];
    var project = function (value, index) {
      return Observable.from(Promise.resolve([value, index]));
    };
    var resultSelector = function (outerVal, innerVal, outerIndex, innerIndex) {
      resultSelectorCalledWith.push([].slice.call(arguments));
      return 8;
    };

    var results = [];
    var expectedCalls = [
      [4, [4,0], 0, 0],
      [3, [3,1], 1, 0],
      [2, [2,2], 2, 0],
      [1, [1,3], 3, 0],
    ];
    source.mergeMap(project, resultSelector).subscribe(
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

  it('should mergeMap values to rejected promises with resultSelector', function (done) {
    var source = Rx.Observable.from([4,3,2,1]);
    var project = function (value, index) {
      return Observable.from(Promise.reject('' + value + '-' + index));
    };
    var resultSelector = function () {
      throw 'this should not be called';
    };

    source.mergeMap(project, resultSelector).subscribe(
      function next(x) {
        done.fail('Subscriber next handler not supposed to be called.');
      },
      function error(err) {
        expect(err).toEqual('4-0');
        done();
      },
      function complete() {
        done.fail('Subscriber complete handler not supposed to be called.');
      });
  });

  it('should mergeMap many outer values to many inner values', function () {
    var values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    var e1 =     hot('-a-------b-------c-------d-------|            ');
    var e1subs =     '^                                            !';
    var inner =  cold('----i---j---k---l---|                        ', values);
    var innersubs = [' ^                   !                        ',
                     '         ^                   !                ',
                     '                 ^                   !        ',
                     '                         ^                   !'];
    var expected =   '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)k---l---|';

    var result = e1.mergeMap(function (value) { return inner; });

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to many inner, complete late', function () {
    var values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    var e1 =    hot('-a-------b-------c-------d-----------------------|');
    var e1subs =    '^                                                !';
    var inner = cold('----i---j---k---l---|                            ', values);
    var expected =  '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)k---l-------|';

    var result = e1.mergeMap(function (value) { return inner; });

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to many inner, outer never completes', function () {
    var values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    var e1 =    hot('-a-------b-------c-------d-------e---------------f------');
    var unsub =     '                                                       !';
    var e1subs =    '^                                                      !';
    var inner = cold('----i---j---k---l---|                                  ', values);
    var expected =  '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)(ki)(lj)k---l---i--';

    var source = e1.mergeMap(function (value) { return inner; });

    expectObservable(source, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
    var values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    var e1 =    hot('-a-------b-------c-------d-------e---------------f------');
    var e1subs =    '^                                                      !';
    var inner = cold('----i---j---k---l---|                                  ', values);
    var expected =  '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)(ki)(lj)k---l---i--';
    var unsub =     '                                                       !';

    var source = e1
      .map(function (x) { return x; })
      .mergeMap(function (value) { return inner; })
      .map(function (x) { return x; });

    expectObservable(source, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to many inner, inner never completes', function () {
    var values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    var e1 =    hot('-a-------b-------c-------d-------|         ');
    var e1subs =    '^                                          ';
    var inner = cold('----i---j---k---l-------------------------', values);
    var expected =  '-----i---j---(ki)(lj)(ki)(lj)(ki)(lj)k---l-';

    var result = e1.mergeMap(function (value) { return inner; });

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to many inner, and inner throws', function () {
    var values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    var e1 =    hot('-a-------b-------c-------d-------|');
    var e1subs =    '^                        !        ';
    var inner = cold('----i---j---k---l-------#        ', values);
    var expected =  '-----i---j---(ki)(lj)(ki)#        ';

    var result = e1.mergeMap(function (value) { return inner; });

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to many inner, and outer throws', function () {
    var values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    var e1 =    hot('-a-------b-------c-------d-------#');
    var e1subs =    '^                                !';
    var inner = cold('----i---j---k---l---|            ', values);
    var expected =  '-----i---j---(ki)(lj)(ki)(lj)(ki)#';

    var result = e1.mergeMap(function (value) { return inner; });

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to many inner, both inner and outer throw', function () {
    var values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    var e1 =    hot('-a-------b-------c-------d-------#');
    var e1subs =    '^                    !            ';
    var inner = cold('----i---j---k---l---#            ', values);
    var expected =  '-----i---j---(ki)(lj)#            ';

    var result = e1.mergeMap(function (value) { return inner; });

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap to many cold Observable, with parameter concurrency=1', function () {
    var values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    var e1 =     hot('-a-------b-------c---|                                        ');
    var e1subs =     '^                                                            !';
    var inner =  cold('----i---j---k---l---|                                        ', values);
    var innersubs = [' ^                   !                                        ',
                     '                     ^                   !                    ',
                     '                                         ^                   !'];
    var expected =   '-----i---j---k---l-------i---j---k---l-------i---j---k---l---|';

    function project() { return inner; }
    function resultSelector(oV, iV, oI, iI) { return iV; }
    var result = e1.mergeMap(project, resultSelector, 1);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap to many cold Observable, with parameter concurrency=2', function () {
    var values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    var e1 =     hot('-a-------b-------c---|                    ');
    var e1subs =     '^                                        !';
    var inner =  cold('----i---j---k---l---|                    ', values);
    var innersubs = [' ^                   !                    ',
                     '         ^                   !            ',
                     '                     ^                   !'];
    var expected =   '-----i---j---(ki)(lj)k---(li)j---k---l---|';

    function project() { return inner; }
    function resultSelector(oV, iV, oI, iI) { return iV; }
    var result = e1.mergeMap(project, resultSelector, 2);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(inner.subscriptions).toBe(innersubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap to many hot Observable, with parameter concurrency=1', function () {
    var values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    var e1 =     hot('-a-------b-------c---|                                        ');
    var e1subs =     '^                                                            !';
    var hotA =   hot('x----i---j---k---l---|                                        ', values);
    var hotB =   hot('-x-x-xxxx-x-x-xxxxx-x----i---j---k---l---|                    ', values);
    var hotC =   hot('x-xxxx---x-x-x-x-x-xx--x--x-x--x--xxxx-x-----i---j---k---l---|', values);
    var asubs =      ' ^                   !                                        ';
    var bsubs =      '                     ^                   !                    ';
    var csubs =      '                                         ^                   !';
    var expected =   '-----i---j---k---l-------i---j---k---l-------i---j---k---l---|';
    var inners = { a: hotA, b: hotB, c: hotC };

    function project(x) { return inners[x]; }
    function resultSelector(oV, iV, oI, iI) { return iV; }
    var result = e1.mergeMap(project, resultSelector, 1);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(hotA.subscriptions).toBe(asubs);
    expectSubscriptions(hotB.subscriptions).toBe(bsubs);
    expectSubscriptions(hotC.subscriptions).toBe(csubs);
  });

  it('should mergeMap to many hot Observable, with parameter concurrency=2', function () {
    var values = {i: 'foo', j: 'bar', k: 'baz', l: 'qux'};
    var e1 =     hot('-a-------b-------c---|                    ');
    var e1subs =     '^                                        !';
    var hotA =   hot('x----i---j---k---l---|                    ', values);
    var hotB =   hot('-x-x-xxxx----i---j---k---l---|            ', values);
    var hotC =   hot('x-xxxx---x-x-x-x-x-xx----i---j---k---l---|', values);
    var asubs =      ' ^                   !                    ';
    var bsubs =      '         ^                   !            ';
    var csubs =      '                     ^                   !';
    var expected =   '-----i---j---(ki)(lj)k---(li)j---k---l---|';
    var inners = { a: hotA, b: hotB, c: hotC };

    function project(x) { return inners[x]; }
    function resultSelector(oV, iV, oI, iI) { return iV; }
    var result = e1.mergeMap(project, resultSelector, 2);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(hotA.subscriptions).toBe(asubs);
    expectSubscriptions(hotB.subscriptions).toBe(bsubs);
    expectSubscriptions(hotC.subscriptions).toBe(csubs);
  });

  it('should mergeMap many complex, where all inners are finite', function () {
    var a =   cold( '-#'                                                  );
    var b =   cold(   '-#'                                                );
    var c =   cold(        '-2--3--4--5------------------6-|'             );
    var d =   cold(              '-----------2--3|'                       );
    var e =   cold(                     '-1--------2--3-----4--5--------|');
    var f =   cold(                                      '--|'            );
    var g =   cold(                                            '---1-2|'  );
    var e1 =   hot('-a-b--^-c-----d------e----------------f-----g|'       );
    var e1subs =         '^                                             !';
    var expected =       '---2--3--4--5---1--2--3--2--3--6--4--5---1-2--|';

    var observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

    var result = e1.mergeMap(function (value) {
      return observableLookup[value];
    });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many complex, all inners finite except one', function () {
    var a =   cold( '-#'                                                  );
    var b =   cold(   '-#'                                                );
    var c =   cold(        '-2--3--4--5------------------6-|'             );
    var d =   cold(              '-----------2--3-'                       );
    var e =   cold(                     '-1--------2--3-----4--5--------|');
    var f =   cold(                                      '--|'            );
    var g =   cold(                                            '---1-2|'  );
    var e1 =   hot('-a-b--^-c-----d------e----------------f-----g|'       );
    var e1subs =         '^                                               ';
    var expected =       '---2--3--4--5---1--2--3--2--3--6--4--5---1-2----';

    var observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

    var result = e1.mergeMap(function (value) {
      return observableLookup[value];
    });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many complex, inners finite, outer does not complete', function () {
    var a =   cold( '-#'                                                  );
    var b =   cold(   '-#'                                                );
    var c =   cold(        '-2--3--4--5------------------6-|'             );
    var d =   cold(              '-----------2--3|'                       );
    var e =   cold(                     '-1--------2--3-----4--5--------|');
    var f =   cold(                                      '--|'            );
    var g =   cold(                                            '---1-2|'  );
    var e1 =   hot('-a-b--^-c-----d------e----------------f-----g--------');
    var e1subs =         '^                                               ';
    var expected =       '---2--3--4--5---1--2--3--2--3--6--4--5---1-2----';

    var observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

    var result = e1.mergeMap(function (value) {
      return observableLookup[value];
    });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many complex, all inners finite, and outer throws', function () {
    var a =   cold( '-#'                                                  );
    var b =   cold(   '-#'                                                );
    var c =   cold(        '-2--3--4--5------------------6-|'             );
    var d =   cold(              '-----------2--3|'                       );
    var e =   cold(                     '-1--------2--3-----4--5--------|');
    var f =   cold(                                      '--|'            );
    var g =   cold(                                            '---1-2|'  );
    var e1 =   hot('-a-b--^-c-----d------e----------------f-----g#       ');
    var e1subs =         '^                                      !       ';
    var expected =       '---2--3--4--5---1--2--3--2--3--6--4--5-#       ';

    var observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

    var result = e1.mergeMap(function (value) {
      return observableLookup[value];
    });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many complex, all inners complete except one throws', function () {
    var a =   cold( '-#'                                                  );
    var b =   cold(   '-#'                                                );
    var c =   cold(        '-2--3--4--5------------------6-#'             );
    var d =   cold(              '-----------2--3|'                       );
    var e =   cold(                     '-1--------2--3-----4--5--------|');
    var f =   cold(                                      '--|'            );
    var g =   cold(                                            '---1-2|'  );
    var e1 =   hot('-a-b--^-c-----d------e----------------f-----g|'       );
    var e1subs =         '^                                !             ';
    var expected =       '---2--3--4--5---1--2--3--2--3--6-#             ';

    var observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };

    var result = e1.mergeMap(function (value) {
      return observableLookup[value];
    });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many complex, all inners finite, outer is unsubscribed', function () {
    var a =   cold( '-#'                                                  );
    var b =   cold(   '-#'                                                );
    var c =   cold(        '-2--3--4--5------------------6-|'             );
    var d =   cold(              '-----------2--3|'                       );
    var e =   cold(                     '-1--------2--3-----4--5--------|');
    var f =   cold(                                      '--|'            );
    var g =   cold(                                            '---1-2|'  );
    var e1 =   hot('-a-b--^-c-----d------e----------------f-----g|'       );
    var unsub =          '                              !                ';
    var e1subs =         '^                             !                ';
    var expected =       '---2--3--4--5---1--2--3--2--3--                ';

    var observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };
    var source = e1.mergeMap(function (value) {
      return observableLookup[value];
    });

    expectObservable(source, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many complex, all inners finite, project throws', function () {
    var a =   cold( '-#'                                                  );
    var b =   cold(   '-#'                                                );
    var c =   cold(        '-2--3--4--5------------------6-|'             );
    var d =   cold(              '-----------2--3|'                       );
    var e =   cold(                     '-1--------2--3-----4--5--------|');
    var f =   cold(                                      '--|'            );
    var g =   cold(                                            '---1-2|'  );
    var e1 =   hot('-a-b--^-c-----d------e----------------f-----g|'       );
    var e1subs =         '^              !                               ';
    var expected =       '---2--3--4--5--#                               ';

    var observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };
    var invoked = 0;
    var source = e1.mergeMap(function (value) {
      invoked++;
      if (invoked === 3) {
        throw 'error';
      }
      return observableLookup[value];
    });

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  function arrayRepeat(value, times) {
    var results = [];
    for (var i = 0; i < times; i++) {
      results.push(value);
    }
    return results;
  }

  it('should mergeMap many outer to an array for each value', function () {
    var e1 =   hot('2-----4--------3--------2-------|');
    var e1subs =   '^                               !';
    var expected = '(22)--(4444)---(333)----(22)----|';

    var source = e1.mergeMap(function (value) {
      return arrayRepeat(value, value);
    });

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to inner arrays, using resultSelector', function () {
    var e1 =   hot('2-----4--------3--------2-------|');
    var e1subs =   '^                               !';
    var expected = '(44)--(8888)---(666)----(44)----|';

    var source = e1.mergeMap(function (value) {
      return arrayRepeat(value, value);
    }, function (x, y) {
      return String(parseInt(x) + parseInt(y));
    });

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to inner arrays, and outer throws', function () {
    var e1 =   hot('2-----4--------3--------2-------#');
    var e1subs =   '^                               !';
    var expected = '(22)--(4444)---(333)----(22)----#';

    var source = e1.mergeMap(function (value) {
      return arrayRepeat(value, value);
    });

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to inner arrays, resultSelector, outer throws', function () {
    var e1 =   hot('2-----4--------3--------2-------#');
    var e1subs =   '^                               !';
    var expected = '(44)--(8888)---(666)----(44)----#';

    var source = e1.mergeMap(function (value) {
      return arrayRepeat(value, value);
    }, function (x, y) {
      return String(parseInt(x) + parseInt(y));
    });

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to inner arrays, outer gets unsubscribed', function () {
    var e1 =   hot('2-----4--------3--------2-------|');
    var unsub =    '             !                   ';
    var e1subs  =  '^            !                   ';
    var expected = '(22)--(4444)--                   ';

    var source = e1.mergeMap(function (value) {
      return arrayRepeat(value, value);
    });

    expectObservable(source, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to inner arrays, resultSelector, outer unsubscribed', function () {
    var e1 =   hot('2-----4--------3--------2-------|');
    var unsub =    '             !                   ';
    var e1subs =   '^            !                   ';
    var expected = '(44)--(8888)--                   ';

    var source = e1.mergeMap(function (value) {
      return arrayRepeat(value, value);
    }, function (x, y) {
      return String(parseInt(x) + parseInt(y));
    });

    expectObservable(source, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to inner arrays, project throws', function () {
    var e1 =   hot('2-----4--------3--------2-------|');
    var e1subs =   '^              !                 ';
    var expected = '(22)--(4444)---#                 ';

    var invoked = 0;
    var source = e1.mergeMap(function (value) {
      invoked++;
      if (invoked === 3) {
        throw 'error';
      }
      return arrayRepeat(value, value);
    });

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to inner arrays, resultSelector throws', function () {
    var e1 =   hot('2-----4--------3--------2-------|');
    var e1subs  =  '^              !                 ';
    var expected = '(44)--(8888)---#                 ';

    var source = e1.mergeMap(function (value) {
      return arrayRepeat(value, value);
    }, function (inner, outer) {
      if (outer === '3') {
        throw 'error';
      }
      return String(parseInt(outer) + parseInt(inner));
    });

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mergeMap many outer to inner arrays, resultSelector, project throws', function () {
    var e1 =   hot('2-----4--------3--------2-------|');
    var e1subs  =  '^              !                 ';
    var expected = '(44)--(8888)---#                 ';

    var invoked = 0;
    var source = e1.mergeMap(function (value) {
      invoked++;
      if (invoked === 3) {
        throw 'error';
      }
      return arrayRepeat(value, value);
    }, function (inner, outer) {
      return String(parseInt(outer) + parseInt(inner));
    });

    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should map and flatten', function () {
    var source = Observable.of(1, 2, 3, 4).mergeMap(function (x) {
      return Observable.of(x + '!');
    });

    var expected = ['1!', '2!', '3!', '4!'];
    var completed = false;

    var sub = source.subscribe(function (x) {
      expect(x).toBe(expected.shift());
    }, null, function () {
      expect(expected.length).toBe(0);
      completed = true;
    });

    expect(completed).toBe(true);
  });

  it('should map and flatten an Array', function () {
    var source = Observable.of(1, 2, 3, 4).mergeMap(function (x) {
      return [x + '!'];
    });

    var expected = ['1!', '2!', '3!', '4!'];
    var completed = false;

    var sub = source.subscribe(function (x) {
      expect(x).toBe(expected.shift());
    }, null, function () {
      expect(expected.length).toBe(0);
      completed = true;
    });

    expect(completed).toBe(true);
  });
});
