import * as Rx from '../../dist/package/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;

/** @test {skip} */
describe('Observable.prototype.skip', () => {
  asDiagram('skip(3)')('should skip values before a total', () => {
    const source = hot('--a--b--c--d--e--|');
    const subs =       '^                !';
    const expected =   '-----------d--e--|';

    expectObservable(source.skip(3)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should skip all values without error if total is more than actual number of values', () => {
    const source = hot('--a--b--c--d--e--|');
    const subs =       '^                !';
    const expected =   '-----------------|';

    expectObservable(source.skip(6)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should skip all values without error if total is same as actual number of values', () => {
    const source = hot('--a--b--c--d--e--|');
    const subs =       '^                !';
    const expected =   '-----------------|';

    expectObservable(source.skip(5)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should not skip if count is zero', () => {
    const source = hot('--a--b--c--d--e--|');
    const subs =       '^                !';
    const expected =   '--a--b--c--d--e--|';

    expectObservable(source.skip(0)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const source = hot('--a--b--c--d--e--|');
    const unsub =      '          !       ';
    const subs =       '^         !       ';
    const expected =   '--------c--       ';

    expectObservable(source.skip(2), unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const source = hot('--a--b--c--d--e--|');
    const subs =       '^         !       ';
    const expected =   '--------c--       ';
    const unsub =      '          !       ';

    const result = source
      .mergeMap((x: string) => Observable.of(x))
      .skip(2)
      .mergeMap((x: string) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should raise error if skip count is more than actual number of emits and source raises error', () => {
    const source = hot('--a--b--c--d--#');
    const subs =       '^             !';
    const expected =   '--------------#';

    expectObservable(source.skip(6)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should raise error if skip count is same as emits of source and source raises error', () => {
    const source = hot('--a--b--c--d--#');
    const subs =       '^             !';
    const expected =   '--------------#';

    expectObservable(source.skip(4)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should skip values before a total and raises error if source raises error', () => {
    const source = hot('--a--b--c--d--#');
    const subs =       '^             !';
    const expected =   '-----------d--#';

    expectObservable(source.skip(3)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should complete regardless of skip count if source is empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '|';

    expectObservable(e1.skip(3)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not complete if source never completes without emit', () => {
    const e1 =   hot('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.skip(3)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should skip values before total and never completes if source emits and does not complete', () => {
    const e1 =   hot('--a--b--c-');
    const e1subs =   '^         ';
    const expected = '-----b--c-';

    expectObservable(e1.skip(1)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should skip all values and never completes if total is more than numbers of value and source does not complete', () => {
    const e1 =   hot('--a--b--c-');
    const e1subs =   '^         ';
    const expected = '----------';

    expectObservable(e1.skip(6)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should skip all values and never completes if total is same asnumbers of value and source does not complete', () => {
    const e1 =   hot('--a--b--c-');
    const e1subs =   '^         ';
    const expected = '----------';

    expectObservable(e1.skip(3)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error if source throws', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable(e1.skip(3)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});