import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram, Symbol, type };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;

declare const rxTestScheduler: Rx.TestScheduler;

/** @test {finally} */
describe('Observable.prototype.finally', () => {
  it('should call finally after complete', (done: MochaDone) => {
    let completed = false;
    Observable.of(1, 2, 3)
      .finally(() => {
        expect(completed).to.be.true;
        done();
      })
      .subscribe(null, null, () => {
        completed = true;
      });
  });

  it('should call finally after error', (done: MochaDone) => {
    let thrown = false;
    Observable.of(1, 2, 3)
      .map(function (x) {
        if (x === 3) {
          throw x;
        }
        return x;
      })
      .finally(() => {
        expect(thrown).to.be.true;
        done();
      })
      .subscribe(null, () => {
        thrown = true;
      });
  });

  it('should call finally upon disposal', (done: MochaDone) => {
    let disposed = false;
    const subscription = Observable
      .timer(100)
      .finally(() => {
        expect(disposed).to.be.true;
        done();
      }).subscribe();
    disposed = true;
    subscription.unsubscribe();
  });

  it('should call finally when synchronously subscribing to and unsubscribing ' +
  'from a shared Observable', (done: MochaDone) => {
    Observable.interval(50)
      .finally(done)
      .share()
      .subscribe()
      .unsubscribe();
  });

  it('should call two finally instances in succession on a shared Observable', (done: MochaDone) => {
    let invoked = 0;
    function checkFinally() {
      invoked += 1;
      if (invoked === 2) {
        done();
      }
    }

    Observable.of(1, 2, 3)
      .finally(checkFinally)
      .finally(checkFinally)
      .share()
      .subscribe();
  });

  it('should handle empty', () => {
    let executed = false;
    let s1 = hot('|');
    let result = s1.finally(() => executed = true);
    let expected = '|';
    expectObservable(result).toBe(expected);
    // manually flush so `finally()` has chance to execute before the test is over.
    rxTestScheduler.flush();
    expect(executed).to.be.true;
  });

  it('should handle never', () => {
    let executed = false;
    let s1 = hot('-');
    let result = s1.finally(() => executed = true);
    let expected = '-';
    expectObservable(result).toBe(expected);
    // manually flush so `finally()` has chance to execute before the test is over.
    rxTestScheduler.flush();
    expect(executed).to.be.false;
  });

  it('should handle throw', () => {
    let executed = false;
    let s1 = hot('#');
    let result = s1.finally(() => executed = true);
    let expected = '#';
    expectObservable(result).toBe(expected);
    // manually flush so `finally()` has chance to execute before the test is over.
    rxTestScheduler.flush();
    expect(executed).to.be.true;
  });

  it('should handle basic hot observable', () => {
    let executed = false;
    let s1 = hot(  '--a--b--c--|');
    let subs =     '^          !';
    let expected = '--a--b--c--|';
    let result = s1.finally(() => executed = true);
    expectObservable(result).toBe(expected);
    expectSubscriptions(s1.subscriptions).toBe(subs);
    // manually flush so `finally()` has chance to execute before the test is over.
    rxTestScheduler.flush();
    expect(executed).to.be.true;
  });

  it('should handle basic cold observable', () => {
    let executed = false;
    let s1 = cold(  '--a--b--c--|');
    let subs =      '^          !';
    let expected =  '--a--b--c--|';
    let result = s1.finally(() => executed = true);
    expectObservable(result).toBe(expected);
    expectSubscriptions(s1.subscriptions).toBe(subs);
    // manually flush so `finally()` has chance to execute before the test is over.
    rxTestScheduler.flush();
    expect(executed).to.be.true;
  });

  it('should handle basic error', () => {
    let executed = false;
    let s1 = hot(  '--a--b--c--#');
    let subs =     '^          !';
    let expected = '--a--b--c--#';
    let result = s1.finally(() => executed = true);
    expectObservable(result).toBe(expected);
    expectSubscriptions(s1.subscriptions).toBe(subs);
    // manually flush so `finally()` has chance to execute before the test is over.
    rxTestScheduler.flush();
    expect(executed).to.be.true;
  });

  it('should handle unsubscription', () => {
    let executed = false;
    let s1 = hot(  '--a--b--c--|');
    let subs =     '^     !     ';
    let expected = '--a--b-';
    let unsub =    '      !';
    let result = s1.finally(() => executed = true);
    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(s1.subscriptions).toBe(subs);
    // manually flush so `finally()` has chance to execute before the test is over.
    rxTestScheduler.flush();
    expect(executed).to.be.true;
  });
});
