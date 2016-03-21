"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
/** @test {combineLatest} */
describe('Observable.prototype.combineLatest', function () {
    asDiagram('combineLatest')('should combine events from two cold observables', function () {
        var e1 = hot('-a--b-----c-d-e-|');
        var e2 = hot('--1--2-3-4---|   ');
        var expected = '--A-BC-D-EF-G-H-|';
        var result = e1.combineLatest(e2, function (a, b) { return String(a) + String(b); });
        expectObservable(result).toBe(expected, {
            A: 'a1', B: 'b1', C: 'b2', D: 'b3', E: 'b4', F: 'c4', G: 'd4', H: 'e4'
        });
    });
    it('should work with two nevers', function () {
        var e1 = cold('-');
        var e1subs = '^';
        var e2 = cold('-');
        var e2subs = '^';
        var expected = '-';
        var result = e1.combineLatest(e2, function (x, y) { return x + y; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should work with never and empty', function () {
        var e1 = cold('-');
        var e1subs = '^';
        var e2 = cold('|');
        var e2subs = '(^!)';
        var expected = '-';
        var result = e1.combineLatest(e2, function (x, y) { return x + y; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should work with empty and never', function () {
        var e1 = cold('|');
        var e1subs = '(^!)';
        var e2 = cold('-');
        var e2subs = '^';
        var expected = '-';
        var result = e1.combineLatest(e2, function (x, y) { return x + y; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should work with empty and empty', function () {
        var e1 = cold('|');
        var e1subs = '(^!)';
        var e2 = cold('|');
        var e2subs = '(^!)';
        var expected = '|';
        var result = e1.combineLatest(e2, function (x, y) { return x + y; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should work with hot-empty and hot-single', function () {
        var values = {
            a: 1,
            b: 2,
            c: 3,
            r: 1 + 3 //a + c
        };
        var e1 = hot('-a-^-|', values);
        var e1subs = '^ !';
        var e2 = hot('-b-^-c-|', values);
        var e2subs = '^   !';
        var expected = '----|';
        var result = e1.combineLatest(e2, function (x, y) { return x + y; });
        expectObservable(result).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should work with hot-single and hot-empty', function () {
        var values = {
            a: 1, b: 2, c: 3
        };
        var e1 = hot('-a-^-|', values);
        var e1subs = '^ !';
        var e2 = hot('-b-^-c-|', values);
        var e2subs = '^   !';
        var expected = '----|';
        var result = e2.combineLatest(e1, function (x, y) { return x + y; });
        expectObservable(result).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should work with hot-single and never', function () {
        var values = {
            a: 1
        };
        var e1 = hot('-a-^-|', values);
        var e1subs = '^ !';
        var e2 = hot('------', values); //never
        var e2subs = '^  ';
        var expected = '-'; //never
        var result = e1.combineLatest(e2, function (x, y) { return x + y; });
        expectObservable(result).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should work with never and hot-single', function () {
        var values = {
            a: 1, b: 2
        };
        var e1 = hot('--------', values); //never
        var e1subs = '^    ';
        var e2 = hot('-a-^-b-|', values);
        var e2subs = '^   !';
        var expected = '-----'; //never
        var result = e1.combineLatest(e2, function (x, y) { return x + y; });
        expectObservable(result).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should work with hot and hot', function () {
        var e1 = hot('--a--^--b--c--|', { a: 'a', b: 'b', c: 'c' });
        var e1subs = '^        !';
        var e2 = hot('---e-^---f--g--|', { e: 'e', f: 'f', g: 'g' });
        var e2subs = '^         !';
        var expected = '----x-yz--|';
        var result = e1.combineLatest(e2, function (x, y) { return x + y; });
        expectObservable(result).toBe(expected, { x: 'bf', y: 'cf', z: 'cg' });
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should accept array of observables', function () {
        var e1 = hot('--a--^--b--c--|');
        var e1subs = '^        !';
        var e2 = hot('---e-^---f--g--|');
        var e2subs = '^         !';
        var e3 = hot('---h-^----i--j-|');
        var e3subs = '^         !';
        var expected = '-----wxyz-|';
        var result = e1.combineLatest([e2, e3], function (x, y, z) { return x + y + z; });
        expectObservable(result).toBe(expected, { w: 'bfi', x: 'cfi', y: 'cgi', z: 'cgj' });
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
        expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
    it('should work with empty and error', function () {
        var e1 = hot('----------|'); //empty
        var e1subs = '^     !';
        var e2 = hot('------#', null, 'shazbot!'); //error
        var e2subs = '^     !';
        var expected = '------#';
        var result = e1.combineLatest(e2, function (x, y) { return x + y; });
        expectObservable(result).toBe(expected, null, 'shazbot!');
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should work with error and empty', function () {
        var e1 = hot('--^---#', null, 'too bad, honk'); //error
        var e1subs = '^   !';
        var e2 = hot('--^--------|'); //empty
        var e2subs = '^   !';
        var expected = '----#';
        var result = e1.combineLatest(e2, function (x, y) { return x + y; });
        expectObservable(result).toBe(expected, null, 'too bad, honk');
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should work with hot and throw', function () {
        var e1 = hot('-a-^--b--c--|', { a: 1, b: 2, c: 3 });
        var e1subs = '^ !';
        var e2 = hot('---^-#', null, 'bazinga');
        var e2subs = '^ !';
        var expected = '--#';
        var result = e1.combineLatest(e2, function (x, y) { return x + y; });
        expectObservable(result).toBe(expected, null, 'bazinga');
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should work with throw and hot', function () {
        var e1 = hot('---^-#', null, 'bazinga');
        var e1subs = '^ !';
        var e2 = hot('-a-^--b--c--|', { a: 1, b: 2, c: 3 });
        var e2subs = '^ !';
        var expected = '--#';
        var result = e1.combineLatest(e2, function (x, y) { return x + y; });
        expectObservable(result).toBe(expected, null, 'bazinga');
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should work with throw and throw', function () {
        var e1 = hot('---^----#', null, 'jenga');
        var e1subs = '^ !';
        var e2 = hot('---^-#', null, 'bazinga');
        var e2subs = '^ !';
        var expected = '--#';
        var result = e1.combineLatest(e2, function (x, y) { return x + y; });
        expectObservable(result).toBe(expected, null, 'bazinga');
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should work with error and throw', function () {
        var e1 = hot('-a-^--b--#', { a: 1, b: 2 }, 'wokka wokka');
        var e1subs = '^ !';
        var e2 = hot('---^-#', null, 'flurp');
        var e2subs = '^ !';
        var expected = '--#';
        var result = e1.combineLatest(e2, function (x, y) { return x + y; });
        expectObservable(result).toBe(expected, null, 'flurp');
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should work with throw and error', function () {
        var e1 = hot('---^-#', null, 'flurp');
        var e1subs = '^ !';
        var e2 = hot('-a-^--b--#', { a: 1, b: 2 }, 'wokka wokka');
        var e2subs = '^ !';
        var expected = '--#';
        var result = e1.combineLatest(e2, function (x, y) { return x + y; });
        expectObservable(result).toBe(expected, null, 'flurp');
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should work with never and throw', function () {
        var e1 = hot('---^-----------');
        var e1subs = '^     !';
        var e2 = hot('---^-----#', null, 'wokka wokka');
        var e2subs = '^     !';
        var expected = '------#';
        var result = e1.combineLatest(e2, function (x, y) { return x + y; });
        expectObservable(result).toBe(expected, null, 'wokka wokka');
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should work with throw and never', function () {
        var e1 = hot('---^----#', null, 'wokka wokka');
        var e1subs = '^    !';
        var e2 = hot('---^-----------');
        var e2subs = '^    !';
        var expected = '-----#';
        var result = e1.combineLatest(e2, function (x, y) { return x + y; });
        expectObservable(result).toBe(expected, null, 'wokka wokka');
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should work with some and throw', function () {
        var e1 = hot('---^----a---b--|', { a: 1, b: 2 });
        var e1subs = '^  !';
        var e2 = hot('---^--#', null, 'wokka wokka');
        var e2subs = '^  !';
        var expected = '---#';
        var result = e1.combineLatest(e2, function (x, y) { return x + y; });
        expectObservable(result).toBe(expected, { a: 1, b: 2 }, 'wokka wokka');
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should work with throw and some', function () {
        var e1 = hot('---^--#', null, 'wokka wokka');
        var e1subs = '^  !';
        var e2 = hot('---^----a---b--|', { a: 1, b: 2 });
        var e2subs = '^  !';
        var expected = '---#';
        var result = e1.combineLatest(e2, function (x, y) { return x + y; });
        expectObservable(result).toBe(expected, { a: 1, b: 2 }, 'wokka wokka');
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should handle throw after complete left', function () {
        var left = hot('--a--^--b---|', { a: 1, b: 2 });
        var leftSubs = '^      !';
        var right = hot('-----^--------#', null, 'bad things');
        var rightSubs = '^        !';
        var expected = '---------#';
        var result = left.combineLatest(right, function (x, y) { return x + y; });
        expectObservable(result).toBe(expected, null, 'bad things');
        expectSubscriptions(left.subscriptions).toBe(leftSubs);
        expectSubscriptions(right.subscriptions).toBe(rightSubs);
    });
    it('should handle throw after complete right', function () {
        var left = hot('-----^--------#', null, 'bad things');
        var leftSubs = '^        !';
        var right = hot('--a--^--b---|', { a: 1, b: 2 });
        var rightSubs = '^      !';
        var expected = '---------#';
        var result = left.combineLatest(right, function (x, y) { return x + y; });
        expectObservable(result).toBe(expected, null, 'bad things');
        expectSubscriptions(left.subscriptions).toBe(leftSubs);
        expectSubscriptions(right.subscriptions).toBe(rightSubs);
    });
    it('should handle interleaved with tail', function () {
        var e1 = hot('-a--^--b---c---|', { a: 'a', b: 'b', c: 'c' });
        var e1subs = '^          !';
        var e2 = hot('--d-^----e---f--|', { d: 'd', e: 'e', f: 'f' });
        var e2subs = '^           !';
        var expected = '-----x-y-z--|';
        var result = e1.combineLatest(e2, function (x, y) { return x + y; });
        expectObservable(result).toBe(expected, { x: 'be', y: 'ce', z: 'cf' });
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should handle two consecutive hot observables', function () {
        var e1 = hot('--a--^--b--c--|', { a: 'a', b: 'b', c: 'c' });
        var e1subs = '^        !';
        var e2 = hot('-----^----------d--e--f--|', { d: 'd', e: 'e', f: 'f' });
        var e2subs = '^                   !';
        var expected = '-----------x--y--z--|';
        var result = e1.combineLatest(e2, function (x, y) { return x + y; });
        expectObservable(result).toBe(expected, { x: 'cd', y: 'ce', z: 'cf' });
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should handle two consecutive hot observables with error left', function () {
        var left = hot('--a--^--b--c--#', { a: 'a', b: 'b', c: 'c' }, 'jenga');
        var leftSubs = '^        !';
        var right = hot('-----^----------d--e--f--|', { d: 'd', e: 'e', f: 'f' });
        var rightSubs = '^        !';
        var expected = '---------#';
        var result = left.combineLatest(right, function (x, y) { return x + y; });
        expectObservable(result).toBe(expected, null, 'jenga');
        expectSubscriptions(left.subscriptions).toBe(leftSubs);
        expectSubscriptions(right.subscriptions).toBe(rightSubs);
    });
    it('should handle two consecutive hot observables with error right', function () {
        var left = hot('--a--^--b--c--|', { a: 'a', b: 'b', c: 'c' });
        var leftSubs = '^        !';
        var right = hot('-----^----------d--e--f--#', { d: 'd', e: 'e', f: 'f' }, 'dun dun dun');
        var rightSubs = '^                   !';
        var expected = '-----------x--y--z--#';
        var result = left.combineLatest(right, function (x, y) { return x + y; });
        expectObservable(result).toBe(expected, { x: 'cd', y: 'ce', z: 'cf' }, 'dun dun dun');
        expectSubscriptions(left.subscriptions).toBe(leftSubs);
        expectSubscriptions(right.subscriptions).toBe(rightSubs);
    });
    it('should handle selector throwing', function () {
        var e1 = hot('--a--^--b--|', { a: 1, b: 2 });
        var e1subs = '^  !';
        var e2 = hot('--c--^--d--|', { c: 3, d: 4 });
        var e2subs = '^  !';
        var expected = '---#';
        var result = e1.combineLatest(e2, function (x, y) { throw 'ha ha ' + x + ', ' + y; });
        expectObservable(result).toBe(expected, null, 'ha ha 2, 4');
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should allow unsubscribing early and explicitly', function () {
        var e1 = hot('--a--^--b--c---d-| ');
        var e1subs = '^        !    ';
        var e2 = hot('---e-^---f--g---h-|');
        var e2subs = '^        !    ';
        var expected = '----x-yz--    ';
        var unsub = '         !    ';
        var values = { x: 'bf', y: 'cf', z: 'cg' };
        var result = e1.combineLatest(e2, function (x, y) { return x + y; });
        expectObservable(result, unsub).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should not break unsubscription chains when unsubscribed explicitly', function () {
        var e1 = hot('--a--^--b--c---d-| ');
        var e1subs = '^        !    ';
        var e2 = hot('---e-^---f--g---h-|');
        var e2subs = '^        !    ';
        var expected = '----x-yz--    ';
        var unsub = '         !    ';
        var values = { x: 'bf', y: 'cf', z: 'cg' };
        var result = e1
            .mergeMap(function (x) { return Observable.of(x); })
            .combineLatest(e2, function (x, y) { return x + y; })
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
});
//# sourceMappingURL=combineLatest-spec.js.map