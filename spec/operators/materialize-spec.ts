import * as Rx from '../../dist/cjs/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;
const Notification = Rx.Notification;

/** @test {materialize} */
describe('Observable.prototype.materialize', () => {
  asDiagram('materialize')('should materialize an Observable', () => {
    const e1 =   hot('--x--y--z--|');
    const expected = '--a--b--c--(d|)';
    const values = { a: '{x}', b: '{y}', c: '{z}', d: '|' };

    const result = e1
      .materialize()
      .map((x: Rx.Notification<any>) => {
        if (x.kind === 'C') {
          return '|';
        } else {
          return '{' + x.value + '}';
        }
      });

    expectObservable(result).toBe(expected, values);
  });

  it('should materialize a happy stream', () => {
    const e1 =   hot('--a--b--c--|');
    const e1subs =   '^          !';
    const expected = '--w--x--y--(z|)';

    const expectedValue = {
      w: Notification.createNext('a'),
      x: Notification.createNext('b'),
      y: Notification.createNext('c'),
      z: Notification.createComplete()
    };

    expectObservable(e1.materialize()).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should materialize a sad stream', () => {
    const e1 =   hot('--a--b--c--#');
    const e1subs =   '^          !';
    const expected = '--w--x--y--(z|)';

    const expectedValue = {
      w: Notification.createNext('a'),
      x: Notification.createNext('b'),
      y: Notification.createNext('c'),
      z: Notification.createError('error')
    };

    expectObservable(e1.materialize()).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 =   hot('--a--b--c--|');
    const unsub =    '      !     ';
    const e1subs =   '^     !     ';
    const expected = '--w--x-     ';

    const expectedValue = {
      w: Notification.createNext('a'),
      x: Notification.createNext('b')
    };

    expectObservable(e1.materialize(), unsub).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =   hot('--a--b--c--|');
    const e1subs =   '^     !     ';
    const expected = '--w--x-     ';
    const unsub =    '      !     ';

    const expectedValue = {
      w: Notification.createNext('a'),
      x: Notification.createNext('b')
    };

    const result = e1
      .mergeMap((x: string) => Observable.of(x))
      .materialize()
      .mergeMap((x: Rx.Notification<any>) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected, expectedValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should materialize stream does not completes', () => {
    const e1 =   hot('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.materialize()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should materialize stream never completes', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.materialize()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should materialize stream does not emit', () => {
    const e1 =   hot('----|');
    const e1subs =   '^   !';
    const expected = '----(x|)';

    expectObservable(e1.materialize()).toBe(expected, { x: Notification.createComplete() });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should materialize empty stream', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '(x|)';

    expectObservable(e1.materialize()).toBe(expected, { x: Notification.createComplete() });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should materialize stream throws', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '(x|)';

    expectObservable(e1.materialize()).toBe(expected, { x: Notification.createError('error') });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});