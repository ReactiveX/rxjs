import { expect } from 'chai';
import * as Rx from 'rxjs/Rx';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { throwError } from 'rxjs';

declare function asDiagram(arg: string): Function;
declare const type: Function;

const Observable = Rx.Observable;

/** @test {smooshAll} */
describe('Observable.prototype.smooshAll', () => {
  asDiagram('smooshAll')('should smoosh a hot observable of cold observables', () => {
    const x = cold(    '--a---b--c---d--|      ');
    const y = cold(           '----e---f--g---|');
    const e1 = hot(  '--x------y-------|       ', { x: x, y: y });
    const expected = '----a---b--c-e-d-f--g---|';

    expectObservable(e1.smooshAll()).toBe(expected);
  });

  it('should smoosh all observables in an observable', () => {
    const e1 = Observable.from([
      Observable.of('a'),
      Observable.of('b'),
      Observable.of('c')
    ]);
    const expected = '(abc|)';

    expectObservable(e1.smooshAll()).toBe(expected);
  });

  it('should throw if any child observable throws', () => {
    const e1 = Observable.from([
      Observable.of('a'),
      throwError('error'),
      Observable.of('c')
    ]);
    const expected = '(a#)';

    expectObservable(e1.smooshAll()).toBe(expected);
  });

  it('should handle merging a hot observable of observables', () => {
    const x = cold(     'a---b---c---|   ');
    const xsubs =     '  ^           !   ';
    const y = cold(        'd---e---f---|');
    const ysubs =     '     ^           !';
    const e1 =    hot('--x--y--|         ', { x: x, y: y });
    const e1subs =    '^                !';
    const expected =  '--a--db--ec--f---|';

    expectObservable(e1.smooshAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should smoosh one cold Observable at a time with parameter concurrency=1', () => {
    const x = cold(     'a---b---c---|            ');
    const xsubs =     '  ^           !            ';
    const y = cold(                 'd---e---f---|');
    const ysubs =     '              ^           !';
    const e1 =    hot('--x--y--|                  ', { x: x, y: y });
    const e1subs =    '^                         !';
    const expected =  '--a---b---c---d---e---f---|';

    expectObservable(e1.smooshAll(1)).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should smoosh two cold Observables at a time with parameter concurrency=2', () => {
    const x = cold(     'a---b---c---|        ');
    const xsubs =     '  ^           !        ';
    const y = cold(        'd---e---f---|     ');
    const ysubs =     '     ^           !     ';
    const z = cold(                 '--g---h-|');
    const zsubs =     '              ^       !';
    const e1 =    hot('--x--y--z--|           ', { x: x, y: y, z: z });
    const e1subs =    '^                     !';
    const expected =  '--a--db--ec--f--g---h-|';

    expectObservable(e1.smooshAll(2)).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should smoosh one hot Observable at a time with parameter concurrency=1', () => {
    const x =     hot('---a---b---c---|          ');
    const xsubs =     '  ^            !          ';
    const y =     hot('-------------d---e---f---|');
    const ysubs =     '               ^         !';
    const e1 =    hot('--x--y--|                 ', { x: x, y: y });
    const e1subs =    '^                        !';
    const expected =  '---a---b---c-----e---f---|';

    expectObservable(e1.smooshAll(1)).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should smoosh two hot Observables at a time with parameter concurrency=2', () => {
    const x =     hot('i--a---b---c---|        ');
    const xsubs =     '  ^            !        ';
    const y =     hot('-i-i--d---e---f---|     ');
    const ysubs =     '     ^            !     ';
    const z =     hot('--i--i--i--i-----g---h-|');
    const zsubs =     '               ^       !';
    const e1 =    hot('--x--y--z--|            ', { x: x, y: y, z: z });
    const e1subs =    '^                      !';
    const expected =  '---a--db--ec--f--g---h-|';

    expectObservable(e1.smooshAll(2)).toBe(expected);
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

    expectObservable(e1.smooshAll(), unsub).toBe(expected);
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

    const result = e1
      .smooshMap((x) => Observable.of(x))
      .smooshAll()
      .smooshMap((x) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should smoosh parallel emissions', () => {
    const x = cold(     '----a----b----c---|');
    const xsubs =     '  ^                 !';
    const y = cold(        '-d----e----f---|');
    const ysubs =     '     ^              !';
    const e1 =    hot('--x--y--|            ', { x: x, y: y });
    const e1subs =    '^                   !';
    const expected =  '------(ad)-(be)-(cf)|';

    expectObservable(e1.smooshAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should smoosh empty and empty', () => {
    const x = cold(     '|');
    const xsubs =     '  (^!)   ';
    const y = cold(        '|');
    const ysubs =     '     (^!)';
    const e1 =    hot('--x--y--|', { x: x, y: y });
    const e1subs =    '^       !';
    const expected =  '--------|';

    expectObservable(e1.smooshAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should smoosh three empties', () => {
    const x = cold(     '|');
    const xsubs =     '  (^!)     ';
    const y = cold(        '|');
    const ysubs =     '     (^!)  ';
    const z = cold(          '|');
    const zsubs =     '       (^!)';
    const e1 =    hot('--x--y-z---|', { x: x, y: y, z: z });
    const e1subs =    '^          !';
    const expected =  '-----------|';

    expectObservable(e1.smooshAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should smoosh never and empty', () => {
    const x = cold(     '-');
    const xsubs =     '  ^';
    const y = cold(        '|');
    const ysubs =     '     (^!)';
    const e1 =    hot('--x--y--|', { x: x, y: y });
    const e1subs =    '^        ';
    const expected =  '---------';

    expectObservable(e1.smooshAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should smoosh never and never', () => {
    const x = cold(     '-');
    const xsubs =     '  ^';
    const y = cold(        '-');
    const ysubs =     '     ^';
    const e1 =    hot('--x--y--|', { x: x, y: y });
    const e1subs =    '^        ';
    const expected =  '---------';

    expectObservable(e1.smooshAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should smoosh empty and throw', () => {
    const x = cold(     '|');
    const xsubs =     '  (^!)   ';
    const y = cold(        '#');
    const ysubs =     '     (^!)';
    const e1 =    hot('--x--y--|', { x: x, y: y });
    const e1subs =    '^    !   ';
    const expected =  '-----#   ';

    expectObservable(e1.smooshAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should smoosh never and throw', () => {
    const x = cold(     '-');
    const xsubs =     '  ^  !';
    const y = cold(        '#');
    const ysubs =     '     (^!)';
    const e1 =    hot('--x--y--|', { x: x, y: y });
    const e1subs =    '^    !   ';
    const expected =  '-----#   ';

    expectObservable(e1.smooshAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should smoosh empty and eventual error', () => {
    const x = cold(     '|');
    const xsubs =     '  (^!)';
    const y = cold(        '------#');
    const ysubs =     '     ^     !';
    const e1 =    hot('--x--y--|', { x: x, y: y });
    const e1subs =    '^          !';
    const expected =  '-----------#';

    expectObservable(e1.smooshAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should smoosh never and eventual error', () => {
    const x = cold(     '-');
    const xsubs =     '  ^        !';
    const y = cold(        '------#');
    const ysubs =     '     ^     !';
    const e1 =    hot('--x--y--|', { x: x, y: y });
    const e1subs =    '^          !';
    const expected =  '-----------#';

    expectObservable(e1.smooshAll()).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should take an empty source and return empty too', () => {
    const e1 = cold( '|');
    const e1subs =   '(^!)';
    const expected = '|';

    expectObservable(e1.smooshAll()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should take a never source and return never too', () => {
    const e1 = cold( '-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.smooshAll()).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should take a throw source and return throw too', () => {
    const e1 = cold( '#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable(e1.smooshAll()).toBe(expected);
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

    expectObservable(e1.smooshAll()).toBe(expected);
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
    const zsubs: string[] = [];
    const e1 =   hot('--x---------y--------z--------| ', { x: x, y: y, z: z });
    const e1subs =   '^                   !           ';
    const expected = '--a-b-------c-d-e-f-#           ';

    expectObservable(e1.smooshAll()).toBe(expected);
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

    expectObservable(e1.smooshAll()).toBe(expected);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should smoosh all promises in an observable', (done) => {
    const e1 = Rx.Observable.from([
      new Promise<string>((res) => { res('a'); }),
      new Promise<string>((res) => { res('b'); }),
      new Promise<string>((res) => { res('c'); }),
      new Promise<string>((res) => { res('d'); }),
    ]);
    const expected = ['a', 'b', 'c', 'd'];

    const res: string[] = [];
    e1.smooshAll().subscribe(
      (x) => { res.push(x); },
      (err) => { done(new Error('should not be called')); },
      () => {
        expect(res).to.deep.equal(expected);
        done();
      });
  });

  it('should raise error when promise rejects', (done) => {
    const error = 'error';
    const e1 = Rx.Observable.from([
      new Promise<string>((res) => { res('a'); }),
      new Promise<string>((res: any, rej) => { rej(error); }),
      new Promise<string>((res) => { res('c'); }),
      new Promise<string>((res) => { res('d'); }),
    ]);

    const res: string[] = [];
    e1.smooshAll().subscribe(
      (x) => { res.push(x); },
      (err) => {
        expect(res.length).to.equal(1);
        expect(err).to.equal('error');
        done();
      },
      () => { done(new Error('should not be called')); });
  });

  type(() => {
    /* tslint:disable:no-unused-variable */
    const source1 = Rx.Observable.of(1, 2, 3);
    const source2 = [1, 2, 3];
    const source3 = new Promise<number>(d => d(1));

    let result: Rx.Observable<number> = Rx.Observable
      .of(source1, source2, source3)
      .pipe(Rx.operators.smooshAll());
    /* tslint:enable:no-unused-variable */
  });

  type(() => {
    /* tslint:disable:no-unused-variable */
    const source1 = Rx.Observable.of(1, 2, 3);
    const source2 = [1, 2, 3];
    const source3 = new Promise<number>(d => d(1));

    let result: Rx.Observable<number> = Rx.Observable
      .of(source1, source2, source3)
      .smooshAll();
    /* tslint:enable:no-unused-variable */
  });

  type(() => {
    // coerce type to a specific type
    /* tslint:disable:no-unused-variable */
    const source1 = Rx.Observable.of(1, 2, 3);
    const source2 = [1, 2, 3];
    const source3 = new Promise<number>(d => d(1));

    let result: Rx.Observable<string> = Rx.Observable
      .of(<any>source1, <any>source2, <any>source3)
      .pipe(Rx.operators.smooshAll<string>());
    /* tslint:enable:no-unused-variable */
  });

  type(() => {
    // coerce type to a specific type
    /* tslint:disable:no-unused-variable */
    const source1 = Rx.Observable.of(1, 2, 3);
    const source2 = [1, 2, 3];
    const source3 = new Promise<number>(d => d(1));

    let result: Rx.Observable<string> = Rx.Observable
      .of(<any>source1, <any>source2, <any>source3)
      .smooshAll<string>();
    /* tslint:enable:no-unused-variable */
  });
});
