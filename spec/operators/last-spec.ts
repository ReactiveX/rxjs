import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
declare const {hot, cold, asDiagram, expectObservable, expectSubscriptions};

/** @test {last} */
describe('Observable.prototype.last', () => {
  asDiagram('last')('should take the last value of an observable', () => {
    const e1 =   hot('--a----b--c--|');
    const e1subs =   '^            !';
    const expected = '-------------(c|)';

    expectObservable(e1.last()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should error on nothing sent but completed', () => {
    const e1 = hot('--a--^----|');
    const e1subs =      '^    !';
    const expected =    '-----#';

    expectObservable(e1.last()).toBe(expected, null, new Rx.EmptyError());
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should error on empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable(e1.last()).toBe(expected, null, new Rx.EmptyError());
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should go on forever on never', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.last()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should return last element matches with predicate', () => {
    const e1 =    hot('--a--b--a--b--|');
    const e1subs =    '^             !';
    const expected =  '--------------(b|)';

    const predicate = function (value) {
      return value === 'b';
    };

    expectObservable(e1.last(predicate)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 =    hot('--a--b--c--d--|');
    const unsub =     '       !       ';
    const e1subs =    '^      !       ';
    const expected =  '--------       ';

    expectObservable(e1.last(), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =    hot('--a--b--c--d--|');
    const e1subs =    '^      !       ';
    const expected =  '--------       ';
    const unsub =     '       !       ';

    const result = e1
      .mergeMap((x: string) => Rx.Observable.of(x))
      .last()
      .mergeMap((x: string) => Rx.Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should return a default value if no element found', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '(a|)';

    expectObservable(e1.last(null, null, 'a')).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not return default value if an element is found', () => {
    const e1 = hot('--a---^---b---c---d---|');
    const e1subs =       '^               !';
    const expected =     '----------------(d|)';

    expectObservable(e1.last(null, null, 'x')).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should support a result selector argument', () => {
    const e1 = hot('--a--^---b---c---d---e--|');
    const e1subs =      '^                  !';
    const expected =    '-------------------(x|)';

    const predicate = function (x) { return x === 'c'; };
    const resultSelector = function (x, i) {
      expect(i).to.equal(1);
      expect(x).to.equal('c');
      return 'x';
    };

    expectObservable(e1.last(predicate, resultSelector)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error when predicate throws', () => {
    const e1 = hot('--a--^---b---c---d---e--|');
    const e1subs =      '^       !           ';
    const expected =    '--------#           ';

    const predicate = function (x) {
      if (x === 'c') {
        throw 'error';
      } else {
        return false;
      }
    };

    expectObservable(e1.last(predicate)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error when result selector throws', () => {
    const e1 = hot('--a--^---b---c---d---e--|');
    const e1subs =      '^       !           ';
    const expected =    '--------#           ';

    const predicate = function (x) { return x === 'c'; };
    const resultSelector = function (x, i) {
      throw 'error';
    };

    expectObservable(e1.last(predicate, resultSelector)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not be compile error', () => {
    {
      // x is `Observable<string | number>`
      const x: Rx.Observable<string | number> = Rx.Observable.from([1, 'aaa', 3, 'bb']);
      // This type guard will narrow a `string | number` to a string in the examples below
      const isString = (x: string | number): x is string => typeof x === 'string';

      // After the type guard `last` predicates, the type is narrowed to string
      const guardedLast1 = x.last(isString).filter(s => s.length > 1).map(s => s.substr(1)); // Observable<string>
      const guardedLast2 = x.last(isString, s => s.substr(0)).filter(s => s.length > 1); // Observable<string>
      // Without a resultSelector, `last` maintains the original type (TS can't do this yet)
      const boolLast1 = x.last(x => typeof x === 'string', null, ''); // Observable<string | number>
      // `last` still uses the `resultSelector` return type, if it exists.
      const boolLast2 = x.last(x => typeof x === 'string', s => ({str: `${s}`}), {str: ''}); // Observable<{str: string}>

      // To avoid the lint error about unused variables 
      expect(guardedLast1).to.not.equal(true);
      expect(guardedLast2).to.not.equal(true);
      expect(boolLast1).to.not.equal(true);
      expect(boolLast2).to.not.equal(true);
    }
  });
});