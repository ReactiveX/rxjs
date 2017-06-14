import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

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

  it('should support type guards without breaking previous behavior', () => {
    // tslint:disable no-unused-variable

    // type guards with interfaces and classes
    {
      interface Bar { bar?: string; }
      interface Baz { baz?: number; }
      class Foo implements Bar, Baz { constructor(public bar: string = 'name', public baz: number = 42) {} }

      const isBar = (x: any): x is Bar => x && (<Bar>x).bar !== undefined;
      const isBaz = (x: any): x is Baz => x && (<Baz>x).baz !== undefined;

      const foo: Foo = new Foo();
      Observable.of(foo).first()
        .subscribe(x => x.baz); // x is Foo
      Observable.of(foo).first(foo => foo.bar === 'name')
        .subscribe(x => x.baz); // x is still Foo
      Observable.of(foo).first(isBar)
        .subscribe(x => x.bar); // x is Bar!

      const foobar: Bar = new Foo(); // type is the interface, not the class
      Observable.of(foobar).first()
        .subscribe(x => x.bar); // x is Bar
      Observable.of(foobar).first(foobar => foobar.bar === 'name')
        .subscribe(x => x.bar); // x is still Bar
      Observable.of(foobar).first(isBaz)
        .subscribe(x => x.baz); // x is Baz!

      const barish = { bar: 'quack', baz: 42 }; // type can quack like a Bar
      Observable.of(barish).first()
        .subscribe(x => x.baz); // x is still { bar: string; baz: number; }
      Observable.of(barish).first(x => x.bar === 'quack')
        .subscribe(x => x.bar); // x is still { bar: string; baz: number; }
      Observable.of(barish).first(isBar)
        .subscribe(x => x.bar); // x is Bar!
    }

    // type guards with primitive types
    {
      const xs: Rx.Observable<string | number> = Observable.from([ 1, 'aaa', 3, 'bb' ]);

      // This type guard will narrow a `string | number` to a string in the examples below
      const isString = (x: string | number): x is string => typeof x === 'string';

      // missing predicate preserves the type
      xs.first().subscribe(x => x); // x is still string | number

      // After the type guard `first` predicates, the type is narrowed to string
      xs.first(isString)
        .subscribe(s => s.length); // s is string
      xs.first(isString, s => s.substr(0)) // s is string in predicate
        .subscribe(s => s.length); // s is string

      // boolean predicates preserve the type
      xs.first(x => typeof x === 'string')
        .subscribe(x => x); // x is still string | number
      xs.first(x => !!x, x => x)
        .subscribe(x => x); // x is still string | number
      xs.first(x => typeof x === 'string', x => x, '') // default is string; x remains string | number
        .subscribe(x => x); // x is still string | number

      // `first` still uses the `resultSelector` return type, if it exists.
      xs.first(x => typeof x === 'string', x => ({ str: `${x}` })) // x remains string | number
        .subscribe(o => o.str); // o is { str: string }
      xs.first(x => typeof x === 'string', x => ({ str: `${x}` }), { str: '' })
        .subscribe(o => o.str); // o is { str: string }
    }

    // tslint:disable enable
  });
});
