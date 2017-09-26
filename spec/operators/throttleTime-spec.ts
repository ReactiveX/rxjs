import { expect } from 'chai';
import * as Rx from '../../dist/package/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;
declare const time: typeof marbleTestingSignature.time;

declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;

/** @test {throttleTime} */
describe('Observable.prototype.throttleTime', () => {
  asDiagram('throttleTime(50)')('should immediately emit the first value in each time window', () => {
    const e1 =   hot('-a-x-y----b---x-cx---|');
    const subs =     '^                    !';
    const expected = '-a--------b-----c----|';

    const result = e1.throttleTime(50, rxTestScheduler);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should throttle events by 50 time units', (done: MochaDone) => {
    Observable.of(1, 2, 3).throttleTime(50)
      .subscribe((x: number) => {
        expect(x).to.equal(1);
      }, null, done);
  });

  it('should throttle events multiple times', () => {
    const expected = ['1-0', '2-0'];
    Observable.concat(
      Observable.timer(0, 10, rxTestScheduler).take(3).map((x: number) => '1-' + x),
      Observable.timer(80, 10, rxTestScheduler).take(5).map((x: number) => '2-' + x)
      )
      .throttleTime(50, rxTestScheduler)
      .subscribe((x: string) => {
        expect(x).to.equal(expected.shift());
      });

    rxTestScheduler.flush();
  });

  it('should simply mirror the source if values are not emitted often enough', () => {
    const e1 =   hot('-a--------b-----c----|');
    const subs =     '^                    !';
    const expected = '-a--------b-----c----|';

    expectObservable(e1.throttleTime(50, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle a busy producer emitting a regular repeating sequence with leading: true, trailing: false', () => {
    const e1 =   hot('a12345b12345c12345d123|');
    const subs =     '^                     !';
    const expected = 'a-----b-----c-----d---|';

    expectObservable(e1.throttleTime(50, rxTestScheduler, {leading: true, trailing: false})).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle a busy producer emitting a regular repeating sequence with leading: true, trailing: true', () => {
    const e1 =   hot('a1234b1234c1234d12e--|');
    const subs =     '^                    !';
    const expected = 'a----b----c----d----e|';

    expectObservable(e1.throttleTime(50, rxTestScheduler, {leading: true, trailing: true})).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should not drop values if values are far apart with leading: true, trailing: true', () => {
    const e1 =   hot('ab-----------c|');
    const subs =     '^             !';
    const expected = 'a----b-------c|';

    expectObservable(e1.throttleTime(50, rxTestScheduler, {leading: true, trailing: true})).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle a busy producer emitting a regular repeating sequence with leading: false, trailing: true', () => {
    const e1 =   hot('12345a1234b1234c12d--|');
    const subs =     '^                    !';
    const expected = '-----a----b----c----d|';

    expectObservable(e1.throttleTime(50, rxTestScheduler, {leading: false, trailing: true})).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should only emit trailing values with leading: false, trailing: true', () => {
    const e1 =   hot('ab-----------c--d--|');
    const subs =     '^                  !';
    const expected = '-----b------------d|';

    expectObservable(e1.throttleTime(50, rxTestScheduler, {leading: false, trailing: true})).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should complete when source does not emit', () => {
    const e1 =   hot('-----|');
    const subs =     '^    !';
    const expected = '-----|';

    expectObservable(e1.throttleTime(50, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should raise error when source does not emit and raises error', () => {
    const e1 =   hot('-----#');
    const subs =     '^    !';
    const expected = '-----#';

    expectObservable(e1.throttleTime(10, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle an empty source', () => {
    const e1 =  cold('|');
    const subs =     '(^!)';
    const expected = '|';

    expectObservable(e1.throttleTime(30, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle a never source', () => {
    const e1 =  cold('-');
    const subs =     '^';
    const expected = '-';

    expectObservable(e1.throttleTime(30, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle a throw source', () => {
    const e1 =  cold('#');
    const subs =     '(^!)';
    const expected = '#';

    expectObservable(e1.throttleTime(30, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should throttle and does not complete when source does not completes', () => {
    const e1 =   hot('-a--(bc)-------d----------------');
    const unsub =    '                               !';
    const subs =     '^                              !';
    const expected = '-a-------------d----------------';

    expectObservable(e1.throttleTime(50, rxTestScheduler), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =   hot('-a--(bc)-------d----------------');
    const subs =     '^                              !';
    const expected = '-a-------------d----------------';
    const unsub =    '                               !';

    const result = e1
      .mergeMap((x: string) => Observable.of(x))
      .throttleTime(50, rxTestScheduler)
      .mergeMap((x: string) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should throttle values until source raises error', () => {
    const e1 =   hot('-a--(bc)-------d---------------#');
    const subs =     '^                              !';
    const expected = '-a-------------d---------------#';

    expectObservable(e1.throttleTime(50, rxTestScheduler)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  describe('throttleTime(fn, { leading: true, trailing: true })', () => {
    asDiagram('throttleTime(fn, { leading: true, trailing: true })')('should immediately emit the first value in each time window', () =>  {
      const e1 =   hot('-a-xy-----b--x--cxxx---|');
      const e1subs =   '^                      !';
      const t =  time( '----|                  ');
      const expected = '-a---y----b---x---x---x|';

      const result = e1.throttleTime(t, rxTestScheduler, { leading: true, trailing: true });

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  describe('throttleTime(fn, { leading: false, trailing: true })', () => {
    asDiagram('throttleTime(fn, { leading: false, trailing: true })')('should emit last given value in each time window', () =>  {
      const e1 =   hot('-a-xy-----b--x--cxcd---|');
      const e1subs =   '^                      !';
      const t =  time( '----|                  ');
      const expected = '-----y--------x---c---d|';

      const result = e1.throttleTime(t, rxTestScheduler, { leading: false, trailing: true });

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
