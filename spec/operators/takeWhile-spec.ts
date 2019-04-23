import { expect } from 'chai';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { takeWhile, tap, mergeMap } from 'rxjs/operators';
import { of, Observable, from } from 'rxjs';

declare function asDiagram(arg: string): Function;

/** @test {takeWhile} */
describe('takeWhile operator', () => {
  asDiagram('takeWhile(x => x < 4)')('should take all elements until predicate is false', () => {
    const source = hot('-1-^2--3--4--5--6--|');
    const sourceSubs =    '^      !         ';
    const expected =      '-2--3--|         ';

    const result = source.pipe(takeWhile((v: any) => +v < 4));

    expectObservable(result).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should take all elements with predicate returns true', () => {
    const e1 = hot('--a-^-b--c--d--e--|');
    const e1subs =     '^             !';
    const expected =   '--b--c--d--e--|';

    expectObservable(e1.pipe(takeWhile(() => true))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should take all elements with truthy predicate', () => {
    const e1 = hot('--a-^-b--c--d--e--|');
    const e1subs =     '^             !';
    const expected =   '--b--c--d--e--|';

    expectObservable(e1.pipe(takeWhile(<any>(() => { return {}; })))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should skip all elements with predicate returns false', () => {
    const e1 = hot('--a-^-b--c--d--e--|');
    const e1subs =     '^ !            ';
    const expected =   '--|            ';

    expectObservable(e1.pipe(takeWhile(() => false))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should skip all elements with falsy predicate', () => {
    const e1 = hot('--a-^-b--c--d--e--|');
    const e1subs =     '^ !            ';
    const expected =   '--|            ';

    expectObservable(e1.pipe(takeWhile(() => null))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should take all elements until predicate return false', () => {
    const e1 = hot('--a-^-b--c--d--e--|');
    const e1subs =     '^       !      ';
    const expected =   '--b--c--|      ';

    function predicate(value: string) {
      return value !== 'd';
    }

    expectObservable(e1.pipe(takeWhile(predicate))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should take all elements up to and including the element that made ' +
      'the predicate return false', () => {
    const e1 = hot('--a-^-b--c--d--e--|');
    const e1subs =     '^       !      ';
    const expected =   '--b--c--(d|)   ';

    function predicate(value: string) {
      return value !== 'd';
    }
    const inclusive = true;

    expectObservable(e1.pipe(takeWhile(predicate, inclusive))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should take elements with predicate when source does not complete', () => {
    const e1 = hot('--a-^-b--c--d--e--');
    const e1subs =     '^             ';
    const expected =   '--b--c--d--e--';

    expectObservable(e1.pipe(takeWhile(() => true))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not complete when source never completes', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    const result = e1.pipe(takeWhile(() => true));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete when source does not emit', () => {
    const e1 = hot('--a-^------------|');
    const e1subs =     '^            !';
    const expected =   '-------------|';

    expectObservable(e1.pipe(takeWhile(() => true))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should complete when source is empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '|';

    const result = e1.pipe(takeWhile(() => true));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should pass element index to predicate', () => {
    const e1 = hot('--a-^-b--c--d--e--|');
    const e1subs =     '^       !      ';
    const expected =   '--b--c--|      ';

    function predicate(value: string, index: number) {
      return index < 2;
    }

    expectObservable(e1.pipe(takeWhile(predicate))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error when source raises error', () => {
    const e1 = hot('--a-^-b--c--d--e--#');
    const e1subs =     '^             !';
    const expected =   '--b--c--d--e--#';

    expectObservable(e1.pipe(takeWhile(() => true))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error when source throws', () => {
    const source = cold('#');
    const subs =        '(^!)';
    const expected =    '#';

    expectObservable(source.pipe(takeWhile(() => true))).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should invoke predicate until return false', () => {
    const e1 = hot('--a-^-b--c--d--e--|');
    const e1subs =     '^       !      ';
    const expected =   '--b--c--|      ';

    let invoked = 0;
    function predicate(value: string) {
      invoked++;
      return value !== 'd';
    }

    const source = e1.pipe(
      takeWhile(predicate),
      tap(null, null, () => {
        expect(invoked).to.equal(3);
      })
    );
    expectObservable(source).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error if predicate throws', () => {
    const e1 = hot('--a-^-b--c--d--e--|');
    const e1subs =     '^ !            ';
    const expected =   '--#            ';

    function predicate(value: string) {
      throw 'error';
    }

    expectObservable(e1.pipe(takeWhile(<any>predicate))).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should take elements until unsubscribed', () => {
    const e1 = hot('--a-^-b--c--d--e--|');
    const unsub =      '-----!         ';
    const e1subs =     '^    !         ';
    const expected =   '--b---         ';

    function predicate(value: string) {
      return value !== 'd';
    }

    expectObservable(e1.pipe(takeWhile(predicate)), unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    const e1 = hot('--a-^-b--c--d--e--|');
    const unsub =      '-----!         ';
    const e1subs =     '^    !         ';
    const expected =   '--b---         ';

    function predicate(value: string) {
      return value !== 'd';
    }

    const result = e1.pipe(
      mergeMap((x: string) => of(x)),
      takeWhile(predicate),
      mergeMap((x: string) => of(x))
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should support type guards without breaking previous behavior', () => {
    // type guards with interfaces and classes
    {
      interface Bar { bar?: string; }
      interface Baz { baz?: number; }
      class Foo implements Bar, Baz { constructor(public bar: string = 'name', public baz: number = 42) {} }

      const isBar = (x: any): x is Bar => x && (<Bar>x).bar !== undefined;

      const foo: Foo = new Foo();
      of(foo).pipe(takeWhile(foo => foo.baz === 42))
        .subscribe(x => x.baz); // x is still Foo
      of(foo).pipe(takeWhile(isBar))
        .subscribe(x => x.bar); // x is Bar!

      const foobar: Bar = new Foo(); // type is interface, not the class
      of(foobar).pipe(takeWhile(foobar => foobar.bar === 'name'))
        .subscribe(x => x.bar); // <-- x is still Bar
      of(foobar).pipe(takeWhile(isBar))
        .subscribe(x => x.bar); // <--- x is Bar!

      const barish = { bar: 'quack', baz: 42 }; // type can quack like a Bar
      of(barish).pipe(takeWhile(x => x.bar === 'quack'))
        .subscribe(x => x.bar); // x is still { bar: string; baz: number; }
      of(barish).pipe(takeWhile(isBar))
        .subscribe(bar => bar.bar); // x is Bar!
    }

    // type guards with primitive types
    {
      const xs: Observable<string | number> = from([ 1, 'aaa', 3, 'bb' ]);

      // This type guard will narrow a `string | number` to a string in the examples below
      const isString = (x: string | number): x is string => typeof x === 'string';

      xs.pipe(takeWhile(isString))
        .subscribe(s => s.length); // s is string

      // In contrast, this type of regular boolean predicate still maintains the original type
      xs.pipe(takeWhile(x => typeof x === 'number'))
        .subscribe(x => x); // x is still string | number
      xs.pipe(takeWhile((x, i) => typeof x === 'number' && x > i))
        .subscribe(x => x); // x is still string | number
    }
  });
});
