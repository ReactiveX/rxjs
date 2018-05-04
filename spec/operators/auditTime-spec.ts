import { expect } from 'chai';
import { of, concat, timer } from 'rxjs';
import { auditTime, take, map, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';

declare function asDiagram(arg: string): Function;

declare const rxTestScheduler: TestScheduler;

/** @test {auditTime} */
describe('auditTime operator', () => {
  asDiagram('auditTime(50)')('should emit the last value in each time window', () => {
    const e1 =   hot('-a-x-y----b---x-cx---|');
    const subs =     '^                    !';
    const expected = '------y--------x-----|';

    const result = e1.pipe(auditTime(50, rxTestScheduler));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should auditTime events by 50 time units', (done: MochaDone) => {
    of(1, 2, 3).pipe(
      auditTime(50)
    ).subscribe((x: number) => {
        done(new Error('should not be called'));
      }, null, () => {
        done();
      });
  });

  it('should auditTime events multiple times', () => {
    const expected = ['1-2', '2-2'];
    concat(
      timer(0, 10, rxTestScheduler).pipe(
        take(3),
        map((x: number) => '1-' + x)
      ),
      timer(80, 10, rxTestScheduler).pipe(
        take(5),
        map((x: number) => '2-' + x)
      )
    ).pipe(
      auditTime(50, rxTestScheduler)
    ).subscribe((x: string) => {
        expect(x).to.equal(expected.shift());
      });

    rxTestScheduler.flush();
  });

  it('should delay the source if values are not emitted often enough', () => {
    const e1 =   hot('-a--------b-----c----|');
    const subs =     '^                    !';
    const expected = '------a--------b-----|';

    expectObservable(e1.pipe(auditTime(50, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle a busy producer emitting a regular repeating sequence', () => {
    const e1 =   hot('abcdefabcdefabcdefabcdefa|');
    const subs =     '^                        !';
    const expected = '-----f-----f-----f-----f-|';

    expectObservable(e1.pipe(auditTime(50, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should complete when source does not emit', () => {
    const e1 =   hot('-----|');
    const subs =     '^    !';
    const expected = '-----|';

    expectObservable(e1.pipe(auditTime(50, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should raise error when source does not emit and raises error', () => {
    const e1 =   hot('-----#');
    const subs =     '^    !';
    const expected = '-----#';

    expectObservable(e1.pipe(auditTime(10, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle an empty source', () => {
    const e1 =  cold('|');
    const subs =     '(^!)';
    const expected = '|';

    expectObservable(e1.pipe(auditTime(30, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle a never source', () => {
    const e1 =  cold('-');
    const subs =     '^';
    const expected = '-';

    expectObservable(e1.pipe(auditTime(30, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should handle a throw source', () => {
    const e1 =  cold('#');
    const subs =     '(^!)';
    const expected = '#';

    expectObservable(e1.pipe(auditTime(30, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should not complete when source does not complete', () => {
    const e1 =   hot('-a--(bc)-------d----------------');
    const unsub =    '                               !';
    const subs =     '^                              !';
    const expected = '------c-------------d-----------';

    expectObservable(e1.pipe(auditTime(50, rxTestScheduler)), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =   hot('-a--(bc)-------d----------------');
    const subs =     '^                              !';
    const expected = '------c-------------d-----------';
    const unsub =    '                               !';

    const result = e1.pipe(
      mergeMap((x: string) => of(x)),
      auditTime(50, rxTestScheduler),
      mergeMap((x: string) => of(x))
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });

  it('should auditTime values until source raises error', () => {
    const e1 =   hot('-a--(bc)-------d---------------#');
    const subs =     '^                              !';
    const expected = '------c-------------d----------#';

    expectObservable(e1.pipe(auditTime(50, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(subs);
  });
});
