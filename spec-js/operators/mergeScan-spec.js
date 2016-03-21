"use strict";
var Rx = require('../../dist/cjs/Rx.KitchenSink');
var Observable = Rx.Observable;
/** @test {mergeScan} */
describe('Observable.prototype.mergeScan', function () {
    it('should mergeScan things', function () {
        var e1 = hot('--a--^--b--c--d--e--f--g--|');
        var e1subs = '^                    !';
        var expected = '---u--v--w--x--y--z--|';
        var values = {
            u: ['b'],
            v: ['b', 'c'],
            w: ['b', 'c', 'd'],
            x: ['b', 'c', 'd', 'e'],
            y: ['b', 'c', 'd', 'e', 'f'],
            z: ['b', 'c', 'd', 'e', 'f', 'g']
        };
        var source = e1.mergeScan(function (acc, x) { return Observable.of(acc.concat(x)); }, []);
        expectObservable(source).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should handle errors', function () {
        var e1 = hot('--a--^--b--c--d--#');
        var e1subs = '^           !';
        var expected = '---u--v--w--#';
        var values = {
            u: ['b'],
            v: ['b', 'c'],
            w: ['b', 'c', 'd']
        };
        var source = e1.mergeScan(function (acc, x) { return Observable.of(acc.concat(x)); }, []);
        expectObservable(source).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should mergeScan values and be able to asynchronously project them', function () {
        var e1 = hot('--a--^--b--c--d--e--f--g--|');
        var e1subs = '^                    !';
        var expected = '-----u--v--w--x--y--z|';
        var values = {
            u: ['b'],
            v: ['b', 'c'],
            w: ['b', 'c', 'd'],
            x: ['b', 'c', 'd', 'e'],
            y: ['b', 'c', 'd', 'e', 'f'],
            z: ['b', 'c', 'd', 'e', 'f', 'g']
        };
        var source = e1.mergeScan(function (acc, x) {
            return Observable.of(acc.concat(x)).delay(20, rxTestScheduler);
        }, []);
        expectObservable(source).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not stop ongoing async projections when source completes', function () {
        var e1 = hot('--a--^--b--c--d--e--f--g--|');
        var e1subs = '^                      !';
        var expected = '--------u--v--w--x--y--(z|)';
        var values = {
            u: ['b'],
            v: ['c'],
            w: ['b', 'd'],
            x: ['c', 'e'],
            y: ['b', 'd', 'f'],
            z: ['c', 'e', 'g'],
        };
        var source = e1.mergeScan(function (acc, x) {
            return Observable.of(acc.concat(x)).delay(50, rxTestScheduler);
        }, []);
        expectObservable(source).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should interrupt ongoing async projections when result is unsubscribed early', function () {
        var e1 = hot('--a--^--b--c--d--e--f--g--|');
        var e1subs = '^               !     ';
        var expected = '--------u--v--w--     ';
        var values = {
            u: ['b'],
            v: ['c'],
            w: ['b', 'd'],
            x: ['c', 'e'],
            y: ['b', 'd', 'f'],
            z: ['c', 'e', 'g'],
        };
        var source = e1.mergeScan(function (acc, x) {
            return Observable.of(acc.concat(x)).delay(50, rxTestScheduler);
        }, []);
        expectObservable(source, e1subs).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should not break unsubscription chains when result is unsubscribed explicitly', function () {
        var e1 = hot('--a--^--b--c--d--e--f--g--|');
        var e1subs = '^               !     ';
        var expected = '--------u--v--w--     ';
        var unsub = '                !     ';
        var values = {
            u: ['b'],
            v: ['c'],
            w: ['b', 'd'],
            x: ['c', 'e'],
            y: ['b', 'd', 'f'],
            z: ['c', 'e', 'g'],
        };
        var source = e1
            .mergeMap(function (x) { return Observable.of(x); })
            .mergeScan(function (acc, x) {
            return Observable.of(acc.concat(x)).delay(50, rxTestScheduler);
        }, [])
            .mergeMap(function (x) { return Observable.of(x); });
        expectObservable(source, unsub).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should handle errors in the projection function', function () {
        var e1 = hot('--a--^--b--c--d--e--f--g--|');
        var e1subs = '^        !';
        var expected = '---u--v--#';
        var values = {
            u: ['b'],
            v: ['b', 'c']
        };
        var source = e1.mergeScan(function (acc, x) {
            if (x === 'd') {
                throw 'bad!';
            }
            return Observable.of(acc.concat(x));
        }, []);
        expectObservable(source).toBe(expected, values, 'bad!');
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should propagate errors from the projected Observable', function () {
        var e1 = hot('--a--^--b--c--d--e--f--g--|');
        var e1subs = '^  !';
        var expected = '---#';
        var source = e1.mergeScan(function (acc, x) { return Observable.throw('bad!'); }, []);
        expectObservable(source).toBe(expected, undefined, 'bad!');
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should handle an empty projected Observable', function () {
        var e1 = hot('--a--^--b--c--d--e--f--g--|');
        var e1subs = '^                    !';
        var expected = '---------------------(x|)';
        var values = { x: [] };
        var source = e1.mergeScan(function (acc, x) { return Observable.empty(); }, []);
        expectObservable(source).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should handle a never projected Observable', function () {
        var e1 = hot('--a--^--b--c--d--e--f--g--|');
        var e1subs = '^                     ';
        var expected = '----------------------';
        var values = { x: [] };
        var source = e1.mergeScan(function (acc, x) { return Observable.never(); }, []);
        expectObservable(source).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('handle empty', function () {
        var e1 = cold('|');
        var e1subs = '(^!)';
        var expected = '(u|)';
        var values = {
            u: []
        };
        var source = e1.mergeScan(function (acc, x) { return Observable.of(acc.concat(x)); }, []);
        expectObservable(source).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('handle never', function () {
        var e1 = cold('-');
        var e1subs = '^';
        var expected = '-';
        var source = e1.mergeScan(function (acc, x) { return Observable.of(acc.concat(x)); }, []);
        expectObservable(source).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('handle throw', function () {
        var e1 = cold('#');
        var e1subs = '(^!)';
        var expected = '#';
        var source = e1.mergeScan(function (acc, x) { return Observable.of(acc.concat(x)); }, []);
        expectObservable(source).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should mergeScan unsubscription', function () {
        var e1 = hot('--a--^--b--c--d--e--f--g--|');
        var expected = '---u--v--w--x--';
        var sub = '^             !';
        var values = {
            u: ['b'],
            v: ['b', 'c'],
            w: ['b', 'c', 'd'],
            x: ['b', 'c', 'd', 'e'],
            y: ['b', 'c', 'd', 'e', 'f'],
            z: ['b', 'c', 'd', 'e', 'f', 'g']
        };
        var source = e1.mergeScan(function (acc, x) { return Observable.of(acc.concat(x)); }, []);
        expectObservable(source, sub).toBe(expected, values);
        expectSubscriptions(e1.subscriptions).toBe(sub);
    });
    it('should mergescan projects cold Observable with single concurrency', function () {
        var e1 = hot('--a--b--c--|');
        var e1subs = '^                                  !';
        var inner = [
            cold('--d--e--f--|                      '),
            cold('--g--h--i--|           '),
            cold('--j--k--l--|')
        ];
        var xsubs = '  ^          !';
        var ysubs = '             ^          !';
        var zsubs = '                        ^          !';
        var expected = '--x-d--e--f--f-g--h--i--i-j--k--l--|';
        var index = 0;
        var source = e1.mergeScan(function (acc, x) {
            var value = inner[index++];
            return value.startWith(acc);
        }, 'x', 1);
        expectObservable(source).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(inner[0].subscriptions).toBe(xsubs);
        expectSubscriptions(inner[1].subscriptions).toBe(ysubs);
        expectSubscriptions(inner[2].subscriptions).toBe(zsubs);
    });
    it('should emit accumulator if inner completes without value', function () {
        var e1 = hot('--a--^--b--c--d--e--f--g--|');
        var e1subs = '^                    !';
        var expected = '---------------------(x|)';
        var source = e1.mergeScan(function (acc, x) { return Observable.empty(); }, ['1']);
        expectObservable(source).toBe(expected, { x: ['1'] });
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should emit accumulator if inner completes without value after source completes', function () {
        var e1 = hot('--a--^--b--c--d--e--f--g--|');
        var e1subs = '^                      !';
        var expected = '-----------------------(x|)';
        var source = e1.mergeScan(function (acc, x) {
            return Observable.empty().delay(50, rxTestScheduler);
        }, ['1']);
        expectObservable(source).toBe(expected, { x: ['1'] });
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
    it('should mergescan projects hot Observable with single concurrency', function () {
        var e1 = hot('---a---b---c---|');
        var e1subs = '^                           !';
        var inner = [
            hot('--d--e--f--|'),
            hot('----g----h----i----|'),
            hot('------j------k-------l------|')
        ];
        var xsubs = '   ^       !';
        var ysubs = '           ^       !';
        var zsubs = '                   ^        !';
        var expected = '---x-e--f--f--i----i-l------|';
        var index = 0;
        var source = e1.mergeScan(function (acc, x) {
            var value = inner[index++];
            return value.startWith(acc);
        }, 'x', 1);
        expectObservable(source).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(inner[0].subscriptions).toBe(xsubs);
        expectSubscriptions(inner[1].subscriptions).toBe(ysubs);
        expectSubscriptions(inner[2].subscriptions).toBe(zsubs);
    });
    it('should mergescan projects cold Observable with dual concurrency', function () {
        var e1 = hot('----a----b----c----|');
        var e1subs = '^                                 !';
        var inner = [
            cold('---d---e---f---|               '),
            cold('---g---h---i---|          '),
            cold('---j---k---l---|')
        ];
        var xsubs = '    ^              !';
        var ysubs = '         ^              !';
        var zsubs = '                   ^              !';
        var expected = '----x--d-d-eg--fh--hi-j---k---l---|';
        var index = 0;
        var source = e1.mergeScan(function (acc, x) {
            var value = inner[index++];
            return value.startWith(acc);
        }, 'x', 2);
        expectObservable(source).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(inner[0].subscriptions).toBe(xsubs);
        expectSubscriptions(inner[1].subscriptions).toBe(ysubs);
        expectSubscriptions(inner[2].subscriptions).toBe(zsubs);
    });
    it('should mergescan projects hot Observable with dual concurrency', function () {
        var e1 = hot('---a---b---c---|');
        var e1subs = '^                           !';
        var inner = [
            hot('--d--e--f--|'),
            hot('----g----h----i----|'),
            hot('------j------k-------l------|')
        ];
        var xsubs = '   ^       !';
        var ysubs = '       ^           !';
        var zsubs = '           ^                !';
        var expected = '---x-e-efh-h-ki------l------|';
        var index = 0;
        var source = e1.mergeScan(function (acc, x) {
            var value = inner[index++];
            return value.startWith(acc);
        }, 'x', 2);
        expectObservable(source).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(inner[0].subscriptions).toBe(xsubs);
        expectSubscriptions(inner[1].subscriptions).toBe(ysubs);
        expectSubscriptions(inner[2].subscriptions).toBe(zsubs);
    });
});
//# sourceMappingURL=mergeScan-spec.js.map