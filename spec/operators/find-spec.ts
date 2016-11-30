import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
declare const {hot, cold, asDiagram, expectObservable, expectSubscriptions};

const Observable = Rx.Observable;

/** @test {find} */
describe('Observable.prototype.find', () => {
  function truePredicate(x) {
    return true;
  }

  asDiagram('find(x => x % 5 === 0)')('should return matching element from source emits single element', () => {
    const values = {a: 3, b: 9, c: 15, d: 20};
    const source = hot('---a--b--c--d---|', values);
    const subs =       '^        !       ';
    const expected =   '---------(c|)    ';

    const predicate = function (x) { return x % 5 === 0; };

    expectObservable((<any>source).find(predicate)).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should throw if not provided a function', () => {
    expect(() => {
      (<any>Observable.of('yut', 'yee', 'sam')).find('yee');
    }).to.throw(TypeError, 'predicate is not a function');
  });

  it('should not emit if source does not emit', () => {
    const source = hot('-');
    const subs =       '^';
    const expected =   '-';

    expectObservable((<any>source).find(truePredicate)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return undefined if source is empty to match predicate', () => {
    const source = cold('|');
    const subs =        '(^!)';
    const expected =    '(x|)';

    const result = (<any>source).find(truePredicate);

    expectObservable(result).toBe(expected, {x: undefined});
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return matching element from source emits single element', () => {
    const source = hot('--a--|');
    const subs =       '^ !';
    const expected =   '--(a|)';

    const predicate = function (value) {
      return value === 'a';
    };

    expectObservable((<any>source).find(predicate)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return matching element from source emits multiple elements', () => {
    const source = hot('--a--b---c-|');
    const subs =       '^    !';
    const expected =   '-----(b|)';

    const predicate = function (value) {
      return value === 'b';
    };

    expectObservable((<any>source).find(predicate)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should work with a custom thisArg', () => {
    const source = hot('--a--b---c-|');
    const subs =       '^    !';
    const expected =   '-----(b|)';

    const finder = {
      target: 'b'
    };
    const predicate = function (value) {
      return value === this.target;
    };

    expectObservable((<any>source).find(predicate, finder)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return undefined if element does not match with predicate', () => {
    const source = hot('--a--b--c--|');
    const subs =       '^          !';
    const expected =   '-----------(x|)';

    const predicate = function (value) {
      return value === 'z';
    };

    expectObservable((<any>source).find(predicate)).toBe(expected, { x: undefined });
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should allow unsubscribing early and explicitly', () => {
    const source = hot('--a--b--c--|');
    const subs =       '^     !     ';
    const expected =   '-------     ';
    const unsub =      '      !     ';

    const result = (<any>source).find((value: string) => value === 'z');

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
      .find((value: string) => value === 'z')
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

    expectObservable((<any>source).find(predicate)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should raise error if predicate throws error', () => {
    const source = hot('--a--b--c--|');
    const subs =       '^ !';
    const expected =   '--#';

    const predicate = function (value) {
      throw 'error';
    };

    expectObservable((<any>source).find(predicate)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should not be compile error', () => {
    {
      // x is `Observable<string | number>`
      const x: Rx.Observable<string | number> = Observable.from([1, 'aaa', 3, 'bb']);
      // This type guard will narrow a `string | number` to a string in the examples below
      const isString = (x: string | number): x is string => typeof x === 'string';

      // After the type guard `find` predicate, the type is narrowed to string
      const guardedFind = x.find<string | number, string>(isString).filter(s => s.length > 1).map(s => s.substr(1)); // Observable<string>  
      // In contrast, a boolean predicate maintains the original type
      const boolFind = x.find(x => typeof x === 'string'); // Observable<string | number>

      // To avoid the lint error about unused variables 
      expect(guardedFind).to.not.equal(true);
      expect(boolFind).to.not.equal(true);
    }
  });
});