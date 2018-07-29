import { of } from 'rxjs';
import { delay, repeatWhen, skip, take, tap, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { hot, cold, expectObservable, expectSubscriptions, time } from '../helpers/marble-testing';

declare const asDiagram: Function;
declare const rxTestScheduler: TestScheduler;

/** @test {delay} */
describe('delay operator', () => {
  asDiagram('delay(20)')('should delay by specified timeframe', () => {
    const e1 =   hot('---a--b--|  ');
    const t =   time(   '--|      ');
    const expected = '-----a--b--|';
    const subs =     '^        !  ';

    const result = e1.pipe(delay(t, rxTestScheduler));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should delay by absolute time period', () => {
    const e1 =   hot('--a--b--|   ');
    const t =   time(  '---|      ');
    const expected = '-----a--b--|';
    const subs =     '^       !   ';

    const absoluteDelay = new Date(rxTestScheduler.now() + t);
    const result = e1.pipe(delay(absoluteDelay, rxTestScheduler));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should delay by absolute time period after subscription', () => {
    const e1 =   hot('---^--a--b--|   ');
    const t =   time(      '---|      ');
    const expected =    '------a--b--|';
    const subs =        '^        !   ';

    const absoluteDelay = new Date(rxTestScheduler.now() + t);
    const result = e1.pipe(delay(absoluteDelay, rxTestScheduler));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should raise error when source raises error', () => {
    const e1 =   hot('---a---b---#');
    const t =   time(   '---|     ');
    const expected = '------a---b#';
    const subs =     '^          !';

    const result = e1.pipe(delay(t, rxTestScheduler));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should raise error when source raises error', () => {
    const e1 =   hot('--a--b--#');
    const t =   time(  '---|   ');
    const expected = '-----a--#';
    const subs =     '^       !';

    const absoluteDelay = new Date(rxTestScheduler.now() + t);
    const result = e1.pipe(delay(absoluteDelay, rxTestScheduler));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should raise error when source raises error after subscription', () => {
    const e1 =   hot('---^---a---b---#');
    const t =   time(       '---|     ');
    const expected =    '-------a---b#';
    const e1Sub =       '^           !';

    const absoluteDelay = new Date(rxTestScheduler.now() + t);
    const result = e1.pipe(delay(absoluteDelay, rxTestScheduler));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1Sub);
  });

  it('should delay when source does not emits', () => {
    const e1 =   hot('----|   ');
    const t =   time(    '---|');
    const expected = '-------|';
    const subs =     '^   !   ';

    const result = e1.pipe(delay(t, rxTestScheduler));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should delay when source is empty', () => {
    const e1 =  cold('|');
    const t =   time('---|');
    const expected = '---|';

    const result = e1.pipe(delay(t, rxTestScheduler));

    expectObservable(result).toBe(expected);
  });

  it('should not complete when source does not completes', () => {
    const e1 =   hot('---a---b---------');
    const t =   time(   '---|          ');
    const expected = '------a---b------';
    const unsub =    '----------------!';
    const subs =     '^               !';

    const result = e1.pipe(delay(t, rxTestScheduler));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =   hot('---a---b----');
    const t =   time(   '---|     ');
    const e1subs =   '^       !   ';
    const expected = '------a--   ';
    const unsub =    '        !   ';

    const result = e1.pipe(
      mergeMap((x: any) => of(x)),
      delay(t, rxTestScheduler),
      mergeMap((x: any) => of(x))
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not complete when source never completes', () => {
    const e1 =  cold('-');
    const t =   time('---|');
    const expected = '-';

    const result = e1.pipe(delay(t, rxTestScheduler));

    expectObservable(result).toBe(expected);
  });

  it('should unsubscribe scheduled actions after execution', () => {
    let subscribeSpy: any = null;
    const counts: number[] = [];

    const e1 =       cold('a|');
    const expected =      '--a-(a|)';
    const duration = time('-|');
    const result = e1.pipe(
      repeatWhen(notifications => {
        const delayed = notifications.pipe(delay(duration, rxTestScheduler));
        subscribeSpy = sinon.spy(delayed['source'], 'subscribe');
        return delayed;
      }),
      skip(1),
      take(2),
      tap({
        next() {
          const [[subscriber]] = subscribeSpy.args;
          counts.push(subscriber._subscriptions.length);
        },
        complete() {
          expect(counts).to.deep.equal([1, 1]);
        }
      })
    );

    expectObservable(result).toBe(expected);
  });
});
