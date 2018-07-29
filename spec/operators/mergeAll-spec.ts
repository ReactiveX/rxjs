import { expect } from 'chai';
import { mergeAll, mergeMap, take } from 'rxjs/operators';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';
import { throwError, from, of, Observable } from 'rxjs';

declare function asDiagram(arg: string): Function;
declare const type: Function;

/** @test {mergeAll} */
describe('mergeAll oeprator', () => {
  asDiagram('mergeAll')('should merge a hot observable of cold observables', () => {
    const x = cold(    '--a---b--c---d--|      ');
    const y = cold(           '----e---f--g---|');
    const e1 = hot(  '--x------y-------|       ', { x: x, y: y });
    const expected = '----a---b--c-e-d-f--g---|';

    expectObservable(e1.pipe(mergeAll())).toBe(expected);
  });

  it('should merge all observables in an observable', () => {
    const e1 = from([
      of('a'),
      of('b'),
      of('c')
    ]);
    const expected = '(abc|)';

    expectObservable(e1.pipe(mergeAll())).toBe(expected);
  });

  it('should throw if any child observable throws', () => {
    const e1 = from([
      of('a'),
      throwError('error'),
      of('c')
    ]);
    const expected = '(a#)';

    expectObservable(e1.pipe(mergeAll())).toBe(expected);
  });

  it('should handle merging a hot observable of observables', () => {
    const x = cold(     'a---b---c---|   ');
    const xsubs =     '  ^           !   ';
    const y = cold(        'd---e---f---|');
    const ysubs =     '     ^           !';
    const e1 =    hot('--x--y--|         ', { x: x, y: y });
    const e1subs =    '^       !         ';
    const expected =  '--a--db--ec--f---|';

    expectObservable(e1.pipe(mergeAll())).toBe(expected);
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
    const e1subs =    '^       !                  ';
    const expected =  '--a---b---c---d---e---f---|';

    expectObservable(e1.pipe(mergeAll(1))).toBe(expected);
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
    const e1subs =    '^          !           ';
    const expected =  '--a--db--ec--f--g---h-|';

    expectObservable(e1.pipe(mergeAll(2))).toBe(expected);
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
    const e1subs =    '^       !                 ';
    const expected =  '---a---b---c-----e---f---|';

    expectObservable(e1.pipe(mergeAll(1))).toBe(expected);
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
    const e1subs =    '^          !            ';
    const expected =  '---a--db--ec--f--g---h-|';

    expectObservable(e1.pipe(mergeAll(2))).toBe(expected);
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
    const e1subs =    '^       !         ';
    const unsub =     '            !     ';
    const expected =  '--a--db--ec--     ';

    expectObservable(e1.pipe(mergeAll()), unsub).toBe(expected);
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
    const e1subs =    '^       !         ';
    const expected =  '--a--db--ec--     ';
    const unsub =     '            !     ';

    const result = e1.pipe(
      mergeMap((x) => of(x)),
      mergeAll(),
      mergeMap((x) => of(x))
    );

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
    const e1subs =    '^       !            ';
    const expected =  '------(ad)-(be)-(cf)|';

    expectObservable(e1.pipe(mergeAll())).toBe(expected);
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

    expectObservable(e1.pipe(mergeAll())).toBe(expected);
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

    expectObservable(e1.pipe(mergeAll())).toBe(expected);
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
    const e1subs =    '^       !';
    const expected =  '---------';

    expectObservable(e1.pipe(mergeAll())).toBe(expected);
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
    const e1subs =    '^       !';
    const expected =  '---------';

    expectObservable(e1.pipe(mergeAll())).toBe(expected);
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

    expectObservable(e1.pipe(mergeAll())).toBe(expected);
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

    expectObservable(e1.pipe(mergeAll())).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should merge empty and eventual error', () => {
    const x = cold(     '|');
    const xsubs =     '  (^!)';
    const y = cold(        '------#');
    const ysubs =     '     ^     !';
    const e1 =    hot('--x--y--|   ', { x: x, y: y });
    const e1subs =    '^       !   ';
    const expected =  '-----------#';

    expectObservable(e1.pipe(mergeAll())).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should merge never and eventual error', () => {
    const x = cold(     '-');
    const xsubs =     '  ^        !';
    const y = cold(        '------#');
    const ysubs =     '     ^     !';
    const e1 =    hot('--x--y--|   ', { x: x, y: y });
    const e1subs =    '^       !   ';
    const expected =  '-----------#';

    expectObservable(e1.pipe(mergeAll())).toBe(expected);
    expectSubscriptions(x.subscriptions).toBe(xsubs);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should take an empty source and return empty too', () => {
    const e1 = cold( '|');
    const e1subs =   '(^!)';
    const expected = '|';

    expectObservable(e1.pipe(mergeAll())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should take a never source and return never too', () => {
    const e1 = cold( '-');
    const e1subs =   '^';
    const expected = '-';

    expectObservable(e1.pipe(mergeAll())).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should take a throw source and return throw too', () => {
    const e1 = cold( '#');
    const e1subs =   '(^!)';
    const expected = '#';

    expectObservable(e1.pipe(mergeAll())).toBe(expected);
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
    const e1subs =   '^                             ! ';
    const expected = '--a-b-------c-d-e-f--g-h-i-j-k-|';

    expectObservable(e1.pipe(mergeAll())).toBe(expected);
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

    expectObservable(e1.pipe(mergeAll())).toBe(expected);
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

    expectObservable(e1.pipe(mergeAll())).toBe(expected);
    expectSubscriptions(y.subscriptions).toBe(ysubs);
    expectSubscriptions(z.subscriptions).toBe(zsubs);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
  });

  it('should merge all promises in an observable', (done) => {
    const e1 = from([
      new Promise<string>((res) => { res('a'); }),
      new Promise<string>((res) => { res('b'); }),
      new Promise<string>((res) => { res('c'); }),
      new Promise<string>((res) => { res('d'); }),
    ]);
    const expected = ['a', 'b', 'c', 'd'];

    const res: string[] = [];
    e1.pipe(mergeAll()).subscribe(
      (x) => { res.push(x); },
      (err) => { done(new Error('should not be called')); },
      () => {
        expect(res).to.deep.equal(expected);
        done();
      });
  });

  it('should raise error when promise rejects', (done) => {
    const error = 'error';
    const e1 = from([
      new Promise<string>((res) => { res('a'); }),
      new Promise<string>((res: any, rej) => { rej(error); }),
      new Promise<string>((res) => { res('c'); }),
      new Promise<string>((res) => { res('d'); }),
    ]);

    const res: string[] = [];
    e1.pipe(mergeAll()).subscribe(
      (x) => { res.push(x); },
      (err) => {
        expect(res.length).to.equal(1);
        expect(err).to.equal('error');
        done();
      },
      () => { done(new Error('should not be called')); });
  });

  it('should finalize generators when merged if the subscription ends', () => {
    const iterable = {
      finalized: false,
      next() {
        return {value: 'duck', done: false};
      },
      return() {
        this.finalized = true;
      },
      [Symbol.iterator]() {
        return this;
      }
    };

    const results: string[] = [];

    const iterableObservable = from<string>(iterable as any);
    of(iterableObservable).pipe(
      mergeAll(),
      take(3)
    ).subscribe(
      x => results.push(x),
      null,
      () => results.push('GOOSE!')
    );

    expect(results).to.deep.equal(['duck', 'duck', 'duck', 'GOOSE!']);
    expect(iterable.finalized).to.be.true;
  });

  type(() => {
    /* tslint:disable:no-unused-variable */
    const source1 = of(1, 2, 3);
    const source2 = [1, 2, 3];
    const source3 = new Promise<number>(d => d(1));

    let result: Observable<number> = of(source1, source2, source3)
      .pipe(mergeAll());
    /* tslint:enable:no-unused-variable */
  });

  type(() => {
    /* tslint:disable:no-unused-variable */
    const source1 = of(1, 2, 3);
    const source2 = [1, 2, 3];
    const source3 = new Promise<number>(d => d(1));

    let result: Observable<number> = of(source1, source2, source3)
      .pipe(mergeAll());
    /* tslint:enable:no-unused-variable */
  });

  type(() => {
    // coerce type to a specific type
    /* tslint:disable:no-unused-variable */
    const source1 = of(1, 2, 3);
    const source2 = [1, 2, 3];
    const source3 = new Promise<number>(d => d(1));

    let result: Observable<string> = of(<any>source1, <any>source2, <any>source3)
      .pipe(mergeAll<string>());
    /* tslint:enable:no-unused-variable */
  });

  type(() => {
    // coerce type to a specific type
    /* tslint:disable:no-unused-variable */
    const source1 = of(1, 2, 3);
    const source2 = [1, 2, 3];
    const source3 = new Promise<number>(d => d(1));

    let result: Observable<string> = of(<any>source1, <any>source2, <any>source3)
      .pipe(mergeAll<string>());
    /* tslint:enable:no-unused-variable */
  });
});
