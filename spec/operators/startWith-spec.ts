import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { startWith, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { of } from 'rxjs';

declare function asDiagram(arg: string): Function;

declare const rxTestScheduler: TestScheduler;

/** @test {startWith} */
describe('startWith operator', () => {
  const defaultStartValue = 'x';

  asDiagram('startWith(s)')('should prepend to a cold Observable', () => {
    const e1 =  cold('---a--b--c--|');
    const e1subs =   '^           !';
    const expected = 's--a--b--c--|';

    expectObservable(e1.pipe(startWith('s'))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should start an observable with given value', () => {
    const e1 =   hot('--a--|');
    const e1subs =   '^    !';
    const expected = 'x-a--|';

    expectObservable(e1.pipe(startWith(defaultStartValue))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should start with given value and does not completes if source does not completes', () => {
    const e1 =   hot('----a-');
    const e1subs =   '^     ';
    const expected = 'x---a-';

    expectObservable(e1.pipe(startWith(defaultStartValue))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should start with given value and does not completes if source never emits', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = 'x-';

    expectObservable(e1.pipe(startWith(defaultStartValue))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should start with given value and completes if source does not emits', () => {
    const e1 =   hot('---|');
    const e1subs =   '^  !';
    const expected = 'x--|';

    expectObservable(e1.pipe(startWith(defaultStartValue))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should start with given value and complete immediately if source is empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '(x|)';

    expectObservable(e1.pipe(startWith(defaultStartValue))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should start with given value and source both if source emits single value', () => {
    const e1 =  cold('(a|)');
    const e1subs =   '(^!)';
    const expected = '(xa|)';

    expectObservable(e1.pipe(startWith(defaultStartValue))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should start with given values when given value is more than one', () => {
    const e1 =   hot('-----a--|');
    const e1subs =   '^       !';
    const expected = '(yz)-a--|';

    expectObservable(e1.pipe(startWith('y', 'z'))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should start with given value and raises error if source raises error', () => {
    const e1 =   hot('--#');
    const e1subs =   '^ !';
    const expected = 'x-#';

    expectObservable(e1.pipe(startWith(defaultStartValue))).toBe(expected, defaultStartValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should start with given value and raises error immediately if source throws error', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '(x#)';

    expectObservable(e1.pipe(startWith(defaultStartValue))).toBe(expected, defaultStartValue);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 =   hot('---a--b----c--d--|');
    const unsub =    '         !        ';
    const e1subs =   '^        !        ';
    const expected = 's--a--b---';
    const values = { s: 's', a: 'a', b: 'b' };

    const result = e1.pipe(startWith('s', rxTestScheduler));

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =   hot('---a--b----c--d--|');
    const e1subs =   '^        !        ';
    const expected = 's--a--b---        ';
    const unsub =    '         !        ';
    const values = { s: 's', a: 'a', b: 'b' };

    const result = e1.pipe(
      mergeMap((x: string) => of(x)),
      startWith('s', rxTestScheduler),
      mergeMap((x: string) => of(x))
    );

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should start with empty if given value is not specified', () => {
    const e1 =   hot('-a-|');
    const e1subs =   '^  !';
    const expected = '-a-|';

    expectObservable(e1.pipe(startWith(rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should accept scheduler as last argument with single value', () => {
    const e1 =   hot('--a--|');
    const e1subs =   '^    !';
    const expected = 'x-a--|';

    expectObservable(e1.pipe(startWith(defaultStartValue, rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should accept scheduler as last argument with multiple value', () => {
    const e1 =   hot('-----a--|');
    const e1subs =   '^       !';
    const expected = '(yz)-a--|';

    expectObservable(e1.pipe(startWith('y', 'z', rxTestScheduler))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
