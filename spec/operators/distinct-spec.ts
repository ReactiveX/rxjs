import * as Rx from '../../dist/cjs/Rx';
declare const {hot, cold, expectObservable, expectSubscriptions};

const Observable = Rx.Observable;

/** @test {distinct} */
describe('Observable.prototype.distinct', () => {
  it('should distinguish between values', () => {
    const e1 =   hot('--a--a--a--b--b--a--|');
    const e1subs =   '^                   !';
    const expected = '--a--------b--------|';

    expectObservable((<any>e1).distinct()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should distinguish between values and does not completes', () => {
    const e1 =   hot('--a--a--a--b--b--a-');
    const e1subs =   '^                  ';
    const expected = '--a--------b-------';

    expectObservable((<any>e1).distinct()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not completes if source never completes', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable((<any>e1).distinct()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not completes if source does not completes', () => {
    const e1 =   hot('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable((<any>e1).distinct()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete if source is empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '|';

    expectObservable((<any>e1).distinct()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete if source does not emit', () => {
    const e1 =   hot('------|');
    const e1subs =   '^     !';
    const expected = '------|';

    expectObservable((<any>e1).distinct()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should emit if source emits single element only', () => {
    const e1 =   hot('--a--|');
    const e1subs =   '^    !';
    const expected = '--a--|';

    expectObservable((<any>e1).distinct()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should emit if source is scalar', () => {
    const e1 = Observable.of('a');
    const expected = '(a|)';

    expectObservable((<any>e1).distinct()).toBe(expected);
  });

  it('should raises error if source raises error', () => {
    const e1 =   hot('--a--a--#');
    const e1subs =   '^       !';
    const expected = '--a-----#';

    expectObservable((<any>e1).distinct()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raises error if source throws', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable((<any>e1).distinct()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not omit if source elements are all different', () => {
    const e1 =   hot('--a--b--c--d--e--f--|');
    const e1subs =   '^                   !';
    const expected = '--a--b--c--d--e--f--|';

    expectObservable((<any>e1).distinct()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing early and explicitly', () => {
    const e1 =   hot('--a--b--b--d--a--f--|');
    const e1subs =   '^         !          ';
    const expected = '--a--b-----          ';
    const unsub =    '          !          ';

    const result = (<any>e1).distinct();

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when unsubscribed explicitly', () => {
    const e1 =   hot('--a--b--b--d--a--f--|');
    const e1subs =   '^         !          ';
    const expected = '--a--b-----          ';
    const unsub =    '          !          ';

    const result = (<any>e1
      .mergeMap((x: any) => Observable.of(x)))
      .distinct()
      .mergeMap((x: any) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should emit once if source elements are all same', () => {
    const e1 =   hot('--a--a--a--a--a--a--|');
    const e1subs =   '^                   !';
    const expected = '--a-----------------|';

    expectObservable((<any>e1).distinct()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should emit once if comparer returns true always regardless of source emits', () => {
    const e1 =   hot('--a--b--c--d--e--f--|');
    const e1subs =   '^                   !';
    const expected = '--a-----------------|';

    expectObservable((<any>e1).distinct(() => true)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should emit all if comparer returns false always regardless of source emits', () => {
    const e1 =   hot('--a--a--a--a--a--a--|');
    const e1subs =   '^                   !';
    const expected = '--a--a--a--a--a--a--|';

    expectObservable((<any>e1).distinct(() => false)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should distinguish values by selector', () => {
    const e1 =   hot('--a--b--c--d--e--f--|', {a: 1, b: 2, c: 3, d: 4, e: 5, f: 6});
    const e1subs =   '^                   !';
    const expected = '--a-----c-----e-----|';
    const selector = (x: number, y: number) => y % 2 === 0;

    expectObservable((<any>e1).distinct(selector)).toBe(expected, {a: 1, c: 3, e: 5});
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raises error when comparer throws', () => {
    const e1 =   hot('--a--b--c--d--e--f--|');
    const e1subs =   '^          !         ';
    const expected = '--a--b--c--#         ';
    const selector = (x: string, y: string) => {
      if (y === 'd') {
        throw 'error';
      }
      return x === y;
    };

    expectObservable((<any>e1).distinct(selector)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should support a flushing stream', () => {
    const e1 =   hot('--a--b--a--b--a--b--|');
    const e1subs =   '^                   !';
    const e2 =   hot('-----------x--------|');
    const e2subs =   '^                   !';
    const expected = '--a--b--------a--b--|';
    const selector = (x: string, y: string) => x === y;

    expectObservable((<any>e1).distinct(selector, e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise error if flush raises error', () => {
    const e1 =   hot('--a--b--a--b--a--b--|');
    const e1subs =   '^            !';
    const e2 =   hot('-----------x-#');
    const e2subs =   '^            !';
    const expected = '--a--b-------#';
    const selector = (x: string, y: string) => x === y;

    expectObservable((<any>e1).distinct(selector, e2)).toBe(expected);
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
    const selector = (x: string, y: string) => x === y;

    expectObservable((<any>e1).distinct(selector, e2), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should allow opting in to default comparator with flush', () => {
    const e1 =   hot('--a--b--a--b--a--b--|');
    const e1subs =   '^                   !';
    const e2 =   hot('-----------x--------|');
    const e2subs =   '^                   !';
    const expected = '--a--b--------a--b--|';

    expectObservable((<any>e1).distinct(null, e2)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });
});