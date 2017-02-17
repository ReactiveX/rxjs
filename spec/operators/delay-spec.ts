import * as Rx from '../../dist/cjs/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram, time };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;
declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;

/** @test {delay} */
describe('Observable.prototype.delay', () => {
  asDiagram('delay(20)')('should delay by specified timeframe', () => {
    const e1 =   hot('---a--b--|  ');
    const t =   time(   '--|      ');
    const expected = '-----a--b--|';
    const subs =     '^          !';

    const result = e1.delay(t, rxTestScheduler);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should delay by absolute time period', () => {
    const e1 =   hot('--a--b--|  ');
    const t =   time(  '---|     ');
    const expected = '-----a--b--|';
    const subs =     '^          !';

    const absoluteDelay = new Date(rxTestScheduler.now() + t);
    const result = e1.delay(absoluteDelay, rxTestScheduler);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should delay by absolute time period after subscription', () => {
    const e1 =   hot('---^--a--b--|  ');
    const t =   time(      '---|     ');
    const expected =    '------a--b--|';
    const subs =        '^           !';

    const absoluteDelay = new Date(rxTestScheduler.now() + t);
    const result = e1.delay(absoluteDelay, rxTestScheduler);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should raise error when source raises error', () => {
    const e1 =   hot('---a---b---#');
    const t =   time(   '---|     ');
    const expected = '------a---b#';
    const subs =     '^          !';

    const result = e1.delay(t, rxTestScheduler);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should raise error when source raises error', () => {
    const e1 =   hot('--a--b--#');
    const t =   time(  '---|   ');
    const expected = '-----a--#';
    const subs =     '^       !';

    const absoluteDelay = new Date(rxTestScheduler.now() + t);
    const result = e1.delay(absoluteDelay, rxTestScheduler);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should raise error when source raises error after subscription', () => {
    const e1 =   hot('---^---a---b---#');
    const t =   time(       '---|     ');
    const expected =    '-------a---b#';
    const e1Sub =       '^           !';

    const absoluteDelay = new Date(rxTestScheduler.now() + t);
    const result = e1.delay(absoluteDelay, rxTestScheduler);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1Sub);
  });

  it('should delay when source does not emits', () => {
    const e1 =   hot('----|   ');
    const t =   time(    '---|');
    const expected = '-------|';
    const subs =     '^      !';

    const result = e1.delay(t, rxTestScheduler);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should delay when source is empty', () => {
    const e1 =  cold('|');
    const t =   time('---|');
    const expected = '---|';

    const result = e1.delay(t, rxTestScheduler);

    expectObservable(result).toBe(expected);
  });

  it('should not complete when source does not completes', () => {
    const e1 =   hot('---a---b---------');
    const t =   time(   '---|          ');
    const expected = '------a---b------';
    const unsub =    '----------------!';
    const subs =     '^               !';

    const result = e1.delay(t, rxTestScheduler);

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =   hot('---a---b----');
    const t =   time(   '---|     ');
    const e1subs =   '^       !   ';
    const expected = '------a--   ';
    const unsub =    '        !   ';

    const result = e1
      .mergeMap((x: any) => Observable.of(x))
      .delay(t, rxTestScheduler)
      .mergeMap((x: any) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not complete when source never completes', () => {
    const e1 =  cold('-');
    const t =   time('---|');
    const expected = '-';

    const result = e1.delay(t, rxTestScheduler);

    expectObservable(result).toBe(expected);
  });
});