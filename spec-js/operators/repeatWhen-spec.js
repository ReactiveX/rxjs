"use strict";
var chai_1 = require('chai');
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;
/** @test {repeatWhen} */
describe('Observable.prototype.repeatWhen', function () {
    asDiagram('repeatWhen')('should handle a source with eventual complete using a hot notifier', function () {
        var source = cold('-1--2--|');
        var subs = ['^      !                     ',
            '             ^      !        ',
            '                          ^ !'];
        var notifier = hot('-------------r------------r-|');
        var expected = '-1--2---------1--2---------1|';
        var result = source.repeatWhen(function (notifications) { return notifier; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should handle a source with eventual complete using a hot notifier that raises error', function () {
        var source = cold('-1--2--|');
        var subs = ['^      !                    ',
            '           ^      !           ',
            '                   ^      !   '];
        var notifier = hot('-----------r-------r---------#');
        var expected = '-1--2-------1--2----1--2-----#';
        var result = source.repeatWhen(function (notifications) { return notifier; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should retry when notified via returned notifier on complete', function (done) {
        var retried = false;
        var expected = [1, 2, 1, 2];
        var i = 0;
        Observable.of(1, 2)
            .map(function (n) {
            return n;
        })
            .repeatWhen(function (notifications) { return notifications.map(function (x) {
            if (retried) {
                throw new Error('done');
            }
            retried = true;
            return x;
        }); })
            .subscribe(function (x) {
            chai_1.expect(x).to.equal(expected[i++]);
        }, function (err) {
            chai_1.expect(err).to.be.an('error', 'done');
            done();
        });
    });
    it('should retry when notified and complete on returned completion', function (done) {
        var expected = [1, 2, 1, 2];
        Observable.of(1, 2)
            .map(function (n) {
            return n;
        })
            .repeatWhen(function (notifications) { return Observable.empty(); })
            .subscribe(function (n) {
            chai_1.expect(n).to.equal(expected.shift());
        }, function (err) {
            done(new Error('should not be called'));
        }, function () {
            done();
        });
    });
    it('should apply an empty notifier on an empty source', function () {
        var source = cold('|');
        var subs = '(^!)';
        var notifier = cold('|');
        var expected = '|';
        var result = source.repeatWhen(function (notifications) { return notifier; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should apply a never notifier on an empty source', function () {
        var source = cold('|');
        var subs = '(^!)';
        var notifier = cold('-');
        var expected = '-';
        var result = source.repeatWhen(function (notifications) { return notifier; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should apply an empty notifier on a never source', function () {
        var source = cold('-');
        var unsub = '                                         !';
        var subs = '^                                        !';
        var notifier = cold('|');
        var expected = '-';
        var result = source.repeatWhen(function (notifications) { return notifier; });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should apply a never notifier on a never source', function () {
        var source = cold('-');
        var unsub = '                                         !';
        var subs = '^                                        !';
        var notifier = cold('-');
        var expected = '-';
        var result = source.repeatWhen(function (notifications) { return notifier; });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should return an empty observable given a just-throw source and empty notifier', function () {
        var source = cold('#');
        var notifier = cold('|');
        var expected = '#';
        var result = source.repeatWhen(function (notifications) { return notifier; });
        expectObservable(result).toBe(expected);
    });
    it('should return a error observable given a just-throw source and never notifier', function () {
        var source = cold('#');
        var notifier = cold('-');
        var expected = '#';
        var result = source.repeatWhen(function (notifications) { return notifier; });
        expectObservable(result).toBe(expected);
    });
    xit('should hide errors using a never notifier on a source with eventual error', function () {
        var source = cold('--a--b--c--#');
        var subs = '^          !';
        var notifier = cold('-');
        var expected = '--a--b--c---------------------------------';
        var result = source.repeatWhen(function (notifications) { return notifier; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    xit('should propagate error thrown from notifierSelector function', function () {
        var source = cold('--a--b--c--|');
        var subs = '^          !';
        var expected = '--a--b--c--#';
        var result = source.repeatWhen((function () { throw 'bad!'; }));
        expectObservable(result).toBe(expected, undefined, 'bad!');
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    xit('should replace error with complete using an empty notifier on a source ' +
        'with eventual error', function () {
        var source = cold('--a--b--c--#');
        var subs = '^          !';
        var notifier = cold('|');
        var expected = '--a--b--c--|';
        var result = source.repeatWhen(function (notifications) { return notifier; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should mirror a basic cold source with complete, given a never notifier', function () {
        var source = cold('--a--b--c--|');
        var subs = '^          !';
        var notifier = cold('|');
        var expected = '--a--b--c--|';
        var result = source.repeatWhen(function (notifications) { return notifier; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should mirror a basic cold source with no termination, given a never notifier', function () {
        var source = cold('--a--b--c---');
        var subs = '^           ';
        var notifier = cold('|');
        var expected = '--a--b--c---';
        var result = source.repeatWhen(function (notifications) { return notifier; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should mirror a basic hot source with complete, given a never notifier', function () {
        var source = hot('-a-^--b--c--|');
        var subs = '^        !';
        var notifier = cold('|');
        var expected = '---b--c--|';
        var result = source.repeatWhen(function (notifications) { return notifier; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    xit('should handle a hot source that raises error but eventually completes', function () {
        var source = hot('-1--2--3----4--5---|');
        var ssubs = ['^      !            ',
            '              ^    !'];
        var notifier = hot('--------------r--------r---r--r--r---|');
        var nsubs = '       ^           !';
        var expected = '-1--2---      -5---|';
        var result = source
            .map(function (x) {
            if (x === '3') {
                throw 'error';
            }
            return x;
        }).repeatWhen(function () { return notifier; });
        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(ssubs);
        expectSubscriptions(notifier.subscriptions).toBe(nsubs);
    });
    it('should tear down resources when result is unsubscribed early', function () {
        var source = cold('-1--2--|');
        var unsub = '                    !       ';
        var subs = ['^      !                    ',
            '         ^      !           ',
            '                 ^  !       '];
        var notifier = hot('---------r-------r---------#');
        var nsubs = '       ^            !       ';
        var expected = '-1--2-----1--2----1--       ';
        var result = source.repeatWhen(function (notifications) { return notifier; });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
        expectSubscriptions(notifier.subscriptions).toBe(nsubs);
    });
    it('should not break unsubscription chains when unsubscribed explicitly', function () {
        var source = cold('-1--2--|');
        var subs = ['^      !                    ',
            '         ^      !           ',
            '                 ^  !       '];
        var notifier = hot('---------r-------r-------r-#');
        var nsubs = '       ^            !       ';
        var expected = '-1--2-----1--2----1--       ';
        var unsub = '                    !       ';
        var result = source
            .mergeMap(function (x) { return Observable.of(x); })
            .repeatWhen(function (notifications) { return notifier; })
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
        expectSubscriptions(notifier.subscriptions).toBe(nsubs);
    });
    it('should handle a source with eventual error using a dynamic notifier ' +
        'selector which eventually throws', function () {
        var source = cold('-1--2--|');
        var subs = ['^      !              ',
            '       ^      !       ',
            '              ^      !'];
        var expected = '-1--2---1--2---1--2--#';
        var invoked = 0;
        var result = source.repeatWhen(function (notifications) {
            return notifications.map(function (err) {
                if (++invoked === 3) {
                    throw 'error';
                }
                else {
                    return 'x';
                }
            });
        });
        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
    it('should handle a source with eventual error using a dynamic notifier ' +
        'selector which eventually completes', function () {
        var source = cold('-1--2--|');
        var subs = ['^      !              ',
            '       ^      !       ',
            '              ^      !'];
        var expected = '-1--2---1--2---1--2--|';
        var invoked = 0;
        var result = source.repeatWhen(function (notifications) { return notifications
            .map(function () { return 'x'; })
            .takeUntil(notifications.flatMap(function () {
            if (++invoked < 3) {
                return Observable.empty();
            }
            else {
                return Observable.of('stop!');
            }
        })); });
        expectObservable(result).toBe(expected);
        expectSubscriptions(source.subscriptions).toBe(subs);
    });
});
//# sourceMappingURL=repeatWhen-spec.js.map