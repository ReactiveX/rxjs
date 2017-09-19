import { expect } from 'chai';
import * as Rx from '../../dist/package/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;

/** @test {switchMap} */
describe('Observable.prototype.switchMap', () => {
  asDiagram('switchMap(i => 10*i\u2014\u201410*i\u2014\u201410*i\u2014| )')
  ('should map-and-flatten each item to an Observable', () => {
    const e1 =    hot('--1-----3--5-------|');
    const e1subs =    '^                  !';
    const e2 =   cold('x-x-x|              ', {x: 10});
    const expected =  '--x-x-x-y-yz-z-z---|';
    const values = {x: 10, y: 30, z: 50};

    const result = e1.switchMap(x => e2.map(i => i * x));

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch with a selector function', (done: MochaDone) => {
    const a = Observable.of(1, 2, 3);
    const expected = ['a1', 'b1', 'c1', 'a2', 'b2', 'c2', 'a3', 'b3', 'c3'];
    a.switchMap((x: number) => Observable.of('a' + x, 'b' + x, 'c' + x))
      .subscribe((x: string) => {
        expect(x).to.equal(expected.shift());
      }, null, done);
  });

  it('should unsub inner observables', () => {
    const unsubbed = [];

    Observable.of('a', 'b').switchMap((x: string) =>
      Observable.create((subscriber: Rx.Subscriber<string>) => {
        subscriber.complete();
        return () => {
          unsubbed.push(x);
        };
      })).subscribe();

    expect(unsubbed).to.deep.equal(['a', 'b']);
  });

  it('should switch inner cold observables', () => {
    const x =   cold(         '--a--b--c--d--e--|           ');
    const xsubs =    '         ^         !                  ';
    const y =   cold(                   '---f---g---h---i--|');
    const ysubs =    '                   ^                 !';
    const e1 =   hot('---------x---------y---------|        ');
    const e1subs =   '^                                    !';
    const expected = '-----------a--b--c----f---g---h---i--|';

    const observableLookup = { x: x, y: y };

    const result = e1.switchMap((value: string) => observableLookup[value]);

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error when projection throws', () => {
    const e1 =   hot('-------x-----y---|');
    const e1subs =   '^      !          ';
    const expected = '-------#          ';
    function project() {
      throw 'error';
    }

    expectObservable(e1.switchMap(<any>project)).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error when resultSelector throws', () => {
    const x =   cold(         '--a--b--c--d--e--|   ');
    const xsubs =    '         ^ !                  ';
    const e1 =   hot('---------x---------y---------|');
    const e1subs =   '^          !                  ';
    const expected = '-----------#                  ';

    function selector() {
      throw 'error';
    }

    const result = e1.switchMap((value: string) => x, selector);

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner cold observables, outer is unsubscribed early', () => {
    const x =   cold(         '--a--b--c--d--e--|           ');
    const xsubs =    '         ^         !                  ';
    const y =   cold(                   '---f---g---h---i--|');
    const ysubs =    '                   ^ !                ';
    const e1 =   hot('---------x---------y---------|        ');
    const e1subs =   '^                    !                ';
    const unsub =    '                     !                ';
    const expected = '-----------a--b--c----                ';

    const observableLookup = { x: x, y: y };

    const result = e1.switchMap((value: string) => observableLookup[value]);

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const x =   cold(         '--a--b--c--d--e--|           ');
    const xsubs =    '         ^         !                  ';
    const y =   cold(                   '---f---g---h---i--|');
    const ysubs =    '                   ^ !                ';
    const e1 =   hot('---------x---------y---------|        ');
    const e1subs =   '^                    !                ';
    const expected = '-----------a--b--c----                ';
    const unsub =    '                     !                ';

    const observableLookup = { x: x, y: y };

    const result = e1
      .mergeMap((x: string) => Observable.of(x))
      .switchMap((value: string) => observableLookup[value])
      .mergeMap((x: string) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner cold observables, inner never completes', () => {
    const x =   cold(         '--a--b--c--d--e--|          ');
    const xsubs =    '         ^         !                 ';
    const y =   cold(                   '---f---g---h---i--');
    const ysubs =    '                   ^                 ';
    const e1 =   hot('---------x---------y---------|       ');
    const e1subs =   '^                                    ';
    const expected = '-----------a--b--c----f---g---h---i--';

    const observableLookup = { x: x, y: y };

    const result = e1.switchMap((value: string) => observableLookup[value]);

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle a synchronous switch to the second inner observable', () => {
    const x =   cold(         '--a--b--c--d--e--|   ');
    const xsubs =    '         (^!)                 ';
    const y =   cold(         '---f---g---h---i--|  ');
    const ysubs =    '         ^                 !  ';
    const e1 =   hot('---------(xy)----------------|');
    const e1subs =   '^                            !';
    const expected = '------------f---g---h---i----|';

    const observableLookup = { x: x, y: y };

    const result = e1.switchMap((value: string) => observableLookup[value]);

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner cold observables, one inner throws', () => {
    const x =   cold(         '--a--b--#--d--e--|          ');
    const xsubs =    '         ^       !                   ';
    const y =   cold(                   '---f---g---h---i--');
    const ysubs = [];
    const e1 =   hot('---------x---------y---------|       ');
    const e1subs =   '^                !                   ';
    const expected = '-----------a--b--#                   ';

    const observableLookup = { x: x, y: y };

    const result = e1.switchMap((value: string) => observableLookup[value]);

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner hot observables', () => {
    const x =    hot('-----a--b--c--d--e--|                 ');
    const xsubs =    '         ^         !                  ';
    const y =    hot('--p-o-o-p-------------f---g---h---i--|');
    const ysubs =    '                   ^                 !';
    const e1 =   hot('---------x---------y---------|        ');
    const e1subs =   '^                                    !';
    const expected = '-----------c--d--e----f---g---h---i--|';

    const observableLookup = { x: x, y: y };

    const result = e1.switchMap((value: string) => observableLookup[value]);

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
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

    const result = e1.switchMap((value: string) => observableLookup[value]);

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

    const result = e1.switchMap((value: string) => observableLookup[value]);

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner never and empty', () => {
    const x = cold('-');
    const y = cold('|');
    const xsubs =    '         ^         !          ';
    const ysubs =    '                   (^!)       ';
    const e1 =   hot('---------x---------y---------|');
    const e1subs =   '^                            !';
    const expected = '-----------------------------|';

    const observableLookup = { x: x, y: y };

    const result = e1.switchMap((value: string) => observableLookup[value]);

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner never and throw', () => {
    const x = cold('-');
    const y = cold('#', null, 'sad');
    const xsubs =    '         ^         !          ';
    const ysubs =    '                   (^!)       ';
    const e1 =   hot('---------x---------y---------|');
    const e1subs =   '^                  !          ';
    const expected = '-------------------#          ';

    const observableLookup = { x: x, y: y };

    const result = e1.switchMap((value: string) => observableLookup[value]);

    expectObservable(result).toBe(expected, undefined, 'sad');
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch inner empty and throw', () => {
    const x = cold('|');
    const y = cold('#', null, 'sad');
    const xsubs =    '         (^!)                 ';
    const ysubs =    '                   (^!)       ';
    const e1 =   hot('---------x---------y---------|');
    const e1subs =   '^                  !          ';
    const expected = '-------------------#          ';

    const observableLookup = { x: x, y: y };

    const result = e1.switchMap((value: string) => observableLookup[value]);

    expectObservable(result).toBe(expected, undefined, 'sad');
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle outer empty', () => {
    const e1 =  cold('|');
    const e1subs =   '(^!)';
    const expected = '|';

    const result = e1.switchMap((value: any) => Observable.of(value));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle outer never', () => {
    const e1 =  cold('-');
    const e1subs =   '^';
    const expected = '-';

    const result = e1.switchMap((value: any) => Observable.of(value));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle outer throw', () => {
    const e1 =  cold('#');
    const e1subs =   '(^!)';
    const expected = '#';

    const result = e1.switchMap((value: any) => Observable.of(value));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle outer error', () => {
    const x =   cold(         '--a--b--c--d--e--|');
    const xsubs =    '         ^         !       ';
    const e1 =   hot('---------x---------#       ');
    const e1subs =   '^                  !       ';
    const expected = '-----------a--b--c-#       ';

    const observableLookup = { x: x };

    const result = e1.switchMap((value: string) => observableLookup[value]);

    expectObservable(result).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should switch with resultSelector goodness', () => {
    const x =   cold(         '--a--b--c--d--e--|           ');
    const xsubs =    '         ^         !                  ';
    const y =   cold(                   '---f---g---h---i--|');
    const ysubs =    '                   ^                 !';
    const e1 =   hot('---------x---------y---------|        ');
    const e1subs =   '^                                    !';
    const expected = '-----------a--b--c----f---g---h---i--|';

    const observableLookup = { x: x, y: y };

    const expectedValues = {
      a: ['x', 'a', 0, 0],
      b: ['x', 'b', 0, 1],
      c: ['x', 'c', 0, 2],
      f: ['y', 'f', 1, 0],
      g: ['y', 'g', 1, 1],
      h: ['y', 'h', 1, 2],
      i: ['y', 'i', 1, 3]
    };

    const result = e1.switchMap((value: string) => observableLookup[value],
      (innerValue, outerValue, innerIndex, outerIndex) => [innerValue, outerValue, innerIndex, outerIndex]);

    expectObservable(result).toBe(expected, expectedValues);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
