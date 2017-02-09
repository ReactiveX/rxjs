import * as Rx from '../../dist/cjs/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;

/** @test {findIndex} */
describe('Observable.prototype.findIndex', () => {
  function truePredicate(x) {
    return true;
  }

  asDiagram('findIndex(x => x % 5 === 0)')('should return matching element from source emits single element', () => {
    const values = {a: 3, b: 9, c: 15, d: 20};
    const source = hot('---a--b--c--d---|', values);
    const subs =       '^        !       ';
    const expected =   '---------(x|)    ';

    const predicate = function (x) { return x % 5 === 0; };

    expectObservable((<any>source).findIndex(predicate)).toBe(expected, { x: 2 });
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should not emit if source does not emit', () => {
    const source = hot('-');
    const subs =       '^';
    const expected =   '-';

    expectObservable((<any>source).findIndex(truePredicate)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return negative index if source is empty to match predicate', () => {
    const source = cold('|');
    const subs =        '(^!)';
    const expected =    '(x|)';

    const result = (<any>source).findIndex(truePredicate);

    expectObservable(result).toBe(expected, {x: -1});
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return index of element from source emits single element', () => {
    const sourceValue = 1;
    const source = hot('--a--|', { a: sourceValue });
    const subs =       '^ !   ';
    const expected =   '--(x|)';

    const predicate = function (value) {
      return value === sourceValue;
    };

    expectObservable((<any>source).findIndex(predicate)).toBe(expected, { x: 0 });
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return index of matching element from source emits multiple elements', () => {
    const source = hot('--a--b---c-|', { b: 7 });
    const subs =       '^    !';
    const expected =   '-----(x|)';

    const predicate = function (value) {
      return value === 7;
    };

    expectObservable((<any>source).findIndex(predicate)).toBe(expected, { x: 1 });
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should work with a custom thisArg', () => {
    const sourceValues = { b: 7 };
    const source = hot('--a--b---c-|', sourceValues);
    const subs =       '^    !';
    const expected =   '-----(x|)';

    const predicate = function (value) {
      return value === this.b;
    };
    const result = (<any>source).findIndex(predicate, sourceValues);

    expectObservable(result).toBe(expected, { x: 1 });
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return negative index if element does not match with predicate', () => {
    const source = hot('--a--b--c--|');
    const subs =       '^          !';
    const expected =   '-----------(x|)';

    const predicate = function (value) {
      return value === 'z';
    };

    expectObservable((<any>source).findIndex(predicate)).toBe(expected, { x: -1 });
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should allow unsubscribing early and explicitly', () => {
    const source = hot('--a--b--c--|');
    const subs =       '^     !     ';
    const expected =   '-------     ';
    const unsub =      '      !     ';

    const result = (<any>source).findIndex((value: string) => value === 'z');

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const source = hot('--a--b--c--|');
    const subs =       '^     !     ';
    const expected =   '-------     ';
    const unsub =      '      !     ';

    const result = (<any>source)
      .mergeMap((x: string) => Observable.of(x))
      .findIndex((value: string) => value === 'z')
      .mergeMap((x: string) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should raise if source raise error while element does not match with predicate', () => {
    const source = hot('--a--b--#');
    const subs =       '^       !';
    const expected =   '--------#';

    const predicate = function (value) {
      return value === 'z';
    };

    expectObservable((<any>source).findIndex(predicate)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should raise error if predicate throws error', () => {
    const source = hot('--a--b--c--|');
    const subs =       '^ !';
    const expected =   '--#';

    const predicate = function (value) {
      throw 'error';
    };

    expectObservable((<any>source).findIndex(predicate)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });
});