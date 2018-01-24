"use strict";
var chai_1 = require('chai');
var bindCallback_1 = require('../dist/package/observable/bindCallback');
var bindNodeCallback_1 = require('../dist/package/observable/bindNodeCallback');
var combineLatest_1 = require('../dist/package/observable/combineLatest');
var concat_1 = require('../dist/package/observable/concat');
var defer_1 = require('../dist/package/observable/defer');
var empty_1 = require('../dist/package/observable/empty');
var forkJoin_1 = require('../dist/package/observable/forkJoin');
var from_1 = require('../dist/package/observable/from');
var fromEvent_1 = require('../dist/package/observable/fromEvent');
var fromEventPattern_1 = require('../dist/package/observable/fromEventPattern');
var fromPromise_1 = require('../dist/package/observable/fromPromise');
var if_1 = require('../dist/package/observable/if');
var interval_1 = require('../dist/package/observable/interval');
var merge_1 = require('../dist/package/observable/merge');
var never_1 = require('../dist/package/observable/never');
var of_1 = require('../dist/package/observable/of');
var onErrorResumeNext_1 = require('../dist/package/observable/onErrorResumeNext');
var pairs_1 = require('../dist/package/observable/pairs');
var race_1 = require('../dist/package/observable/race');
var range_1 = require('../dist/package/observable/range');
var throw_1 = require('../dist/package/observable/throw');
var timer_1 = require('../dist/package/observable/timer');
var using_1 = require('../dist/package/observable/using');
var zip_1 = require('../dist/package/observable/zip');
var Rx = require('../dist/package/Rx');
describe('exports', function () {
    it('should have rxjs/observable/bindCallback', function () {
        chai_1.expect(bindCallback_1.bindCallback).to.equal(Rx.Observable.bindCallback);
    });
    it('should have rxjs/observable/bindNodeCallback', function () {
        chai_1.expect(bindNodeCallback_1.bindNodeCallback).to.equal(Rx.Observable.bindNodeCallback);
    });
    it('should have rxjs/observable/combineLatest', function () {
        chai_1.expect(combineLatest_1.combineLatest).to.equal(Rx.Observable.combineLatest);
    });
    it('should have rxjs/observable/concat', function () {
        chai_1.expect(concat_1.concat).to.equal(Rx.Observable.concat);
    });
    it('should have rxjs/observable/defer', function () {
        chai_1.expect(defer_1.defer).to.equal(Rx.Observable.defer);
    });
    it('should have rxjs/observable/empty', function () {
        chai_1.expect(empty_1.empty).to.equal(Rx.Observable.empty);
    });
    it('should have rxjs/observable/forkJoin', function () {
        chai_1.expect(forkJoin_1.forkJoin).to.equal(Rx.Observable.forkJoin);
    });
    it('should have rxjs/observable/from', function () {
        chai_1.expect(from_1.from).to.equal(Rx.Observable.from);
    });
    it('should have rxjs/observable/fromEvent', function () {
        chai_1.expect(fromEvent_1.fromEvent).to.equal(Rx.Observable.fromEvent);
    });
    it('should have rxjs/observable/fromEventPattern', function () {
        chai_1.expect(fromEventPattern_1.fromEventPattern).to.equal(Rx.Observable.fromEventPattern);
    });
    it('should have rxjs/observable/fromPromise', function () {
        chai_1.expect(fromPromise_1.fromPromise).to.equal(Rx.Observable.fromPromise);
    });
    it('should have rxjs/observable/if', function () {
        chai_1.expect(if_1._if).to.equal(Rx.Observable.if);
    });
    it('should have rxjs/observable/interval', function () {
        chai_1.expect(interval_1.interval).to.equal(Rx.Observable.interval);
    });
    it('should have rxjs/observable/merge', function () {
        chai_1.expect(merge_1.merge).to.equal(Rx.Observable.merge);
    });
    it('should have rxjs/observable/never', function () {
        chai_1.expect(never_1.never).to.equal(Rx.Observable.never);
    });
    it('should have rxjs/observable/of', function () {
        chai_1.expect(of_1.of).to.equal(Rx.Observable.of);
    });
    it('should have rxjs/observable/onErrorResumeNext', function () {
        chai_1.expect(onErrorResumeNext_1.onErrorResumeNext).to.equal(Rx.Observable.onErrorResumeNext);
    });
    it('should have rxjs/observable/pairs', function () {
        chai_1.expect(pairs_1.pairs).to.equal(Rx.Observable.pairs);
    });
    it('should have rxjs/observable/race', function () {
        chai_1.expect(race_1.race).to.equal(Rx.Observable.race);
    });
    it('should have rxjs/observable/range', function () {
        chai_1.expect(range_1.range).to.equal(Rx.Observable.range);
    });
    it('should have rxjs/observable/throw', function () {
        chai_1.expect(throw_1._throw).to.equal(Rx.Observable.throw);
    });
    it('should have rxjs/observable/timer', function () {
        chai_1.expect(timer_1.timer).to.equal(Rx.Observable.timer);
    });
    it('should have rxjs/observable/using', function () {
        chai_1.expect(using_1.using).to.equal(Rx.Observable.using);
    });
    it('should have rxjs/observable/zip', function () {
        chai_1.expect(zip_1.zip).to.equal(Rx.Observable.zip);
    });
});
//# sourceMappingURL=exports-spec.js.map