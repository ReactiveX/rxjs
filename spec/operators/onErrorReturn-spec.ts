import { expect } from 'chai';
import * as Rx from '../../dist/cjs/Rx';
declare const { hot, cold, asDiagram, expectObservable, expectSubscriptions };

declare const rxTestSchdeuler: Rx.TestScheduler;
const Observable = Rx.Observable;

/** @test {onErrorReturn} */
describe('Observable.prototype.onErrorReturn', () => {
  asDiagram('onErrorReturn')('should catch error and emit single selected value', () => {
    const e1 =   hot('--a--b--#        ');
    const expected = '--a--b--(1|)';

    const result = e1.onErrorReturn((err: any) => '1');

    expectObservable(result).toBe(expected);
  });

  it('should catch error and replace it with Observable.of() that you can .switch()', () => {
    const e1 =   hot('--a--b--c--------|');
    const subs =     '^       !';
    const expected = '--a--b--(XYZ|)';

    const result = e1
      .map((n: string) => {
        if (n === 'c') {
          throw 'bad';
        }
        return n;
      })
      .onErrorReturn((err: any) => {
        return Observable.of('X', 'Y', 'Z');
      })
      .switch();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 =   hot('--1-2-3-4-5-6---#');
    const e1subs =   '^      !         ';
    const expected = '--1-2-3-         ';
    const unsub =    '       !         ';

    const result = e1.onErrorReturn(() => 'x');

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    const e1 =   hot('--1-2-3-4-5-6---#');
    const e1subs =   '^      !         ';
    const expected = '--1-2-3-         ';
    const unsub =    '       !         ';

    const result = e1
      .mergeMap((x: any) => Observable.of(x))
      .onErrorReturn(() => 'x')
      .mergeMap((x: any) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should mirror the source if it does not raise errors', () => {
    const e1 =  cold('--a--b--c--|');
    const subs =     '^          !';
    const expected = '--a--b--c--|';

    const result = e1.onErrorReturn((err: any) => 'x');

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should pass the error as the first argument', (done: MochaDone) => {
    Observable.throw('bad')
      .onErrorReturn((err: any) => {
        expect(err).to.equal('bad');
      })
      .subscribe(() => {
        //noop
       }, (err: any) => {
          done(new Error('should not be called'));
        }, () => {
          done();
        });
  });

  it('should catch error thrown in selector and instead error with that', () => {
    const e1 =   hot('--a--b--c--------|');
    const subs =     '^       !';
    const expected = '--a--b--#';

    const result = e1
      .map((n: string) => {
        if (n === 'c') {
          throw 'bad';
        }
        return n;
      })
      .onErrorReturn((err: any) => {
        throw 'error';
      });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });
});
