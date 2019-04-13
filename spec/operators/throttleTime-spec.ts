import { expect } from 'chai';
import { hot, cold, expectObservable, expectSubscriptions, time } from '../helpers/marble-testing';
import { throttleTime, take, map, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of, concat, timer } from 'rxjs';

declare function asDiagram(arg: string): Function;

declare const rxTestScheduler: TestScheduler;

/** @test {throttleTime} */
describe('throttleTime operator', () => {
  asDiagram('throttleTime(50)')('should immediately emit the first value in each time window', () => {
    const e1 =   hot('-a-x-y----b---x-cx---|');
    const subs =     '^                    !';
    const expected = '-a--------b-----c----|';

    const result = e1.pipe(throttleTime(50, rxTestScheduler));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should throttle events by 50 time units', (done: MochaDone) => {
    of(1, 2, 3).pipe(throttleTime(50))
      .subscribe((x: number) => {
        expect(x).to.equal(1);
      }, null, done);
  });

  it('should throttle events multiple times', () => {
    const expected = ['1-0', '2-0'];
    concat(
      timer(0, 10, rxTestScheduler).pipe(take(3), map((x: number) => '1-' + x)),
      timer(80, 10, rxTestScheduler).pipe(take(5), map((x: number) => '2-' + x))
    ).pipe(
      throttleTime(50, rxTestScheduler)
    ).subscribe((x: string) => {
        expect(x).to.equal(expected.shift());
      });

    rxTestScheduler.flush();
  });

  it('should simply mirror the source if values are not emitted often enough', () => {
    const e1 =   hot('-a--------b-----c----|');
    const subs =     '^                    !';
    const expected = '-a--------b-----c----|';

    expectObservable(e1.pipe(throttleTime(50, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle a busy producer emitting a regular repeating sequence', () => {
    const e1 =   hot('abcdefabcdefabcdefabcdefa|');
    const subs =     '^                        !';
    const expected = 'a-----a-----a-----a-----a|';

    expectObservable(e1.pipe(throttleTime(50, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should complete when source does not emit', () => {
    const e1 =   hot('-----|');
    const subs =     '^    !';
    const expected = '-----|';

    expectObservable(e1.pipe(throttleTime(50, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should raise error when source does not emit and raises error', () => {
    const e1 =   hot('-----#');
    const subs =     '^    !';
    const expected = '-----#';

    expectObservable(e1.pipe(throttleTime(10, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle an empty source', () => {
    const e1 =  cold('|');
    const subs =     '(^!)';
    const expected = '|';

    expectObservable(e1.pipe(throttleTime(30, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle a never source', () => {
    const e1 =  cold('-');
    const subs =     '^';
    const expected = '-';

    expectObservable(e1.pipe(throttleTime(30, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle a throw source', () => {
    const e1 =  cold('#');
    const subs =     '(^!)';
    const expected = '#';

    expectObservable(e1.pipe(throttleTime(30, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should throttle and does not complete when source does not completes', () => {
    const e1 =   hot('-a--(bc)-------d----------------');
    const unsub =    '                               !';
    const subs =     '^                              !';
    const expected = '-a-------------d----------------';

    expectObservable(e1.pipe(throttleTime(50, rxTestScheduler)), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =   hot('-a--(bc)-------d----------------');
    const subs =     '^                              !';
    const expected = '-a-------------d----------------';
    const unsub =    '                               !';

    const result = e1.pipe(
      mergeMap((x: string) => of(x)),
      throttleTime(50, rxTestScheduler),
      mergeMap((x: string) => of(x))
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should throttle values until source raises error', () => {
    const e1 =   hot('-a--(bc)-------d---------------#');
    const subs =     '^                              !';
    const expected = '-a-------------d---------------#';

    expectObservable(e1.pipe(throttleTime(50, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  describe('throttleTime(fn, { leading: true, trailing: true })', () => {
    asDiagram('throttleTime(fn, { leading: true, trailing: true })')('should immediately emit the first and last values in each time window', () =>  {
      const e1 =   hot('-a-xy-----b--x--cxxx--|');
      const e1subs =   '^                     !';
      const t =  time( '----|                  ');
      const expected = '-a---y----b---x-c---x-|';

      const result = e1.pipe(throttleTime(t, rxTestScheduler, { leading: true, trailing: true }));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });

    it('should emit the value if only a single one is given', () => {
      const e1 =   hot('-a--------------------|');
      const t =   time('----|                  ');
      const expected = '-a--------------------|';

      const result = e1.pipe(throttleTime(t, rxTestScheduler, { leading: true, trailing: true }));

      expectObservable(result).toBe(expected);
    });
  });

  describe('throttleTime(fn, { leading: false, trailing: true })', () => {
    asDiagram('throttleTime(fn, { leading: false, trailing: true })')('should immediately emit the last value in each time window', () =>  {
      const e1 =   hot('-a-xy-----b--x--cxxx--|');
      const e1subs =   '^                     !';
      const t =  time( '----|                  ');
      const expected = '-----y--------x-----x-|';

      const result = e1.pipe(throttleTime(t, rxTestScheduler, { leading: false, trailing: true }));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });

    it('should emit the last throttled value when complete', () => {
      const e1 =   hot('-a-xy-----b--x--cxx|');
      const e1subs =   '^                  !';
      const t =   time('----|               ');
      const expected = '-----y--------x----(x|)';

      const result = e1.pipe(throttleTime(t, rxTestScheduler, { leading: false, trailing: true }));

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });

    it('should emit the value if only a single one is given', () => {
      const e1 =   hot('-a--------------------|');
      const t =   time('----|                  ');
      const expected = '-----a----------------|';

      const result = e1.pipe(throttleTime(t, rxTestScheduler, { leading: false, trailing: true }));

      expectObservable(result).toBe(expected);
    });
  });
});
