import { expect } from 'chai';
import { queueScheduler, of, Observable } from 'rxjs';
import { combineAll, mergeMap } from 'rxjs/operators';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';

declare function asDiagram(arg: string): Function;
declare const type: Function;

/** @test {combineAll} */
describe('combineAll operator', () => {
  asDiagram('combineAll')('should combine events from two observables', () => {
    const x =    cold(               '-a-----b---|');
    const y =    cold(               '--1-2-|     ');
    const outer = hot('-x----y--------|           ', { x: x, y: y });
    const expected =  '-----------------A-B--C---|';

    const result = outer.pipe(combineAll((a, b) => String(a) + String(b)));

    expectObservable(result).toBe(expected, { A: 'a1', B: 'a2', C: 'b2' });
  });

  it('should work with two nevers', () => {
    const e1 = cold( '-');
    const e1subs =   '^';
    const e2 = cold( '-');
    const e2subs =   '^';
    const expected = '-';

    const result = of(e1, e2).pipe(combineAll((x, y) => x + y));

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

    const result = of(e1, e2).pipe(combineAll((x, y) => x + y));

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

    const result = of(e1, e2).pipe(combineAll((x, y) => x + y));

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

    const result = of(e1, e2).pipe(combineAll((x, y) => x + y));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with hot-empty and hot-single', () => {
    const e1 =        hot('-a-^-|');
    const e1subs =           '^ !';
    const e2 =        hot('-b-^-c-|');
    const e2subs =           '^   !';
    const expected =         '----|';

    const result = of(e1, e2).pipe(combineAll((x, y) => x + y));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with hot-single and hot-empty', () => {
    const e1 =        hot('-a-^-|');
    const e1subs =           '^ !';
    const e2 =        hot('-b-^-c-|');
    const e2subs =           '^   !';
    const expected =         '----|';

    const result = of(e2, e1).pipe(combineAll((x, y) => x + y));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with hot-single and never', () => {
    const e1 =        hot('-a-^-|');
    const e1subs =           '^ !';
    const e2 =        hot('------'); //never
    const e2subs =           '^  ';
    const expected =         '-'; //never

    const result = of(e1, e2).pipe(combineAll((x, y) => x + y));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with never and hot-single', () => {
    const e1 =        hot('--------'); //never
    const e1subs =           '^    ';
    const e2 =        hot('-a-^-b-|');
    const e2subs =           '^   !';
    const expected =         '-----'; //never

    const result = of(e1, e2).pipe(combineAll((x, y) => x + y));

    expectObservable(result).toBe(expected);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with hot and hot', () => {
    const e1 =   hot('--a--^--b--c--|');
    const e1subs =        '^        !';
    const e2 =   hot('---e-^---f--g--|');
    const e2subs =        '^         !';
    const expected =      '----x-yz--|';

    const result = of(e1, e2).pipe(combineAll((x, y) => x + y));

    expectObservable(result).toBe(expected, { x: 'bf', y: 'cf', z: 'cg' });
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

    const result = of(e1, e2).pipe(combineAll((x, y) => x + y));

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

    const result = of(e1, e2).pipe(
      mergeMap((x) => of(x)),
      combineAll((x, y) => x + y),
      mergeMap((x) => of(x))
    );

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should combine 3 observables', () => {
    const e1 =   hot('--a--^--b--c--|');
    const e1subs =        '^        !';
    const e2 =   hot('---e-^---f--g--|');
    const e2subs =        '^         !';
    const e3 =   hot('---h-^----i--j-|');
    const e3subs =        '^         !';
    const expected =      '-----wxyz-|';

    const result = of(e1, e2, e3).pipe(combineAll((x, y, z) => x + y + z));

    expectObservable(result).toBe(expected, { w: 'bfi', x: 'cfi', y: 'cgi', z: 'cgj' });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should work with empty and error', () => {
    const e1 =   hot('----------|'); //empty
    const e1subs =   '^     !';
    const e2 =   hot('------#', undefined, 'shazbot!'); //error
    const e2subs =   '^     !';
    const expected = '------#';

    const result = of(e1, e2).pipe(combineAll((x, y) => x + y));

    expectObservable(result).toBe(expected, null, 'shazbot!');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with error and empty', () => {
    const e1 =   hot('--^---#', undefined, 'too bad, honk'); //error
    const e1subs =     '^   !';
    const e2 =   hot('--^--------|'); //empty
    const e2subs =     '^   !';
    const expected =   '----#';

    const result = of(e1, e2).pipe(combineAll((x, y) => x + y));

    expectObservable(result).toBe(expected, null, 'too bad, honk');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with hot and throw', () => {
    const e1 =    hot('-a-^--b--c--|');
    const e1subs =       '^ !';
    const e2 =    hot('---^-#', undefined, 'bazinga');
    const e2subs =       '^ !';
    const expected =     '--#';

    const result = of(e1, e2).pipe(combineAll((x, y) => x + y));

    expectObservable(result).toBe(expected, null, 'bazinga');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with throw and hot', () => {
    const e1 =    hot('---^-#', undefined, 'bazinga');
    const e1subs =       '^ !';
    const e2 =    hot('-a-^--b--c--|');
    const e2subs =       '^ !';
    const expected =     '--#';

    const result = of(e1, e2).pipe(combineAll((x, y) => x + y));

    expectObservable(result).toBe(expected, null, 'bazinga');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with throw and throw', () => {
    const e1 =    hot('---^----#', undefined, 'jenga');
    const e1subs =       '^ !';
    const e2 =    hot('---^-#', undefined, 'bazinga');
    const e2subs =       '^ !';
    const expected =     '--#';

    const result = of(e1, e2).pipe(combineAll((x, y) => x + y));

    expectObservable(result).toBe(expected, null, 'bazinga');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with error and throw', () => {
    const e1 =    hot('-a-^--b--#', undefined, 'wokka wokka');
    const e1subs =       '^ !';
    const e2 =    hot('---^-#', undefined, 'flurp');
    const e2subs =       '^ !';
    const expected =     '--#';

    const result = of(e1, e2).pipe(combineAll((x, y) => x + y));

    expectObservable(result).toBe(expected, null, 'flurp');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with throw and error', () => {
    const e1 =    hot('---^-#', undefined, 'flurp');
    const e1subs =       '^ !';
    const e2 =    hot('-a-^--b--#', undefined, 'wokka wokka');
    const e2subs =       '^ !';
    const expected =     '--#';

    const result = of(e1, e2).pipe(combineAll((x, y) => x + y));

    expectObservable(result).toBe(expected, null, 'flurp');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with never and throw', () => {
    const e1 =    hot('---^-----------');
    const e1subs =       '^     !';
    const e2 =    hot('---^-----#', undefined, 'wokka wokka');
    const e2subs =       '^     !';
    const expected =     '------#';

    const result = of(e1, e2).pipe(combineAll((x, y) => x + y));

    expectObservable(result).toBe(expected, null, 'wokka wokka');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with throw and never', () => {
    const e1 =    hot('---^----#', undefined, 'wokka wokka');
    const e1subs =       '^    !';
    const e2 =    hot('---^-----------');
    const e2subs =       '^    !';
    const expected =     '-----#';

    const result = of(e1, e2).pipe(combineAll((x, y) => x + y));

    expectObservable(result).toBe(expected, null, 'wokka wokka');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with some and throw', () => {
    const e1 =    hot('---^----a---b--|');
    const e1subs =       '^  !';
    const e2 =    hot('---^--#', undefined, 'wokka wokka');
    const e2subs =       '^  !';
    const expected =     '---#';

    const result = of(e1, e2).pipe(combineAll((x, y) => x + y));

    expectObservable(result).toBe(expected, { a: 1, b: 2}, 'wokka wokka');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should work with throw and some', () => {
    const e1 =    hot('---^--#', undefined, 'wokka wokka');
    const e1subs =       '^  !';
    const e2 =    hot('---^----a---b--|');
    const e2subs =       '^  !';
    const expected =     '---#';

    const result = of(e1, e2).pipe(combineAll((x, y) => x + y));

    expectObservable(result).toBe(expected, null, 'wokka wokka');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should handle throw after complete left', () => {
    const left =  hot('--a--^--b---|');
    const leftSubs =       '^      !';
    const right = hot('-----^--------#', undefined, 'bad things');
    const rightSubs =      '^        !';
    const expected =       '---------#';

    const result = of(left, right).pipe(combineAll((x, y) => x + y));

    expectObservable(result).toBe(expected, null, 'bad things');
    expectSubscriptions(left.subscriptions).toBe(leftSubs);
    expectSubscriptions(right.subscriptions).toBe(rightSubs);
  });

  it('should handle throw after complete right', () => {
    const left =   hot('-----^--------#', undefined, 'bad things');
    const leftSubs =        '^        !';
    const right =  hot('--a--^--b---|');
    const rightSubs =       '^      !';
    const expected =        '---------#';

    const result = of(left, right).pipe(combineAll((x, y) => x + y));

    expectObservable(result).toBe(expected, null, 'bad things');
    expectSubscriptions(left.subscriptions).toBe(leftSubs);
    expectSubscriptions(right.subscriptions).toBe(rightSubs);
  });

  it('should handle interleaved with tail', () => {
    const e1 = hot('-a--^--b---c---|');
    const e1subs =     '^          !';
    const e2 = hot('--d-^----e---f--|');
    const e2subs =     '^           !';
    const expected =   '-----x-y-z--|';

    const result = of(e1, e2).pipe(combineAll((x, y) => x + y));

    expectObservable(result).toBe(expected, { x: 'be', y: 'ce', z: 'cf' });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should handle two consecutive hot observables', () => {
    const e1 = hot('--a--^--b--c--|');
    const e1subs =      '^        !';
    const e2 = hot('-----^----------d--e--f--|');
    const e2subs =      '^                   !';
    const expected =    '-----------x--y--z--|';

    const result = of(e1, e2).pipe(combineAll((x, y) => x + y));

    expectObservable(result).toBe(expected, { x: 'cd', y: 'ce', z: 'cf' });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should handle two consecutive hot observables with error left', () => {
    const left =  hot('--a--^--b--c--#', undefined, 'jenga');
    const leftSubs =       '^        !';
    const right = hot('-----^----------d--e--f--|');
    const rightSubs =      '^        !';
    const expected =       '---------#';

    const result = of(left, right).pipe(combineAll((x, y) => x + y));

    expectObservable(result).toBe(expected, null, 'jenga');
    expectSubscriptions(left.subscriptions).toBe(leftSubs);
    expectSubscriptions(right.subscriptions).toBe(rightSubs);
  });

  it('should handle two consecutive hot observables with error right', () => {
    const left =  hot('--a--^--b--c--|');
    const leftSubs =       '^        !';
    const right = hot('-----^----------d--e--f--#', undefined, 'dun dun dun');
    const rightSubs =      '^                   !';
    const expected =       '-----------x--y--z--#';

    const result = of(left, right).pipe(combineAll((x, y) => x + y));

    expectObservable(result).toBe(expected, { x: 'cd', y: 'ce', z: 'cf' }, 'dun dun dun');
    expectSubscriptions(left.subscriptions).toBe(leftSubs);
    expectSubscriptions(right.subscriptions).toBe(rightSubs);
  });

  it('should handle selector throwing', () => {
    const e1 = hot('--a--^--b--|');
    const e1subs =      '^  !';
    const e2 = hot('--c--^--d--|');
    const e2subs =      '^  !';
    const expected =    '---#';

    const result = of(e1, e2).pipe(combineAll((x, y) => { throw 'ha ha ' + x + ', ' + y; }));

    expectObservable(result).toBe(expected, null, 'ha ha b, d');
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should combine two observables', (done) => {
    const a = of(1, 2, 3);
    const b = of(4, 5, 6, 7, 8);
    const expected = [[3, 4], [3, 5], [3, 6], [3, 7], [3, 8]];
    of(a, b).pipe(combineAll()).subscribe((vals) => {
      expect(vals).to.deep.equal(expected.shift());
    }, null, () => {
      expect(expected.length).to.equal(0);
      done();
    });
  });

  it('should combine two immediately-scheduled observables', (done) => {
    const a = of<number>(1, 2, 3, queueScheduler);
    const b = of<number>(4, 5, 6, 7, 8, queueScheduler);
    const r = [[1, 4], [2, 4], [2, 5], [3, 5], [3, 6], [3, 7], [3, 8]];

    of(a, b, queueScheduler).pipe(combineAll())
      .subscribe((vals) => {
        expect(vals).to.deep.equal(r.shift());
    }, null, () => {
      expect(r.length).to.equal(0);
      done();
    });
  });

  type(() => {
    /* tslint:disable:no-unused-variable */
    const source1 = of(1, 2, 3);
    const source2 = [1, 2, 3];
    const source3 = new Promise<number>(d => d(1));

    let result: Observable<number[]> = of(source1, source2, source3).pipe(combineAll());
    /* tslint:enable:no-unused-variable */
  });

  type(() => {
    /* tslint:disable:no-unused-variable */
    const source1 = of(1, 2, 3);
    const source2 = [1, 2, 3];
    const source3 = new Promise<number>(d => d(1));

    let result: Observable<number> = of(source1, source2, source3).pipe(
      combineAll((...args) => args.reduce((acc, x) => acc + x, 0))
    );
    /* tslint:enable:no-unused-variable */
  });

  type(() => {
    /* tslint:disable:no-unused-variable */
    const source1 = of(1, 2, 3);
    const source2 = [1, 2, 3];
    const source3 = new Promise<number>(d => d(1));

    let result: Observable<number[]> = of(source1, source2, source3).pipe(
      combineAll()
    );
    /* tslint:enable:no-unused-variable */
  });

  type(() => {
    /* tslint:disable:no-unused-variable */
    const source1 = of(1, 2, 3);
    const source2 = [1, 2, 3];
    const source3 = new Promise<number>(d => d(1));

    let result: Observable<number> = of(source1, source2, source3).pipe(
      combineAll((...args) => args.reduce((acc, x) => acc + x, 0))
    );
    /* tslint:enable:no-unused-variable */
  });

  type(() => {
    // coerce type to a specific type
    /* tslint:disable:no-unused-variable */
    const source1 = of(1, 2, 3);
    const source2 = [1, 2, 3];
    const source3 = new Promise<number>(d => d(1));

    let result: Observable<string[]> = of(<any>source1, <any>source2, <any>source3).pipe(
      combineAll<string>()
    );
    /* tslint:enable:no-unused-variable */
  });

  type(() => {
    // coerce type to a specific type
    /* tslint:disable:no-unused-variable */
    const source1 = of(1, 2, 3);
    const source2 = [1, 2, 3];
    const source3 = new Promise<number>(d => d(1));

    let result: Observable<string> = of(<any>source1, <any>source2, <any>source3).pipe(
      combineAll<string>((...args) => args.reduce((acc, x) => acc + x, 0))
    );
    /* tslint:enable:no-unused-variable */
  });

  type(() => {
    // coerce type to a specific type
    /* tslint:disable:no-unused-variable */
    const source1 = of(1, 2, 3);
    const source2 = [1, 2, 3];
    const source3 = new Promise<number>(d => d(1));

    let result: Observable<string[]> = of(<any>source1, <any>source2, <any>source3).pipe(
      combineAll<string>()
    );
    /* tslint:enable:no-unused-variable */
  });

  type(() => {
    // coerce type to a specific type
    /* tslint:disable:no-unused-variable */
    const source1 = of(1, 2, 3);
    const source2 = [1, 2, 3];
    const source3 = new Promise<number>(d => d(1));

    let result: Observable<string> = of(<any>source1, <any>source2, <any>source3).pipe(
      combineAll<string>((...args) => args.reduce((acc, x) => acc + x, 0))
    );
    /* tslint:enable:no-unused-variable */
  });
});
