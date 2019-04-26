import { of } from 'rxjs';
import { endWith, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';

declare function asDiagram(arg: string): Function;

declare const rxTestScheduler: TestScheduler;

/** @test {endWith} */
describe('endWith operator', () => {
  const defaultStartValue = 'x';

  asDiagram('endWith(s)')('should append to a cold Observable', () => {
    const e1 =  cold('---a--b--c--|');
    const e1subs =   '^           !';
    const expected = '---a--b--c--(s|)';

    expectObservable(e1.pipe(endWith('s'))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should append numbers to a cold Observable', () => {
    const values = { a: 1, b: 2, c: 3, s: 4 };
    const e1 =  cold('---a--b--c--|', values);
    const e1subs =   '^           !';
    const expected = '---a--b--c--(s|)';

    expectObservable(e1.pipe(endWith(values.s))).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should end an observable with given value', () => {
    const e1 =   hot('--a--|');
    const e1subs =   '^    !';
    const expected = '--a--(x|)';

    expectObservable(e1.pipe(endWith(defaultStartValue))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not end with given value if source does not complete', () => {
    const e1 =   hot('----a-');
    const e1subs =   '^     ';
    const expected = '----a-';

    expectObservable(e1.pipe(endWith(defaultStartValue))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not end with given value if source never emits and does not completes', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.pipe(endWith(defaultStartValue))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should end with given value if source does not emit but does complete', () => {
    const e1 =   hot('---|');
    const e1subs =   '^  !';
    const expected = '---(x|)';

    expectObservable(e1.pipe(endWith(defaultStartValue))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should emit given value and complete immediately if source is empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '(x|)';

    expectObservable(e1.pipe(endWith(defaultStartValue))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should end with given value and source both if source emits single value', () => {
    const e1 =  cold('(a|)');
    const e1subs =   '(^!)';
    const expected = '(ax|)';

    expectObservable(e1.pipe(endWith(defaultStartValue))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should end with given values when given more than one value', () => {
    const e1 =   hot('-----a--|');
    const e1subs =   '^       !';
    const expected = '-----a--(yz|)';

    expectObservable(e1.pipe(endWith('y', 'z'))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error and not end with given value if source raises error', () => {
    const e1 =   hot('--#');
    const e1subs =   '^ !';
    const expected = '--#';

    expectObservable(e1.pipe(endWith(defaultStartValue))).toBe(expected, defaultStartValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error immediately and not end with given value if source throws error immediately', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable(e1.pipe(endWith(defaultStartValue))).toBe(expected, defaultStartValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 =   hot('---a--b----c--d--|');
    const unsub =    '         !        ';
    const e1subs =   '^        !        ';
    const expected = '---a--b---';

    const result = e1.pipe(endWith('s', rxTestScheduler));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =   hot('---a--b----c--d--|');
    const e1subs =   '^        !        ';
    const expected = '---a--b---        ';
    const unsub =    '         !        ';

    const result = e1.pipe(
      mergeMap((x: string) => of(x)),
      endWith('s', rxTestScheduler),
      mergeMap((x: string) => of(x))
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should end with empty if given value is not specified', () => {
    const e1 =   hot('-a-|');
    const e1subs =   '^  !';
    const expected = '-a-|';

    expectObservable(e1.pipe(endWith(rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should accept scheduler as last argument with single value', () => {
    const e1 =   hot('--a--|');
    const e1subs =   '^    !';
    const expected = '--a--(x|)';

    expectObservable(e1.pipe(endWith(defaultStartValue, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should accept scheduler as last argument with multiple value', () => {
    const e1 =   hot('-----a--|');
    const e1subs =   '^       !';
    const expected = '-----a--(yz|)';

    expectObservable(e1.pipe(endWith('y', 'z', rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
