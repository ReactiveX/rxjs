import { distinctUntilKeyChanged, mergeMap } from 'rxjs/operators';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { of } from 'rxjs';

declare function asDiagram(arg: string): Function;

/** @test {distinctUntilKeyChanged} */
describe('distinctUntilKeyChanged operator', () => {
  asDiagram('distinctUntilKeyChanged(\'k\')')('should distinguish between values', () => {
    const values = {a: {k: 1}, b: {k: 2}, c: {k: 3}};
    const e1 =   hot('-a--b-b----a-c-|', values);
    const expected = '-a--b------a-c-|';

    const result = (<any>e1).pipe(distinctUntilKeyChanged('k'));

    expectObservable(result).toBe(expected, values);
  });

  it('should distinguish between values', () => {
    const values = {a: {val: 1}, b: {val: 2}};
    const e1 =   hot('--a--a--a--b--b--a--|', values);
    const e1subs =   '^                   !';
    const expected = '--a--------b-----a--|';

    expectObservable((<any>e1).pipe(distinctUntilKeyChanged('val'))).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should distinguish between values and does not completes', () => {
    const values = {a: {val: 1}, b: {val: 2}};
    const e1 =   hot('--a--a--a--b--b--a-', values);
    const e1subs =   '^                  ';
    const expected = '--a--------b-----a-';

    expectObservable((<any>e1).pipe(distinctUntilKeyChanged('val'))).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should distinguish between values with key', () => {
    const values = {a: {val: 1}, b: {valOther: 1}, c: {valOther: 3}, d: {val: 1}, e: {val: 5}};
    const e1 =   hot('--a--b--c--d--e--|', values);
    const e1subs =   '^                !';
    const expected = '--a--b-----d--e--|';

    expectObservable((<any>e1).pipe(distinctUntilKeyChanged('val'))).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not compare if source does not have element with key', () => {
    const values = {a: {valOther: 1}, b: {valOther: 1}, c: {valOther: 3}, d: {valOther: 1}, e: {valOther: 5}};
    const e1 =   hot('--a--b--c--d--e--|', values);
    const e1subs =   '^                !';
    const expected = '--a--------------|';

    expectObservable((<any>e1).pipe(distinctUntilKeyChanged('val'))).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not completes if source never completes', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable((<any>e1).pipe(distinctUntilKeyChanged('val'))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not completes if source does not completes', () => {
    const e1 =   hot('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable((<any>e1).pipe(distinctUntilKeyChanged('val'))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete if source is empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '|';

    expectObservable((<any>e1).pipe(distinctUntilKeyChanged('val'))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete if source does not emit', () => {
    const e1 =   hot('------|');
    const e1subs =   '^     !';
    const expected = '------|';

    expectObservable((<any>e1).pipe(distinctUntilKeyChanged('val'))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should emit if source emits single element only', () => {
    const values = {a: {val: 1}};
    const e1 =   hot('--a--|', values);
    const e1subs =   '^    !';
    const expected = '--a--|';

    expectObservable((<any>e1).pipe(distinctUntilKeyChanged('val'))).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should emit if source is scalar', () => {
    const values = {a: {val: 1}};
    const e1 = of(values.a);
    const expected = '(a|)';

    expectObservable((<any>e1).pipe(distinctUntilKeyChanged('val'))).toBe(expected, values);
  });

  it('should raises error if source raises error', () => {
    const values = {a: {val: 1}};
    const e1 =   hot('--a--a--#', values);
    const e1subs =   '^       !';
    const expected = '--a-----#';

    expectObservable((<any>e1).pipe(distinctUntilKeyChanged('val'))).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raises error if source throws', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable((<any>e1).pipe(distinctUntilKeyChanged('val'))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not omit if source elements are all different', () => {
    const values = {a: {val: 1}, b: {val: 2}, c: {val: 3}, d: {val: 4}, e: {val: 5}};
    const e1 =   hot('--a--b--c--d--e--|', values);
    const e1subs =   '^                !';
    const expected = '--a--b--c--d--e--|';

    expectObservable((<any>e1).pipe(distinctUntilKeyChanged('val'))).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing early and explicitly', () => {
    const values = {a: {val: 1}, b: {val: 2}, c: {val: 3}, d: {val: 4}, e: {val: 5}};
    const e1 =   hot('--a--b--b--d--a--e--|', values);
    const e1subs =   '^         !          ';
    const expected = '--a--b-----          ';
    const unsub =    '          !          ';

    const result = (<any>e1).pipe(distinctUntilKeyChanged('val'));

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when unsubscribed explicitly', () => {
    const values = {a: {val: 1}, b: {val: 2}, c: {val: 3}, d: {val: 4}, e: {val: 5}};
    const e1 =   hot('--a--b--b--d--a--e--|', values);
    const e1subs =   '^         !          ';
    const expected = '--a--b-----          ';
    const unsub =    '          !          ';

    const result = (<any>e1).pipe(
      mergeMap((x: any) => of(x)),
      distinctUntilKeyChanged('val'),
      mergeMap((x: any) => of(x))
    );

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should emit once if source elements are all same', () => {
    const values = {a: {val: 1}};
    const e1 =   hot('--a--a--a--a--a--a--|', values);
    const e1subs =   '^                   !';
    const expected = '--a-----------------|';

    expectObservable((<any>e1).pipe(distinctUntilKeyChanged('val'))).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should emit once if comparer returns true always regardless of source emits', () => {
    const values = {a: {val: 1}, b: {val: 2}, c: {val: 3}, d: {val: 4}, e: {val: 5}};
    const e1 =   hot('--a--b--c--d--e--|', values);
    const e1subs =   '^                !';
    const expected = '--a--------------|';

    expectObservable(e1.pipe(distinctUntilKeyChanged('val', () => true))).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should emit all if comparer returns false always regardless of source emits', () => {
    const values = {a: {val: 1}};
    const e1 =   hot('--a--a--a--a--a--a--|', values);
    const e1subs =   '^                   !';
    const expected = '--a--a--a--a--a--a--|';

    expectObservable(e1.pipe(distinctUntilKeyChanged('val', () => false))).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should distinguish values by selector', () => {
    const values = {a: {val: 1}, b: {val: 2}, c: {val: 3}, d: {val: 4}, e: {val: 5}};
    const e1 =   hot('--a--b--c--d--e--|', values);
    const e1subs =   '^                !';
    const expected = '--a-----c-----e--|';
    const selector = (x: number, y: number) => y % 2 === 0;

    expectObservable(e1.pipe(distinctUntilKeyChanged('val', selector))).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raises error when comparer throws', () => {
    const values = {a: {val: 1}, b: {val: 2}, c: {val: 3}, d: {val: 4}, e: {val: 5}};
    const e1 =   hot('--a--b--c--d--e--|', values);
    const e1subs =   '^          !      ';
    const expected = '--a--b--c--#      ';
    const selector = (x: number, y: number) => {
      if (y === 4) {
        throw 'error';
      }
      return x === y;
    };

    expectObservable(e1.pipe(distinctUntilKeyChanged('val', selector))).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
