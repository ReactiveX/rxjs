"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
var queueScheduler = Rx.Scheduler.queue;
/** @test {zipAll} */
describe('Observable.prototype.zipAll', function () {
    asDiagram('zipAll')('should combine paired events from two observables', function () {
        var x = cold('-a-----b-|');
        var y = cold('--1-2-----');
        var outer = hot('-x----y--------|         ', { x: x, y: y });
        var expected = '-----------------A----B-|';
        var result = outer.zipAll(function (a, b) { return String(a) + String(b); });
        expectObservable(result).toBe(expected, { A: 'a1', B: 'b2' });
    });
    it('should combine two observables', function () {
        var a = hot('---1---2---3---');
        var asubs = '^';
        var b = hot('--4--5--6--7--8--');
        var bsubs = '^';
        var expected = '---x---y---z';
        var values = { x: ['1', '4'], y: ['2', '5'], z: ['3', '6'] };
        expectObservable(Observable.of(a, b).zipAll()).toBe(expected, values);
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
    it('should take all observables from the source and zip them', function (done) {
        var expected = ['a1', 'b2', 'c3'];
        var i = 0;
        Observable.of(Observable.of('a', 'b', 'c'), Observable.of(1, 2, 3))
            .zipAll(function (a, b) { return a + b; })
            .subscribe(function (x) {
            expect(x).toBe(expected[i++]);
        }, null, done);
    });
    it('should end once one observable completes and its buffer is empty', function () {
        var e1 = hot('---a--b--c--|               ');
        var e1subs = '^           !               ';
        var e2 = hot('------d----e----f--------|  ');
        var e2subs = '^                 !         ';
        var e3 = hot('--------h----i----j---------'); // doesn't complete
        var e3subs = '^                 !         ';
        var expected = '--------x----y----(z|)      '; // e1 complete and buffer empty
        var values = {
            x: ['a', 'd', 'h'],
            y: ['b', 'e', 'i'],
            z: ['c', 'f', 'j']
        };
        expectObservable(Observable.of(e1, e2, e3).zipAll()).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
        expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
    it('should end once one observable nexts and zips value from completed other ' +
        'observable whose buffer is empty', function () {
        var e1 = hot('---a--b--c--|             ');
        var e1subs = '^           !             ';
        var e2 = hot('------d----e----f|        ');
        var e2subs = '^                !        ';
        var e3 = hot('--------h----i----j-------'); // doesn't complete
        var e3subs = '^                 !       ';
        var expected = '--------x----y----(z|)    '; // e2 buffer empty and signaled complete
        var values = {
            x: ['a', 'd', 'h'],
            y: ['b', 'e', 'i'],
            z: ['c', 'f', 'j']
        };
        expectObservable(Observable.of(e1, e2, e3).zipAll()).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
        expectSubscriptions(e3.subscriptions).toBe(e3subs);
    });
    describe('with iterables', function () {
        it('should zip them with values', function () {
            var myIterator = {
                count: 0,
                next: function () {
                    return { value: this.count++, done: false };
                }
            };
            myIterator[Symbol.iterator] = function () { return this; };
            var e1 = hot('---a---b---c---d---|');
            var e1subs = '^                  !';
            var expected = '---w---x---y---z---|';
            var values = {
                w: ['a', 0],
                x: ['b', 1],
                y: ['c', 2],
                z: ['d', 3]
            };
            expectObservable(Observable.of(e1, myIterator).zipAll()).toBe(expected, values);
            expectSubscriptions(e1.subscriptions).toBe(e1subs);
        });
        it('should only call `next` as needed', function () {
            var nextCalled = 0;
            var myIterator = {
                count: 0,
                next: function () {
                    nextCalled++;
                    return { value: this.count++, done: false };
                }
            };
            myIterator[Symbol.iterator] = function () { return this; };
            Observable.of(Observable.of(1, 2, 3), myIterator).zipAll()
                .subscribe();
            // since zip will call `next()` in advance, total calls when
            // zipped with 3 other values should be 4.
            expect(nextCalled).toBe(4);
        });
        it('should work with never observable and empty iterable', function () {
            var a = cold('-');
            var asubs = '^';
            var b = [];
            var expected = '-';
            expectObservable(Observable.of(a, b).zipAll()).toBe(expected);
            expectSubscriptions(a.subscriptions).toBe(asubs);
        });
        it('should work with empty observable and empty iterable', function () {
            var a = cold('|');
            var asubs = '(^!)';
            var b = [];
            var expected = '|';
            expectObservable(Observable.of(a, b).zipAll()).toBe(expected);
            expectSubscriptions(a.subscriptions).toBe(asubs);
        });
        it('should work with empty observable and non-empty iterable', function () {
            var a = cold('|');
            var asubs = '(^!)';
            var b = [1];
            var expected = '|';
            expectObservable(Observable.of(a, b).zipAll()).toBe(expected);
            expectSubscriptions(a.subscriptions).toBe(asubs);
        });
        it('should work with non-empty observable and empty iterable', function () {
            var a = hot('---^----a--|');
            var asubs = '^       !';
            var b = [];
            var expected = '--------|';
            expectObservable(Observable.of(a, b).zipAll()).toBe(expected);
            expectSubscriptions(a.subscriptions).toBe(asubs);
        });
        it('should work with never observable and non-empty iterable', function () {
            var a = cold('-');
            var asubs = '^';
            var b = [1];
            var expected = '-';
            expectObservable(Observable.of(a, b).zipAll()).toBe(expected);
            expectSubscriptions(a.subscriptions).toBe(asubs);
        });
        it('should work with non-empty observable and non-empty iterable', function () {
            var a = hot('---^----1--|');
            var asubs = '^    !   ';
            var b = [2];
            var expected = '-----(x|)';
            expectObservable(Observable.of(a, b).zipAll()).toBe(expected, { x: ['1', 2] });
            expectSubscriptions(a.subscriptions).toBe(asubs);
        });
        it('should work with non-empty observable and empty iterable', function () {
            var a = hot('---^----#');
            var asubs = '^    !';
            var b = [];
            var expected = '-----#';
            expectObservable(Observable.of(a, b).zipAll()).toBe(expected);
            expectSubscriptions(a.subscriptions).toBe(asubs);
        });
        it('should work with observable which raises error and non-empty iterable', function () {
            var a = hot('---^----#');
            var asubs = '^    !';
            var b = [1];
            var expected = '-----#';
            expectObservable(Observable.of(a, b).zipAll()).toBe(expected);
            expectSubscriptions(a.subscriptions).toBe(asubs);
        });
        it('should work with non-empty many observable and non-empty many iterable', function () {
            var a = hot('---^--1--2--3--|');
            var asubs = '^        !   ';
            var b = [4, 5, 6];
            var expected = '---x--y--(z|)';
            expectObservable(Observable.of(a, b).zipAll()).toBe(expected, { x: ['1', 4], y: ['2', 5], z: ['3', 6] });
            expectSubscriptions(a.subscriptions).toBe(asubs);
        });
        it('should work with non-empty observable and non-empty iterable selector that throws', function () {
            var a = hot('---^--1--2--3--|');
            var asubs = '^     !';
            var b = [4, 5, 6];
            var expected = '---x--#';
            var selector = function (x, y) {
                if (y === 5) {
                    throw new Error('too bad');
                }
                else {
                    return x + y;
                }
            };
            expectObservable(Observable.of(a, b).zipAll(selector)).toBe(expected, { x: '14' }, new Error('too bad'));
            expectSubscriptions(a.subscriptions).toBe(asubs);
        });
    });
    it('should combine two observables and selector', function () {
        var a = hot('---1---2---3---');
        var asubs = '^';
        var b = hot('--4--5--6--7--8--');
        var bsubs = '^';
        var expected = '---x---y---z';
        expectObservable(Observable.of(a, b).zipAll(function (e1, e2) { return e1 + e2; }))
            .toBe(expected, { x: '14', y: '25', z: '36' });
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
    it('should work with n-ary symmetric', function () {
        var a = hot('---1-^-1----4----|');
        var asubs = '^         !  ';
        var b = hot('---1-^--2--5----| ');
        var bsubs = '^         !  ';
        var c = hot('---1-^---3---6-|  ');
        var expected = '----x---y-|  ';
        expectObservable(Observable.of(a, b, c).zipAll()).toBe(expected, { x: ['1', '2', '3'], y: ['4', '5', '6'] });
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
    it('should work with n-ary symmetric selector', function () {
        var a = hot('---1-^-1----4----|');
        var asubs = '^         !  ';
        var b = hot('---1-^--2--5----| ');
        var bsubs = '^         !  ';
        var c = hot('---1-^---3---6-|  ');
        var expected = '----x---y-|  ';
        var observable = Observable.of(a, b, c).zipAll(function (r0, r1, r2) { return [r0, r1, r2]; });
        expectObservable(observable).toBe(expected, { x: ['1', '2', '3'], y: ['4', '5', '6'] });
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
    it('should work with n-ary symmetric array selector', function () {
        var a = hot('---1-^-1----4----|');
        var asubs = '^         !  ';
        var b = hot('---1-^--2--5----| ');
        var bsubs = '^         !  ';
        var c = hot('---1-^---3---6-|  ');
        var expected = '----x---y-|  ';
        var observable = Observable.of(a, b, c).zipAll(function (r0, r1, r2) { return [r0, r1, r2]; });
        expectObservable(observable).toBe(expected, { x: ['1', '2', '3'], y: ['4', '5', '6'] });
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
    it('should work with some data asymmetric 1', function () {
        var a = hot('---1-^-1-3-5-7-9-x-y-z-w-u-|');
        var asubs = '^                 !    ';
        var b = hot('---1-^--2--4--6--8--0--|    ');
        var bsubs = '^                 !    ';
        var expected = '---a--b--c--d--e--|    ';
        expectObservable(Observable.of(a, b).zipAll(function (r1, r2) { return r1 + r2; }))
            .toBe(expected, { a: '12', b: '34', c: '56', d: '78', e: '90' });
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
    it('should work with some data asymmetric 2', function () {
        var a = hot('---1-^--2--4--6--8--0--|    ');
        var asubs = '^                 !    ';
        var b = hot('---1-^-1-3-5-7-9-x-y-z-w-u-|');
        var bsubs = '^                 !    ';
        var expected = '---a--b--c--d--e--|    ';
        expectObservable(Observable.of(a, b).zipAll(function (r1, r2) { return r1 + r2; }))
            .toBe(expected, { a: '21', b: '43', c: '65', d: '87', e: '09' });
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
    it('should work with some data symmetric', function () {
        var a = hot('---1-^-1-3-5-7-9------| ');
        var asubs = '^                ! ';
        var b = hot('---1-^--2--4--6--8--0--|');
        var bsubs = '^                ! ';
        var expected = '---a--b--c--d--e-| ';
        expectObservable(Observable.of(a, b).zipAll(function (r1, r2) { return r1 + r2; }))
            .toBe(expected, { a: '12', b: '34', c: '56', d: '78', e: '90' });
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
    it('should work with selector throws', function () {
        var a = hot('---1-^-2---4----|  ');
        var asubs = '^       !     ';
        var b = hot('---1-^--3----5----|');
        var bsubs = '^       !     ';
        var expected = '---x----#     ';
        var selector = function (x, y) {
            if (y === '5') {
                throw new Error('too bad');
            }
            else {
                return x + y;
            }
        };
        var observable = Observable.of(a, b).zipAll(selector);
        expectObservable(observable).toBe(expected, { x: '23' }, new Error('too bad'));
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
    it('should work with right completes first', function () {
        var a = hot('---1-^-2-----|');
        var asubs = '^     !';
        var b = hot('---1-^--3--|');
        var bsubs = '^     !';
        var expected = '---x--|';
        expectObservable(Observable.zip(a, b)).toBe(expected, { x: ['2', '3'] });
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
    it('should zip until one child terminates', function (done) {
        var expected = ['a1', 'b2'];
        var i = 0;
        Observable.of(Observable.of('a', 'b', 'c'), Observable.of(1, 2))
            .zipAll(function (a, b) { return a + b; })
            .subscribe(function (x) {
            expect(x).toBe(expected[i++]);
        }, null, done);
    });
    it('should handle a hot observable of observables', function () {
        var x = cold('a---b---c---|      ');
        var xsubs = '        ^           !';
        var y = cold('d---e---f---|   ');
        var ysubs = '        ^           !';
        var e1 = hot('--x--y--|            ', { x: x, y: y });
        var e1subs = '^                   !';
        var expected = '--------u---v---w---|';
        var values = {
            u: ['a', 'd'],
            v: ['b', 'e'],
            w: ['c', 'f']
        };
        expectObservable(e1.zipAll()).toBe(expected, values);
        expectSubscriptions(x.subscriptions).toBe(xsubs);
        expectSubscriptions(y.subscriptions).toBe(ysubs);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should handle merging a hot observable of non-overlapped observables', function () {
        var x = cold('a-b---------|                         ');
        var xsubs = '                           ^           !';
        var y = cold('c-d-e-f-|                      ');
        var ysubs = '                           ^       !    ';
        var z = cold('g-h-i-j-k-|           ');
        var zsubs = '                           ^         !  ';
        var e1 = hot('--x------y--------z--------|            ', { x: x, y: y, z: z });
        var e1subs = '^                                      !';
        var expected = '---------------------------u-v---------|';
        var values = {
            u: ['a', 'c', 'g'],
            v: ['b', 'd', 'h']
        };
        expectObservable(e1.zipAll()).toBe(expected, values);
        expectSubscriptions(x.subscriptions).toBe(xsubs);
        expectSubscriptions(y.subscriptions).toBe(ysubs);
        expectSubscriptions(z.subscriptions).toBe(zsubs);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should raise error if inner observable raises error', function () {
        var x = cold('a-b---------|                     ');
        var xsubs = '                              ^       !';
        var y = cold('c-d-e-f-#               ');
        var ysubs = '                              ^       !';
        var z = cold('g-h-i-j-k-|    ');
        var zsubs = '                              ^       !';
        var e1 = hot('--x---------y--------z--------|', { x: x, y: y, z: z });
        var e1subs = '^                                     !';
        var expected = '------------------------------u-v-----#';
        var expectedValues = {
            u: ['a', 'c', 'g'],
            v: ['b', 'd', 'h']
        };
        expectObservable(e1.zipAll()).toBe(expected, expectedValues);
        expectSubscriptions(x.subscriptions).toBe(xsubs);
        expectSubscriptions(y.subscriptions).toBe(ysubs);
        expectSubscriptions(z.subscriptions).toBe(zsubs);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should raise error if outer observable raises error', function () {
        var y = cold('a-b---------|');
        var z = cold('c-d-e-f-|');
        var e1 = hot('--y---------z---#', { y: y, z: z });
        var e1subs = '^               !';
        var expected = '----------------#';
        expectObservable(e1.zipAll()).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should work with two nevers', function () {
        var a = cold('-');
        var asubs = '^';
        var b = cold('-');
        var bsubs = '^';
        var expected = '-';
        expectObservable(Observable.of(a, b).zipAll()).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
    it('should work with never and empty', function () {
        var a = cold('-');
        var asubs = '(^!)';
        var b = cold('|');
        var bsubs = '(^!)';
        var expected = '|';
        expectObservable(Observable.of(a, b).zipAll()).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
    it('should work with empty and never', function () {
        var a = cold('|');
        var asubs = '(^!)';
        var b = cold('-');
        var bsubs = '(^!)';
        var expected = '|';
        expectObservable(Observable.of(a, b).zipAll()).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
    it('should work with empty and empty', function () {
        var a = cold('|');
        var asubs = '(^!)';
        var b = cold('|');
        var bsubs = '(^!)';
        var expected = '|';
        expectObservable(Observable.of(a, b).zipAll()).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
    it('should work with empty and non-empty', function () {
        var a = cold('|');
        var asubs = '(^!)';
        var b = hot('---1--|');
        var bsubs = '(^!)';
        var expected = '|';
        expectObservable(Observable.of(a, b).zipAll()).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
    it('should work with non-empty and empty', function () {
        var a = hot('---1--|');
        var asubs = '(^!)';
        var b = cold('|');
        var bsubs = '(^!)';
        var expected = '|';
        expectObservable(Observable.of(a, b).zipAll()).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
    it('should work with never and non-empty', function () {
        var a = cold('-');
        var asubs = '^';
        var b = hot('---1--|');
        var bsubs = '^     !';
        var expected = '-';
        expectObservable(Observable.of(a, b).zipAll()).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
    it('should work with non-empty and never', function () {
        var a = hot('---1--|');
        var asubs = '^     !';
        var b = cold('-');
        var bsubs = '^';
        var expected = '-';
        expectObservable(Observable.of(a, b).zipAll()).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
    it('should combine a source with a second', function () {
        var a = hot('---1---2---3---');
        var asubs = '^';
        var b = hot('--4--5--6--7--8--');
        var bsubs = '^';
        var expected = '---x---y---z';
        expectObservable(Observable.of(a, b).zipAll())
            .toBe(expected, { x: ['1', '4'], y: ['2', '5'], z: ['3', '6'] });
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
    it('should work with empty and error', function () {
        var a = cold('|');
        var asubs = '(^!)';
        var b = hot('------#', null, 'too bad');
        var bsubs = '(^!)';
        var expected = '|';
        expectObservable(Observable.of(a, b).zipAll()).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
    it('should work with error and empty', function () {
        var a = hot('------#', null, 'too bad');
        var asubs = '(^!)';
        var b = cold('|');
        var bsubs = '(^!)';
        var expected = '|';
        expectObservable(Observable.of(a, b).zipAll()).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
    it('should work with error', function () {
        var a = hot('----------|');
        var asubs = '^     !    ';
        var b = hot('------#    ');
        var bsubs = '^     !    ';
        var expected = '------#    ';
        expectObservable(Observable.of(a, b).zipAll()).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
    it('should work with never and error', function () {
        var a = cold('-');
        var asubs = '^     !';
        var b = hot('------#');
        var bsubs = '^     !';
        var expected = '------#';
        expectObservable(Observable.of(a, b).zipAll()).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
    it('should work with error and never', function () {
        var a = hot('------#');
        var asubs = '^     !';
        var b = cold('-');
        var bsubs = '^     !';
        var expected = '------#';
        expectObservable(Observable.of(a, b).zipAll()).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
    it('should work with error and error', function () {
        var a = hot('------#', null, 'too bad');
        var asubs = '^     !';
        var b = hot('----------#', null, 'too bad 2');
        var bsubs = '^     !';
        var expected = '------#';
        expectObservable(Observable.of(a, b).zipAll()).toBe(expected, null, 'too bad');
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
    it('should work with two sources that eventually raise errors', function () {
        var a = hot('--w-----#----', { w: 1 }, 'too bad');
        var asubs = '^       !';
        var b = hot('-----z-----#-', { z: 2 }, 'too bad 2');
        var bsubs = '^       !';
        var expected = '-----x--#';
        expectObservable(Observable.of(a, b).zipAll()).toBe(expected, { x: [1, 2] }, 'too bad');
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
    it('should work with two sources that eventually raise errors (swapped)', function () {
        var a = hot('-----z-----#-', { z: 2 }, 'too bad 2');
        var asubs = '^       !';
        var b = hot('--w-----#----', { w: 1 }, 'too bad');
        var bsubs = '^       !';
        var expected = '-----x--#';
        expectObservable(Observable.of(a, b).zipAll()).toBe(expected, { x: [2, 1] }, 'too bad');
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
    it('should work with error and some', function () {
        var a = cold('#');
        var asubs = '(^!)';
        var b = hot('--1--2--3--');
        var bsubs = '(^!)';
        var expected = '#';
        expectObservable(Observable.of(a, b).zipAll()).toBe(expected);
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
    it('should combine two immediately-scheduled observables', function (done) {
        var a = Observable.of(1, 2, 3, queueScheduler);
        var b = Observable.of(4, 5, 6, 7, 8, queueScheduler);
        var r = [[1, 4], [2, 5], [3, 6]];
        var i = 0;
        var result = Observable.of(a, b, queueScheduler).zipAll();
        result.subscribe(function (vals) {
            expect(vals).toDeepEqual(r[i++]);
        }, null, done);
    });
    it('should combine a source with an immediately-scheduled source', function (done) {
        var a = Observable.of(1, 2, 3, queueScheduler);
        var b = Observable.of(4, 5, 6, 7, 8);
        var r = [[1, 4], [2, 5], [3, 6]];
        var i = 0;
        var result = Observable.of(a, b, queueScheduler).zipAll();
        result.subscribe(function (vals) {
            expect(vals).toDeepEqual(r[i++]);
        }, null, done);
    });
    it('should not break unsubscription chain when unsubscribed explicitly', function () {
        var a = hot('---1---2---3---|');
        var unsub = '         !';
        var asubs = '^        !';
        var b = hot('--4--5--6--7--8--|');
        var bsubs = '^        !';
        var expected = '---x---y--';
        var values = { x: ['1', '4'], y: ['2', '5'] };
        var r = Observable.of(a, b)
            .mergeMap(function (x) { return Observable.of(x); })
            .zipAll()
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(r, unsub).toBe(expected, values);
        expectSubscriptions(a.subscriptions).toBe(asubs);
        expectSubscriptions(b.subscriptions).toBe(bsubs);
    });
});
//# sourceMappingURL=zipAll-spec.js.map