import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

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
      Observable.of(foo).find(foo => foo.baz === 42)
        .subscribe(x => x.baz); // x is still Foo
      Observable.of(foo).find(isBar)
        .subscribe(x => x.bar); // x is Bar!

      const foobar: Bar = new Foo(); // type is interface, not the class
      Observable.of(foobar).find(foobar => foobar.bar === 'name')
        .subscribe(x => x.bar); // <-- x is still Bar
      Observable.of(foobar).find(isBar)
        .subscribe(x => x.bar); // <--- x is Bar!

      const barish = { bar: 'quack', baz: 42 }; // type can quack like a Bar
      Observable.of(barish).find(x => x.bar === 'quack')
        .subscribe(x => x.bar); // x is still { bar: string; baz: number; }
      Observable.of(barish).find(isBar)
        .subscribe(bar => bar.bar); // x is Bar!
    }

    // type guards with primitive types
    {
      const xs: Rx.Observable<string | number> = Observable.from([ 1, 'aaa', 3, 'bb' ]);

      // This type guard will narrow a `string | number` to a string in the examples below
      const isString = (x: string | number): x is string => typeof x === 'string';

      xs.find(isString)
        .subscribe(s => s.length); // s is string

      // In contrast, this type of regular boolean predicate still maintains the original type
      xs.find(x => typeof x === 'number')
        .subscribe(x => x); // x is still string | number
      xs.find((x, i) => typeof x === 'number' && x > i)
        .subscribe(x => x); // x is still string | number
    }

    // tslint:disable enable
  });
});
