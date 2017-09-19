import { expect } from 'chai';
import * as Rx from '../../dist/package/Rx';
import marbleTestingSignature = require('../helpers/marble-testing'); // tslint:disable-line:no-require-imports

declare const { type };
declare const hot: typeof marbleTestingSignature.hot;
declare const cold: typeof marbleTestingSignature.cold;
declare const expectObservable: typeof marbleTestingSignature.expectObservable;
declare const expectSubscriptions: typeof marbleTestingSignature.expectSubscriptions;

const Observable = Rx.Observable;
const queueScheduler = Rx.Scheduler.queue;

/** @test {combineLatest} */
describe('Observable.combineLatest', () => {
  it('should combineLatest the provided observables', () => {
    const firstSource =  hot('----a----b----c----|');
    const secondSource = hot('--d--e--f--g--|');
    const expected =         '----uv--wx-y--z----|';

    const combined = Observable.combineLatest(firstSource, secondSource,
      (a: any, b: any) => '' + a + b);

    expectObservable(combined).toBe(expected, {u: 'ad', v: 'ae', w: 'af', x: 'bf', y: 'bg', z: 'cg'});
  });

  it('should combine an immediately-scheduled source with an immediately-scheduled second', (done: MochaDone) => {
    const a = Observable.of<number>(1, 2, 3, queueScheduler);
    const b = Observable.of<number>(4, 5, 6, 7, 8, queueScheduler);
    const r = [[1, 4], [2, 4], [2, 5], [3, 5], [3, 6], [3, 7], [3, 8]];

    //type definition need to be updated
    Observable.combineLatest(a, b, queueScheduler).subscribe((vals: any) => {
      expect(vals).to.deep.equal(r.shift());
    }, (x) => {
      done(new Error('should not be called'));
    }, () => {
      expect(r.length).to.equal(0);
      done();
    });
  });

  it('should accept array of observables', () => {
    const firstSource =  hot('----a----b----c----|');
    const secondSource = hot('--d--e--f--g--|');
    const expected =         '----uv--wx-y--z----|';

    const combined = Observable.combineLatest([firstSource, secondSource],
      (a: any, b: any) => '' + a + b);

    expectObservable(combined).toBe(expected, {u: 'ad', v: 'ae', w: 'af', x: 'bf', y: 'bg', z: 'cg'});
  });

  it('should work with two nevers', () => {
    const e1 = cold( '-');
    const e1subs =   '^';
    const e2 = cold( '-');
    const e2subs =   '^';
    const expected = '-';

    const result = Observable.combineLatest(e1, e2, (x: any, y: any) => x + y);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with never and empty', () => {
    const e1 = cold( '-');
    const e1subs =   '^';
    const e2 = cold( '|');
    const e2subs =   '(^!)';
    const expected = '-';

    const result = Observable.combineLatest(e1, e2, (x: any, y: any) => x + y);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with empty and never', () => {
    const e1 = cold( '|');
    const e1subs =   '(^!)';
    const e2 = cold( '-');
    const e2subs =   '^';
    const expected = '-';

    const result = Observable.combineLatest(e1, e2, (x: any, y: any) => x + y);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with empty and empty', () => {
    const e1 = cold('|');
    const e1subs =  '(^!)';
    const e2 = cold('|');
    const e2subs =  '(^!)';
    const expected = '|';

    const result = Observable.combineLatest(e1, e2, (x: any, y: any) => x + y);

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with hot-empty and hot-single', () => {
    const values = {
      a: 1,
      b: 2,
      c: 3,
      r: 1 + 3 //a + c
    };
    const e1 =        hot('-a-^-|', values);
    const e1subs =           '^ !';
    const e2 =        hot('-b-^-c-|', values);
    const e2subs =           '^   !';
    const expected =         '----|';

    const result = Observable.combineLatest(e1, e2, (x: any, y: any) => x + y);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with hot-single and hot-empty', () => {
    const values = {
      a: 1, b: 2, c: 3
    };
    const e1 =        hot('-a-^-|', values);
    const e1subs =           '^ !';
    const e2 =        hot('-b-^-c-|', values);
    const e2subs =           '^   !';
    const expected =         '----|';

    const result = Observable.combineLatest(e2, e1, (x: any, y: any) => x + y);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with hot-single and never', () => {
    const values = {
      a: 1
    };
    const e1 =        hot('-a-^-|', values);
    const e1subs =           '^ !';
    const e2 =        hot('------', values); //never
    const e2subs =           '^  ';
    const expected =         '-'; //never

    const result = Observable.combineLatest(e1, e2, (x: any, y: any) => x + y);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with never and hot-single', () => {
    const values = {
      a: 1, b: 2
    };
    const e1 =        hot('--------', values); //never
    const e1subs =           '^    ';
    const e2 =        hot('-a-^-b-|', values);
    const e2subs =           '^   !';
    const expected =         '-----'; //never

    const result = Observable.combineLatest(e1, e2, (x: any, y: any) => x + y);

    expectObservable(result).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with hot and hot', () => {
    const e1 =   hot('--a--^--b--c--|', { a: 'a', b: 'b', c: 'c' });
    const e1subs =        '^        !';
    const e2 =   hot('---e-^---f--g--|', { e: 'e', f: 'f', g: 'g' });
    const e2subs =        '^         !';
    const expected =      '----x-yz--|';

    const result = Observable.combineLatest(e1, e2, (x: any, y: any) => x + y);

    expectObservable(result).toBe(expected, { x: 'bf', y: 'cf', z: 'cg' });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with empty and error', () => {
    const e1 =   hot('----------|'); //empty
    const e1subs =   '^     !';
    const e2 =   hot('------#', null, 'shazbot!'); //error
    const e2subs =   '^     !';
    const expected = '------#';

    const result = Observable.combineLatest(e1, e2, (x: any, y: any) => x + y);

    expectObservable(result).toBe(expected, null, 'shazbot!');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with error and empty', () => {
    const e1 =   hot('--^---#', null, 'too bad, honk'); //error
    const e1subs =     '^   !';
    const e2 =   hot('--^--------|'); //empty
    const e2subs =     '^   !';
    const expected =   '----#';

    const result = Observable.combineLatest(e1, e2, (x: any, y: any) => x + y);

    expectObservable(result).toBe(expected, null, 'too bad, honk');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with hot and throw', () => {
    const e1 =    hot('-a-^--b--c--|', { a: 1, b: 2, c: 3});
    const e1subs =       '^ !';
    const e2 =    hot('---^-#', null, 'bazinga');
    const e2subs =       '^ !';
    const expected =     '--#';

    const result = Observable.combineLatest(e1, e2, (x: any, y: any) => x + y);

    expectObservable(result).toBe(expected, null, 'bazinga');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with throw and hot', () => {
    const e1 =    hot('---^-#', null, 'bazinga');
    const e1subs =       '^ !';
    const e2 =    hot('-a-^--b--c--|', { a: 1, b: 2, c: 3});
    const e2subs =       '^ !';
    const expected =     '--#';

    const result = Observable.combineLatest(e1, e2, (x: any, y: any) => x + y);

    expectObservable(result).toBe(expected, null, 'bazinga');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with throw and throw', () => {
    const e1 =    hot('---^----#', null, 'jenga');
    const e1subs =       '^ !';
    const e2 =    hot('---^-#', null, 'bazinga');
    const e2subs =       '^ !';
    const expected =     '--#';

    const result = Observable.combineLatest(e1, e2, (x: any, y: any) => x + y);

    expectObservable(result).toBe(expected, null, 'bazinga');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with error and throw', () => {
    const e1 =    hot('-a-^--b--#', { a: 1, b: 2 }, 'wokka wokka');
    const e1subs =       '^ !';
    const e2 =    hot('---^-#', null, 'flurp');
    const e2subs =       '^ !';
    const expected =     '--#';

    const result = Observable.combineLatest(e1, e2, (x: any, y: any) => x + y);

    expectObservable(result).toBe(expected, null, 'flurp');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with throw and error', () => {
    const e1 =    hot('---^-#', null, 'flurp');
    const e1subs =       '^ !';
    const e2 =    hot('-a-^--b--#', { a: 1, b: 2 }, 'wokka wokka');
    const e2subs =       '^ !';
    const expected =     '--#';

    const result = Observable.combineLatest(e1, e2, (x: any, y: any) => x + y);

    expectObservable(result).toBe(expected, null, 'flurp');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with never and throw', () => {
    const e1 =    hot('---^-----------');
    const e1subs =       '^     !';
    const e2 =    hot('---^-----#', null, 'wokka wokka');
    const e2subs =       '^     !';
    const expected =     '------#';

    const result = Observable.combineLatest(e1, e2, (x: any, y: any) => x + y);

    expectObservable(result).toBe(expected, null, 'wokka wokka');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with throw and never', () => {
    const e1 =    hot('---^----#', null, 'wokka wokka');
    const e1subs =       '^    !';
    const e2 =    hot('---^-----------');
    const e2subs =       '^    !';
    const expected =     '-----#';

    const result = Observable.combineLatest(e1, e2, (x: any, y: any) => x + y);

    expectObservable(result).toBe(expected, null, 'wokka wokka');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with some and throw', () => {
    const e1 =    hot('---^----a---b--|', { a: 1, b: 2 });
    const e1subs =       '^  !';
    const e2 =    hot('---^--#', null, 'wokka wokka');
    const e2subs =       '^  !';
    const expected =     '---#';

    const result = Observable.combineLatest(e1, e2, (x: any, y: any) => x + y);

    expectObservable(result).toBe(expected, { a: 1, b: 2}, 'wokka wokka');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with throw and some', () => {
    const e1 =    hot('---^--#', null, 'wokka wokka');
    const e1subs =       '^  !';
    const e2 =    hot('---^----a---b--|', { a: 1, b: 2 });
    const e2subs =       '^  !';
    const expected =     '---#';

    const result = Observable.combineLatest(e1, e2, (x: any, y: any) => x + y);

    expectObservable(result).toBe(expected, { a: 1, b: 2}, 'wokka wokka');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should handle throw after complete left', () => {
    const left =  hot('--a--^--b---|', { a: 1, b: 2 });
    const leftSubs =       '^      !';
    const right = hot('-----^--------#', null, 'bad things');
    const rightSubs =      '^        !';
    const expected =       '---------#';

    const result = Observable.combineLatest(left, right, (x: any, y: any) => x + y);

    expectObservable(result).toBe(expected, null, 'bad things');
    expectSubscriptions(left.subscriptions).toBe(leftSubs);
    expectSubscriptions(right.subscriptions).toBe(rightSubs);
  });

  it('should handle throw after complete right', () => {
    const left =   hot('-----^--------#', null, 'bad things');
    const leftSubs =        '^        !';
    const right =  hot('--a--^--b---|', { a: 1, b: 2 });
    const rightSubs =       '^      !';
    const expected =        '---------#';

    const result = Observable.combineLatest(left, right, (x: any, y: any) => x + y);

    expectObservable(result).toBe(expected, null, 'bad things');
    expectSubscriptions(left.subscriptions).toBe(leftSubs);
    expectSubscriptions(right.subscriptions).toBe(rightSubs);
  });

  it('should handle interleaved with tail', () => {
    const e1 = hot('-a--^--b---c---|', { a: 'a', b: 'b', c: 'c' });
    const e1subs =     '^          !';
    const e2 = hot('--d-^----e---f--|', { d: 'd', e: 'e', f: 'f'});
    const e2subs =     '^           !';
    const expected =   '-----x-y-z--|';

    const result = Observable.combineLatest(e1, e2, (x: any, y: any) => x + y);

    expectObservable(result).toBe(expected, { x: 'be', y: 'ce', z: 'cf' });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should handle two consecutive hot observables', () => {
    const e1 = hot('--a--^--b--c--|', { a: 'a', b: 'b', c: 'c' });
    const e1subs =      '^        !';
    const e2 = hot('-----^----------d--e--f--|', { d: 'd', e: 'e', f: 'f' });
    const e2subs =      '^                   !';
    const expected =    '-----------x--y--z--|';

    const result = Observable.combineLatest(e1, e2, (x: any, y: any) => x + y);

    expectObservable(result).toBe(expected, { x: 'cd', y: 'ce', z: 'cf' });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should handle two consecutive hot observables with error left', () => {
    const left =  hot('--a--^--b--c--#', { a: 'a', b: 'b', c: 'c' }, 'jenga');
    const leftSubs =       '^        !';
    const right = hot('-----^----------d--e--f--|', { d: 'd', e: 'e', f: 'f' });
    const rightSubs =      '^        !';
    const expected =       '---------#';

    const result = Observable.combineLatest(left, right, (x: any, y: any) => x + y);

    expectObservable(result).toBe(expected, null, 'jenga');
    expectSubscriptions(left.subscriptions).toBe(leftSubs);
    expectSubscriptions(right.subscriptions).toBe(rightSubs);
  });

  it('should handle two consecutive hot observables with error right', () => {
    const left =  hot('--a--^--b--c--|', { a: 'a', b: 'b', c: 'c' });
    const leftSubs =       '^        !';
    const right = hot('-----^----------d--e--f--#', { d: 'd', e: 'e', f: 'f' }, 'dun dun dun');
    const rightSubs =      '^                   !';
    const expected =       '-----------x--y--z--#';

    const result = Observable.combineLatest(left, right, (x: any, y: any) => x + y);

    expectObservable(result).toBe(expected, { x: 'cd', y: 'ce', z: 'cf' }, 'dun dun dun');
    expectSubscriptions(left.subscriptions).toBe(leftSubs);
    expectSubscriptions(right.subscriptions).toBe(rightSubs);
  });

  it('should handle selector throwing', () => {
    const e1 = hot('--a--^--b--|', { a: 1, b: 2});
    const e1subs =      '^  !';
    const e2 = hot('--c--^--d--|', { c: 3, d: 4});
    const e2subs =      '^  !';
    const expected =    '---#';

    const result = Observable.combineLatest(e1, e2, (x: any, y: any) => { throw 'ha ha ' + x + ', ' + y; });

    expectObservable(result).toBe(expected, null, 'ha ha 2, 4');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should allow unsubscribing early and explicitly', () => {
    const e1 =   hot('--a--^--b--c---d-| ');
    const e1subs =        '^        !    ';
    const e2 =   hot('---e-^---f--g---h-|');
    const e2subs =        '^        !    ';
    const expected =      '----x-yz--    ';
    const unsub =         '         !    ';
    const values = { x: 'bf', y: 'cf', z: 'cg' };

    const result = Observable.combineLatest(e1, e2, (x: any, y: any) => x + y);

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should not break unsubscription chains when unsubscribed explicitly', () => {
    const e1 =   hot('--a--^--b--c---d-| ');
    const e1subs =        '^        !    ';
    const e2 =   hot('---e-^---f--g---h-|');
    const e2subs =        '^        !    ';
    const expected =      '----x-yz--    ';
    const unsub =         '         !    ';
    const values = { x: 'bf', y: 'cf', z: 'cg' };

    const result = Observable.combineLatest(
        e1.mergeMap((x: string) => Observable.of(x)),
        e2.mergeMap((x: string) => Observable.of(x)),
        (x: any, y: any) => x + y
    ).mergeMap((x: any) => Observable.of(x));

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should support promises', () => {
    type(() => {
      /* tslint:disable:no-unused-variable */
      let a: Promise<number>;
      let b: Promise<string>;
      let c: Promise<boolean>;
      let o1: Rx.Observable<[number, string, boolean]> = Observable.combineLatest(a, b, c);
      let o2: Rx.Observable<boolean> = Observable.combineLatest(a, b, c, (aa, bb, cc) => !!aa && !!bb && cc);
      /* tslint:enable:no-unused-variable */
    });
  });

  it('should support observables', () => {
    type(() => {
      /* tslint:disable:no-unused-variable */
      let a: Rx.Observable<number>;
      let b: Rx.Observable<string>;
      let c: Rx.Observable<boolean>;
      let o1: Rx.Observable<[number, string, boolean]> = Observable.combineLatest(a, b, c);
      let o2: Rx.Observable<boolean> = Observable.combineLatest(a, b, c, (aa, bb, cc) => !!aa && !!bb && cc);
      /* tslint:enable:no-unused-variable */
    });
  });

  it('should support mixed observables and promises', () => {
    type(() => {
      /* tslint:disable:no-unused-variable */
      let a: Promise<number>;
      let b: Rx.Observable<string>;
      let c: Promise<boolean>;
      let d: Rx.Observable<string[]>;
      let o1: Rx.Observable<[number, string, boolean, string[]]> = Observable.combineLatest(a, b, c, d);
      let o2: Rx.Observable<boolean> = Observable.combineLatest(a, b, c, d, (aa, bb, cc, dd) => !!aa && !!bb && cc && !!dd.length);
      /* tslint:enable:no-unused-variable */
    });
  });

  it('should support arrays of promises', () => {
    type(() => {
      /* tslint:disable:no-unused-variable */
      let a: Promise<number>[];
      let o1: Rx.Observable<number[]> = Observable.combineLatest(a);
      let o2: Rx.Observable<number[]> = Observable.combineLatest(...a);
      let o3: Rx.Observable<number> = Observable.combineLatest(a, (...x) => x.length);
      /* tslint:enable:no-unused-variable */
    });
  });

  it('should support arrays of observables', () => {
    type(() => {
      /* tslint:disable:no-unused-variable */
      let a: Rx.Observable<number>[];
      let o1: Rx.Observable<number[]> = Observable.combineLatest(a);
      let o2: Rx.Observable<number[]> = Observable.combineLatest(...a);
      let o3: Rx.Observable<number> = Observable.combineLatest(a, (...x) => x.length);
      /* tslint:enable:no-unused-variable */
    });
  });

  it('should return Array<T> when given a single promise', () => {
    type(() => {
      /* tslint:disable:no-unused-variable */
      let a: Promise<number>;
      let o1: Rx.Observable<number[]> = Observable.combineLatest(a);
      /* tslint:enable:no-unused-variable */
    });
  });

  it('should return Array<T> when given a single observable', () => {
    type(() => {
      /* tslint:disable:no-unused-variable */
      let a: Rx.Observable<number>;
      let o1: Rx.Observable<number[]> = Observable.combineLatest(a);
      /* tslint:enable:no-unused-variable */
    });
  });
});
