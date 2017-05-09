import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
declare const {hot, cold, asDiagram, time, expectObservable, expectSubscriptions, rxTestScheduler};

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

  it('should handle error observables properly', () => {
    let s = cold(  '#');
    let sSubs1 =   '(^!)';
    let sSubs2 =   '                  (^!)';
    let t =        '------------------|';
    let exp1 =     '#';
    let exp2 =     '                  #';

    let source = s.shareResults();

    // first subscription starts the observable
    expectObservable(source).toBe(exp1);

    rxTestScheduler.schedule(() => {
      // second subscription
      expectObservable(source).toBe(exp2);
      expectSubscriptions(s.subscriptions).toBe([sSubs1, sSubs2]);
    }, time(t));
  });

  it('should multicast with a replay-like functionality', () => {
    let s = hot('---^---a-----b-----c--|');
    let sSubs =    '^                  !';
    let t1 =       '-----------|';
    let t2 =       '---------------------|';
    let exp1 =     '----a-----b-----c--|';
    let exp2 =     '           (ab)-c--|';
    let exp3 =     '                     (abc|)';

    let source = s.shareResults();

    // first subscription starts the observable
    expectObservable(source).toBe(exp1);

    rxTestScheduler.schedule(() => {
      expectObservable(source).toBe(exp2);
    }, time(t1));

    rxTestScheduler.schedule(() => {
      // second subscription
      expectObservable(source).toBe(exp3);
      expectSubscriptions(s.subscriptions).toBe(sSubs);
    }, time(t2));
  });

  it('should multicast with a replay-like functionality ' +
    'until it errors then it should be replayable', () => {
      let s =   cold('---a-----b------c--#');
      let sSubs1 =   '^                  !';
      let t1 =       '-----------|';
      let t2 =       '---------------------|';
      let exp1 =     '---a-----b------c--#';
      let exp2 =     '           (ab)-c--#';
      let exp3 =     '                     ---a-----b------c--#';
      let sSubs2 =   '                     ^                  !';

      let source = s.shareResults();

      // first subscription starts the observable
      expectObservable(source).toBe(exp1);

      rxTestScheduler.schedule(() => {
        expectObservable(source).toBe(exp2);
      }, time(t1));

      rxTestScheduler.schedule(() => {
        // second subscription
        expectObservable(source).toBe(exp3);
        expectSubscriptions(s.subscriptions).toBe([sSubs1, sSubs2]);
      }, time(t2));
    });

  it('should handle empty observables properly', () => {
    let s = cold(  '|');
    let sSubs1 =   '(^!)';
    let t =        '------------------|';
    let exp1 =     '|';
    let exp2 =     '                  |';

    let source = s.shareResults();

    // first subscription starts the observable
    expectObservable(source).toBe(exp1);

    rxTestScheduler.schedule(() => {
      // second subscription
      expectObservable(source).toBe(exp2);
      expectSubscriptions(s.subscriptions).toBe(sSubs1);
    }, time(t));
  });
});