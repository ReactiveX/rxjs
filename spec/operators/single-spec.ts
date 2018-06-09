import { expect } from 'chai';
import { hot, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { single, mergeMap, tap } from 'rxjs/operators';
import { of, EmptyError } from 'rxjs';

declare function asDiagram(arg: string): Function;

/** @test {single} */
describe('single operator', () => {
  asDiagram('single')('should raise error from empty predicate if observable emits multiple time', () => {
    const e1 =    hot('--a--b--c--|');
    const e1subs =    '^    !      ';
    const expected =  '-----#      ';
    const errorMsg = 'Sequence contains more than one element';

    expectObservable(e1.pipe(single())).toBe(expected, null, errorMsg);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error from empty predicate if observable does not emit', () => {
    const e1 = hot('--a--^--|');
    const e1subs =      '^  !';
    const expected =    '---#';

    expectObservable(e1.pipe(single())).toBe(expected, null, new EmptyError());
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should return only element from empty predicate if observable emits only once', () => {
    const e1 =    hot('--a--|');
    const e1subs =    '^    !';
    const expected =  '-----(a|)';

    expectObservable(e1.pipe(single())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 =    hot('--a--b--c--|');
    const unsub =     '   !        ';
    const e1subs =    '^  !        ';
    const expected =  '----        ';

    expectObservable(e1.pipe(single()), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =    hot('--a--b--c--|');
    const e1subs =    '^  !        ';
    const expected =  '----        ';
    const unsub =     '   !        ';

    const result = e1.pipe(
      mergeMap((x: string) => of(x)),
      single(),
      mergeMap((x: string) => of(x))
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error from empty predicate if observable emits error', () => {
    const e1 =    hot('--a--b^--#');
    const e1subs =          '^  !';
    const expected =        '---#';

    expectObservable(e1.pipe(single())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error from predicate if observable emits error', () => {
    const e1 =    hot('--a--b^--#');
    const e1subs =          '^  !';
    const expected =        '---#';

    const predicate = function (value: string) {
      return value === 'c';
    };

    expectObservable(e1.pipe(single(predicate))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error if predicate throws error', () => {
    const e1 =    hot('--a--b--c--d--|');
    const e1subs =    '^          !   ';
    const expected =  '-----------#   ';

    const predicate = function (value: string) {
      if (value !== 'd') {
        return false;
      }
      throw 'error';
    };

    expectObservable(e1.pipe(single(predicate))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should return element from predicate if observable have single matching element', () => {
    const e1 =    hot('--a--b--c--|');
    const e1subs =    '^          !';
    const expected =  '-----------(b|)';

    const predicate = function (value: string) {
      return value === 'b';
    };

    expectObservable(e1.pipe(single(predicate))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error from predicate if observable have multiple matching element', () => {
    const e1 =    hot('--a--b--a--b--b--|');
    const e1subs =    '^          !      ';
    const expected =  '-----------#      ';

    const predicate = function (value: string) {
      return value === 'b';
    };

    expectObservable(e1.pipe(single(predicate))).toBe(expected, null, 'Sequence contains more than one element');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error from predicate if observable does not emit', () => {
    const e1 = hot('--a--^--|');
    const e1subs =      '^  !';
    const expected =    '---#';

    const predicate = function (value: string) {
      return value === 'a';
    };

    expectObservable(e1.pipe(single(predicate))).toBe(expected, null, new EmptyError());
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should return undefined from predicate if observable does not contain matching element', () => {
    const e1 =    hot('--a--b--c--|');
    const e1subs =    '^          !';
    const expected =  '-----------(z|)';

    const predicate = function (value: string) {
      return value === 'x';
    };

    expectObservable(e1.pipe(single(predicate))).toBe(expected, {z: undefined});
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should call predicate with indices starting at 0', () => {
    const e1 =    hot('--a--b--c--|');
    const e1subs =    '^          !';
    const expected =  '-----------(b|)';

    let indices: number[] = [];
    const predicate = function(value: string, index: number) {
      indices.push(index);
      return value === 'b';
    };

    expectObservable(e1.pipe(
      single(predicate),
      tap(null, null, () => {
        expect(indices).to.deep.equal([0, 1, 2]);
      }))
    ).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
