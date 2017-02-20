import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;
/** @test {single} */
describe('Observable.prototype.single', () => {
  asDiagram('single')('should raise error from empty predicate if observable emits multiple time', () => {
    const e1 =    hot('--a--b--c--|');
    const e1subs =    '^    !      ';
    const expected =  '-----#      ';
    const errorMsg = 'Sequence contains more than one element';

    expectObservable(e1.single()).toBe(expected, null, errorMsg);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error from empty predicate if observable does not emit', () => {
    const e1 = hot('--a--^--|');
    const e1subs =      '^  !';
    const expected =    '---#';

    expectObservable(e1.single()).toBe(expected, null, new Rx.EmptyError());
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should return only element from empty predicate if observable emits only once', () => {
    const e1 =    hot('--a--|');
    const e1subs =    '^    !';
    const expected =  '-----(a|)';

    expectObservable(e1.single()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 =    hot('--a--b--c--|');
    const unsub =     '   !        ';
    const e1subs =    '^  !        ';
    const expected =  '----        ';

    expectObservable(e1.single(), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =    hot('--a--b--c--|');
    const e1subs =    '^  !        ';
    const expected =  '----        ';
    const unsub =     '   !        ';

    const result = e1
      .mergeMap((x: string) => Observable.of(x))
      .single()
      .mergeMap((x: string) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error from empty predicate if observable emits error', () => {
    const e1 =    hot('--a--b^--#');
    const e1subs =          '^  !';
    const expected =        '---#';

    expectObservable(e1.single()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error from predicate if observable emits error', () => {
    const e1 =    hot('--a--b^--#');
    const e1subs =          '^  !';
    const expected =        '---#';

    const predicate = function (value) {
      return value === 'c';
    };

    expectObservable(e1.single(predicate)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error if predicate throws error', () => {
    const e1 =    hot('--a--b--c--d--|');
    const e1subs =    '^          !   ';
    const expected =  '-----------#   ';

    const predicate = function (value) {
      if (value !== 'd') {
        return false;
      }
      throw 'error';
    };

    expectObservable(e1.single(predicate)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should return element from predicate if observable have single matching element', () => {
    const e1 =    hot('--a--b--c--|');
    const e1subs =    '^          !';
    const expected =  '-----------(b|)';

    const predicate = function (value) {
      return value === 'b';
    };

    expectObservable(e1.single(predicate)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error from predicate if observable have multiple matching element', () => {
    const e1 =    hot('--a--b--a--b--b--|');
    const e1subs =    '^          !      ';
    const expected =  '-----------#      ';

    const predicate = function (value) {
      return value === 'b';
    };

    expectObservable(e1.single(predicate)).toBe(expected, null, 'Sequence contains more than one element');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error from predicate if observable does not emit', () => {
    const e1 = hot('--a--^--|');
    const e1subs =      '^  !';
    const expected =    '---#';

    const predicate = function (value) {
      return value === 'a';
    };

    expectObservable(e1.single(predicate)).toBe(expected, null, new Rx.EmptyError());
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should return undefined from predicate if observable does not contain matching element', () => {
    const e1 =    hot('--a--b--c--|');
    const e1subs =    '^          !';
    const expected =  '-----------(z|)';

    const predicate = function (value) {
      return value === 'x';
    };

    expectObservable(e1.single(predicate)).toBe(expected, {z: undefined});
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should call predicate with indices starting at 0', () => {
    const e1 =    hot('--a--b--c--|');
    const e1subs =    '^          !';
    const expected =  '-----------(b|)';

    let indices = [];
    const predicate = function(value, index) {
      indices.push(index);
      return value === 'b';
    };

    expectObservable(e1.single(predicate).do(null, null, () => {
      expect(indices).to.deep.equal([0, 1, 2]);
    })).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});