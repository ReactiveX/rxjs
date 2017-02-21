import {expect} from 'chai';
import * as Rx from '../../dist/cjs/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { asDiagram };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;

/** @test {mergeAll} */
describe('Observable.prototype.mergeAll', () => {
  asDiagram('mergeAll')('should merge a hot observable of cold observables', () => {
    const x = cold(    '--a---b--c---d--|      ');
    const y = cold(           '----e---f--g---|');
    const e1 = hot(  '--x------y-------|       ', { x: x, y: y });
    const expected = '----a---b--c-e-d-f--g---|';

    expectObservable(e1.mergeAll()).toBe(expected);
  });

  it('should merge all observables in an observable', () => {
    const e1 = Observable.from([
      Observable.of('a'),
      Observable.of('b'),
      Observable.of('c')
    ]);
    const expected = '(abc|)';

    expectObservable(e1.mergeAll()).toBe(expected);
  });

  it('should throw if any child observable throws', () => {
    const e1 = Observable.from([
      Observable.of('a'),
      Observable.throw('error'),
      Observable.of('c')
    ]);
    const expected = '(a#)';

    expectObservable(e1.mergeAll()).toBe(expected);
  });

  it('should handle merging a hot observable of observables', () => {
    const x = cold(     'a---b---c---|   ');
    const xsubs =     '  ^           !   ';
    const y = cold(        'd---e---f---|');
    const ysubs =     '     ^           !';
    const e1 =    hot('--x--y--|         ', { x: x, y: y });
    const e1subs =    '^                !';
    const expected =  '--a--db--ec--f---|';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should merge one cold Observable at a time with parameter concurrency=1', () => {
    const x = cold(     'a---b---c---|            ');
    const xsubs =     '  ^           !            ';
    const y = cold(                 'd---e---f---|');
    const ysubs =     '              ^           !';
    const e1 =    hot('--x--y--|                  ', { x: x, y: y });
    const e1subs =    '^                         !';
    const expected =  '--a---b---c---d---e---f---|';

    expectObservable(e1.mergeAll(1)).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should merge two cold Observables at a time with parameter concurrency=2', () => {
    const x = cold(     'a---b---c---|        ');
    const xsubs =     '  ^           !        ';
    const y = cold(        'd---e---f---|     ');
    const ysubs =     '     ^           !     ';
    const z = cold(                 '--g---h-|');
    const zsubs =     '              ^       !';
    const e1 =    hot('--x--y--z--|           ', { x: x, y: y, z: z });
    const e1subs =    '^                     !';
    const expected =  '--a--db--ec--f--g---h-|';

    expectObservable(e1.mergeAll(2)).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should merge one hot Observable at a time with parameter concurrency=1', () => {
    const x =     hot('---a---b---c---|          ');
    const xsubs =     '  ^            !          ';
    const y =     hot('-------------d---e---f---|');
    const ysubs =     '               ^         !';
    const e1 =    hot('--x--y--|                 ', { x: x, y: y });
    const e1subs =    '^                        !';
    const expected =  '---a---b---c-----e---f---|';

    expectObservable(e1.mergeAll(1)).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should merge two hot Observables at a time with parameter concurrency=2', () => {
    const x =     hot('i--a---b---c---|        ');
    const xsubs =     '  ^            !        ';
    const y =     hot('-i-i--d---e---f---|     ');
    const ysubs =     '     ^            !     ';
    const z =     hot('--i--i--i--i-----g---h-|');
    const zsubs =     '               ^       !';
    const e1 =    hot('--x--y--z--|            ', { x: x, y: y, z: z });
    const e1subs =    '^                      !';
    const expected =  '---a--db--ec--f--g---h-|';

    expectObservable(e1.mergeAll(2)).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle merging a hot observable of observables, outer unsubscribed early', () => {
    const x = cold(     'a---b---c---|   ');
    const xsubs =     '  ^         !     ';
    const y = cold(        'd---e---f---|');
    const ysubs =     '     ^      !     ';
    const e1 =    hot('--x--y--|         ', { x: x, y: y });
    const e1subs =    '^           !     ';
    const unsub =     '            !     ';
    const expected =  '--a--db--ec--     ';

    expectObservable(e1.mergeAll(), unsub).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    const x = cold(     'a---b---c---|   ');
    const xsubs =     '  ^         !     ';
    const y = cold(        'd---e---f---|');
    const ysubs =     '     ^      !     ';
    const e1 =    hot('--x--y--|         ', { x: x, y: y });
    const e1subs =    '^           !     ';
    const expected =  '--a--db--ec--     ';
    const unsub =     '            !     ';

    const result = (<any>e1)
      .mergeMap((x: string) => Observable.of(x))
      .mergeAll()
      .mergeMap((x: any) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should merge parallel emissions', () => {
    const x = cold(     '----a----b----c---|');
    const xsubs =     '  ^                 !';
    const y = cold(        '-d----e----f---|');
    const ysubs =     '     ^              !';
    const e1 =    hot('--x--y--|            ', { x: x, y: y });
    const e1subs =    '^                   !';
    const expected =  '------(ad)-(be)-(cf)|';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should merge empty and empty', () => {
    const x = cold(     '|');
    const xsubs =     '  (^!)   ';
    const y = cold(        '|');
    const ysubs =     '     (^!)';
    const e1 =    hot('--x--y--|', { x: x, y: y });
    const e1subs =    '^       !';
    const expected =  '--------|';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should merge three empties', () => {
    const x = cold(     '|');
    const xsubs =     '  (^!)     ';
    const y = cold(        '|');
    const ysubs =     '     (^!)  ';
    const z = cold(          '|');
    const zsubs =     '       (^!)';
    const e1 =    hot('--x--y-z---|', { x: x, y: y, z: z });
    const e1subs =    '^          !';
    const expected =  '-----------|';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should merge never and empty', () => {
    const x = cold(     '-');
    const xsubs =     '  ^';
    const y = cold(        '|');
    const ysubs =     '     (^!)';
    const e1 =    hot('--x--y--|', { x: x, y: y });
    const e1subs =    '^        ';
    const expected =  '---------';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should merge never and never', () => {
    const x = cold(     '-');
    const xsubs =     '  ^';
    const y = cold(        '-');
    const ysubs =     '     ^';
    const e1 =    hot('--x--y--|', { x: x, y: y });
    const e1subs =    '^        ';
    const expected =  '---------';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should merge empty and throw', () => {
    const x = cold(     '|');
    const xsubs =     '  (^!)   ';
    const y = cold(        '#');
    const ysubs =     '     (^!)';
    const e1 =    hot('--x--y--|', { x: x, y: y });
    const e1subs =    '^    !   ';
    const expected =  '-----#   ';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should merge never and throw', () => {
    const x = cold(     '-');
    const xsubs =     '  ^  !';
    const y = cold(        '#');
    const ysubs =     '     (^!)';
    const e1 =    hot('--x--y--|', { x: x, y: y });
    const e1subs =    '^    !   ';
    const expected =  '-----#   ';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should merge empty and eventual error', () => {
    const x = cold(     '|');
    const xsubs =     '  (^!)';
    const y = cold(        '------#');
    const ysubs =     '     ^     !';
    const e1 =    hot('--x--y--|', { x: x, y: y });
    const e1subs =    '^          !';
    const expected =  '-----------#';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should merge never and eventual error', () => {
    const x = cold(     '-');
    const xsubs =     '  ^        !';
    const y = cold(        '------#');
    const ysubs =     '     ^     !';
    const e1 =    hot('--x--y--|', { x: x, y: y });
    const e1subs =    '^          !';
    const expected =  '-----------#';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should take an empty source and return empty too', () => {
    const e1 = cold( '|');
    const e1subs =   '(^!)';
    const expected = '|';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should take a never source and return never too', () => {
    const e1 = cold( '-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should take a throw source and return throw too', () => {
    const e1 = cold( '#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should handle merging a hot observable of non-overlapped observables', () => {
    const x = cold(    'a-b---------|                 ');
    const xsubs =    '  ^           !                 ';
    const y = cold(              'c-d-e-f-|           ');
    const ysubs =    '            ^       !           ';
    const z = cold(                       'g-h-i-j-k-|');
    const zsubs =    '                     ^         !';
    const e1 =   hot('--x---------y--------z--------| ', { x: x, y: y, z: z });
    const e1subs =   '^                              !';
    const expected = '--a-b-------c-d-e-f--g-h-i-j-k-|';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error if inner observable raises error', () => {
    const x = cold(    'a-b---------|                 ');
    const xsubs =    '  ^           !                 ';
    const y = cold(              'c-d-e-f-#           ');
    const ysubs =    '            ^       !           ';
    const z = cold(                       'g-h-i-j-k-|');
    const zsubs = [];
    const e1 =   hot('--x---------y--------z--------| ', { x: x, y: y, z: z });
    const e1subs =   '^                   !           ';
    const expected = '--a-b-------c-d-e-f-#           ';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should raise error if outer observable raises error', () => {
    const y = cold(    'a-b---------|                ');
    const ysubs =    '  ^           !                ';
    const z = cold(              'c-d-e-f-|          ');
    const zsubs =    '            ^   !              ';
    const e1 =   hot('--y---------z---#              ', { y: y, z: z });
    const e1subs =   '^               !              ';
    const expected = '--a-b-------c-d-#              ';

    expectObservable(e1.mergeAll()).toBe(expected);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should merge all promises in an observable', (done: MochaDone) => {
    const e1 = Rx.Observable.from([
      new Promise((res: any) => { res('a'); }),
      new Promise((res: any) => { res('b'); }),
      new Promise((res: any) => { res('c'); }),
      new Promise((res: any) => { res('d'); }),
    ]);
    const expected = ['a', 'b', 'c', 'd'];

    const res = [];
    (<any>e1.mergeAll()).subscribe(
      (x: any) => { res.push(x); },
      (err: any) => { done(new Error('should not be called')); },
      () => {
        expect(res).to.deep.equal(expected);
        done();
      });
  });

  it('should raise error when promise rejects', (done: MochaDone) => {
    const error = 'error';
    const e1 = Rx.Observable.from([
      new Promise((res: any) => { res('a'); }),
      new Promise((res: any, rej: any) => { rej(error); }),
      new Promise((res: any) => { res('c'); }),
      new Promise((res: any) => { res('d'); }),
    ]);

    const res = [];
    (<any>e1.mergeAll()).subscribe(
      (x: any) => { res.push(x); },
      (err: any) => {
        expect(res.length).to.equal(1);
        expect(err).to.equal('error');
        done();
      },
      () => { done(new Error('should not be called')); });
  });
});
