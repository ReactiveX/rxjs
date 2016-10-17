import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
declare const {hot, cold, asDiagram, time, expectObservable, expectSubscriptions};

const Observable = Rx.Observable;

/** @test {shareResults} */
describe('Observable.prototype.shareResults', () => {
  it('should exist', () => {
    expect(Observable.prototype.shareResults).to.be.a('function');
  });

  it('should share results after completion of the observable', () => {
    let s = hot('---^---a--b--c--|');
    let sSubs =    '^            !';
    let t =        '------------------|';
    let exp1 =     '----a--b--c--|';
    let exp2 =     '                  (abc|)';

    let source = s.shareResults();

    // first subscription starts the observable
    expectObservable(source).toBe(exp1);

    rxTestScheduler.schedule(() => {
      // second subscription
      expectObservable(source).toBe(exp2);
      expectSubscriptions(s.subscriptions).toBe(sSubs);
    }, time(t));
  });

  it('should be retryable after an error', () => {
    let s = cold(  '----a--b--c--#');
    let sSubs1 =   '^            !';
    let sSubs2 =   '                  ^            !';
    let t =        '------------------|';
    let exp1 =     '----a--b--c--#';
    let exp2 =     '                  ----a--b--c--#';

    let source = s.shareResults();

    // first subscription starts the observable
    expectObservable(source).toBe(exp1);

    rxTestScheduler.schedule(() => {
      // second subscription
      expectObservable(source).toBe(exp2);
      expectSubscriptions(s.subscriptions).toBe([sSubs1, sSubs2]);
    }, time(t));
  });
});