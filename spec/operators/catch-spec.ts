import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx.KitchenSink';
declare const {hot, cold, asDiagram, expectObservable, expectSubscriptions};

declare const rxTestSchdeuler: Rx.TestScheduler;
const Observable = Rx.Observable;

/** @test {catch} */
describe('Observable.prototype.catch', () => {
  asDiagram('catch')('should catch error and replace with a cold Observable', () => {
    const e1 =   hot('--a--b--#        ');
    const e2 =  cold('-1-2-3-|         ');
    const expected = '--a--b---1-2-3-|)';

    const result = e1.catch((err: any) => e2);

    expectObservable(result).toBe(expected);
  });

  it('should catch error and replace it with Observable.of()', () => {
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
      .catch((err: any) => {
        return Observable.of('X', 'Y', 'Z', Rx.Scheduler.none);
      });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should catch error and replace it with a cold Observable', () => {
    const e1 =   hot('--a--b--#          ');
    const e1subs =   '^       !          ';
    const e2 =  cold(        '1-2-3-4-5-|');
    const e2subs =   '        ^         !';
    const expected = '--a--b--1-2-3-4-5-|';

    const result = e1.catch((err: any) => e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 =   hot('--1-2-3-4-5-6---#');
    const e1subs =   '^      !         ';
    const expected = '--1-2-3-         ';
    const unsub =    '       !         ';

    const result = e1.catch(() => {
      return Observable.of('X', 'Y', 'Z', Rx.Scheduler.none);
    });

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
      .catch(() => {
        return Observable.of('X', 'Y', 'Z', Rx.Scheduler.none);
      })
      .mergeMap((x: any) => Observable.of(x, Rx.Scheduler.none));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should catch error and replace it with a hot Observable', () => {
    const e1 =   hot('--a--b--#          ');
    const e1subs =   '^       !          ';
    const e2 =   hot('1-2-3-4-5-6-7-8-9-|');
    const e2subs =   '        ^         !';
    const expected = '--a--b--5-6-7-8-9-|';

    const result = e1.catch((err: any) => e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should catch and allow the cold observable to be repeated with the third ' +
  '(caught) argument', () => {
    const e1 =  cold('--a--b--c--------|       ');
    const subs =    ['^       !                ',
                   '        ^       !        ',
                   '                ^       !'];
    const expected = '--a--b----a--b----a--b--#';

    let retries = 0;
    const result = e1
      .map((n: any) => {
        if (n === 'c') {
          throw 'bad';
        }
        return n;
      })
      .catch((err: any, caught: any) => {
        if (retries++ === 2) {
          throw 'done';
        }
        return caught;
      });

    expectObservable(result).toBe(expected, undefined, 'done');
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should catch and allow the hot observable to proceed with the third ' +
  '(caught) argument', () => {
    const e1 =   hot('--a--b--c----d---|');
    const subs =    ['^       !         ',
                   '        ^        !'];
    const expected = '--a--b-------d---|';

    let retries = 0;
    const result = e1
      .map((n: any) => {
        if (n === 'c') {
          throw 'bad';
        }
        return n;
      })
      .catch((err: any, caught: any) => {
        if (retries++ === 2) {
          throw 'done';
        }
        return caught;
      });

    expectObservable(result).toBe(expected, undefined, 'done');
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should catch and replace a Observable.throw() as the source', () => {
    const e1 =  cold('#');
    const subs =     '(^!)';
    const expected = '(abc|)';

    const result = e1.catch((err: any) => Observable.of('a', 'b', 'c', Rx.Scheduler.none));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should mirror the source if it does not raise errors', () => {
    const e1 =  cold('--a--b--c--|');
    const subs =     '^          !';
    const expected = '--a--b--c--|';

    const result = e1.catch((err: any) => Observable.of('x', 'y', 'z', Rx.Scheduler.none));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should complete if you return Observable.empty()', () => {
    const e1 =   hot('--a--b--#');
    const e1subs =   '^       !';
    const e2 =  cold(        '|');
    const e2subs =   '        (^!)';
    const expected = '--a--b--|';

    const result = e1.catch(() => e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise error if you return Observable.throw()', () => {
    const e1 =   hot('--a--b--#');
    const e1subs =   '^       !';
    const e2 =  cold(        '#');
    const e2subs =   '        (^!)';
    const expected = '--a--b--#';

    const result = e1.catch(() => e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should never terminate if you return Observable.never()', () => {
    const e1 =   hot('--a--b--#');
    const e1subs =   '^       !';
    const e2 = cold(         '-');
    const e2subs =   '        ^';
    const expected = '--a--b---';

    const result = e1.catch(() => e2);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should pass the error as the first argument', (done: MochaDone) => {
    Observable.throw('bad')
      .catch((err: any) => {
        expect(err).to.equal('bad');
        return Observable.empty();
      })
      .subscribe(() => {
        //noop
       }, (err: any) => {
          done(new Error('should not be called'));
        }, () => {
          done();
        });
  });
});
