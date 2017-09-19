import { expect } from 'chai';
import * as Rx from '../../dist/package/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;
declare const rxTestScheduler: Rx.TestScheduler;
const Observable = Rx.Observable;

/** @test {concatAll} */
describe('Observable.prototype.concatAll', () => {
  asDiagram('concatAll')('should concat an observable of observables', () => {
    const x = cold(    '----a------b------|                 ');
    const y = cold(                      '---c-d---|        ');
    const z = cold(                               '---e--f-|');
    const outer = hot('-x---y----z------|              ', { x: x, y: y, z: z });
    const expected =  '-----a------b---------c-d------e--f-|';

    const result = outer.concatAll();

    expectObservable(result).toBe(expected);
  });

  it('should concat sources from promise', function (done: MochaDone) {
    this.timeout(2000);
    const sources = Rx.Observable.from([
      new Promise((res: any) => { res(0); }),
      new Promise((res: any) => { res(1); }),
      new Promise((res: any) => { res(2); }),
      new Promise((res: any) => { res(3); }),
    ]).take(10);

    const res = [];
    (<any>sources.concatAll()).subscribe(
      (x: number) => { res.push(x); },
      (err: any) => { done(new Error('should not be called')); },
      () => {
        expect(res).to.deep.equal([0, 1, 2, 3]);
        done();
      });
  });

  it('should concat and raise error from promise', function (done: MochaDone) {
    this.timeout(2000);

    const sources = Rx.Observable.from([
      new Promise((res: any) => { res(0); }),
      new Promise((res: any, rej: any) => { rej(1); }),
      new Promise((res: any) => { res(2); }),
      new Promise((res: any) => { res(3); }),
    ]).take(10);

    const res = [];
    (<any>sources.concatAll()).subscribe(
      (x: number) => { res.push(x); },
      (err: any) => {
        expect(res.length).to.equal(1);
        expect(err).to.equal(1);
        done();
      },
      () => { done(new Error('should not be called')); });
  });

  it('should concat all observables in an observable', () => {
    const e1 = Rx.Observable.from([
      Rx.Observable.of('a'),
      Rx.Observable.of('b'),
      Rx.Observable.of('c')
    ]).take(10);
    const expected = '(abc|)';

    expectObservable(e1.concatAll()).toBe(expected);
  });

  it('should throw if any child observable throws', () => {
    const e1 = Rx.Observable.from([
      Rx.Observable.of('a'),
      Rx.Observable.throw('error'),
      Rx.Observable.of('c')
    ]).take(10);
    const expected = '(a#)';

    expectObservable(e1.concatAll()).toBe(expected);
  });

  it('should concat merging a hot observable of non-overlapped observables', () => {
    const values = {
      x: cold(       'a-b---------|'),
      y: cold(                 'c-d-e-f-|'),
      z: cold(                          'g-h-i-j-k-|')
    };

    const e1 =   hot('--x---------y--------z--------|', values);
    const expected = '--a-b---------c-d-e-f-g-h-i-j-k-|';

    expectObservable(e1.concatAll()).toBe(expected);
  });

  it('should raise error if inner observable raises error', () => {
    const values = {
      x: cold(       'a-b---------|'),
      y: cold(                 'c-d-e-f-#'),
      z: cold(                          'g-h-i-j-k-|')
    };
    const e1 =   hot('--x---------y--------z--------|', values);
    const expected = '--a-b---------c-d-e-f-#';

    expectObservable(e1.concatAll()).toBe(expected);
  });

  it('should raise error if outer observable raises error', () => {
    const values = {
      y: cold(       'a-b---------|'),
      z: cold(                 'c-d-e-f-|'),
    };
    const e1 =   hot('--y---------z---#    ', values);
    const expected = '--a-b---------c-#';

    expectObservable(e1.concatAll()).toBe(expected);
  });

  it('should complete without emit if both sources are empty', () => {
    const e1 =   cold('--|');
    const e1subs =    '^ !';
    const e2 =   cold(  '----|');
    const e2subs =    '  ^   !';
    const expected =  '------|';

    const result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not complete if first source does not completes', () => {
    const e1 =   cold('-');
    const e1subs =    '^';
    const e2 =   cold('--|');
    const e2subs = [];
    const expected =  '-';

    const result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not complete if second source does not completes', () => {
    const e1 =   cold('--|');
    const e1subs =    '^ !';
    const e2 =   cold('---');
    const e2subs =    '  ^';
    const expected =  '---';

    const result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not complete if both sources do not complete', () => {
    const e1 =   cold('-');
    const e1subs =    '^';
    const e2 =   cold('-');
    const e2subs = [];
    const expected =  '-';

    const result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise error when first source is empty, second source raises error', () => {
    const e1 =   cold('--|');
    const e1subs =    '^ !';
    const e2 =   cold(  '----#');
    const e2subs =    '  ^   !';
    const expected =  '------#';

    const result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise error when first source raises error, second source is empty', () => {
    const e1 =   cold('---#');
    const e1subs =    '^  !';
    const e2 =   cold('----|');
    const e2subs = [];
    const expected =  '---#';

    const result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise first error when both source raise error', () => {
    const e1 =   cold('---#');
    const e1subs =    '^  !';
    const e2 =   cold('------#');
    const e2subs = [];
    const expected =  '---#';

    const result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should concat if first source emits once, second source is empty', () => {
    const e1 =   cold('--a--|');
    const e1subs =    '^    !';
    const e2 =   cold(     '--------|');
    const e2subs =    '     ^       !';
    const expected =  '--a----------|';

    const result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should concat if first source is empty, second source emits once', () => {
    const e1 =   cold('--|');
    const e1subs =    '^ !';
    const e2 =   cold(  '--a--|');
    const e2subs =    '  ^    !';
    const expected =  '----a--|';

    const result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should emit element from first source, and should not complete if second ' +
  'source does not completes', () => {
    const e1 =   cold('--a--|');
    const e1subs =    '^    !';
    const e2 =   cold(     '-');
    const e2subs =    '     ^';
    const expected =  '--a---';

    const result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not complete if first source does not complete', () => {
    const e1 =   cold('-');
    const e1subs =    '^';
    const e2 =   cold('--a--|');
    const e2subs = [];
    const expected =  '-';

    const result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should emit elements from each source when source emit once', () => {
    const e1 =   cold('---a|');
    const e1subs =    '^   !';
    const e2 =   cold(    '-----b--|');
    const e2subs =    '    ^       !';
    const expected =  '---a-----b--|';

    const result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should unsubscribe to inner source if outer is unsubscribed early', () => {
    const e1 =   cold('---a-a--a|            ');
    const e1subs =    '^        !            ';
    const e2 =   cold(         '-----b-b--b-|');
    const e2subs =    '         ^       !    ';
    const unsub =     '                 !    ';
    const expected =  '---a-a--a-----b-b     ';

    const result = Observable.of(e1, e2).concatAll();

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const e1 =   cold('---a-a--a|            ');
    const e1subs =    '^        !            ';
    const e2 =   cold(         '-----b-b--b-|');
    const e2subs =    '         ^       !    ';
    const expected =  '---a-a--a-----b-b-    ';
    const unsub =     '                 !    ';

    const result = Observable.of(e1, e2)
      .mergeMap((x: any) => Observable.of(x))
      .concatAll()
      .mergeMap((x: any) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should raise error from first source and does not emit from second source', () => {
    const e1 =   cold('--#');
    const e1subs =    '^ !';
    const e2 =   cold('----a--|');
    const e2subs = [];
    const expected =  '--#';

    const result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should emit element from first source then raise error from second source', () => {
    const e1 =   cold('--a--|');
    const e1subs =    '^    !';
    const e2 =   cold(     '-------#');
    const e2subs =    '     ^      !';
    const expected =  '--a---------#';

    const result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should emit all elements from both hot observable sources if first source ' +
  'completes before second source starts emit', () => {
    const e1 =   hot('--a--b-|');
    const e1subs =   '^      !';
    const e2 =   hot('--------x--y--|');
    const e2subs =   '       ^      !';
    const expected = '--a--b--x--y--|';

    const result = Observable.of(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should emit elements from second source regardless of completion time ' +
  'when second source is cold observable', () => {
    const e1 =   hot('--a--b--c---|');
    const e1subs =   '^           !';
    const e2 =  cold('-x-y-z-|');
    const e2subs =   '            ^      !';
    const expected = '--a--b--c----x-y-z-|';

    const result = Observable.of<Rx.Observable<string>>(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not emit collapsing element from second source', () => {
    const e1 =   hot('--a--b--c--|');
    const e1subs =   '^          !';
    const e2 =   hot('--------x--y--z--|');
    const e2subs =   '           ^     !';
    const expected = '--a--b--c--y--z--|';

    const result = Observable.of<Rx.Observable<string>>(e1, e2).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should be able to work on a different scheduler', () => {
    const e1 =   cold('---a|');
    const e1subs =    '^   !';
    const e2 =   cold(    '---b--|');
    const e2subs =    '    ^     !';
    const e3 =   cold(          '---c--|');
    const e3subs =    '          ^     !';
    const expected =  '---a---b-----c--|';

    const result = Observable.of<Rx.Observable<string>>(e1, e2, e3, rxTestScheduler).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should concatAll a nested observable with a single inner observable', () => {
    const e1 =   cold('---a-|');
    const e1subs =    '^    !';
    const expected =  '---a-|';

    const result = Observable.of(e1).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should concatAll a nested observable with a single inner observable, and a scheduler', () => {
    const e1 =   cold('---a-|');
    const e1subs =    '^    !';
    const expected =  '---a-|';

    const result = Observable.of<Rx.Observable<string>>(e1, rxTestScheduler).concatAll();

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });
});
