import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
declare const {hot, cold, asDiagram, expectObservable, expectSubscriptions};

const Observable = Rx.Observable;

/** @test {some} */
describe('Observable.prototype.some', () => {
  function truePredicate(x) {
    return true;
  }

  function predicate(x) {
    return x % 5 === 0;
  }

  asDiagram('some(x => x % 5 === 0)')('should return true if only some of element matches with predicate', () => {
    const source = hot('--a--b--c--d--e--|', { a: 3, b: 5, c: 6, d: 7, e: 15 });
    const sourceSubs = '^    !            ';
    const expected =   '-----(b|)';

    expectObservable(source.some(predicate)).toBe(expected, { b: true });
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should accept thisArg with scalar observables', () => {
    const thisArg = {};

    Observable.of(1).some(function (value: number, index: number) {
      expect(this).to.deep.equal(thisArg);
      return true;
    }, thisArg).subscribe();

  });

  it('should accept thisArg with array observables', () => {
    const thisArg = {};

    Observable.of(1, 2, 3, 4).some(function (value: number, index: number) {
      expect(this).to.deep.equal(thisArg);
      return true;
    }, thisArg).subscribe();
  });

  it('should accept thisArg with ordinary observables', () => {
    const thisArg = {};

    Observable.create((observer: Rx.Observer<number>) => {
      observer.next(1);
      observer.complete();
    })
    .some(function (value: number, index: number) {
      expect(this).to.deep.equal(thisArg);
    }, thisArg).subscribe();
  });

  it('should emit false if source is empty', () => {
    const source = hot('-----|');
    const sourceSubs = '^    !';
    const expected =   '-----(x|)';

    expectObservable(source.some(predicate)).toBe(expected, {x: false});
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should emit false if single source of element does not match with predicate', () => {
    const source = hot('--a--|');
    const sourceSubs = '^    !';
    const expected =   '-----(x|)';

    expectObservable(source.some(predicate)).toBe(expected, {x: false});
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should emit false if none of the elements match with predicate', () => {
    const source = hot('--a--b--c--d--e--|');
    const sourceSubs = '^                !';
    const expected =   '-----------------(x|)';

    expectObservable(source.some(predicate)).toBe(expected, {x: false});
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should return true if the first element matches with predicate', () => {
    const source = hot('--a--b--c--d--e--|', {a: 5, b: 10, c: 15});
    const sourceSubs = '^ !               ';
    const expected =   '--(x|)';

    expectObservable(source.some(predicate)).toBe(expected, {x: true});
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should return true if the second element matches with predicate', () => {
    const source = hot('--a--b--c--d--e--|', {a: 3, b: 10, c: 15});
    const sourceSubs = '^    !            ';
    const expected =   '-----(x|)';

    expectObservable(source.some(predicate)).toBe(expected, {x: true});
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should allow unsubscribing early and explicitly', () => {
    const source = hot('--a--b--c--d--e--|', {a: 2, b: 4, c: 5, d: 10});
    const sourceSubs = '^      !          ';
    const expected =   '--------          ';
    const unsub =      '       !          ';

    const result = source.some(predicate);

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should not break unsubscription chains when result Observable is unsubscribed', () => {
    const source = hot('--a--b--c--d--e--|', {a: 2, b: 4, c: 6, d: 10});
    const sourceSubs = '^      !          ';
    const expected =   '--------          ';
    const unsub =      '       !          ';

    const result = source
      .mergeMap((x: any) => Observable.of(x))
      .some(predicate)
      .mergeMap((x: any) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should propagate error if predicate eventually throws', () => {
    const source = hot('--a--b--c--d--e--|');
    const sourceSubs = '^       !';
    const expected =   '--------#';

    function faultyPredicate(x) {
      if (x === 'c') {
        throw 'error';
      } else {
        return false;
      }
    }

    expectObservable(source.some(faultyPredicate)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should emit true if single source element match with predicate', () => {
    const source = hot('--a--|', {a: 5});
    const sourceSubs = '^ !   ';
    const expected =   '--(x|)';

    expectObservable(source.some(predicate)).toBe(expected, {x: true});
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should emit true if Scalar source matches with predicate', () => {
    const source = Observable.of(5);
    const expected = '(T|)';

    expectObservable(source.some(predicate)).toBe(expected, {T: true});
  });

  it('should emit false if Scalar source does not match with predicate', () => {
    const source = Observable.of(3);
    const expected = '(F|)';

    expectObservable(source.some(predicate)).toBe(expected, {F: false});
  });

  it('should propagate error if predicate throws on Scalar source', () => {
    const source = Observable.of(3);
    const expected = '#';

    function faultyPredicate(x) {
      throw 'error';
    }

    expectObservable(source.some(<any>faultyPredicate)).toBe(expected);
  });

  it('should emit true if all Array sources matches with predicate', () => {
    const source = Observable.of(5, 10, 15, 20);
    const expected = '(T|)';

    expectObservable(source.some(predicate)).toBe(expected, {T: true});
  });

  it('should emit true if one Array source does not match with predicate', () => {
    const source = Observable.of(5, 9, 15, 20);
    const expected = '(F|)';

    expectObservable(source.some(predicate)).toBe(expected, {F: true});
  });

  it('should propagate error if predicate eventually throws on Array source', () => {
    const source = Observable.of(5, 10, 15, 20);
    const expected = '#';

    function faultyPredicate(x) {
      if (x === 15) {
        throw 'error';
      }
      return false;
    }

    expectObservable(source.some(faultyPredicate)).toBe(expected);
  });

  it('should emit true as soon as one source element matches with predicate', () => {
    const source = hot('--a--b--c--d--e--|', {a: 5, b: 10, c: 15, d: 20, e: 25});
    const sourceSubs = '^ !               ';
    const expected =   '--(x|)';

    expectObservable(source.some(predicate)).toBe(expected, {x: true});
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should raise error if source raises error', () => {
    const source = hot('--#');
    const sourceSubs = '^ !';
    const expected =   '--#';

    expectObservable(source.some(truePredicate)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should not completes if source never emits', () => {
    const source = cold('-');
    const sourceSubs =  '^';
    const expected =    '-';

    expectObservable(source.some(truePredicate)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should emit true if source element matches with predicate after subscription', () => {
    const source = hot('--z--^--a--|', {a: 5});
    const sourceSubs =      '^  !   ';
    const expected =        '---(x|)';

    expectObservable(source.some(predicate)).toBe(expected, {x: true});
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should emit false if source element does not match with predicate after subscription', () => {
    const source = hot('--z--^--b--c--z--d--|', {a: 2, b: 4, c: 6, d: 8});
    const sourceSubs =      '^              !';
    const expected =        '---------------(x|)';

    expectObservable(source.some(predicate)).toBe(expected, {x: false});
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should raise error if source raises error after subscription', () => {
    const source = hot('--z--^--#');
    const sourceSubs =      '^  !';
    const expected =        '---#';

    expectObservable(source.some(truePredicate)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should emit false if source does not emit after subscription', () => {
    const source = hot('--z--^-----|');
    const sourceSubs =      '^     !';
    const expected =        '------(x|)';

    expectObservable(source.some(predicate)).toBe(expected, {x: false});
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });
});