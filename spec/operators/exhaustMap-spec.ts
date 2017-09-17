import * as Rx from '../../dist/package/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;

/** @test {exhaustMap} */
describe('Observable.prototype.exhaustMap', () => {
  asDiagram('exhaustMap(i => 10*i\u2014\u201410*i\u2014\u201410*i\u2014| )')
  ('should map-and-flatten each item to an Observable', () => {
    const e1 =    hot('--1-----3--5-------|');
    const e1subs =    '^                  !';
    const e2 =   cold('x-x-x|              ', {x: 10});
    const expected =  '--x-x-x-y-y-y------|';
    const values = {x: 10, y: 30, z: 50};

    const result = e1.exhaustMap(x => e2.map(i => i * x));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle outer throw', () => {
    const x =   cold('--a--b--c--|');
    const xsubs = [];
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    const result = (<any>e1).exhaustMap(() => x);

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle outer empty', () => {
    const x =   cold('--a--b--c--|');
    const xsubs = [];
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '|';

    const result = (<any>e1).exhaustMap(() => x);
    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle outer never', () => {
    const x =   cold('--a--b--c--|');
    const xsubs = [];
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    const result = (<any>e1).exhaustMap(() => x);

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error if project throws', () => {
    const e1 =   hot('---x---------y-----------------z-------------|');
    const e1subs =   '^  !';
    const expected = '---#';

    const result = (<any>e1).exhaustMap((value: any) => {
      throw 'error';
    });

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error if selector throws', () => {
    const x = cold(     '--a--b--c--|         ');
    const xsubs =    '   ^ !                  ';
    const e1 =   hot('---x---------y----z----|');
    const e1subs =   '^    !                  ';
    const expected = '-----#                  ';

    const result = (<any>e1).exhaustMap((value: any) => x,
      () => {
        throw 'error';
      });

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch with a selector function', () => {
    const x = cold(     '--a--b--c--|                              ');
    const xsubs =    '   ^          !                              ';
    const y = cold(               '--d--e--f--|                    ');
    const ysubs = [];
    const z = cold(                                 '--g--h--i--|  ');
    const zsubs =    '                               ^          !  ';
    const e1 =   hot('---x---------y-----------------z-------------|');
    const e1subs =   '^                                            !';
    const expected = '-----a--b--c---------------------g--h--i-----|';

    const observableLookup = { x: x, y: y, z: z };

    const result = (<any>e1).exhaustMap((value: any) => observableLookup[value]);

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
    const ysubs = [];
    const z = cold(                                 '--g--h--i--|   ');
    const zsubs =    '                               ^  !           ';
    const e1 =   hot('---x---------y-----------------z-------------|');
    const unsub =    '                                  !           ';
    const e1subs =   '^                                 !           ';
    const expected = '-----a--b--c---------------------g-           ';

    const observableLookup = { x: x, y: y, z: z };

    const result = (<any>e1).exhaustMap((value: any) => observableLookup[value]);

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
    const ysubs = [];
    const z = cold(                                 '--g--h--i--|   ');
    const zsubs =    '                               ^  !           ';
    const e1 =   hot('---x---------y-----------------z-------------|');
    const e1subs =   '^                                 !           ';
    const expected = '-----a--b--c---------------------g-           ';
    const unsub =    '                                  !           ';

    const observableLookup = { x: x, y: y, z: z };

    const result = (<any>e1)
      .mergeMap((x: any) => Observable.of(x))
      .exhaustMap((value: any) => observableLookup[value])
      .mergeMap((x: any) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner cold observables, inner never completes', () => {
    const x = cold(     '--a--b--c--|                              ');
    const xsubs =    '   ^          !                              ';
    const y = cold(               '--d--e--f--|                    ');
    const ysubs = [];
    const z = cold(                                 '--g--h--i-----');
    const zsubs =    '                               ^             ';
    const e1 =   hot('---x---------y-----------------z---------|   ');
    const e1subs =   '^                                            ';
    const expected = '-----a--b--c---------------------g--h--i-----';

    const observableLookup = { x: x, y: y, z: z };

    const result = (<any>e1).exhaustMap((value: any) => observableLookup[value]);

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
    const ysubs = [];
    const e1 =   hot('---------(xy)----------------|');
    const e1subs =   '^                            !';
    const expected = '-----------a--b--c--d--e-----|';

    const observableLookup = { x: x, y: y };

    const result = (<any>e1).exhaustMap((value: any) => observableLookup[value]);

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner cold observables, one inner throws', () => {
    const x =   cold(         '--a--b--c--d--#             ');
    const xsubs =    '         ^             !             ';
    const y =   cold(                   '---f---g---h---i--');
    const ysubs = [];
    const e1 =   hot('---------x---------y---------|       ');
    const e1subs =   '^                      !             ';
    const expected = '-----------a--b--c--d--#             ';

    const observableLookup = { x: x, y: y };

    const result = (<any>e1).exhaustMap((value: any) => observableLookup[value]);

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner hot observables', () => {
    const x =    hot('-----a--b--c--d--e--|                  ');
    const xsubs =    '         ^          !                  ';
    const y =    hot('--p-o-o-p-------f---g---h---i--|       ');
    const ysubs =  [];
    const z =    hot('---z-o-o-m-------------j---k---l---m--|');
    const zsubs =    '                    ^                 !';
    const e1 =   hot('---------x----y-----z--------|         ');
    const e1subs =   '^                                     !';
    const expected = '-----------c--d--e-----j---k---l---m--|';

    const observableLookup = { x: x, y: y, z: z };

    const result = (<any>e1).exhaustMap((value: any) => observableLookup[value]);

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

    const result = (<any>e1).exhaustMap((value: any) => observableLookup[value]);

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
    const e1subs =   '^                             ';
    const expected = '------------------------------';

    const observableLookup = { x: x, y: y };

    const result = (<any>e1).exhaustMap((value: any) => observableLookup[value]);

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should never switch inner never', () => {
    const x = cold('-');
    const y = cold('#');
    const xsubs =    '         ^                     ';
    const ysubs = [];
    const e1 =   hot('---------x---------y----------|');
    const e1subs =   '^                              ';
    const expected = '-------------------------------';

    const observableLookup = { x: x, y: y };

    const result = (<any>e1).exhaustMap((value: any) => observableLookup[value]);

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

    const result = (<any>e1).exhaustMap((value: any) => observableLookup[value]);

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

    const result = (<any>e1).exhaustMap((value: any) => observableLookup[value]);

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch with resultSelector goodness', () => {
    const x =   cold(  '--a--b--c--d--e-|                   ');
    const xsubs =    '  ^               !                   ';
    const y =   cold(            '---f---g---h---i--|       ');
    const ysubs = [];
    const z =   cold(                   '---k---l---m---n--|');
    const zsubs =    '                   ^                 !';
    const e1 =   hot('--x---------y------z-|                ');
    const e1subs =   '^                                    !';
    const expected = '----a--b--c--d--e-----k---l---m---n--|';

    const observableLookup = { x: x, y: y, z: z };

    const expectedValues = {
      a: ['x', 'a', 0, 0],
      b: ['x', 'b', 0, 1],
      c: ['x', 'c', 0, 2],
      d: ['x', 'd', 0, 3],
      e: ['x', 'e', 0, 4],
      k: ['z', 'k', 1, 0],
      l: ['z', 'l', 1, 1],
      m: ['z', 'm', 1, 2],
      n: ['z', 'n', 1, 3],
    };

    const result = (<any>e1).exhaustMap((value: any) => observableLookup[value],
    (innerValue, outerValue, innerIndex, outerIndex) => [innerValue, outerValue, innerIndex, outerIndex]);

    expectObservable(result).toBe(expected, expectedValues);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
