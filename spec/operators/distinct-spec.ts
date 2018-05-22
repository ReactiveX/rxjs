import { distinct, mergeMap } from 'rxjs/operators';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { of } from 'rxjs';

/** @test {distinct} */
describe('distinct operator', () => {
  it('should distinguish between values', () => {
    const e1 =   hot('--a--a--a--b--b--a--|');
    const e1subs =   '^                   !';
    const expected = '--a--------b--------|';

    expectObservable((<any>e1).pipe(distinct())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should distinguish between values and does not completes', () => {
    const e1 =   hot('--a--a--a--b--b--a-');
    const e1subs =   '^                  ';
    const expected = '--a--------b-------';

    expectObservable((<any>e1).pipe(distinct())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not completes if source never completes', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable((<any>e1).pipe(distinct())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not completes if source does not completes', () => {
    const e1 =   hot('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable((<any>e1).pipe(distinct())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete if source is empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '|';

    expectObservable((<any>e1).pipe(distinct())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete if source does not emit', () => {
    const e1 =   hot('------|');
    const e1subs =   '^     !';
    const expected = '------|';

    expectObservable((<any>e1).pipe(distinct())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should emit if source emits single element only', () => {
    const e1 =   hot('--a--|');
    const e1subs =   '^    !';
    const expected = '--a--|';

    expectObservable((<any>e1).pipe(distinct())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should emit if source is scalar', () => {
    const e1 = of('a');
    const expected = '(a|)';

    expectObservable((<any>e1).pipe(distinct())).toBe(expected);
  });

  it('should raises error if source raises error', () => {
    const e1 =   hot('--a--a--#');
    const e1subs =   '^       !';
    const expected = '--a-----#';

    expectObservable((<any>e1).pipe(distinct())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raises error if source throws', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable((<any>e1).pipe(distinct())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not omit if source elements are all different', () => {
    const e1 =   hot('--a--b--c--d--e--f--|');
    const e1subs =   '^                   !';
    const expected = '--a--b--c--d--e--f--|';

    expectObservable((<any>e1).pipe(distinct())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing early and explicitly', () => {
    const e1 =   hot('--a--b--b--d--a--f--|');
    const e1subs =   '^         !          ';
    const expected = '--a--b-----          ';
    const unsub =    '          !          ';

    const result = (<any>e1).pipe(distinct());

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when unsubscribed explicitly', () => {
    const e1 =   hot('--a--b--b--d--a--f--|');
    const e1subs =   '^         !          ';
    const expected = '--a--b-----          ';
    const unsub =    '          !          ';

    const result = (<any>e1).pipe(
      mergeMap((x: any) => of(x)),
      distinct(),
      mergeMap((x: any) => of(x)),
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should emit once if source elements are all same', () => {
    const e1 =   hot('--a--a--a--a--a--a--|');
    const e1subs =   '^                   !';
    const expected = '--a-----------------|';

    expectObservable((<any>e1).pipe(distinct())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should distinguish values by key', () => {
    const values = {a: 1, b: 2, c: 3, d: 4, e: 5, f: 6};
    const e1 =   hot('--a--b--c--d--e--f--|', values);
    const e1subs =   '^                   !';
    const expected = '--a--b--c-----------|';
    const selector = (value: number) => value % 3;

    expectObservable((<any>e1).pipe(distinct(selector))).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raises error when selector throws', () => {
    const e1 =   hot('--a--b--c--d--e--f--|');
    const e1subs =   '^          !         ';
    const expected = '--a--b--c--#         ';
    const selector = (value: string) => {
      if (value === 'd') {
        throw new Error('d is for dumb');
      }
      return value;
    };

    expectObservable((<any>e1).pipe(distinct(selector))).toBe(expected, undefined, new Error('d is for dumb'));
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should support a flushing stream', () => {
    const e1 =   hot('--a--b--a--b--a--b--|');
    const e1subs =   '^                   !';
    const e2 =   hot('-----------x--------|');
    const e2subs =   '^                   !';
    const expected = '--a--b--------a--b--|';

    expectObservable((<any>e1).pipe(distinct(null, e2))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise error if flush raises error', () => {
    const e1 =   hot('--a--b--a--b--a--b--|');
    const e1subs =   '^            !';
    const e2 =   hot('-----------x-#');
    const e2subs =   '^            !';
    const expected = '--a--b-------#';

    expectObservable((<any>e1).pipe(distinct(null, e2))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should unsubscribe from the flushing stream when the main stream is unsubbed', () => {
    const e1 =   hot('--a--b--a--b--a--b--|');
    const e1subs =   '^          !         ';
    const e2 =   hot('-----------x--------|');
    const e2subs =   '^          !         ';
    const unsub =    '           !         ';
    const expected = '--a--b------';

    expectObservable((<any>e1).pipe(distinct(null, e2)), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should allow opting in to default comparator with flush', () => {
    const e1 =   hot('--a--b--a--b--a--b--|');
    const e1subs =   '^                   !';
    const e2 =   hot('-----------x--------|');
    const e2subs =   '^                   !';
    const expected = '--a--b--------a--b--|';

    expectObservable((<any>e1).pipe(distinct(null, e2))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });
});
