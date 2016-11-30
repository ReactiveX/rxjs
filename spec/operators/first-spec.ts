import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
declare const {hot, asDiagram, expectObservable, expectSubscriptions};

const Observable = Rx.Observable;

/** @test {first} */
describe('Observable.prototype.first', () => {
  asDiagram('first')('should take the first value of an observable with many values', () => {
    const e1 =   hot('-----a--b--c---d---|');
    const expected = '-----(a|)           ';
    const sub =      '^    !              ';

    expectObservable(e1.first()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should take the first value of an observable with one value', () => {
    const e1 =   hot('---(a|)');
    const expected = '---(a|)';
    const sub =      '^  !';

    expectObservable(e1.first()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should error on empty', () => {
    const e1 = hot('--a--^----|');
    const expected =    '-----#';
    const sub =         '^    !';

    expectObservable(e1.first()).toBe(expected, null, new Rx.EmptyError());
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should return the default value if source observable was empty', () => {
    const e1 = hot('-----^----|');
    const expected =    '-----(a|)';
    const sub =         '^    !';

    expectObservable(e1.first(null, null, 'a')).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should only emit one value in recursive cases', () => {
    const subject = new Rx.Subject<number>();
    const results = [];

    subject.first().subscribe(x => {
      results.push(x);
      subject.next(x + 1);
    });

    subject.next(0);

    expect(results).to.deep.equal([0]);
  });

  it('should propagate error from the source observable', () => {
    const e1 = hot('---^---#');
    const expected =  '----#';
    const sub =       '^   !';

    expectObservable(e1.first()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should go on forever on never', () => {
    const e1 = hot('--^-------');
    const expected = '--------';
    const sub =      '^       ';

    expectObservable(e1.first()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should allow unsubscribing early and explicitly', () => {
    const e1 = hot('--a--^-----b----c---d--|');
    const e1subs =      '^  !               ';
    const expected =    '----               ';
    const unsub =       '   !               ';

    expectObservable(e1.first(), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 = hot('--a--^-----b----c---d--|');
    const e1subs =      '^  !               ';
    const expected =    '----               ';
    const unsub =       '   !               ';

    const result = e1
      .mergeMap((x: string) => Observable.of(x))
      .first()
      .mergeMap((x: string) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should return first value that matches a predicate', () => {
    const e1 = hot('--a-^--b--c--a--c--|');
    const expected =   '------(c|)';
    const sub =        '^     !';
    const predicate = function (value) {
      return value === 'c';
    };

    expectObservable(e1.first(predicate)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should return first value that matches a predicate for odd numbers', () => {
    const e1 = hot('--a-^--b--c--d--e--|', {a: 1, b: 2, c: 3, d: 4, e: 5});
    const expected =   '------(c|)';
    const sub =        '^     !';
    const predicate = function (value) {
      return value % 2 === 1;
    };

    expectObservable(e1.first(predicate)).toBe(expected, {c: 3});
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should error when no value matches the predicate', () => {
    const e1 = hot('--a-^--b--c--a--c--|');
    const expected =   '---------------#';
    const sub =        '^              !';
    const predicate = function (value) {
      return value === 's';
    };

    expectObservable(e1.first(predicate)).toBe(expected, null, new Rx.EmptyError());
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should return the default value when no value matches the predicate', () => {
    const e1 = hot('--a-^--b--c--a--c--|');
    const expected =   '---------------(d|)';
    const sub =        '^              !';
    const predicate = function (value) {
      return value === 's';
    };

    expectObservable(e1.first(predicate, null, 'd')).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should propagate error when no value matches the predicate', () => {
    const e1 = hot('--a-^--b--c--a--#');
    const expected =   '------------#';
    const sub =        '^           !';
    const predicate = function (value) {
      return value === 's';
    };

    expectObservable(e1.first(predicate)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should return first value that matches the index in the predicate', () => {
    const e1 = hot('--a-^--b--c--a--c--|');
    const expected =   '---------(a|)';
    const sub =        '^        !';
    const predicate = function (value, index) {
      return index === 2;
    };

    expectObservable(e1.first(predicate)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should propagate error from predicate', () => {
    const e1 = hot('--a-^--b--c--d--e--|', {a: 1, b: 2, c: 3, d: 4, e: 5});
    const expected =   '---------#';
    const sub =        '^        !';
    const predicate = function (value) {
      if (value < 4) {
        return false;
      } else {
        throw 'error';
      }
    };

    expectObservable(e1.first(predicate)).toBe(expected, null, 'error');
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should support a result selector argument', () => {
    const e1 = hot('--a--^---b---c---d---e--|');
    const expected =    '--------(x|)';
    const sub =         '^       !';
    const predicate = function (x) { return x === 'c'; };
    const resultSelector = function (x, i) {
      expect(i).to.equal(1);
      expect(x).to.equal('c');
      return 'x';
    };

    expectObservable(e1.first(predicate, resultSelector)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should raise error when result selector throws', () => {
    const e1 = hot('--a--^---b---c---d---e--|');
    const expected =    '--------#';
    const sub =         '^       !';
    const predicate = function (x) { return x === 'c'; };
    const resultSelector = function (x, i) {
      throw 'error';
    };

    expectObservable(e1.first(predicate, resultSelector)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(sub);
  });

  it('should not be compile error', () => {
    {
      // x is `Observable<string | number>`
      const x: Rx.Observable<string | number> = Observable.from([1, 'aaa', 3, 'bb']);
      // This type guard will narrow a `string | number` to a string in the examples below
      const isString = (x: string | number): x is string => typeof x === 'string';

      // After the type guard `first` predicates, the type is narrowed to string
      const guardedFirst1 = x.first<string | number, string>(isString).filter(s => s.length > 1).map(s => s.substr(1)); // Observable<string>
      const guardedFirst2 = x.first<string | number, string>(isString, s => s.substr(0)).filter(s => s.length > 1); // Observable<string>
      // Without a resultSelector, `first` maintains the original type (TS can't do this yet)
      const boolFirst1 = x.first(x => typeof x === 'string', null, ''); // Observable<string | number>
      // `first` still uses the `resultSelector` return type, if it exists.
      const boolFirst2 = x.first(x => typeof x === 'string', s => ({str: `${s}`}), {str: ''}); // Observable<{str: string}>

      // To avoid the lint error about unused variables 
      expect(guardedFirst1).to.not.equal(true);
      expect(guardedFirst2).to.not.equal(true);
      expect(boolFirst1).to.not.equal(true);
      expect(boolFirst2).to.not.equal(true);
    }
  });
});
