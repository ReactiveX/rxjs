import * as Rx from '../../dist/package/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;
const Notification = Rx.Notification;

/** @test {dematerialize} */
describe('Observable.prototype.dematerialize', () => {
  asDiagram('dematerialize')('should dematerialize an Observable', () => {
    const values = {
      a: '{x}',
      b: '{y}',
      c: '{z}',
      d: '|'
    };

    const e1 =   hot('--a--b--c--d-|', values);
    const expected = '--x--y--z--|';

    const result = e1.map((x: string) => {
      if (x === '|') {
        return Notification.createComplete();
      } else {
        return Notification.createNext(x.replace('{', '').replace('}', ''));
      }
    }).dematerialize();

    expectObservable(result).toBe(expected);
  });

  it('should dematerialize a happy stream', () => {
    const values = {
      a: Notification.createNext('w'),
      b: Notification.createNext('x'),
      c: Notification.createNext('y'),
      d: Notification.createComplete()
    };

    const e1 =   hot('--a--b--c--d--|', values);
    const e1subs =   '^          !';
    const expected = '--w--x--y--|';

    expectObservable(e1.dematerialize()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should dematerialize a sad stream', () => {
    const values = {
      a: Notification.createNext('w'),
      b: Notification.createNext('x'),
      c: Notification.createNext('y'),
      d: Notification.createError('error')
    };

    const e1 =   hot('--a--b--c--d--|', values);
    const e1subs =   '^          !';
    const expected = '--w--x--y--#';

    expectObservable(e1.dematerialize()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should dematerialize stream does not completes', () => {
    const e1 =   hot('------');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.dematerialize()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should dematerialize stream never completes', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.dematerialize()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should dematerialize stream does not emit', () => {
    const e1 =   hot('----|');
    const e1subs =   '^   !';
    const expected = '----|';

    expectObservable(e1.dematerialize()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should dematerialize empty stream', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '|';

    expectObservable(e1.dematerialize()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should dematerialize stream throws', () => {
    const error = 'error';
    const e1 =   hot('(x|)', {x: Notification.createError(error)});
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable(e1.dematerialize()).toBe(expected, null, error);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing early and explicitly', () => {
    const values = {
      a: Notification.createNext('w'),
      b: Notification.createNext('x')
    };

    const e1 =   hot('--a--b--c--d--|', values);
    const e1subs =   '^      !       ';
    const expected = '--w--x--       ';
    const unsub =    '       !       ';

    const result = e1.dematerialize();

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when unsubscribed explicitly', () => {
    const values = {
      a: Notification.createNext('w'),
      b: Notification.createNext('x')
    };

    const e1 =   hot('--a--b--c--d--|', values);
    const e1subs =   '^      !       ';
    const expected = '--w--x--       ';
    const unsub =    '       !       ';

    const result = e1
      .mergeMap((x: any) => Observable.of(x))
      .dematerialize()
      .mergeMap((x: any) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should dematerialize and completes when stream compltes with complete notification', () => {
    const e1 =   hot('----(a|)', { a: Notification.createComplete() });
    const e1subs =   '^   !';
    const expected = '----|';

    expectObservable(e1.dematerialize()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should dematerialize and completes when stream emits complete notification', () => {
    const e1 =   hot('----a--|', { a: Notification.createComplete() });
    const e1subs =   '^   !';
    const expected = '----|';

    expectObservable(e1.dematerialize()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});