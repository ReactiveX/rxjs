import { expect } from 'chai';
import { cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { pluck, map, tap, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';

declare function asDiagram(arg: string): Function;

/** @test {pluck} */
describe('pluck operator', () => {
  asDiagram('pluck(\'v\')')('should dematerialize an Observable', () => {
    const values = {
      a: '{v:1}',
      b: '{v:2}',
      c: '{v:3}'
    };

    const e1 =  cold('--a--b--c--|', values);
    const expected = '--x--y--z--|';

    const result = e1.pipe(
      map((x: string) => ({v: x.charAt(3)})),
      pluck('v')
    );

    expectObservable(result).toBe(expected, {x: '1', y: '2', z: '3'});
  });

  it('should work for one object', () => {
    const a =   cold('--x--|', {x: {prop: 42}});
    const asubs =    '^    !';
    const expected = '--y--|';

    const r = a.pipe(pluck('prop'));
    expectObservable(r).toBe(expected, {y: 42});
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should work for multiple objects', () => {
    const inputs = {
      a: {prop: '1'},
      b: {prop: '2'},
      c: {prop: '3'},
      d: {prop: '4'},
      e: {prop: '5'},
    };
    const a =   cold('--a-b--c-d---e-|', inputs);
    const asubs =    '^              !';
    const expected = '--1-2--3-4---5-|';

    const r = a.pipe(pluck('prop'));
    expectObservable(r).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should work with deep nested properties', () => {
    const inputs = {
      a: {a: {b: {c: '1'}}},
      b: {a: {b: {c: '2'}}},
      c: {a: {b: {c: '3'}}},
      d: {a: {b: {c: '4'}}},
      e: {a: {b: {c: '5'}}},
    };
    const a =   cold('--a-b--c-d---e-|', inputs);
    const asubs =    '^              !';
    const expected = '--1-2--3-4---5-|';

    const r = a.pipe(pluck('a', 'b', 'c'));
    expectObservable(r).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should work with edge cases of deep nested properties', () => {
    const inputs = {
      a: {a: {b: {c: 1}}},
      b: {a: {b: 2}},
      c: {a: {c: {c: 3}}},
      d: {},
      e: {a: {b: {c: 5}}},
    };
    const a =   cold('--a-b--c-d---e-|', inputs);
    const asubs =    '^              !';
    const expected = '--r-x--y-z---w-|';
    const values: { [key: string]: number | undefined } = {r: 1, x: undefined, y: undefined, z: undefined, w: 5};

    // @ts-ignore
    const r = a.pipe(pluck('a', 'b', 'c'));
    expectObservable(r).toBe(expected, values);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should throw an error if not property is passed', () => {
    expect(() => {
      // @ts-ignore
      of({prop: 1}, {prop: 2}).pipe(pluck());
    }).to.throw(Error, 'list of properties cannot be empty.');
  });

  it('should propagate errors from observable that emits only errors', () => {
    const a =   cold('#');
    const asubs =    '(^!)';
    const expected = '#';

    // @ts-ignore
    const r = a.pipe(pluck('whatever'));
    expectObservable(r).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should propagate errors from observable that emit values', () => {
    const a =   cold('--a--b--#', {a: {prop: '1'}, b: {prop: '2'}}, 'too bad');
    const asubs =    '^       !';
    const expected = '--1--2--#';

    const r = a.pipe(pluck('prop'));
    expectObservable(r).toBe(expected, undefined, 'too bad');
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should not pluck an empty observable', () => {
    const a =   cold('|');
    const asubs =    '(^!)';
    const expected = '|';

    const invoked = 0;
    const r = a.pipe(
      // @ts-ignore
      pluck('whatever'),
      tap(null, null, () => {
        expect(invoked).to.equal(0);
      })
    );

    expectObservable(r).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should allow unsubscribing explicitly and early', () => {
    const a =   cold('--a--b--c--|', {a: {prop: '1'}, b: {prop: '2'}});
    const unsub =    '      !     ';
    const asubs =    '^     !     ';
    const expected = '--1--2-     ';

    const r = a.pipe(pluck('prop'));
    expectObservable(r, unsub).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should pluck twice', () => {
    const inputs = {
      a: {a: {b: {c: '1'}}},
      b: {a: {b: {c: '2'}}},
      c: {a: {b: {c: '3'}}},
      d: {a: {b: {c: '4'}}},
      e: {a: {b: {c: '5'}}},
    };
    const a =   cold('--a-b--c-d---e-|', inputs);
    const asubs =    '^              !';
    const expected = '--1-2--3-4---5-|';

    const r = a.pipe(
      pluck('a', 'b'),
      pluck('c')
    );
    expectObservable(r).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });

  it('should not break unsubscription chain when unsubscribed explicitly', () => {
    const a =   cold('--a--b--c--|', {a: {prop: '1'}, b: {prop: '2'}});
    const unsub =    '      !     ';
    const asubs =    '^     !     ';
    const expected = '--1--2-     ';

    const r = a.pipe(
      mergeMap((x: { prop: string }) => of(x)),
      pluck('prop'),
      mergeMap((x: string) => of(x))
    );

    expectObservable(r, unsub).toBe(expected);
    expectSubscriptions(a.subscriptions).toBe(asubs);
  });
});
