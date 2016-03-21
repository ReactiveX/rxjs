"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
/** @test {buffer} */
describe('Observable.prototype.buffer', function () {
    asDiagram('buffer')('should emit buffers that close and reopen', function () {
        var a = hot('-a-b-c-d-e-f-g-h-i-|');
        var b = hot('-----B-----B-----B-|');
        var expected = '-----x-----y-----z-|';
        var expectedValues = {
            x: ['a', 'b', 'c'],
            y: ['d', 'e', 'f'],
            z: ['g', 'h', 'i']
        };
        expectObservable(a.buffer(b)).toBe(expected, expectedValues);
    });
    it('should work with empty and empty selector', function () {
        var a = Observable.empty();
        var b = Observable.empty();
        var expected = '|';
        expectObservable(a.buffer(b)).toBe(expected);
    });
    it('should work with empty and non-empty selector', function () {
        var a = Observable.empty();
        var b = hot('-----a-----');
        var expected = '|';
        expectObservable(a.buffer(b)).toBe(expected);
    });
    it('should work with non-empty and empty selector', function () {
        var a = hot('--1--2--^--3--4--5---6----7--8--9---0---|');
        var b = Observable.empty();
        var expected = '|';
        expectObservable(a.buffer(b)).toBe(expected);
    });
    it('should work with never and never selector', function () {
        var a = Observable.never();
        var b = Observable.never();
        var expected = '-';
        expectObservable(a.buffer(b)).toBe(expected);
    });
    it('should work with never and empty selector', function () {
        var a = Observable.never();
        var b = Observable.empty();
        var expected = '|';
        expectObservable(a.buffer(b)).toBe(expected);
    });
    it('should work with empty and never selector', function () {
        var a = Observable.empty();
        var b = Observable.never();
        var expected = '|';
        expectObservable(a.buffer(b)).toBe(expected);
    });
    it('should work with non-empty and throw selector', function () {
        var a = hot('---^--a--');
        var b = Observable.throw(new Error('too bad'));
        var expected = '#';
        expectObservable(a.buffer(b)).toBe(expected, null, new Error('too bad'));
    });
    it('should work with throw and non-empty selector', function () {
        var a = Observable.throw(new Error('too bad'));
        var b = hot('---^--a--');
        var expected = '#';
        expectObservable(a.buffer(b)).toBe(expected, null, new Error('too bad'));
    });
    it('should work with error', function () {
        var a = hot('---^-------#', null, new Error('too bad'));
        var b = hot('---^--------');
        var expected = '--------#';
        expectObservable(a.buffer(b)).toBe(expected, null, new Error('too bad'));
    });
    it('should work with error and non-empty selector', function () {
        var a = hot('---^-------#', null, new Error('too bad'));
        var b = hot('---^---a----');
        var expected = '----a---#';
        expectObservable(a.buffer(b)).toBe(expected, { a: [] }, new Error('too bad'));
    });
    it('should work with selector', function () {
        // Buffer Boundaries Simple (RxJS 4)
        var a = hot('--1--2--^--3--4--5---6----7--8--9---0---|');
        var b = hot('--------^--a-------b---cd---------e---f---|');
        var expected = '---a-------b---cd---------e---f-|';
        var expectedValues = {
            a: ['3'],
            b: ['4', '5'],
            c: ['6'],
            d: [],
            e: ['7', '8', '9'],
            f: ['0']
        };
        expectObservable(a.buffer(b)).toBe(expected, expectedValues);
    });
    it('should work with selector completed', function () {
        // Buffer Boundaries onCompletedBoundaries (RxJS 4)
        var a = hot('--1--2--^--3--4--5---6----7--8--9---0---|');
        var subs = '^                !               ';
        var b = hot('--------^--a-------b---cd|               ');
        var expected = '---a-------b---cd|               ';
        var expectedValues = {
            a: ['3'],
            b: ['4', '5'],
            c: ['6'],
            d: []
        };
        expectObservable(a.buffer(b)).toBe(expected, expectedValues);
        expectSubscriptions(a.subscriptions).toBe(subs);
    });
    it('should allow unsubscribing the result Observable early', function () {
        var a = hot('--1--2--^--3--4--5---6----7--8--9---0---|');
        var unsub = '              !                  ';
        var subs = '^             !                  ';
        var b = hot('--------^--a-------b---cd|               ');
        var expected = '---a-------b---                  ';
        var expectedValues = {
            a: ['3'],
            b: ['4', '5']
        };
        expectObservable(a.buffer(b), unsub).toBe(expected, expectedValues);
        expectSubscriptions(a.subscriptions).toBe(subs);
    });
    it('should not break unsubscription chains when unsubscribed explicitly', function () {
        var a = hot('--1--2--^--3--4--5---6----7--8--9---0---|');
        var subs = '^             !                  ';
        var b = hot('--------^--a-------b---cd|               ');
        var expected = '---a-------b---                  ';
        var unsub = '              !                  ';
        var expectedValues = {
            a: ['3'],
            b: ['4', '5']
        };
        var result = a
            .mergeMap(function (x) { return Observable.of(x); })
            .buffer(b)
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected, expectedValues);
        expectSubscriptions(a.subscriptions).toBe(subs);
    });
    it('should work with non-empty and selector error', function () {
        // Buffer Boundaries onErrorSource (RxJS 4)
        var a = hot('--1--2--^--3-----#', { '3': 3 }, new Error('too bad'));
        var subs = '^        !';
        var b = hot('--------^--a--b---');
        var expected = '---a--b--#';
        var expectedValues = {
            a: [3],
            b: []
        };
        expectObservable(a.buffer(b)).toBe(expected, expectedValues, new Error('too bad'));
        expectSubscriptions(a.subscriptions).toBe(subs);
    });
    it('should work with non-empty and empty selector error', function () {
        var a = hot('--1--2--^--3--4--5---6----7--8--9---0---|');
        var b = hot('--------^----------------#', null, new Error('too bad'));
        var expected = '-----------------#';
        expectObservable(a.buffer(b)).toBe(expected, null, new Error('too bad'));
    });
    it('should work with non-empty and selector error', function () {
        // Buffer Boundaries onErrorBoundaries (RxJS 4)
        var obj = { a: true, b: true, c: true };
        var a = hot('--1--2--^--3--4--5---6----7--8--9---0---|');
        var subs = '^                !';
        var b = hot('--------^--a-------b---c-#', obj, new Error('too bad'));
        var expected = '---a-------b---c-#';
        var expectedValues = {
            a: ['3'],
            b: ['4', '5'],
            c: ['6']
        };
        expectObservable(a.buffer(b)).toBe(expected, expectedValues, new Error('too bad'));
        expectSubscriptions(a.subscriptions).toBe(subs);
    });
    it('should unsubscribe notifier when source unsubscribed', function () {
        var a = hot('--1--2--^--3--4--5---6----7--8--9---0---|');
        var unsub = '              !                  ';
        var subs = '^             !                  ';
        var b = hot('--------^--a-------b---cd|               ');
        var bsubs = '^             !                  ';
        var expected = '---a-------b---                  ';
        var expectedValues = {
            a: ['3'],
            b: ['4', '5']
        };
        expectObservable(a.buffer(b), unsub).toBe(expected, expectedValues);
        expectSubscriptions(a.subscriptions).toBe(subs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
    it('should unsubscribe notifier when source unsubscribed', function () {
        var a = hot('-a-b-c-d-e-f-g-h-i-|');
        var b = hot('-----1-----2-----3-|');
        var bsubs = '^    !';
        var expected = '-----(x|)';
        var expectedValues = {
            x: ['a', 'b', 'c'],
        };
        expectObservable(a.buffer(b).take(1)).toBe(expected, expectedValues);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
});
//# sourceMappingURL=buffer-spec.js.map