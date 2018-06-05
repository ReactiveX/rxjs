import { expect } from 'chai';
import { finalize, map, share } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { of, timer, interval } from 'rxjs';

declare const type: Function;

declare const rxTestScheduler: TestScheduler;

/** @test {finalize} */
describe('finalize operator', () => {
  it('should call finalize after complete', (done: MochaDone) => {
    let completed = false;
    of(1, 2, 3).pipe(
      finalize(() => {
        expect(completed).to.be.true;
        done();
      })
    ).subscribe(null, null, () => {
        completed = true;
      });
  });

  it('should call finalize after error', (done: MochaDone) => {
    let thrown = false;
    of(1, 2, 3).pipe(
      map(function (x) {
        if (x === 3) {
          throw x;
        }
        return x;
      }),
      finalize(() => {
        expect(thrown).to.be.true;
        done();
      })
    ).subscribe(null, () => {
        thrown = true;
      });
  });

  it('should call finalize upon disposal', (done: MochaDone) => {
    let disposed = false;
    const subscription = timer(100).pipe(
      finalize(() => {
        expect(disposed).to.be.true;
        done();
      })).subscribe();
    disposed = true;
    subscription.unsubscribe();
  });

  it('should call finalize when synchronously subscribing to and unsubscribing ' +
  'from a shared Observable', (done: MochaDone) => {
    interval(50).pipe(
      finalize(done),
      share()
    ).subscribe()
      .unsubscribe();
  });

  it('should call two finalize instances in succession on a shared Observable', (done: MochaDone) => {
    let invoked = 0;
    function checkFinally() {
      invoked += 1;
      if (invoked === 2) {
        done();
      }
    }

    of(1, 2, 3).pipe(
      finalize(checkFinally),
      finalize(checkFinally),
      share()
    ).subscribe();
  });

  it('should handle empty', () => {
    let executed = false;
    let s1 = hot('|');
    let result = s1.pipe(finalize(() => executed = true));
    let expected = '|';
    expectObservable(result).toBe(expected);
    // manually flush so `finalize()` has chance to execute before the test is over.
    rxTestScheduler.flush();
    expect(executed).to.be.true;
  });

  it('should handle never', () => {
    let executed = false;
    let s1 = hot('-');
    let result = s1.pipe(finalize(() => executed = true));
    let expected = '-';
    expectObservable(result).toBe(expected);
    // manually flush so `finalize()` has chance to execute before the test is over.
    rxTestScheduler.flush();
    expect(executed).to.be.false;
  });

  it('should handle throw', () => {
    let executed = false;
    let s1 = hot('#');
    let result = s1.pipe(finalize(() => executed = true));
    let expected = '#';
    expectObservable(result).toBe(expected);
    // manually flush so `finalize()` has chance to execute before the test is over.
    rxTestScheduler.flush();
    expect(executed).to.be.true;
  });

  it('should handle basic hot observable', () => {
    let executed = false;
    let s1 = hot(  '--a--b--c--|');
    let subs =     '^          !';
    let expected = '--a--b--c--|';
    let result = s1.pipe(finalize(() => executed = true));
    expectObservable(result).toBe(expected);
    expectSubscriptions(s1.subscriptions).toBe(subs);
    // manually flush so `finalize()` has chance to execute before the test is over.
    rxTestScheduler.flush();
    expect(executed).to.be.true;
  });

  it('should handle basic cold observable', () => {
    let executed = false;
    let s1 = cold(  '--a--b--c--|');
    let subs =      '^          !';
    let expected =  '--a--b--c--|';
    let result = s1.pipe(finalize(() => executed = true));
    expectObservable(result).toBe(expected);
    expectSubscriptions(s1.subscriptions).toBe(subs);
    // manually flush so `finalize()` has chance to execute before the test is over.
    rxTestScheduler.flush();
    expect(executed).to.be.true;
  });

  it('should handle basic error', () => {
    let executed = false;
    let s1 = hot(  '--a--b--c--#');
    let subs =     '^          !';
    let expected = '--a--b--c--#';
    let result = s1.pipe(finalize(() => executed = true));
    expectObservable(result).toBe(expected);
    expectSubscriptions(s1.subscriptions).toBe(subs);
    // manually flush so `finalize()` has chance to execute before the test is over.
    rxTestScheduler.flush();
    expect(executed).to.be.true;
  });

  it('should handle unsubscription', () => {
    let executed = false;
    let s1 = hot(  '--a--b--c--|');
    let subs =     '^     !     ';
    let expected = '--a--b-';
    let unsub =    '      !';
    let result = s1.pipe(finalize(() => executed = true));
    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(s1.subscriptions).toBe(subs);
    // manually flush so `finalize()` has chance to execute before the test is over.
    rxTestScheduler.flush();
    expect(executed).to.be.true;
  });
});
