import { expect } from 'chai';
import { map, tap, mergeMap } from 'rxjs/operators';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { of } from 'rxjs';

declare function asDiagram(arg: string): Function;

// function shortcuts
const addDrama = function (x: number | string) { return x + '!'; };
const identity = function <T>(x: T) { return x; };

/** @test {map} */
describe('map operator', () => {
  asDiagram('map(x => 10 * x)')('should map multiple values', () => {
    const a =   cold('--1--2--3--|');
    const asubs =    '^          !';
    const expected = '--x--y--z--|';

    const r = a.pipe(map(function (x) { return 10 * (+x); }));

    expectObservable(r).toBe(expected, {x: 10, y: 20, z: 30});
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should map one value', () => {
    const a =   cold('--x--|', {x: 42});
    const asubs =    '^    !';
    const expected = '--y--|';

    const r = a.pipe(map(addDrama));

    expectObservable(r).toBe(expected, {y: '42!'});
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should throw an error if not passed a function', () => {
    expect(() => {
      of(1, 2, 3).pipe(map(<any>'potato'));
    }).to.throw(TypeError, 'argument is not a function. Are you looking for `mapTo()`?');
  });

  it('should map multiple values', () => {
    const a =   cold('--1--2--3--|');
    const asubs =    '^          !';
    const expected = '--x--y--z--|';

    const r = a.pipe(map(addDrama));

    expectObservable(r).toBe(expected, {x: '1!', y: '2!', z: '3!'});
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should propagate errors from map function', () => {
    const a =   cold('--x--|', {x: 42});
    const asubs =    '^ !   ';
    const expected = '--#   ';

    const r = a.pipe(map((x: any) => {
      throw 'too bad';
    }));

    expectObservable(r).toBe(expected, null, 'too bad');
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should propagate errors from observable that emits only errors', () => {
    const a =   cold('#');
    const asubs =    '(^!)';
    const expected = '#';

    const r = a.pipe(map(identity));
    expectObservable(r).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should propagate errors from observable that emit values', () => {
    const a =   cold('--a--b--#', {a: 1, b: 2}, 'too bad');
    const asubs =    '^       !';
    const expected = '--x--y--#';

    const r = a.pipe(map(addDrama));
    expectObservable(r).toBe(expected, {x: '1!', y: '2!'}, 'too bad');
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should not map an empty observable', () => {
    const a =   cold('|');
    const asubs =    '(^!)';
    const expected = '|';

    let invoked = 0;
    const r = a.pipe(
      map((x: any) => { invoked++; return x; }),
      tap(null, null, () => {
        expect(invoked).to.equal(0);
      })
    );

    expectObservable(r).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const a =   cold('--1--2--3--|');
    const unsub =    '      !     ';
    const asubs =    '^     !     ';
    const expected = '--x--y-     ';

    const r = a.pipe(map(addDrama));

    expectObservable(r, unsub).toBe(expected, {x: '1!', y: '2!'});
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should map with index', () => {
    const a = hot('-5-^-4--3---2----1--|');
    const asubs =    '^                !';
    const expected = '--a--b---c----d--|';
    const values = {a: 5, b: 14, c: 23, d: 32};

    let invoked = 0;
    const r = a.pipe(
      map((x: string, index: number) => {
        invoked++;
        return (parseInt(x) + 1) + (index * 10);
      }),
      tap(null, null, () => {
        expect(invoked).to.equal(4);
      })
    );

    expectObservable(r).toBe(expected, values);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should map with index until completed', () => {
    const a = hot('-5-^-4--3---2----1--|');
    const asubs =    '^                !';
    const expected = '--a--b---c----d--|';
    const values = {a: 5, b: 14, c: 23, d: 32};

    let invoked = 0;
    const r = a.pipe(
      map((x: string, index: number) => {
        invoked++;
        return (parseInt(x) + 1) + (index * 10);
      }),
      tap(null, null, () => {
        expect(invoked).to.equal(4);
      })
    );

    expectObservable(r).toBe(expected, values);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should map with index until an error occurs', () => {
    const a = hot('-5-^-4--3---2----1--#', undefined, 'too bad');
    const asubs =    '^                !';
    const expected = '--a--b---c----d--#';
    const values = {a: 5, b: 14, c: 23, d: 32};

    let invoked = 0;
    const r = a.pipe(
      map((x: string, index: number) => {
        invoked++;
        return (parseInt(x) + 1) + (index * 10);
      }),
      tap(null, null, () => {
        expect(invoked).to.equal(4);
      })
    );

    expectObservable(r).toBe(expected, values, 'too bad');
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should map using a custom thisArg', () => {
    const a = hot('-5-^-4--3---2----1--|');
    const asubs =    '^                !';
    const expected = '--a--b---c----d--|';
    const values = {a: 5, b: 14, c: 23, d: 32};

    const foo = {
      value: 42
    };
    const r = a
      .pipe(map(function (this: typeof foo, x: string, index: number) {
        expect(this).to.equal(foo);
        return (parseInt(x) + 1) + (index * 10);
      }, foo));

    expectObservable(r).toBe(expected, values);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should map twice', () => {
    const a = hot('-0----1-^-2---3--4-5--6--7-8-|');
    const asubs =         '^                    !';
    const expected =      '--a---b--c-d--e--f-g-|';
    const values = {a: 2, b: 3, c: 4, d: 5, e: 6, f: 7, g: 8};

    let invoked1 = 0;
    let invoked2 = 0;
    const r = a.pipe(
      map((x: string) => { invoked1++; return parseInt(x) * 2; }),
      map((x: number) => { invoked2++; return x / 2; }),
      tap(null, null, () => {
        expect(invoked1).to.equal(7);
        expect(invoked2).to.equal(7);
      })
    );

    expectObservable(r).toBe(expected, values);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should do multiple maps using a custom thisArg', () => {
    const a =    hot('--1--2--3--4--|');
    const asubs =    '^             !';
    const expected = '--a--b--c--d--|';
    const values = {a: 11, b: 14, c: 17, d: 20};

    class Filterer {
      selector1 = (x: string) => parseInt(x) + 2;
      selector2 = (x: string) => parseInt(x) * 3;
    }
    const filterer = new Filterer();

    const r = a.pipe(
      map(function (this: any, x) { return this.selector1(x); }, filterer),
      map(function (this: any, x) { return this.selector2(x); }, filterer),
      map(function (this: any, x) { return this.selector1(x); }, filterer)
    );

    expectObservable(r).toBe(expected, values);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    const a =   cold('--1--2--3--|');
    const unsub =    '      !     ';
    const asubs =    '^     !     ';
    const expected = '--x--y-     ';

    const r = a.pipe(
      mergeMap((x: string) => of(x)),
      map(addDrama),
      mergeMap((x: string) => of(x))
    );

    expectObservable(r, unsub).toBe(expected, {x: '1!', y: '2!'});
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });
});
