import { expect } from 'chai';
import { find, mergeMap, delay } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { of, Observable, from } from 'rxjs';

declare function asDiagram(arg: string): Function;

declare const rxTestScheduler: TestScheduler;

/** @test {find} */
describe('find operator', () => {
  function truePredicate(x: any) {
    return true;
  }

  asDiagram('find(x => x % 5 === 0)')('should return matching element from source emits single element', () => {
    const values = {a: 3, b: 9, c: 15, d: 20};
    const source = hot('---a--b--c--d---|', values);
    const subs =       '^        !       ';
    const expected =   '---------(c|)    ';

    const predicate = function (x: number) { return x % 5 === 0; };

    expectObservable(source.pipe(find(predicate))).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should throw if not provided a function', () => {
    expect(() => {
      of('yut', 'yee', 'sam').pipe(find('yee' as any));
    }).to.throw(TypeError, 'predicate is not a function');
  });

  it('should not emit if source does not emit', () => {
    const source = hot('-');
    const subs =       '^';
    const expected =   '-';

    expectObservable(source.pipe(find(truePredicate))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return undefined if source is empty to match predicate', () => {
    const source = cold('|');
    const subs =        '(^!)';
    const expected =    '(x|)';

    const result = source.pipe(find(truePredicate));

    expectObservable(result).toBe(expected, {x: undefined});
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return matching element from source emits single element', () => {
    const source = hot('--a--|');
    const subs =       '^ !';
    const expected =   '--(a|)';

    const predicate = function (value: string) {
      return value === 'a';
    };

    expectObservable(source.pipe(find(predicate))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return matching element from source emits multiple elements', () => {
    const source = hot('--a--b---c-|');
    const subs =       '^    !';
    const expected =   '-----(b|)';

    const predicate = function (value: string) {
      return value === 'b';
    };

    expectObservable(source.pipe(find(predicate))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should work with a custom thisArg', () => {
    const source = hot('--a--b---c-|');
    const subs =       '^    !';
    const expected =   '-----(b|)';

    const finder = {
      target: 'b'
    };
    const predicate = function (this: typeof finder, value: string) {
      return value === this.target;
    };

    expectObservable(source.pipe(find(predicate, finder))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return undefined if element does not match with predicate', () => {
    const source = hot('--a--b--c--|');
    const subs =       '^          !';
    const expected =   '-----------(x|)';

    const predicate = function (value: string) {
      return value === 'z';
    };

    expectObservable(source.pipe(find(predicate))).toBe(expected, { x: undefined });
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should allow unsubscribing early and explicitly', () => {
    const source = hot('--a--b--c--|');
    const subs =       '^     !     ';
    const expected =   '-------     ';
    const unsub =      '      !     ';

    const result = source.pipe(find((value: string) => value === 'z'));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const source = hot('--a--b--c--|');
    const subs =       '^     !     ';
    const expected =   '-------     ';
    const unsub =      '      !     ';

    const result = source.pipe(
      mergeMap((x: string) => of(x)),
      find((value: string) => value === 'z'),
      mergeMap((x: string) => of(x))
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should unsubscribe when the predicate is matched', () => {
    const source = hot('--a--b---c-|');
    const subs =       '^    !';
    const expected =   '-------(b|)';

    const duration = rxTestScheduler.createTime('--|');

    expectObservable(source.pipe(
      find((value: string) => value === 'b'),
      delay(duration, rxTestScheduler)
    )).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should raise if source raise error while element does not match with predicate', () => {
    const source = hot('--a--b--#');
    const subs =       '^       !';
    const expected =   '--------#';

    const predicate = function (value: string) {
      return value === 'z';
    };

    expectObservable(source.pipe(find(predicate))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should raise error if predicate throws error', () => {
    const source = hot('--a--b--c--|');
    const subs =       '^ !';
    const expected =   '--#';

    const predicate = function (value: string) {
      throw 'error';
    };

    expectObservable(source.pipe(find(predicate))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
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
      of(foo).pipe(find(foo => foo.baz === 42))
        .subscribe(x => x.baz); // x is still Foo
      of(foo).pipe(find(isBar))
        .subscribe(x => x.bar); // x is Bar!

      const foobar: Bar = new Foo(); // type is interface, not the class
      of(foobar).pipe(find(foobar => foobar.bar === 'name'))
        .subscribe(x => x.bar); // <-- x is still Bar
      of(foobar).pipe(find(isBar))
        .subscribe(x => x.bar); // <--- x is Bar!

      const barish = { bar: 'quack', baz: 42 }; // type can quack like a Bar
      of(barish).pipe(find(x => x.bar === 'quack'))
        .subscribe(x => x.bar); // x is still { bar: string; baz: number; }
      of(barish).pipe(find(isBar))
        .subscribe(bar => bar.bar); // x is Bar!
    }

    // type guards with primitive types
    {
      const xs: Observable<string | number> = from([ 1, 'aaa', 3, 'bb' ]);

      // This type guard will narrow a `string | number` to a string in the examples below
      const isString = (x: string | number): x is string => typeof x === 'string';

      xs.pipe(find(isString))
        .subscribe(s => s.length); // s is string

      // In contrast, this type of regular boolean predicate still maintains the original type
      xs.pipe(find(x => typeof x === 'number'))
        .subscribe(x => x); // x is still string | number
      xs.pipe(find((x, i) => typeof x === 'number' && x > i))
        .subscribe(x => x); // x is still string | number
    }

    // tslint:disable enable
  });
});
