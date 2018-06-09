import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { sampleTime, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of } from 'rxjs';

declare function asDiagram(arg: string): Function;

declare const rxTestScheduler: TestScheduler;

/** @test {sampleTime} */
describe('sampleTime operator', () => {
  asDiagram('sampleTime(70)')('should get samples on a delay', () => {
    const e1 =   hot('a---b-c---------d--e---f-g-h--|');
    const e1subs =   '^                             !';
    const expected = '-------c-------------e------h-|';
    // timer          -------!------!------!------!--

    expectObservable(e1.pipe(sampleTime(70, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should sample nothing if new value has not arrived', () => {
    const e1 =   hot('----a-^--b----c--------------f----|');
    const e1subs =         '^                           !';
    const expected =       '-----------c----------------|';
    // timer              -----------!----------!---------

    expectObservable(e1.pipe(sampleTime(110, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should sample if new value has arrived, even if it is the same value', () => {
    const e1 =   hot('----a-^--b----c----------c---f----|');
    const e1subs =         '^                           !';
    const expected =       '-----------c----------c-----|';
    // timer              -----------!----------!---------

    expectObservable(e1.pipe(sampleTime(110, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should sample nothing if source has not nexted by time of sample', () => {
    const e1 =   hot('----a-^-------------b-------------|');
    const e1subs =         '^                           !';
    const expected =       '----------------------b-----|';
    // timer              -----------!----------!---------

    expectObservable(e1.pipe(sampleTime(110, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error if source raises error', () => {
    const e1 =   hot('----a-^--b----c----d----#');
    const e1subs =         '^                 !';
    const expected =       '-----------c------#';
    // timer              -----------!----------!---------

    expectObservable(e1.pipe(sampleTime(110, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 =   hot('----a-^--b----c----d----e----f----|');
    const unsub =          '                !            ';
    const e1subs =         '^               !            ';
    const expected =       '-----------c-----            ';
    // timer              -----------!----------!---------

    expectObservable(e1.pipe(sampleTime(110, rxTestScheduler)), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =   hot('----a-^--b----c----d----e----f----|');
    const e1subs =         '^               !            ';
    // timer              -----------!----------!---------
    const expected =       '-----------c-----            ';
    const unsub =          '                !            ';

    const result = e1.pipe(
      mergeMap((x: string) => of(x)),
      sampleTime(110, rxTestScheduler),
      mergeMap((x: string) => of(x))
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should completes if source does not emits', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '|';

    expectObservable(e1.pipe(sampleTime(60, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error if source throws immediately', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable(e1.pipe(sampleTime(60, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not completes if source does not complete', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.pipe(sampleTime(60, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
