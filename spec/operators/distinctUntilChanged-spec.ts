import { distinctUntilChanged, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';

declare function asDiagram(arg: string): Function;

/** @test {distinctUntilChanged} */
describe('distinctUntilChanged operator', () => {
  asDiagram('distinctUntilChanged')('should distinguish between values', () => {
    const e1 =   hot('-1--2-2----1-3-|');
    const expected = '-1--2------1-3-|';

    expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
  });

  it('should distinguish between values', () => {
    const e1 =   hot('--a--a--a--b--b--a--|');
    const e1subs =   '^                   !';
    const expected = '--a--------b-----a--|';

    expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should distinguish between values and does not completes', () => {
    const e1 =   hot('--a--a--a--b--b--a-');
    const e1subs =   '^                  ';
    const expected = '--a--------b-----a-';

    expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not completes if source never completes', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not completes if source does not completes', () => {
    const e1 =   hot('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete if source is empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '|';

    expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete if source does not emit', () => {
    const e1 =   hot('------|');
    const e1subs =   '^     !';
    const expected = '------|';

    expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should emit if source emits single element only', () => {
    const e1 =   hot('--a--|');
    const e1subs =   '^    !';
    const expected = '--a--|';

    expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should emit if source is scalar', () => {
    const e1 = of('a');
    const expected = '(a|)';

    expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
  });

  it('should raises error if source raises error', () => {
    const e1 =   hot('--a--a--#');
    const e1subs =   '^       !';
    const expected = '--a-----#';

    expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raises error if source throws', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not omit if source elements are all different', () => {
    const e1 =   hot('--a--b--c--d--e--f--|');
    const e1subs =   '^                   !';
    const expected = '--a--b--c--d--e--f--|';

    expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing early and explicitly', () => {
    const e1 =   hot('--a--b--b--d--a--f--|');
    const e1subs =   '^         !          ';
    const expected = '--a--b-----          ';
    const unsub =    '          !          ';

    const result = e1.pipe(distinctUntilChanged());

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when unsubscribed explicitly', () => {
    const e1 =   hot('--a--b--b--d--a--f--|');
    const e1subs =   '^         !          ';
    const expected = '--a--b-----          ';
    const unsub =    '          !          ';

    const result = e1.pipe(
      mergeMap((x: any) => of(x)),
      distinctUntilChanged(),
      mergeMap((x: any) => of(x)),
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should emit once if source elements are all same', () => {
    const e1 =   hot('--a--a--a--a--a--a--|');
    const e1subs =   '^                   !';
    const expected = '--a-----------------|';

    expectObservable(e1.pipe(distinctUntilChanged())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should emit once if comparator returns true always regardless of source emits', () => {
    const e1 =   hot('--a--b--c--d--e--f--|');
    const e1subs =   '^                   !';
    const expected = '--a-----------------|';

    expectObservable(e1.pipe(distinctUntilChanged(() => { return true; }))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should emit all if comparator returns false always regardless of source emits', () => {
    const e1 =   hot('--a--a--a--a--a--a--|');
    const e1subs =   '^                   !';
    const expected = '--a--a--a--a--a--a--|';

    expectObservable(e1.pipe(distinctUntilChanged(() => { return false; }))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should distinguish values by comparator', () => {
    const e1 =   hot('--a--b--c--d--e--f--|', {a: 1, b: 2, c: 3, d: 4, e: 5, f: 6});
    const e1subs =   '^                   !';
    const expected = '--a-----c-----e-----|';
    const comparator = (x: number, y: number) => y % 2 === 0;

    expectObservable(e1.pipe(distinctUntilChanged(comparator))).toBe(expected, {a: 1, c: 3, e: 5});
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raises error when comparator throws', () => {
    const e1 =   hot('--a--b--c--d--e--f--|');
    const e1subs =   '^          !         ';
    const expected = '--a--b--c--#         ';
    const comparator = (x: string, y: string) => {
      if (y === 'd') {
        throw 'error';
      }
      return x === y;
    };

    expectObservable(e1.pipe(distinctUntilChanged(comparator))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should use the keySelector to pick comparator values', () => {
    const e1 =   hot('--a--b--c--d--e--f--|', {a: 1, b: 2, c: 3, d: 4, e: 5, f: 6});
    const e1subs =   '^                   !';
    const expected = '--a--b-----d-----f--|';
    const comparator = (x: number, y: number) => y % 2 === 1;
    const keySelector = (x: number) => x % 2;

    expectObservable(e1.pipe(distinctUntilChanged(comparator, keySelector))).toBe(expected, {a: 1, b: 2, d: 4, f: 6});
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raises error when keySelector throws', () => {
    const e1 =   hot('--a--b--c--d--e--f--|');
    const e1subs =   '^          !         ';
    const expected = '--a--b--c--#         ';
    const keySelector = (x: string) => {
      if (x === 'd') {
        throw 'error';
      }
      return x;
    };

    expectObservable(e1.pipe(distinctUntilChanged(null, keySelector))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
