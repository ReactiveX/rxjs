import { expect } from 'chai';
import { bindCallback, bindNodeCallback, combineLatest, concat, defer, empty, forkJoin, from, fromEvent, fromEventPattern,
  iif, interval, merge, of, onErrorResumeNext, pairs, race, range, throwError, timer, using, zip } from 'rxjs';
import * as Rx from 'rxjs/Rx';

describe('exports', () => {
  it('should have rxjs/observable/bindCallback', () => {
    expect(bindCallback).to.equal(Rx.Observable.bindCallback);
  });

  it('should have rxjs/observable/bindNodeCallback', () => {
    expect(bindNodeCallback).to.equal(Rx.Observable.bindNodeCallback);
  });

  it('should have rxjs/observable/combineLatest', () => {
    expect(combineLatest).to.equal(Rx.Observable.combineLatest);
  });

  it('should have rxjs/observable/concat', () => {
    expect(concat).to.equal(Rx.Observable.concat);
  });

  it('should have rxjs/observable/defer', () => {
    expect(defer).to.equal(Rx.Observable.defer);
  });

  it('should have rxjs/observable/empty', () => {
    expect(empty).to.equal(Rx.Observable.empty);
  });

  it('should have rxjs/observable/forkJoin', () => {
    expect(forkJoin).to.equal(Rx.Observable.forkJoin);
  });

  it('should have rxjs/observable/from', () => {
    expect(from).to.equal(Rx.Observable.from);
  });

  it('should have rxjs/observable/fromEvent', () => {
    expect(fromEvent).to.equal(Rx.Observable.fromEvent);
  });

  it('should have rxjs/observable/fromEventPattern', () => {
    expect(fromEventPattern).to.equal(Rx.Observable.fromEventPattern);
  });

  it('should have rxjs/observable/fromPromise', () => {
    expect(from).to.equal(Rx.Observable.fromPromise);
  });

  it('should have rxjs/observable/iif', () => {
    expect(iif).to.equal(Rx.Observable.if);
  });

  it('should have rxjs/observable/interval', () => {
    expect(interval).to.equal(Rx.Observable.interval);
  });

  it('should have rxjs/observable/merge', () => {
    expect(merge).to.equal(Rx.Observable.merge);
  });

  it('should have rxjs/observable/of', () => {
    expect(of).to.equal(Rx.Observable.of);
  });

  it('should have rxjs/observable/onErrorResumeNext', () => {
    expect(onErrorResumeNext).to.equal(Rx.Observable.onErrorResumeNext);
  });

  it('should have rxjs/observable/pairs', () => {
    expect(pairs).to.equal(Rx.Observable.pairs);
  });

  it('should have rxjs/observable/race', () => {
    expect(race).to.equal(Rx.Observable.race);
  });

  it('should have rxjs/observable/range', () => {
    expect(range).to.equal(Rx.Observable.range);
  });

  it('should have rxjs/observable/throwError', () => {
    expect(throwError).to.equal(Rx.Observable.throw);
  });

  it('should have rxjs/observable/timer', () => {
    expect(timer).to.equal(Rx.Observable.timer);
  });

  it('should have rxjs/observable/using', () => {
    expect(using).to.equal(Rx.Observable.using);
  });

  it('should have rxjs/observable/zip', () => {
    expect(zip).to.equal(Rx.Observable.zip);
  });
});
