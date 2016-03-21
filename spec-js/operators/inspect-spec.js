"use strict";
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
/** @test {inspect} */
describe('Observable.prototype.inspect', function () {
    asDiagram('inspect')('should emit the last value in each time window', function () {
        var e1 = hot('-a-xy-----b--x--cxxx-|');
        var e1subs = '^                    !';
        var e2 = cold('----|                ');
        var e2subs = [' ^   !                ',
            '          ^   !       ',
            '                ^   ! '];
        var expected = '-----y--------x-----x|';
        var result = e1.inspect(function () { return e2; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should delay the source if values are not emitted often enough', function () {
        var e1 = hot('-a--------b-----c----|');
        var e1subs = '^                    !';
        var e2 = cold('----|                ');
        var e2subs = [' ^   !                ',
            '          ^   !       ',
            '                ^   ! '];
        var expected = '-----a--------b-----c|';
        var result = e1.inspect(function () { return e2; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should inspect with duration Observable using next to close the duration', function () {
        var e1 = hot('-a-xy-----b--x--cxxx-|');
        var e1subs = '^                    !';
        var e2 = cold('----x-y-z            ');
        var e2subs = [' ^   !                ',
            '          ^   !       ',
            '                ^   ! '];
        var expected = '-----y--------x-----x|';
        var result = e1.inspect(function () { return e2; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should interrupt source and duration when result is unsubscribed early', function () {
        var e1 = hot('-a-x-y-z-xyz-x-y-z----b--x-x-|');
        var unsub = '              !               ';
        var e1subs = '^             !               ';
        var e2 = cold('-----x------------|          ');
        var e2subs = [' ^    !                       ',
            '       ^    !                 ',
            '             ^!               '];
        var expected = '------y-----z--               ';
        var result = e1.inspect(function () { return e2; });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
        var e1 = hot('-a-x-y-z-xyz-x-y-z----b--x-x-|');
        var e1subs = '^             !               ';
        var e2 = cold('-----x------------|          ');
        var e2subs = [' ^    !                       ',
            '       ^    !                 ',
            '             ^!               '];
        var expected = '------y-----z--               ';
        var unsub = '              !               ';
        var result = e1
            .mergeMap(function (x) { return Observable.of(x); })
            .inspect(function () { return e2; })
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should handle a busy producer emitting a regular repeating sequence', function () {
        var e1 = hot('abcdefabcdefabcdefabcdefa|');
        var e1subs = '^                        !';
        var e2 = cold('-----|                    ');
        var e2subs = ['^    !                    ',
            '      ^    !              ',
            '            ^    !        ',
            '                  ^    !  ',
            '                        ^!'];
        var expected = '-----f-----f-----f-----f-|';
        var result = e1.inspect(function () { return e2; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should mirror source if durations are always empty', function () {
        var e1 = hot('abcdefabcdefabcdefabcdefa|');
        var e1subs = '^                        !';
        var e2 = cold('|');
        var expected = 'abcdefabcdefabcdefabcdefa|';
        var result = e1.inspect(function () { return e2; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should emit no values if duration is a never', function () {
        var e1 = hot('----abcdefabcdefabcdefabcdefa|');
        var e1subs = '^                            !';
        var e2 = cold('-');
        var e2subs = '    ^                        !';
        var expected = '-----------------------------|';
        var result = e1.inspect(function () { return e2; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should unsubscribe duration Observable when source raise error', function () {
        var e1 = hot('----abcdefabcdefabcdefabcdefa#');
        var e1subs = '^                            !';
        var e2 = cold('-');
        var e2subs = '    ^                        !';
        var expected = '-----------------------------#';
        var result = e1.inspect(function () { return e2; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should raise error as soon as just-throw duration is used', function () {
        var e1 = hot('----abcdefabcdefabcdefabcdefa|');
        var e1subs = '^   !                         ';
        var e2 = cold('#');
        var e2subs = '    (^!)                      ';
        var expected = '----(-#)                      ';
        var result = e1.inspect(function () { return e2; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
    it('should inspect using durations of constying lengths', function () {
        var e1 = hot('abcdefabcdabcdefghabca|   ');
        var e1subs = '^                     !   ';
        var e2 = [cold('-----|                    '),
            cold('---|                '),
            cold('-------|        '),
            cold('--|     '),
            cold('----|')];
        var e2subs = ['^    !                    ',
            '      ^  !                ',
            '          ^      !        ',
            '                  ^ !     ',
            '                     ^!   '];
        var expected = '-----f---d-------h--c-|   ';
        var i = 0;
        var result = e1.inspect(function () { return e2[i++]; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        for (var j = 0; j < e2.length; j++) {
            expectSubscriptions(e2[j].subscriptions).toBe(e2subs[j]);
        }
    });
    it('should propagate error from duration Observable', function () {
        var e1 = hot('abcdefabcdabcdefghabca|   ');
        var e1subs = '^                !        ';
        var e2 = [cold('-----|                    '),
            cold('---|                '),
            cold('-------#        ')];
        var e2subs = ['^    !                    ',
            '      ^  !                ',
            '          ^      !        '];
        var expected = '-----f---d-------#        ';
        var i = 0;
        var result = e1.inspect(function () { return e2[i++]; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        for (var j = 0; j < e2.length; j++) {
            expectSubscriptions(e2[j].subscriptions).toBe(e2subs[j]);
        }
    });
    it('should propagate error thrown from durationSelector function', function () {
        var e1 = hot('abcdefabcdabcdefghabca|   ');
        var e1subs = '^         !               ';
        var e2 = [cold('-----|                    '),
            cold('---|                '),
            cold('-------|        ')];
        var e2subs = ['^    !                    ',
            '      ^  !                '];
        var expected = '-----f---d#               ';
        var i = 0;
        var result = e1.inspect(function () {
            if (i === 2) {
                throw 'error';
            }
            return e2[i++];
        });
        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        for (var j = 0; j < e2subs.length; j++) {
            expectSubscriptions(e2[j].subscriptions).toBe(e2subs[j]);
        }
    });
    it('should complete when source does not emit', function () {
        var e1 = hot('-----|');
        var subs = '^    !';
        var expected = '-----|';
        function durationSelector() { return cold('-----|'); }
        expectObservable(e1.inspect(durationSelector)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(subs);
    });
    it('should raise error when source does not emit and raises error', function () {
        var e1 = hot('-----#');
        var subs = '^    !';
        var expected = '-----#';
        function durationSelector() { return cold('-----|'); }
        expectObservable(e1.inspect(durationSelector)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(subs);
    });
    it('should handle an empty source', function () {
        var e1 = cold('|');
        var subs = '(^!)';
        var expected = '|';
        function durationSelector() { return cold('-----|'); }
        expectObservable(e1.inspect(durationSelector)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(subs);
    });
    it('should handle a never source', function () {
        var e1 = cold('-');
        var subs = '^';
        var expected = '-';
        function durationSelector() { return cold('-----|'); }
        expectObservable(e1.inspect(durationSelector)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(subs);
    });
    it('should handle a throw source', function () {
        var e1 = cold('#');
        var subs = '(^!)';
        var expected = '#';
        function durationSelector() { return cold('-----|'); }
        expectObservable(e1.inspect(durationSelector)).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(subs);
    });
    it('should inspect by promise resolves', function (done) {
        var e1 = Observable.interval(10).take(5);
        var expected = [0, 1, 2, 3];
        e1.inspect(function () {
            return new Promise(function (resolve) { resolve(42); });
        }).subscribe(function (x) {
            expect(x).toEqual(expected.shift());
        }, function () {
            done.fail('should not be called');
        }, function () {
            expect(expected.length).toBe(0);
            done();
        });
    });
    it('should raise error when promise rejects', function (done) {
        var e1 = Observable.interval(10).take(10);
        var expected = [0, 1, 2];
        var error = new Error('error');
        e1.inspect(function (x) {
            if (x === 3) {
                return new Promise(function (resolve, reject) { reject(error); });
            }
            else {
                return new Promise(function (resolve) { resolve(42); });
            }
        }).subscribe(function (x) {
            expect(x).toEqual(expected.shift());
        }, function (err) {
            expect(err).toBe(error);
            expect(expected.length).toBe(0);
            done();
        }, function () {
            done.fail('should not be called');
        });
    });
});
//# sourceMappingURL=inspect-spec.js.map