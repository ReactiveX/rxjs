"use strict";
/** @test {cache} */
describe('Observable.prototype.cache', function () {
    it('should replay values upon subscription', function () {
        var s1 = hot('---^---a---b---c---|     ').cache();
        var expected1 = '----a---b---c---|     ';
        var expected2 = '                (abc|)';
        var t = time('----------------|');
        expectObservable(s1).toBe(expected1);
        rxTestScheduler.schedule(function () {
            expectObservable(s1).toBe(expected2);
        }, t);
    });
    it('should replay values and error', function () {
        var s1 = hot('---^---a---b---c---#     ').cache();
        var expected1 = '----a---b---c---#     ';
        var expected2 = '                (abc#)';
        var t = time('----------------|');
        expectObservable(s1).toBe(expected1);
        rxTestScheduler.schedule(function () {
            expectObservable(s1).toBe(expected2);
        }, t);
    });
    it('should replay values and and share', function () {
        var s1 = hot('---^---a---b---c------------d--e--f-|').cache();
        var expected1 = '----a---b---c------------d--e--f-|';
        var expected2 = '                (abc)----d--e--f-|';
        var t = time('----------------|');
        expectObservable(s1).toBe(expected1);
        rxTestScheduler.schedule(function () {
            expectObservable(s1).toBe(expected2);
        }, t);
    });
    it('should have a bufferCount that limits the replay test 1', function () {
        var s1 = hot('---^---a---b---c------------d--e--f-|').cache(1);
        var expected1 = '----a---b---c------------d--e--f-|';
        var expected2 = '                c--------d--e--f-|';
        var t = time('----------------|');
        expectObservable(s1).toBe(expected1);
        rxTestScheduler.schedule(function () {
            expectObservable(s1).toBe(expected2);
        }, t);
    });
    it('should have a bufferCount that limits the replay test 2', function () {
        var s1 = hot('---^---a---b---c------------d--e--f-|').cache(2);
        var expected1 = '----a---b---c------------d--e--f-|';
        var expected2 = '                (bc)-----d--e--f-|';
        var t = time('----------------|');
        expectObservable(s1).toBe(expected1);
        rxTestScheduler.schedule(function () {
            expectObservable(s1).toBe(expected2);
        }, t);
    });
    it('should accept a windowTime that limits the replay', function () {
        var w = time('----------|');
        var s1 = hot('---^---a---b---c------------d--e--f-|').cache(Number.POSITIVE_INFINITY, w, rxTestScheduler);
        var expected1 = '----a---b---c------------d--e--f-|';
        var expected2 = '                (bc)-----d--e--f-|';
        var t = time('----------------|');
        expectObservable(s1).toBe(expected1);
        rxTestScheduler.schedule(function () {
            expectObservable(s1).toBe(expected2);
        }, t);
    });
    it('should handle empty', function () {
        var s1 = cold('|').cache();
        var expected1 = '|';
        var expected2 = '                |';
        var t = time('----------------|');
        expectObservable(s1).toBe(expected1);
        rxTestScheduler.schedule(function () {
            expectObservable(s1).toBe(expected2);
        }, t);
    });
    it('should handle throw', function () {
        var s1 = cold('#').cache();
        var expected1 = '#';
        var expected2 = '                #';
        var t = time('----------------|');
        expectObservable(s1).toBe(expected1);
        rxTestScheduler.schedule(function () {
            expectObservable(s1).toBe(expected2);
        }, t);
    });
    it('should handle never', function () {
        var s1 = cold('-').cache();
        var expected1 = '-';
        var expected2 = '                -';
        var t = time('----------------|');
        expectObservable(s1).toBe(expected1);
        rxTestScheduler.schedule(function () {
            expectObservable(s1).toBe(expected2);
        }, t);
    });
    it('should multicast a completion', function () {
        var s1 = hot('--a--^--b------c-----d------e-|').cache();
        var t1 = time('|                         ');
        var e1 = '---b------c-----d------e-|';
        var t2 = time('----------|               ');
        var e2 = '          (bc)--d------e-|';
        var t3 = time('----------------|         ');
        var e3 = '                (bcd)--e-|';
        var expected = [e1, e2, e3];
        [t1, t2, t3].forEach(function (t, i) {
            rxTestScheduler.schedule(function () {
                expectObservable(s1).toBe(expected[i]);
            }, t);
        });
    });
    it('should multicast an error', function () {
        var s1 = hot('--a--^--b------c-----d------e-#').cache();
        var t1 = time('|                         ');
        var e1 = '---b------c-----d------e-#';
        var t2 = time('----------|               ');
        var e2 = '          (bc)--d------e-#';
        var t3 = time('----------------|         ');
        var e3 = '                (bcd)--e-#';
        var expected = [e1, e2, e3];
        [t1, t2, t3].forEach(function (t, i) {
            rxTestScheduler.schedule(function () {
                expectObservable(s1).toBe(expected[i]);
            }, t);
        });
    });
    it('should limit replay by both count and a window time, test 2', function () {
        var w = time('-----------|');
        var s1 = hot('--a--^---b---c----d----e------f--g--h--i-------|').cache(4, w, rxTestScheduler);
        var e1 = '----b---c----d----e------f--g--h--i-------|';
        var t1 = time('--------------------|');
        //                          -----------|
        var e2 = '                    (de)-f--g--h--i-------|'; // time wins
        var t2 = time('-----------------------------------|');
        var e3 = '                                   (fghi)-|'; // count wins
        //                                         -----------|
        expectObservable(s1).toBe(e1);
        rxTestScheduler.schedule(function () {
            expectObservable(s1).toBe(e2);
        }, t1);
        rxTestScheduler.schedule(function () {
            expectObservable(s1).toBe(e3);
        }, t2);
    });
});
//# sourceMappingURL=cache-spec.js.map