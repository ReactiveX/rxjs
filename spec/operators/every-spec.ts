import { expect } from 'chai';
import { every, mergeMap } from 'rxjs/operators';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { of, Observable, Observer } from 'rxjs';

declare function asDiagram(arg: string): Function;

/** @test {every} */
describe('every operator', () => {
  function truePredicate(x: number | string) {
    return true;
  }

  function predicate(x: number | string) {
    return (+x) % 5 === 0;
  }

  asDiagram('every(x => x % 5 === 0)')('should return false if only some of element matches with predicate', () => {
    const source = hot('--a--b--c--d--e--|', {a: 5, b: 10, c: 15, d: 18, e: 20});
    const sourceSubs = '^          !      ';
    const expected =   '-----------(F|)   ';

    expectObservable(source.pipe(every(predicate))).toBe(expected, {F: false});
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should accept thisArg with scalar observables', () => {
    const thisArg = {};

    of(1).pipe(every(function (this: any, value: number, index: number) {
      expect(this).to.deep.equal(thisArg);
      return true;
    }, thisArg)).subscribe();

  });

  it('should accept thisArg with array observables', () => {
    const thisArg = {};

    of(1, 2, 3, 4).pipe(every(function (this: any, value: number, index: number) {
      expect(this).to.deep.equal(thisArg);
      return true;
    }, thisArg)).subscribe();
  });

  it('should accept thisArg with ordinary observables', () => {
    const thisArg = {};

    Observable.create((observer: Observer<number>) => {
      observer.next(1);
      observer.complete();
    })
    .pipe(every(function (this: any, value: number, index: number) {
      expect(this).to.deep.equal(thisArg);
      return true;
    }, thisArg)).subscribe();
  });

  it('should emit true if source is empty', () => {
    const source = hot('-----|');
    const sourceSubs = '^    !';
    const expected =   '-----(x|)';

    expectObservable(source.pipe(every(predicate))).toBe(expected, {x: true});
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should emit false if single source of element does not match with predicate', () => {
    const source = hot('--a--|');
    const sourceSubs = '^ !';
    const expected =   '--(x|)';

    expectObservable(source.pipe(every(predicate))).toBe(expected, {x: false});
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should emit false if none of element does not match with predicate', () => {
    const source = hot('--a--b--c--d--e--|');
    const sourceSubs = '^ !';
    const expected =   '--(x|)';

    expectObservable(source.pipe(every(predicate))).toBe(expected, {x: false});
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should return false if only some of element matches with predicate', () => {
    const source = hot('--a--b--c--d--e--|', {a: 5, b: 10, c: 15});
    const sourceSubs = '^          !';
    const expected =   '-----------(x|)';

    expectObservable(source.pipe(every(predicate))).toBe(expected, {x: false});
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should allow unsubscribing early and explicitly', () => {
    const source = hot('--a--b--c--d--e--|', {a: 5, b: 10, c: 15});
    const sourceSubs = '^      !          ';
    const expected =   '--------          ';
    const unsub =      '       !          ';

    const result = source.pipe(every(predicate));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should not break unsubscription chains when result Observable is unsubscribed', () => {
    const source = hot('--a--b--c--d--e--|', {a: 5, b: 10, c: 15});
    const sourceSubs = '^      !          ';
    const expected =   '--------          ';
    const unsub =      '       !          ';

    const result = source.pipe(
      mergeMap((x: any) => of(x)),
      every(predicate),
      mergeMap((x: any) => of(x))
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should propagate error if predicate eventually throws', () => {
    const source = hot('--a--b--c--d--e--|');
    const sourceSubs = '^       !';
    const expected =   '--------#';

    function faultyPredicate(x: string) {
      if (x === 'c') {
        throw 'error';
      } else {
        return true;
      }
    }

    expectObservable(source.pipe(every(faultyPredicate))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should emit true if single source element match with predicate', () => {
    const source = hot('--a--|', {a: 5});
    const sourceSubs = '^    !';
    const expected =   '-----(x|)';

    expectObservable(source.pipe(every(predicate))).toBe(expected, {x: true});
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should emit true if Scalar source matches with predicate', () => {
    const source = of(5);
    const expected = '(T|)';

    expectObservable(source.pipe(every(predicate))).toBe(expected, {T: true});
  });

  it('should emit false if Scalar source does not match with predicate', () => {
    const source = of(3);
    const expected = '(F|)';

    expectObservable(source.pipe(every(predicate))).toBe(expected, {F: false});
  });

  it('should propagate error if predicate throws on Scalar source', () => {
    const source = of(3);
    const expected = '#';

    function faultyPredicate(x: number) {
      throw 'error';
    }

    expectObservable(source.pipe(every(<any>faultyPredicate))).toBe(expected);
  });

  it('should emit true if Array source matches with predicate', () => {
    const source = of(5, 10, 15, 20);
    const expected = '(T|)';

    expectObservable(source.pipe(every(predicate))).toBe(expected, {T: true});
  });

  it('should emit false if Array source does not match with predicate', () => {
    const source = of(5, 9, 15, 20);
    const expected = '(F|)';

    expectObservable(source.pipe(every(predicate))).toBe(expected, {F: false});
  });

  it('should propagate error if predicate eventually throws on Array source', () => {
    const source = of(5, 10, 15, 20);
    const expected = '#';

    function faultyPredicate(x: number) {
      if (x === 15) {
        throw 'error';
      }
      return true;
    }

    expectObservable(source.pipe(every(faultyPredicate))).toBe(expected);
  });

  it('should emit true if all source element matches with predicate', () => {
    const source = hot('--a--b--c--d--e--|', {a: 5, b: 10, c: 15, d: 20, e: 25});
    const sourceSubs = '^                !';
    const expected =   '-----------------(x|)';

    expectObservable(source.pipe(every(predicate))).toBe(expected, {x: true});
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should raise error if source raises error', () => {
    const source = hot('--#');
    const sourceSubs = '^ !';
    const expected =   '--#';

    expectObservable(source.pipe(every(truePredicate))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should not completes if source never emits', () => {
    const source = cold('-');
    const sourceSubs =  '^';
    const expected =    '-';

    expectObservable(source.pipe(every(truePredicate))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should emit true if source element matches with predicate after subscription', () => {
    const source = hot('--z--^--a--b--c--d--e--|', {a: 5, b: 10, c: 15, d: 20, e: 25});
    const sourceSubs =      '^                 !';
    const expected =        '------------------(x|)';

    expectObservable(source.pipe(every(predicate))).toBe(expected, {x: true});
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should emit false if source element does not match with predicate after subscription', () => {
    const source = hot('--z--^--b--c--z--d--|', {a: 5, b: 10, c: 15, d: 20});
    const sourceSubs =      '^        !';
    const expected =        '---------(x|)';

    expectObservable(source.pipe(every(predicate))).toBe(expected, {x: false});
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should raise error if source raises error after subscription', () => {
    const source = hot('--z--^--#');
    const sourceSubs =      '^  !';
    const expected =        '---#';

    expectObservable(source.pipe(every(truePredicate))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should emit true if source does not emit after subscription', () => {
    const source = hot('--z--^-----|');
    const sourceSubs =      '^     !';
    const expected =        '------(x|)';

    expectObservable(source.pipe(every(predicate))).toBe(expected, {x: true});
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });
});
