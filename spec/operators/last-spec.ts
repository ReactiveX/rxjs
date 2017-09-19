import { expect } from 'chai';
import * as Rx from '../../dist/package/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;

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
      Observable.of(foo).last()
        .subscribe(x => x.baz); // x is Foo
      Observable.of(foo).last(foo => foo.bar === 'name')
        .subscribe(x => x.baz); // x is still Foo
      Observable.of(foo).last(isBar)
        .subscribe(x => x.bar); // x is Bar!

      const foobar: Bar = new Foo(); // type is the interface, not the class
      Observable.of(foobar).last()
        .subscribe(x => x.bar); // x is Bar
      Observable.of(foobar).last(foobar => foobar.bar === 'name')
        .subscribe(x => x.bar); // x is still Bar
      Observable.of(foobar).last(isBaz)
        .subscribe(x => x.baz); // x is Baz!

      const barish = { bar: 'quack', baz: 42 }; // type can quack like a Bar
      Observable.of(barish).last()
        .subscribe(x => x.baz); // x is still { bar: string; baz: number; }
      Observable.of(barish).last(x => x.bar === 'quack')
        .subscribe(x => x.bar); // x is still { bar: string; baz: number; }
      Observable.of(barish).last(isBar)
        .subscribe(x => x.bar); // x is Bar!
    }

    // type guards with primitive types
    {
      const xs: Rx.Observable<string | number> = Observable.from([ 1, 'aaa', 3, 'bb' ]);

      // This type guard will narrow a `string | number` to a string in the examples below
      const isString = (x: string | number): x is string => typeof x === 'string';

      // missing predicate preserves the type
      xs.last().subscribe(x => x); // x is still string | number

      // After the type guard `last` predicates, the type is narrowed to string
      xs.last(isString)
        .subscribe(s => s.length); // s is string
      xs.last(isString, s => s.substr(0)) // s is string in predicate
        .subscribe(s => s.length); // s is string

      // boolean predicates preserve the type
      xs.last(x => typeof x === 'string')
        .subscribe(x => x); // x is still string | number
      xs.last(x => !!x, x => x)
        .subscribe(x => x); // x is still string | number
      xs.last(x => typeof x === 'string', x => x, '') // default is string; x remains string | number
        .subscribe(x => x); // x is still string | number

      // `last` still uses the `resultSelector` return type, if it exists.
      xs.last(x => typeof x === 'string', x => ({ str: `${x}` })) // x remains string | number
        .subscribe(o => o.str); // o is { str: string }
      xs.last(x => typeof x === 'string', x => ({ str: `${x}` }), { str: '' })
        .subscribe(o => o.str); // o is { str: string }
    }

    // tslint:disable enable
  });
});
