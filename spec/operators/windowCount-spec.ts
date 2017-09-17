import * as Rx from '../../dist/package/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram, time };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;

/** @test {windowCount} */
describe('Observable.prototype.windowCount', () => {
  asDiagram('windowCount(3)')('should emit windows with count 3, no skip specified', () => {
    const source =   hot('---a---b---c---d---e---f---g---h---i---|');
    const sourceSubs =   '^                                      !';
    const expected =     'x----------y-----------z-----------w---|';
    const x = cold(      '---a---b---(c|)                         ');
    const y = cold(                 '----d---e---(f|)             ');
    const z = cold(                             '----g---h---(i|) ');
    const w = cold(                                         '----|');
    const expectedValues = { x: x, y: y, z: z, w: w };

    const result = source.windowCount(3);

    expectObservable(result).toBe(expected, expectedValues);
    expectSubscriptions(source.subscriptions).toBe(sourceSubs);
  });

  it('should emit windows with count 2 and skip 1', () => {
    const source = hot('^-a--b--c--d--|');
    const subs =       '^             !';
    const expected =   'u-v--x--y--z--|';
    const u = cold(    '--a--(b|)      ');
    const v = cold(      '---b--(c|)   ');
    const x = cold(         '---c--(d|)');
    const y = cold(            '---d--|');
    const z = cold(               '---|');
    const values = { u: u, v: v, x: x, y: y, z: z };

    const result = source.windowCount(2, 1);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should emit windows with count 2, and skip unspecified', () => {
    const source = hot('--a--b--c--d--e--f--|');
    const subs =       '^                   !';
    const expected =   'x----y-----z-----w--|';
    const x = cold(    '--a--(b|)            ');
    const y = cold(         '---c--(d|)      ');
    const z = cold(               '---e--(f|)');
    const w = cold(                     '---|');
    const values = { x: x, y: y, z: z, w: w };

    const result = source.windowCount(2);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return empty if source is empty', () => {
    const source = cold('|');
    const subs =        '(^!)';
    const expected =    '(w|)';
    const w =      cold('|');
    const values = { w: w };

    const result = source.windowCount(2, 1);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should return Never if source if Never', () => {
    const source = cold('-');
    const subs =        '^';
    const expected =    'w';
    const w =      cold('-');
    const expectedValues = { w: w };

    const result = source.windowCount(2, 1);

    expectObservable(result).toBe(expected, expectedValues);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should propagate error from a just-throw source', () => {
    const source =   cold('#');
    const subs =          '(^!)';
    const expected =      '(w#)';
    const w =        cold('#');
    const expectedValues = { w: w };

    const result = source.windowCount(2, 1);

    expectObservable(result).toBe(expected, expectedValues);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should raise error if source raises error', () => {
    const source = hot('--a--b--c--d--e--f--#');
    const subs =       '^                   !';
    const expected =   'u-v--w--x--y--z--q--#';
    const u = cold(    '--a--b--(c|)         ');
    const v = cold(      '---b--c--(d|)      ');
    const w = cold(         '---c--d--(e|)   ');
    const x = cold(            '---d--e--(f|)');
    const y = cold(               '---e--f--#');
    const z = cold(                  '---f--#');
    const q = cold(                     '---#');
    const values = { u: u, v: v, w: w, x: x, y: y, z: z, q: q };

    const result = source.windowCount(3, 1);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should dispose of inner windows once outer is unsubscribed early', () => {
    const source = hot('^-a--b--c--d--|');
    const subs =       '^        !     ';
    const expected =   'w-x--y--z-     ';
    const w = cold(    '--a--(b|)      ');
    const x = cold(      '---b--(c|)   ');
    const y = cold(         '---c-     ');
    const z = cold(            '--     ');
    const unsub =      '         !     ';
    const values = { w: w, x: x, y: y, z: z };

    const result = source.windowCount(2, 1);

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const source = hot('^-a--b--c--d--|');
    const subs =       '^        !     ';
    const expected =   'w-x--y--z-     ';
    const w = cold(    '--a--(b|)      ');
    const x = cold(      '---b--(c|)   ');
    const y = cold(         '---c-     ');
    const z = cold(            '--     ');
    const unsub =      '         !     ';
    const values = { w: w, x: x, y: y, z: z };

    const result = source
      .mergeMap((x: string) => Observable.of(x))
      .windowCount(2, 1)
      .mergeMap((x: Rx.Observable<string>) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(source.subscriptions).toBe(subs);
  });
});
