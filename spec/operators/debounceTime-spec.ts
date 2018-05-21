import { expect } from 'chai';
import { of, Subject } from 'rxjs';
import { debounceTime, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { VirtualTimeScheduler } from '../../src/internal/scheduler/VirtualTimeScheduler';

declare function asDiagram(arg: string): Function;

declare const rxTestScheduler: TestScheduler;

/** @test {debounceTime} */
describe('debounceTime operator', () => {
  asDiagram('debounceTime(20)')('should debounce values by 20 time units', () => {
    const e1 =   hot('-a--bc--d---|');
    const expected = '---a---c--d-|';

    expectObservable(e1.pipe(debounceTime(20, rxTestScheduler))).toBe(expected);
  });

  it('should delay all element by the specified time', () => {
    const e1 =   hot('-a--------b------c----|');
    const e1subs =   '^                     !';
    const expected = '------a--------b------(c|)';

    expectObservable(e1.pipe(debounceTime(50, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should debounce and delay element by the specified time', () => {
    const e1 =   hot('-a--(bc)-----------d-------|');
    const e1subs =   '^                          !';
    const expected = '---------c--------------d--|';

    expectObservable(e1.pipe(debounceTime(50, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete when source does not emit', () => {
    const e1 =   hot('-----|');
    const e1subs =   '^    !';
    const expected = '-----|';

    expectObservable(e1.pipe(debounceTime(10, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete when source is empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '|';

    expectObservable(e1.pipe(debounceTime(10, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error when source does not emit and raises error', () => {
    const e1 =   hot('-----#');
    const e1subs =   '^    !';
    const expected = '-----#';

    expectObservable(e1.pipe(debounceTime(10, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error when source throws', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable(e1.pipe(debounceTime(10, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing early and explicitly', () => {
    const e1 =   hot('--a--bc--d----|');
    const e1subs =   '^      !       ';
    const expected = '----a---       ';
    const unsub =    '       !       ';

    const result = e1.pipe(debounceTime(20, rxTestScheduler));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when unsubscribed explicitly', () => {
    const e1 =   hot('--a--bc--d----|');
    const e1subs =   '^      !       ';
    const expected = '----a---       ';
    const unsub =    '       !       ';

    const result = e1.pipe(
      mergeMap((x: any) => of(x)),
      debounceTime(20, rxTestScheduler),
      mergeMap((x: any) => of(x))
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should debounce and does not complete when source does not completes', () => {
    const e1 =   hot('-a--(bc)-----------d-------');
    const e1subs =   '^                          ';
    const expected = '---------c--------------d--';

    expectObservable(e1.pipe(debounceTime(50, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not completes when source does not completes', () => {
    const e1 =   hot('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.pipe(debounceTime(10, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not completes when source never completes', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.pipe(debounceTime(10, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should delay all element until source raises error', () => {
    const e1 =   hot('-a--------b------c----#');
    const e1subs =   '^                     !';
    const expected = '------a--------b------#';

    expectObservable(e1.pipe(debounceTime(50, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should debounce all elements while source emits within given time', () => {
    const e1 =   hot('--a--b--c--d--e--f--g--h-|');
    const e1subs =   '^                        !';
    const expected = '-------------------------(h|)';

    expectObservable(e1.pipe(debounceTime(40, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should debounce all element while source emits within given time until raises error', () => {
    const e1 =   hot('--a--b--c--d--e--f--g--h-#');
    const e1subs =   '^                        !';
    const expected = '-------------------------#';

    expectObservable(e1.pipe(debounceTime(40, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should debounce correctly when synchronously reentered', () => {
    const results: number[] = [];
    const source = new Subject<number>();
    const scheduler = new VirtualTimeScheduler();

    source.pipe(debounceTime(0, scheduler)).subscribe(value => {
      results.push(value);

      if (value === 1) {
        source.next(2);
      }
    });
    source.next(1);
    scheduler.flush();

    expect(results).to.deep.equal([1, 2]);
  });
});
