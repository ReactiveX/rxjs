import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { concat, defer, Observable, of, from } from 'rxjs';
import { exhaustMap, mergeMap, takeWhile, map } from 'rxjs/operators';
import { expect } from 'chai';

declare function asDiagram(arg: string): Function;

/** @test {exhaustMap} */
describe('exhaustMap', () => {
  asDiagram('exhaustMap(i => 10*i\u2014\u201410*i\u2014\u201410*i\u2014| )')
  ('should map-and-flatten each item to an Observable', () => {
    const e1 =    hot('--1-----3--5-------|');
    const e1subs =    '^                  !';
    const e2 =   cold('x-x-x|              ', {x: 10});
    const expected =  '--x-x-x-y-y-y------|';
    const values = {x: 10, y: 30, z: 50};

    const result = e1.pipe(exhaustMap(x => e2.pipe(map(i => i * +x))));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
  it('should support the deprecated resultSelector', () => {
    const results: Array<number[]> = [];

    of(1, 2, 3).pipe(
      exhaustMap(
        x => of(x, x + 1, x + 2),
        (a, b, i, ii) => [a, b, i, ii]
      )
    )
    .subscribe({
      next (value) {
        results.push(value);
      },
      error(err) {
        throw err;
      },
      complete() {
        expect(results).to.deep.equal([
          [1, 1, 0, 0],
          [1, 2, 0, 1],
          [1, 3, 0, 2],
          [2, 2, 1, 0],
          [2, 3, 1, 1],
          [2, 4, 1, 2],
          [3, 3, 2, 0],
          [3, 4, 2, 1],
          [3, 5, 2, 2],
        ]);
      }
    });
  });

  it('should support a void resultSelector (still deprecated)', () => {
    const results: number[] = [];

    of(1, 2, 3).pipe(
      exhaustMap(
        x => of(x, x + 1, x + 2),
        void 0
      )
    )
    .subscribe({
      next (value) {
        results.push(value);
      },
      error(err) {
        throw err;
      },
      complete() {
        expect(results).to.deep.equal([
          1, 2, 3, 2, 3, 4, 3, 4, 5
        ]);
      }
    });
  });

  it('should handle outer throw', () => {
    const x =   cold('--a--b--c--|');
    const xsubs: string[] = [];
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    const result = e1.pipe(exhaustMap(() => x));

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle outer empty', () => {
    const x =   cold('--a--b--c--|');
    const xsubs: string[] = [];
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '|';

    const result = e1.pipe(exhaustMap(() => x));
    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle outer never', () => {
    const x =   cold('--a--b--c--|');
    const xsubs: string[] = [];
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    const result = e1.pipe(exhaustMap(() => x));

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error if project throws', () => {
    const e1 =   hot('---x---------y-----------------z-------------|');
    const e1subs =   '^  !';
    const expected = '---#';

    const result = e1.pipe(exhaustMap(value => {
      throw 'error';
    }));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch with a selector function', () => {
    const x = cold(     '--a--b--c--|                              ');
    const xsubs =    '   ^          !                              ';
    const y = cold(               '--d--e--f--|                    ');
    const ysubs: string[] = [];
    const z = cold(                                 '--g--h--i--|  ');
    const zsubs =    '                               ^          !  ';
    const e1 =   hot('---x---------y-----------------z-------------|');
    const e1subs =   '^                                            !';
    const expected = '-----a--b--c---------------------g--h--i-----|';

    const observableLookup = { x: x, y: y, z: z };

    const result = e1.pipe(exhaustMap(value => observableLookup[value]));

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner cold observables, outer is unsubscribed early', () => {
    const x = cold(     '--a--b--c--|                               ');
    const xsubs =    '   ^          !                               ';
    const y = cold(               '--d--e--f--|                     ');
    const ysubs: string[] = [];
    const z = cold(                                 '--g--h--i--|   ');
    const zsubs =    '                               ^  !           ';
    const e1 =   hot('---x---------y-----------------z-------------|');
    const unsub =    '                                  !           ';
    const e1subs =   '^                                 !           ';
    const expected = '-----a--b--c---------------------g-           ';

    const observableLookup = { x: x, y: y, z: z };

    const result = e1.pipe(exhaustMap(value => observableLookup[value]));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const x = cold(     '--a--b--c--|                               ');
    const xsubs =    '   ^          !                               ';
    const y = cold(               '--d--e--f--|                     ');
    const ysubs: string[] = [];
    const z = cold(                                 '--g--h--i--|   ');
    const zsubs =    '                               ^  !           ';
    const e1 =   hot('---x---------y-----------------z-------------|');
    const e1subs =   '^                                 !           ';
    const expected = '-----a--b--c---------------------g-           ';
    const unsub =    '                                  !           ';

    const observableLookup = { x: x, y: y, z: z };

    const result = e1.pipe(
      mergeMap(x => of(x)),
      exhaustMap(value => observableLookup[value]),
      mergeMap(x => of(x))
    );

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should stop listening to a synchronous observable when unsubscribed', () => {
    const sideEffects: number[] = [];
    const synchronousObservable = concat(
      defer(() => {
        sideEffects.push(1);
        return of(1);
      }),
      defer(() => {
        sideEffects.push(2);
        return of(2);
      }),
      defer(() => {
        sideEffects.push(3);
        return of(3);
      })
    );

    of(null).pipe(
      exhaustMap(() => synchronousObservable),
      takeWhile((x) => x != 2) // unsubscribe at the second side-effect
    ).subscribe(() => { /* noop */ });

    expect(sideEffects).to.deep.equal([1, 2]);
  });

  it('should switch inner cold observables, inner never completes', () => {
    const x = cold(     '--a--b--c--|                              ');
    const xsubs =    '   ^          !                              ';
    const y = cold(               '--d--e--f--|                    ');
    const ysubs: string[] = [];
    const z = cold(                                 '--g--h--i-----');
    const zsubs =    '                               ^             ';
    const e1 =   hot('---x---------y-----------------z---------|   ');
    const e1subs =   '^                                        !   ';
    const expected = '-----a--b--c---------------------g--h--i-----';

    const observableLookup = { x: x, y: y, z: z };

    const result = e1.pipe(exhaustMap(value => observableLookup[value]));

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a synchronous switch an stay on the first inner observable', () => {
    const x =   cold(         '--a--b--c--d--e--|   ');
    const xsubs =    '         ^                !   ';
    const y =   cold(         '---f---g---h---i--|  ');
    const ysubs: string[] = [];
    const e1 =   hot('---------(xy)----------------|');
    const e1subs =   '^                            !';
    const expected = '-----------a--b--c--d--e-----|';

    const observableLookup = { x: x, y: y };

    const result = e1.pipe(exhaustMap(value => observableLookup[value]));

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner cold observables, one inner throws', () => {
    const x =   cold(         '--a--b--c--d--#             ');
    const xsubs =    '         ^             !             ';
    const y =   cold(                   '---f---g---h---i--');
    const ysubs: string[] = [];
    const e1 =   hot('---------x---------y---------|       ');
    const e1subs =   '^                      !             ';
    const expected = '-----------a--b--c--d--#             ';

    const observableLookup = { x: x, y: y };

    const result = e1.pipe(exhaustMap(value => observableLookup[value]));

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner hot observables', () => {
    const x =    hot('-----a--b--c--d--e--|                  ');
    const xsubs =    '         ^          !                  ';
    const y =    hot('--p-o-o-p-------f---g---h---i--|       ');
    const ysubs: string[] = [];
    const z =    hot('---z-o-o-m-------------j---k---l---m--|');
    const zsubs =    '                    ^                 !';
    const e1 =   hot('---------x----y-----z--------|         ');
    const e1subs =   '^                            !         ';
    const expected = '-----------c--d--e-----j---k---l---m--|';

    const observableLookup = { x: x, y: y, z: z };

    const result = e1.pipe(exhaustMap(value => observableLookup[value]));

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner empty and empty', () => {
    const x = cold('|');
    const y = cold('|');
    const xsubs =    '         (^!)                 ';
    const ysubs =    '                   (^!)       ';
    const e1 =   hot('---------x---------y---------|');
    const e1subs =   '^                            !';
    const expected = '-----------------------------|';

    const observableLookup = { x: x, y: y };

    const result = e1.pipe(exhaustMap(value => observableLookup[value]));

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner empty and never', () => {
    const x = cold('|');
    const y = cold('-');
    const xsubs =    '         (^!)                 ';
    const ysubs =    '                   ^          ';
    const e1 =   hot('---------x---------y---------|');
    const e1subs =   '^                            !';
    const expected = '------------------------------';

    const observableLookup = { x: x, y: y };

    const result = e1.pipe(exhaustMap(value => observableLookup[value]));

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should never switch inner never', () => {
    const x = cold('-');
    const y = cold('#');
    const xsubs =    '         ^                     ';
    const ysubs: string[] = [];
    const e1 =   hot('---------x---------y----------|');
    const e1subs =   '^                             !';
    const expected = '-------------------------------';

    const observableLookup = { x: x, y: y };

    const result = e1.pipe(exhaustMap(value => observableLookup[value]));

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner empty and throw', () => {
    const x = cold('|');
    const y = cold('#');
    const xsubs =    '         (^!)                  ';
    const ysubs =    '                   (^!)        ';
    const e1 =   hot('---------x---------y---------|');
    const e1subs =   '^                  !          ';
    const expected = '-------------------#          ';

    const observableLookup = { x: x, y: y };

    const result = e1.pipe(exhaustMap(value => observableLookup[value]));

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle outer error', () => {
    const x =   cold(         '--a--b--c--d--e--|');
    const xsubs =    '         ^         !       ';
    const e1 =   hot('---------x---------#       ');
    const e1subs =   '^                  !       ';
    const expected = '-----------a--b--c-#       ';

    const observableLookup = { x: x };

    const result = e1.pipe(exhaustMap(value => observableLookup[value]));

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
