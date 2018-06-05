import { ignoreElements, mergeMap } from 'rxjs/operators';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { of } from 'rxjs';

declare function asDiagram(arg: string): Function;

/** @test {ignoreElements} */
describe('ignoreElements operator', () => {
  asDiagram('ignoreElements')('should ignore all the elements of the source', () => {
    const source = hot('--a--b--c--d--|');
    const subs =       '^             !';
    const expected =   '--------------|';

    expectObservable(source.pipe(ignoreElements())).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should allow unsubscribing early and explicitly', () => {
    const source = hot('--a--b--c--d--|');
    const subs =       '^      !       ';
    const expected =   '--------       ';
    const unsub =      '       !       ';

    const result = source.pipe(ignoreElements());

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should allow unsubscribing early and explicitly', () => {
    const source = hot('--a--b--c--d--|');
    const subs =       '^      !       ';
    const expected =   '--------       ';
    const unsub =      '       !       ';

    const result = source.pipe(
      mergeMap((x: string) => of(x)),
      ignoreElements(),
      mergeMap((x: string) => of(x))
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should propagate errors from the source', () => {
    const source = hot('--a--#');
    const subs =       '^    !';
    const expected =   '-----#';

    expectObservable(source.pipe(ignoreElements())).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should support Observable.empty', () => {
    const source = cold('|');
    const subs =        '(^!)';
    const expected =    '|';

    expectObservable(source.pipe(ignoreElements())).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should support Observable.never', () => {
    const source = cold('-');
    const subs =        '^';
    const expected =    '-';

    expectObservable(source.pipe(ignoreElements())).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should support Observable.throw', () => {
    const source = cold('#');
    const subs =        '(^!)';
    const expected =    '#';

    expectObservable(source.pipe(ignoreElements())).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });
});
