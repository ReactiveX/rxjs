
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { last, mergeMap } from 'rxjs/operators';
import { EmptyError, of, from, Observable } from 'rxjs';

declare function asDiagram(arg: string): Function;

/** @test {last} */
describe('Observable.prototype.last', () => {
  asDiagram('last')('should take the last value of an observable', () => {
    const e1 =   hot('--a----b--c--|');
    const e1subs =   '^            !';
    const expected = '-------------(c|)';

    expectObservable(e1.pipe(last())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should error on nothing sent but completed', () => {
    const e1 = hot('--a--^----|');
    const e1subs =      '^    !';
    const expected =    '-----#';

    expectObservable(e1.pipe(last())).toBe(expected, null, new EmptyError());
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should error on empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable(e1.pipe(last())).toBe(expected, null, new EmptyError());
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should go on forever on never', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.pipe(last())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should return last element matches with predicate', () => {
    const e1 =    hot('--a--b--a--b--|');
    const e1subs =    '^             !';
    const expected =  '--------------(b|)';

    expectObservable(e1.pipe(last(value => value === 'b'))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const e1 =    hot('--a--b--c--d--|');
    const unsub =     '       !       ';
    const e1subs =    '^      !       ';
    const expected =  '--------       ';

    expectObservable(e1.pipe(last()), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =    hot('--a--b--c--d--|');
    const e1subs =    '^      !       ';
    const expected =  '--------       ';
    const unsub =     '       !       ';

    const result = e1.pipe(
      mergeMap(x => of(x)),
      last(),
      mergeMap(x => of(x)),
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should return a default value if no element found', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '(a|)';

    expectObservable(e1.pipe(last(null, 'a'))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not return default value if an element is found', () => {
    const e1 = hot('--a---^---b---c---d---|');
    const e1subs =       '^               !';
    const expected =     '----------------(d|)';

    expectObservable(e1.pipe(last(null, 'x'))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error when predicate throws', () => {
    const e1 = hot('--a--^---b---c---d---e--|');
    const e1subs =      '^       !           ';
    const expected =    '--------#           ';

    const predicate = function (x: string) {
      if (x === 'c') {
        throw 'error';
      } else {
        return false;
      }
    };

    expectObservable(e1.pipe(last(predicate))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should support type guards without breaking previous behavior', () => {
    // tslint:disable no-unused-variable

    // type guards with interfaces and classes
    {
      interface Bar { bar?: string; }
      interface Baz { baz?: number; }
      class Foo implements Bar, Baz { constructor(public bar: string = 'name', public baz: number = 42) {} }

      const isBar = (x: any): x is Bar => x && (x as Bar).bar !== undefined;
      const isBaz = (x: any): x is Baz => x && (x as Baz).baz !== undefined;

      const foo: Foo = new Foo();
      of(foo).pipe(last())
        .subscribe(x => x.baz); // x is Foo
      of(foo).pipe(last(foo => foo.bar === 'name'))
        .subscribe(x => x.baz); // x is still Foo
      of(foo).pipe(last(isBar))
        .subscribe(x => x.bar); // x is Bar!

      const foobar: Bar = new Foo(); // type is the interface, not the class
      of(foobar).pipe(last())
        .subscribe(x => x.bar); // x is Bar
      of(foobar).pipe(last(foobar => foobar.bar === 'name'))
        .subscribe(x => x.bar); // x is still Bar
      of(foobar).pipe(last(isBaz))
        .subscribe(x => x.baz); // x is Baz!

      const barish = { bar: 'quack', baz: 42 }; // type can quack like a Bar
      of(barish).pipe(last())
        .subscribe(x => x.baz); // x is still { bar: string; baz: number; }
      of(barish).pipe(last(x => x.bar === 'quack'))
        .subscribe(x => x.bar); // x is still { bar: string; baz: number; }
      of(barish).pipe(last(isBar))
        .subscribe(x => x.bar); // x is Bar!
    }

    // type guards with primitive types
    {
      const xs: Observable<string | number> = from([ 1, 'aaa', 3, 'bb' ]);

      // This type guard will narrow a `string | number` to a string in the examples below
      const isString = (x: string | number): x is string => typeof x === 'string';

      // missing predicate preserves the type
      xs.pipe(last()).subscribe(x => x); // x is still string | number

      // null predicate preserves the type
      xs.pipe(last(null)).subscribe(x => x); // x is still string | number

      // undefined predicate preserves the type
      xs.pipe(last(undefined)).subscribe(x => x); // x is still string | number

      // After the type guard `last` predicates, the type is narrowed to string
      xs.pipe(last(isString))
        .subscribe(s => s.length); // s is string

      // boolean predicates preserve the type
      xs.pipe(last(x => typeof x === 'string'))
        .subscribe(x => x); // x is still string | number
    }

    // tslint:disable enable
  });
});
