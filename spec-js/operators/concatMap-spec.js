"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
/** @test {concatMap} */
describe('Observable.prototype.concatMap', function () {
    it('should concatenate many regular interval inners', function () {
        var a = cold('--a-a-a-(a|)                            ');
        var asubs = '^       !                               ';
        var b = cold('----b--b--(b|)                  ');
        var bsubs = '        ^         !                     ';
        var c = cold('-c-c-(c|)      ');
        var csubs = '                         ^    !         ';
        var d = cold('------(d|)');
        var dsubs = '                              ^     !   ';
        var e1 = hot('a---b--------------------c-d----|       ');
        var e1subs = '^                                   !   ';
        var expected = '--a-a-a-a---b--b--b-------c-c-c-----(d|)';
        var observableLookup = { a: a, b: b, c: c, d: d };
        var source = e1.concatMap(function (value) { return observableLookup[value]; });
        expectObservable(source).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
        expectSubscriptions(c.subscriptions).toBe(csubs);
        expectSubscriptions(d.subscriptions).toBe(dsubs);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should concatMap many outer values to many inner values', function () {
        var values = { i: 'foo', j: 'bar', k: 'baz', l: 'qux' };
        var e1 = hot('-a---b---c---d---|                        ');
        var e1subs = '^                                        !';
        var inner = cold('--i-j-k-l-|                              ', values);
        var innersubs = [' ^         !                              ',
            '           ^         !                    ',
            '                     ^         !          ',
            '                               ^         !'];
        var expected = '---i-j-k-l---i-j-k-l---i-j-k-l---i-j-k-l-|';
        var result = e1.concatMap(function (value) { return inner; });
        expectObservable(result).toBe(expected, values);
        expectSubscriptions(inner.subscriptions).toBe(innersubs);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should handle an empty source', function () {
        var e1 = cold('|');
        var e1subs = '(^!)';
        var inner = cold('-1-2-3|');
        var innersubs = [];
        var expected = '|';
        var result = e1.concatMap(function () { return inner; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(inner.subscriptions).toBe(innersubs);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should handle a never source', function () {
        var e1 = cold('-');
        var e1subs = '^';
        var inner = cold('-1-2-3|');
        var innersubs = [];
        var expected = '-';
        var result = e1.concatMap(function () { return inner; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(inner.subscriptions).toBe(innersubs);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should error immediately if given a just-throw source', function () {
        var e1 = cold('#');
        var e1subs = '(^!)';
        var inner = cold('-1-2-3|');
        var innersubs = [];
        var expected = '#';
        var result = e1.concatMap(function () { return inner; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(inner.subscriptions).toBe(innersubs);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should return a silenced version of the source if the mapped inner is empty', function () {
        var e1 = cold('--a-b--c-| ');
        var e1subs = '^        ! ';
        var inner = cold('|');
        var innersubs = ['  (^!)     ',
            '    (^!)   ',
            '       (^!)'];
        var expected = '---------| ';
        var result = e1.concatMap(function () { return inner; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(inner.subscriptions).toBe(innersubs);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should return a never if the mapped inner is never', function () {
        var e1 = cold('--a-b--c-|');
        var e1subs = '^         ';
        var inner = cold('-');
        var innersubs = '  ^       ';
        var expected = '----------';
        var result = e1.concatMap(function () { return inner; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(inner.subscriptions).toBe(innersubs);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should propagate errors if the mapped inner is a just-throw Observable', function () {
        var e1 = cold('--a-b--c-|');
        var e1subs = '^ !       ';
        var inner = cold('#');
        var innersubs = '  (^!)    ';
        var expected = '--#       ';
        var result = e1.concatMap(function () { return inner; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(inner.subscriptions).toBe(innersubs);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should concatMap many outer to many inner, complete late', function () {
        var values = { i: 'foo', j: 'bar', k: 'baz', l: 'qux' };
        var e1 = hot('-a---b---c---d----------------------------------|');
        var e1subs = '^                                               !';
        var inner = cold('--i-j-k-l-|                                     ', values);
        var innersubs = [' ^         !                                     ',
            '           ^         !                           ',
            '                     ^         !                 ',
            '                               ^         !       '];
        var expected = '---i-j-k-l---i-j-k-l---i-j-k-l---i-j-k-l--------|';
        var result = e1.concatMap(function (value) { return inner; });
        expectObservable(result).toBe(expected, values);
        expectSubscriptions(inner.subscriptions).toBe(innersubs);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should concatMap many outer to many inner, outer never completes', function () {
        var values = { i: 'foo', j: 'bar', k: 'baz', l: 'qux' };
        var e1 = hot('-a---b---c---d-----------------------------------');
        var e1subs = '^                                                ';
        var inner = cold('--i-j-k-l-|                                     ', values);
        var innersubs = [' ^         !                                     ',
            '           ^         !                           ',
            '                     ^         !                 ',
            '                               ^         !       '];
        var expected = '---i-j-k-l---i-j-k-l---i-j-k-l---i-j-k-l---------';
        var result = e1.concatMap(function (value) { return inner; });
        expectObservable(result).toBe(expected, values);
        expectSubscriptions(inner.subscriptions).toBe(innersubs);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should concatMap many outer to many inner, inner never completes', function () {
        var values = { i: 'foo', j: 'bar', k: 'baz', l: 'qux' };
        var e1 = hot('-a---b---c---d---|');
        var e1subs = '^                 ';
        var inner = cold('--i-j-k-l-       ', values);
        var innersubs = ' ^                ';
        var expected = '---i-j-k-l--------';
        var result = e1.concatMap(function (value) { return inner; });
        expectObservable(result).toBe(expected, values);
        expectSubscriptions(inner.subscriptions).toBe(innersubs);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should concatMap many outer to many inner, and inner throws', function () {
        var values = { i: 'foo', j: 'bar', k: 'baz', l: 'qux' };
        var e1 = hot('-a---b---c---d---|');
        var e1subs = '^          !      ';
        var inner = cold('--i-j-k-l-#      ', values);
        var innersubs = ' ^         !      ';
        var expected = '---i-j-k-l-#      ';
        var result = e1.concatMap(function (value) { return inner; });
        expectObservable(result).toBe(expected, values);
        expectSubscriptions(inner.subscriptions).toBe(innersubs);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should concatMap many outer to many inner, and outer throws', function () {
        var values = { i: 'foo', j: 'bar', k: 'baz', l: 'qux' };
        var e1 = hot('-a---b---c---d---#');
        var e1subs = '^                !';
        var inner = cold('--i-j-k-l-|      ', values);
        var innersubs = [' ^         !      ',
            '           ^     !'];
        var expected = '---i-j-k-l---i-j-#';
        var result = e1.concatMap(function (value) { return inner; });
        expectObservable(result).toBe(expected, values);
        expectSubscriptions(inner.subscriptions).toBe(innersubs);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should concatMap many outer to many inner, both inner and outer throw', function () {
        var values = { i: 'foo', j: 'bar', k: 'baz', l: 'qux' };
        var e1 = hot('-a---b---c---d---#');
        var e1subs = '^          !      ';
        var inner = cold('--i-j-k-l-#      ', values);
        var innersubs = ' ^         !      ';
        var expected = '---i-j-k-l-#      ';
        var result = e1.concatMap(function (value) { return inner; });
        expectObservable(result).toBe(expected, values);
        expectSubscriptions(inner.subscriptions).toBe(innersubs);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should concatMap many complex, where all inners are finite', function () {
        var a = cold('-#                                                          ');
        var asubs = [];
        var b = cold('-#                                                        ');
        var bsubs = [];
        var c = cold('-2--3--4--5----6-|                                   ');
        var csubs = '  ^                !                                   ';
        var d = cold('----2--3|                           ');
        var dsubs = '                   ^       !                           ';
        var e = cold('-1------2--3-4-5---|        ');
        var esubs = '                           ^                  !        ';
        var f = cold('--|      ');
        var fsubs = '                                              ^ !      ';
        var g = cold('---1-2|');
        var gsubs = '                                                ^     !';
        var e1 = hot('-a-b--^-c-----d------e----------------f-----g|               ');
        var e1subs = '^                                                     !';
        var expected = '---2--3--4--5----6-----2--3-1------2--3-4-5--------1-2|';
        var observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };
        var result = e1.concatMap(function (value) { return observableLookup[value]; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
        expectSubscriptions(c.subscriptions).toBe(csubs);
        expectSubscriptions(d.subscriptions).toBe(dsubs);
        expectSubscriptions(e.subscriptions).toBe(esubs);
        expectSubscriptions(f.subscriptions).toBe(fsubs);
        expectSubscriptions(g.subscriptions).toBe(gsubs);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should concatMap many complex, all inners finite except one', function () {
        var a = cold('-#                                                          ');
        var asubs = [];
        var b = cold('-#                                                        ');
        var bsubs = [];
        var c = cold('-2--3--4--5----6-|                                   ');
        var csubs = '  ^                !                                   ';
        var d = cold('----2--3-                           ');
        var dsubs = '                   ^                                   ';
        var e = cold('-1------2--3-4-5---|        ');
        var esubs = [];
        var f = cold('--|      ');
        var fsubs = [];
        var g = cold('---1-2|');
        var gsubs = [];
        var e1 = hot('-a-b--^-c-----d------e----------------f-----g|               ');
        var e1subs = '^                                                      ';
        var expected = '---2--3--4--5----6-----2--3----------------------------';
        var observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };
        var result = e1.concatMap(function (value) { return observableLookup[value]; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
        expectSubscriptions(c.subscriptions).toBe(csubs);
        expectSubscriptions(d.subscriptions).toBe(dsubs);
        expectSubscriptions(e.subscriptions).toBe(esubs);
        expectSubscriptions(f.subscriptions).toBe(fsubs);
        expectSubscriptions(g.subscriptions).toBe(gsubs);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should concatMap many complex, inners finite, outer does not complete', function () {
        var a = cold('-#                                                          ');
        var asubs = [];
        var b = cold('-#                                                        ');
        var bsubs = [];
        var c = cold('-2--3--4--5----6-|                                   ');
        var csubs = '  ^                !                                   ';
        var d = cold('----2--3|                           ');
        var dsubs = '                   ^       !                           ';
        var e = cold('-1------2--3-4-5---|        ');
        var esubs = '                           ^                  !        ';
        var f = cold('--|      ');
        var fsubs = '                                              ^ !      ';
        var g = cold('---1-2|');
        var gsubs = '                                                ^     !';
        var e1 = hot('-a-b--^-c-----d------e----------------f-----g---             ');
        var e1subs = '^                                                      ';
        var expected = '---2--3--4--5----6-----2--3-1------2--3-4-5--------1-2-';
        var observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };
        var result = e1.concatMap(function (value) { return observableLookup[value]; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
        expectSubscriptions(c.subscriptions).toBe(csubs);
        expectSubscriptions(d.subscriptions).toBe(dsubs);
        expectSubscriptions(e.subscriptions).toBe(esubs);
        expectSubscriptions(f.subscriptions).toBe(fsubs);
        expectSubscriptions(g.subscriptions).toBe(gsubs);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should concatMap many complex, all inners finite, and outer throws', function () {
        var a = cold('-#                                                          ');
        var asubs = [];
        var b = cold('-#                                                        ');
        var bsubs = [];
        var c = cold('-2--3--4--5----6-|                                   ');
        var csubs = '  ^                !                                   ';
        var d = cold('----2--3|                           ');
        var dsubs = '                   ^       !                           ';
        var e = cold('-1------2--3-4-5---|        ');
        var esubs = '                           ^           !               ';
        var f = cold('--|      ');
        var fsubs = [];
        var g = cold('---1-2|');
        var gsubs = [];
        var e1 = hot('-a-b--^-c-----d------e----------------f-----g#               ');
        var e1subs = '^                                      !               ';
        var expected = '---2--3--4--5----6-----2--3-1------2--3#               ';
        var observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };
        var result = e1.concatMap(function (value) { return observableLookup[value]; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
        expectSubscriptions(c.subscriptions).toBe(csubs);
        expectSubscriptions(d.subscriptions).toBe(dsubs);
        expectSubscriptions(e.subscriptions).toBe(esubs);
        expectSubscriptions(f.subscriptions).toBe(fsubs);
        expectSubscriptions(g.subscriptions).toBe(gsubs);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should concatMap many complex, all inners complete except one throws', function () {
        var a = cold('-#                                                          ');
        var asubs = [];
        var b = cold('-#                                                        ');
        var bsubs = [];
        var c = cold('-2--3--4--5----6-#                                   ');
        var csubs = '  ^                !                                   ';
        var d = cold('----2--3|                           ');
        var dsubs = [];
        var e = cold('-1------2--3-4-5---|        ');
        var esubs = [];
        var f = cold('--|      ');
        var fsubs = [];
        var g = cold('---1-2|');
        var gsubs = [];
        var e1 = hot('-a-b--^-c-----d------e----------------f-----g|               ');
        var e1subs = '^                  !                                   ';
        var expected = '---2--3--4--5----6-#                                   ';
        var observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };
        var result = e1.concatMap(function (value) { return observableLookup[value]; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
        expectSubscriptions(c.subscriptions).toBe(csubs);
        expectSubscriptions(d.subscriptions).toBe(dsubs);
        expectSubscriptions(e.subscriptions).toBe(esubs);
        expectSubscriptions(f.subscriptions).toBe(fsubs);
        expectSubscriptions(g.subscriptions).toBe(gsubs);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should concatMap many complex, all inners finite, outer is unsubscribed early', function () {
        var a = cold('-#                                                          ');
        var asubs = [];
        var b = cold('-#                                                        ');
        var bsubs = [];
        var c = cold('-2--3--4--5----6-|                                   ');
        var csubs = '  ^                !                                   ';
        var d = cold('----2--3|                           ');
        var dsubs = '                   ^       !                           ';
        var e = cold('-1------2--3-4-5---|        ');
        var esubs = '                           ^  !                        ';
        var f = cold('--|      ');
        var fsubs = [];
        var g = cold('---1-2|');
        var gsubs = [];
        var e1 = hot('-a-b--^-c-----d------e----------------f-----g|               ');
        var e1subs = '^                             !                        ';
        var unsub = '                              !                        ';
        var expected = '---2--3--4--5----6-----2--3-1--                        ';
        var observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };
        var result = e1.concatMap(function (value) { return observableLookup[value]; });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
        expectSubscriptions(c.subscriptions).toBe(csubs);
        expectSubscriptions(d.subscriptions).toBe(dsubs);
        expectSubscriptions(e.subscriptions).toBe(esubs);
        expectSubscriptions(f.subscriptions).toBe(fsubs);
        expectSubscriptions(g.subscriptions).toBe(gsubs);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
        var a = cold('-#                                                          ');
        var asubs = [];
        var b = cold('-#                                                        ');
        var bsubs = [];
        var c = cold('-2--3--4--5----6-|                                   ');
        var csubs = '  ^                !                                   ';
        var d = cold('----2--3|                           ');
        var dsubs = '                   ^       !                           ';
        var e = cold('-1------2--3-4-5---|        ');
        var esubs = '                           ^  !                        ';
        var f = cold('--|      ');
        var fsubs = [];
        var g = cold('---1-2|');
        var gsubs = [];
        var e1 = hot('-a-b--^-c-----d------e----------------f-----g|               ');
        var e1subs = '^                             !                        ';
        var unsub = '                              !                        ';
        var expected = '---2--3--4--5----6-----2--3-1--                        ';
        var observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };
        var result = e1
            .mergeMap(function (x) { return Observable.of(x); })
            .concatMap(function (value) { return observableLookup[value]; })
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
        expectSubscriptions(c.subscriptions).toBe(csubs);
        expectSubscriptions(d.subscriptions).toBe(dsubs);
        expectSubscriptions(e.subscriptions).toBe(esubs);
        expectSubscriptions(f.subscriptions).toBe(fsubs);
        expectSubscriptions(g.subscriptions).toBe(gsubs);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should concatMap many complex, all inners finite, project throws', function () {
        var a = cold('-#                                                          ');
        var asubs = [];
        var b = cold('-#                                                        ');
        var bsubs = [];
        var c = cold('-2--3--4--5----6-|                                   ');
        var csubs = '  ^                !                                   ';
        var d = cold('----2--3|                           ');
        var dsubs = '                   ^       !                           ';
        var e = cold('-1------2--3-4-5---|        ');
        var esubs = [];
        var f = cold('--|      ');
        var fsubs = [];
        var g = cold('---1-2|');
        var gsubs = [];
        var e1 = hot('-a-b--^-c-----d------e----------------f-----g|               ');
        var e1subs = '^                          !                           ';
        var expected = '---2--3--4--5----6-----2--3#                           ';
        var observableLookup = { a: a, b: b, c: c, d: d, e: e, f: f, g: g };
        var result = e1.concatMap(function (value) {
            if (value === 'e') {
                throw 'error';
            }
            return observableLookup[value];
        });
        expectObservable(result).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
        expectSubscriptions(c.subscriptions).toBe(csubs);
        expectSubscriptions(d.subscriptions).toBe(dsubs);
        expectSubscriptions(e.subscriptions).toBe(esubs);
        expectSubscriptions(f.subscriptions).toBe(fsubs);
        expectSubscriptions(g.subscriptions).toBe(gsubs);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    function arrayRepeat(value, times) {
        var results = [];
        for (var i = 0; i < times; i++) {
            results.push(value);
        }
        return results;
    }
    it('should concatMap many outer to an array for each value', function () {
        var e1 = hot('2-----4--------3--------2-------|');
        var e1subs = '^                               !';
        var expected = '(22)--(4444)---(333)----(22)----|';
        var result = e1.concatMap((function (value) { return arrayRepeat(value, value); }));
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should concatMap many outer to inner arrays, using resultSelector', function () {
        var e1 = hot('2-----4--------3--------2-------|');
        var e1subs = '^                               !';
        var expected = '(44)--(8888)---(666)----(44)----|';
        var result = e1.concatMap((function (value) { return arrayRepeat(value, value); }), function (x, y) { return String(parseInt(x) + parseInt(y)); });
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should concatMap many outer to inner arrays, and outer throws', function () {
        var e1 = hot('2-----4--------3--------2-------#');
        var e1subs = '^                               !';
        var expected = '(22)--(4444)---(333)----(22)----#';
        var result = e1.concatMap((function (value) { return arrayRepeat(value, value); }));
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should concatMap many outer to inner arrays, resultSelector, outer throws', function () {
        var e1 = hot('2-----4--------3--------2-------#');
        var e1subs = '^                               !';
        var expected = '(44)--(8888)---(666)----(44)----#';
        var result = e1.concatMap((function (value) { return arrayRepeat(value, value); }), function (x, y) { return String(parseInt(x) + parseInt(y)); });
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should mergeMap many outer to inner arrays, outer unsubscribed early', function () {
        var e1 = hot('2-----4--------3--------2-------|');
        var e1subs = '^            !                   ';
        var unsub = '             !                   ';
        var expected = '(22)--(4444)--                   ';
        var result = e1.concatMap((function (value) { return arrayRepeat(value, value); }));
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should concatMap many outer to inner arrays, resultSelector, outer unsubscribed', function () {
        var e1 = hot('2-----4--------3--------2-------|');
        var e1subs = '^            !                   ';
        var unsub = '             !                   ';
        var expected = '(44)--(8888)--                   ';
        var result = e1.concatMap((function (value) { return arrayRepeat(value, value); }), function (x, y) { return String(parseInt(x) + parseInt(y)); });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should concatMap many outer to inner arrays, project throws', function () {
        var e1 = hot('2-----4--------3--------2-------|');
        var e1subs = '^              !                 ';
        var expected = '(22)--(4444)---#                 ';
        var invoked = 0;
        var result = e1.concatMap((function (value) {
            invoked++;
            if (invoked === 3) {
                throw 'error';
            }
            return arrayRepeat(value, value);
        }));
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should concatMap many outer to inner arrays, resultSelector throws', function () {
        var e1 = hot('2-----4--------3--------2-------|');
        var e1subs = '^              !                 ';
        var expected = '(44)--(8888)---#                 ';
        var result = e1.concatMap((function (value) { return arrayRepeat(value, value); }), function (inner, outer) {
            if (outer === '3') {
                throw 'error';
            }
            return String(parseInt(outer) + parseInt(inner));
        });
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should concatMap many outer to inner arrays, resultSelector, project throws', function () {
        var e1 = hot('2-----4--------3--------2-------|');
        var e1subs = '^              !                 ';
        var expected = '(44)--(8888)---#                 ';
        var invoked = 0;
        var result = e1.concatMap((function (value) {
            invoked++;
            if (invoked === 3) {
                throw 'error';
            }
            return arrayRepeat(value, value);
        }), function (inner, outer) {
            return String(parseInt(outer) + parseInt(inner));
        });
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should map values to constant resolved promises and concatenate', function (done) {
        var source = Rx.Observable.from([4, 3, 2, 1]);
        var project = function (value) { return Observable.from(Promise.resolve(42)); };
        var results = [];
        source.concatMap(project).subscribe(function (x) {
            results.push(x);
        }, function (err) {
            done.fail('Subscriber error handler not supposed to be called.');
        }, function () {
            expect(results).toEqual([42, 42, 42, 42]);
            done();
        });
    });
    it('should map values to constant rejected promises and concatenate', function (done) {
        var source = Rx.Observable.from([4, 3, 2, 1]);
        var project = function (value) { return Observable.from(Promise.reject(42)); };
        source.concatMap(project).subscribe(function (x) {
            done.fail('Subscriber next handler not supposed to be called.');
        }, function (err) {
            expect(err).toEqual(42);
            done();
        }, function () {
            done.fail('Subscriber complete handler not supposed to be called.');
        });
    });
    it('should map values to resolved promises and concatenate', function (done) {
        var source = Rx.Observable.from([4, 3, 2, 1]);
        var project = function (value, index) { return Observable.from(Promise.resolve(value + index)); };
        var results = [];
        source.concatMap(project).subscribe(function (x) {
            results.push(x);
        }, function (err) {
            done.fail('Subscriber error handler not supposed to be called.');
        }, function () {
            expect(results).toEqual([4, 4, 4, 4]);
            done();
        });
    });
    it('should map values to rejected promises and concatenate', function (done) {
        var source = Rx.Observable.from([4, 3, 2, 1]);
        var project = function (value, index) { return Observable.from(Promise.reject('' + value + '-' + index)); };
        source.concatMap(project).subscribe(function (x) {
            done.fail('Subscriber next handler not supposed to be called.');
        }, function (err) {
            expect(err).toEqual('4-0');
            done();
        }, function () {
            done.fail('Subscriber complete handler not supposed to be called.');
        });
    });
    it('should concatMap values to resolved promises with resultSelector', function (done) {
        var source = Rx.Observable.from([4, 3, 2, 1]);
        var resultSelectorCalledWith = [];
        var project = function (value, index) { return Observable.from((Promise.resolve([value, index]))); };
        var resultSelector = function (outerVal, innerVal, outerIndex, innerIndex) {
            resultSelectorCalledWith.push([].slice.call(arguments));
            return 8;
        };
        var results = [];
        var expectedCalls = [
            [4, [4, 0], 0, 0],
            [3, [3, 1], 1, 0],
            [2, [2, 2], 2, 0],
            [1, [1, 3], 3, 0]
        ];
        source.concatMap(project, resultSelector).subscribe(function (x) {
            results.push(x);
        }, function (err) {
            done.fail('Subscriber error handler not supposed to be called.');
        }, function () {
            expect(results).toEqual([8, 8, 8, 8]);
            expect(resultSelectorCalledWith).toDeepEqual(expectedCalls);
            done();
        });
    });
    it('should concatMap values to rejected promises with resultSelector', function (done) {
        var source = Rx.Observable.from([4, 3, 2, 1]);
        var project = function (value, index) { return Observable.from(Promise.reject('' + value + '-' + index)); };
        var resultSelector = function () {
            throw 'this should not be called';
        };
        source.concatMap(project, resultSelector).subscribe(function (x) {
            done.fail('Subscriber next handler not supposed to be called.');
        }, function (err) {
            expect(err).toEqual('4-0');
            done();
        }, function () {
            done.fail('Subscriber complete handler not supposed to be called.');
        });
    });
});
//# sourceMappingURL=concatMap-spec.js.map