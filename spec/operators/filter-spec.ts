import { expect } from 'chai';
import * as Rx from '../../dist/package/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;

/** @test {filter} */
describe('Observable.prototype.filter', () => {
  function oddFilter(x) {
    return (+x) % 2 === 1;
  }

  function isPrime(i) {
    if (+i <= 1) { return false; }
    const max = Math.floor(Math.sqrt(+i));
    for (let j = 2; j <= max; ++j) {
      if (+i % j === 0) { return false; }
    }
    return true;
  }

  asDiagram('filter(x => x % 2 === 1)')('should filter out even values', () => {
    const source = hot('--0--1--2--3--4--|');
    const subs =       '^                !';
    const expected =   '-----1-----3-----|';

    expectObservable(source.filter(oddFilter)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should filter in only prime numbers', () => {
    const source = hot('-1--2--^-3-4-5-6--7-8--9--|');
    const subs =              '^                  !';
    const expected =          '--3---5----7-------|';

    expectObservable(source.filter(isPrime)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should filter with an always-true predicate', () => {
    const source = hot('-1--2--^-3-4-5-6--7-8--9--|');
    const expected =          '--3-4-5-6--7-8--9--|';
    const predicate = () => { return true; };

    expectObservable(source.filter(predicate)).toBe(expected);
  });

  it('should filter with an always-false predicate', () => {
    const source = hot('-1--2--^-3-4-5-6--7-8--9--|');
    const expected =          '-------------------|';
    const predicate = () => { return false; };

    expectObservable(source.filter(predicate)).toBe(expected);
  });

  it('should filter in only prime numbers, source unsubscribes early', () => {
    const source = hot('-1--2--^-3-4-5-6--7-8--9--|');
    const subs =              '^           !       ';
    const unsub =             '            !       ';
    const expected =          '--3---5----7-       ';

    expectObservable(source.filter(isPrime), unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should filter in only prime numbers, source throws', () => {
    const source = hot('-1--2--^-3-4-5-6--7-8--9--#');
    const subs =              '^                  !';
    const expected =          '--3---5----7-------#';

    expectObservable(source.filter(isPrime)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should filter in only prime numbers, but predicate throws', () => {
    const source = hot('-1--2--^-3-4-5-6--7-8--9--|');
    const subs =              '^       !           ';
    const expected =          '--3---5-#           ';

    let invoked = 0;
    function predicate(x: any, index: number) {
      invoked++;
      if (invoked === 4) {
        throw 'error';
      }
      return isPrime(x);
    };

    expectObservable((<any>source).filter(predicate)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should filter in only prime numbers, predicate with index', () => {
    const source = hot('-1--2--^-3-4-5-6--7-8--9--|');
    const subs =              '^                  !';
    const expected =          '--3--------7-------|';

    function predicate(x: any, i: number) {
      return isPrime((+x) + i * 10);
    }

    expectObservable((<any>source).filter(predicate)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should invoke predicate once for each checked value', () => {
    const source = hot('-1--2--^-3-4-5-6--7-8--9--|');
    const expected =          '--3---5----7-------|';

    let invoked = 0;
    const predicate = (x: any) => {
      invoked++;
      return isPrime(x);
    };

    const r = source
      .filter(predicate)
      .do(null, null, () => {
        expect(invoked).to.equal(7);
      });

    expectObservable(r).toBe(expected);
  });

  it('should filter in only prime numbers, predicate with index, ' +
  'source unsubscribes early', () => {
    const source = hot('-1--2--^-3-4-5-6--7-8--9--|');
    const subs =              '^           !       ';
    const unsub =             '            !       ';
    const expected =          '--3--------7-       ';

    function predicate(x: any, i: number) {
      return isPrime((+x) + i * 10);
    }
    expectObservable((<any>source).filter(predicate), unsub).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should filter in only prime numbers, predicate with index, source throws', () => {
    const source = hot('-1--2--^-3-4-5-6--7-8--9--#');
    const subs =              '^                  !';
    const expected =          '--3--------7-------#';

    function predicate(x: any, i: number) {
      return isPrime((+x) + i * 10);
    }
    expectObservable((<any>source).filter(predicate)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should filter in only prime numbers, predicate with index and throws', () => {
    const source = hot('-1--2--^-3-4-5-6--7-8--9--|');
    const subs =              '^       !           ';
    const expected =          '--3-----#           ';

    let invoked = 0;
    function predicate(x: any, i: number) {
      invoked++;
      if (invoked === 4) {
        throw 'error';
      }
      return isPrime((+x) + i * 10);
    };

    expectObservable((<any>source).filter(predicate)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should compose with another filter to allow multiples of six', () => {
    const source = hot('-1--2--^-3-4-5-6--7-8--9--|');
    const expected =          '--------6----------|';

    expectObservable(
      source
        .filter((x: number) => x % 2 === 0)
        .filter((x: number) => x % 3 === 0)
    ).toBe(expected);
  });

  it('should be able to accept and use a thisArg', () => {
    const source = hot('-1--2--^-3-4-5-6--7-8--9--|');
    const expected =          '--------6----------|';

    function Filterer() {
      this.filter1 = (x: number) => x % 2 === 0;
      this.filter2 = (x: number) => x % 3 === 0;
    }

    const filterer = new Filterer();

    expectObservable(
      source
        .filter(function (x) { return this.filter1(x); }, filterer)
        .filter(function (x) { return this.filter2(x); }, filterer)
        .filter(function (x) { return this.filter1(x); }, filterer)
    ).toBe(expected);
  });

  it('should be able to use filter and map composed', () => {
    const source = hot('-1--2--^-3-4-5-6--7-8--9--|');
    const expected =          '----a---b----c-----|';
    const values = { a: 16, b: 36, c: 64 };

    expectObservable(
      source
        .filter((x: number) => x % 2 === 0)
        .map((x: number) => x * x)
    ).toBe(expected, values);
  });

  it('should propagate errors from the source', () => {
    const source = hot('--0--1--2--3--4--#');
    const subs =       '^                !';
    const expected =   '-----1-----3-----#';

    expectObservable(source.filter(oddFilter)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should support Observable.empty', () => {
    const source = cold('|');
    const subs =        '(^!)';
    const expected =    '|';

    expectObservable(source.filter(oddFilter)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should support Observable.never', () => {
    const source = cold('-');
    const subs =        '^';
    const expected =    '-';

    expectObservable(source.filter(oddFilter)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should support Observable.throw', () => {
    const source = cold('#');
    const subs =        '(^!)';
    const expected =    '#';

    expectObservable(source.filter(oddFilter)).toBe(expected);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should send errors down the error path', (done: MochaDone) => {
    Observable.of(42).filter(<any>((x: number, index: number) => {
      throw 'bad';
    }))
      .subscribe((x: number) => {
        done(new Error('should not be called'));
      }, (err: any) => {
        expect(err).to.equal('bad');
        done();
      }, () => {
        done(new Error('should not be called'));
      });
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    const source = hot('-1--2--^-3-4-5-6--7-8--9--|');
    const subs =              '^           !       ';
    const unsub =             '            !       ';
    const expected =          '--3---5----7-       ';

    const r = source
      .mergeMap((x: any) => Observable.of(x))
      .filter(isPrime)
      .mergeMap((x: any) => Observable.of(x));

    expectObservable(r, unsub).toBe(expected);
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
      Observable.of(foo).filter(foo => foo.baz === 42)
        .subscribe(x => x.baz); // x is still Foo
      Observable.of(foo).filter(isBar)
        .subscribe(x => x.bar); // x is Bar!

      const foobar: Bar = new Foo(); // type is interface, not the class
      Observable.of(foobar).filter(foobar => foobar.bar === 'name')
        .subscribe(x => x.bar); // <-- x is still Bar
      Observable.of(foobar).filter(isBar)
        .subscribe(x => x.bar); // <--- x is Bar!

      const barish = { bar: 'quack', baz: 42 }; // type can quack like a Bar
      Observable.of(barish).filter(x => x.bar === 'quack')
        .subscribe(x => x.bar); // x is still { bar: string; baz: number; }
      Observable.of(barish).filter(isBar)
        .subscribe(bar => bar.bar); // x is Bar!
    }

    // type guards with primitive types
    {
      const xs: Rx.Observable<string | number> = Observable.from([ 1, 'aaa', 3, 'bb' ]);

      // This type guard will narrow a `string | number` to a string in the examples below
      const isString = (x: string | number): x is string => typeof x === 'string';

      xs.filter(isString)
        .subscribe(s => s.length); // s is string

      // In contrast, this type of regular boolean predicate still maintains the original type
      xs.filter(x => typeof x === 'number')
        .subscribe(x => x); // x is still string | number
      xs.filter((x, i) => typeof x === 'number' && x > i)
        .subscribe(x => x); // x is still string | number
    }

    // tslint:disable enable
  });
});
