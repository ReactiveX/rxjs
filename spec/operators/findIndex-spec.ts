import { findIndex, mergeMap, delay } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { of } from 'rxjs';

declare function asDiagram(arg: string): Function;

declare const rxTestScheduler: TestScheduler;

/** @test {findIndex} */
describe('findIndex operator', () => {
  function truePredicate(x: any) {
    return true;
  }

  asDiagram('findIndex(x => x % 5 === 0)')('should return matching element from source emits single element', () => {
    const values = {a: 3, b: 9, c: 15, d: 20};
    const source = hot('---a--b--c--d---|', values);
    const subs =       '^        !       ';
    const expected =   '---------(x|)    ';

    const predicate = function (x: number) { return x % 5 === 0; };

    expectObservable(source.pipe(findIndex(predicate))).toBe(expected, { x: 2 });
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should not emit if source does not emit', () => {
    const source = hot('-');
    const subs =       '^';
    const expected =   '-';

    expectObservable(source.pipe(findIndex(truePredicate))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return negative index if source is empty to match predicate', () => {
    const source = cold('|');
    const subs =        '(^!)';
    const expected =    '(x|)';

    const result = source.pipe(findIndex(truePredicate));

    expectObservable(result).toBe(expected, {x: -1});
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return index of element from source emits single element', () => {
    const sourceValue = 1;
    const source = hot('--a--|', { a: sourceValue });
    const subs =       '^ !   ';
    const expected =   '--(x|)';

    const predicate = function (value: number) {
      return value === sourceValue;
    };

    expectObservable(source.pipe(findIndex(predicate))).toBe(expected, { x: 0 });
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return index of matching element from source emits multiple elements', () => {
    const source = hot('--a--b---c-|', { b: 7 });
    const subs =       '^    !';
    const expected =   '-----(x|)';

    const predicate = function (value: number) {
      return value === 7;
    };

    expectObservable(source.pipe(findIndex(predicate))).toBe(expected, { x: 1 });
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should work with a custom thisArg', () => {
    const sourceValues = { b: 7 };
    const source = hot('--a--b---c-|', sourceValues);
    const subs =       '^    !';
    const expected =   '-----(x|)';

    const predicate = function (this: typeof sourceValues, value: number) {
      return value === this.b;
    };
    const result = source.pipe(findIndex(predicate, sourceValues));

    expectObservable(result).toBe(expected, { x: 1 });
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return negative index if element does not match with predicate', () => {
    const source = hot('--a--b--c--|');
    const subs =       '^          !';
    const expected =   '-----------(x|)';

    const predicate = function (value: string) {
      return value === 'z';
    };

    expectObservable(source.pipe(findIndex(predicate))).toBe(expected, { x: -1 });
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should allow unsubscribing early and explicitly', () => {
    const source = hot('--a--b--c--|');
    const subs =       '^     !     ';
    const expected =   '-------     ';
    const unsub =      '      !     ';

    const result = source.pipe(findIndex((value: string) => value === 'z'));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const source = hot('--a--b--c--|');
    const subs =       '^     !     ';
    const expected =   '-------     ';
    const unsub =      '      !     ';

    const result = source.pipe(
      mergeMap((x: string) => of(x)),
      findIndex((value: string) => value === 'z'),
      mergeMap((x: number) => of(x))
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should unsubscribe when the predicate is matched', () => {
    const source = hot('--a--b---c-|');
    const subs =       '^    !';
    const expected =   '-------(x|)';

    const duration = rxTestScheduler.createTime('--|');

    expectObservable(source.pipe(
      findIndex((value: string) => value === 'b'),
      delay(duration, rxTestScheduler)
    )).toBe(expected, { x: 1 });
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should raise if source raise error while element does not match with predicate', () => {
    const source = hot('--a--b--#');
    const subs =       '^       !';
    const expected =   '--------#';

    const predicate = function (value: string) {
      return value === 'z';
    };

    expectObservable(source.pipe(findIndex(predicate))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should raise error if predicate throws error', () => {
    const source = hot('--a--b--c--|');
    const subs =       '^ !';
    const expected =   '--#';

    const predicate = function (value: string) {
      throw 'error';
    };

    expectObservable(source.pipe(findIndex(predicate))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });
});
