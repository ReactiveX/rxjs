import { of } from 'rxjs';
import { combineLatest, mergeMap, distinct, count } from 'rxjs/operators';
import { hot, cold, expectObservable, expectSubscriptions } from '../helpers/marble-testing';

declare function asDiagram(arg: string): Function;

/** @test {combineLatest} */
describe('combineLatest operator', () => {
  asDiagram('combineLatest')('should combine events from two cold observables', () => {
    const e1 =   cold('-a--b-----c-d-e-|');
    const e2 =   cold('--1--2-3-4---|   ');
    const expected = '--A-BC-D-EF-G-H-|';

    const result = e1.pipe(combineLatest(e2, (a, b) => String(a) + String(b)));

    expectObservable(result).toBe(expected, {
      A: 'a1', B: 'b1', C: 'b2', D: 'b3', E: 'b4', F: 'c4', G: 'd4', H: 'e4'
    });
  });

  it('should work with two nevers', () => {
    const e1 = cold( '-');
    const e1subs =   '^';
    const e2 = cold( '-');
    const e2subs =   '^';
    const expected = '-';

    const result = e1.pipe(combineLatest(e2, (x, y) => x + y));

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

    const result = e1.pipe(combineLatest(e2, (x, y) => x + y));

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

    const result = e1.pipe(combineLatest(e2, (x, y) => x + y));

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

    const result = e1.pipe(combineLatest(e2, (x, y) => x + y));

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

    const result = e1.pipe(combineLatest(e2, (x, y) => x + y));

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

    const result = e2.pipe(combineLatest(e1, (x, y) => x + y));

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

    const result = e1.pipe(combineLatest(e2, (x, y) => x + y));

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

    const result = e1.pipe(combineLatest(e2, (x, y) => x + y));

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

    const result = e1.pipe(combineLatest(e2, (x, y) => x + y));

    expectObservable(result).toBe(expected, { x: 'bf', y: 'cf', z: 'cg' });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should accept array of observables', () => {
    const e1 =   hot('--a--^--b--c--|');
    const e1subs =        '^        !';
    const e2 =   hot('---e-^---f--g--|');
    const e2subs =        '^         !';
    const e3 =   hot('---h-^----i--j-|');
    const e3subs =        '^         !';
    const expected =      '-----wxyz-|';

    const result = e1.pipe(combineLatest([e2, e3], (x: string, y: string, z: string) => x + y + z));

    expectObservable(result).toBe(expected, { w: 'bfi', x: 'cfi', y: 'cgi', z: 'cgj' });
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
    expectSubscriptions(e3.subscriptions).toBe(e3subs);
  });

  it('should work with empty and error', () => {
    const e1 =   hot('----------|'); //empty
    const e1subs =   '^     !';
    const e2 =   hot('------#', null, 'shazbot!'); //error
    const e2subs =   '^     !';
    const expected = '------#';

    const result = e1.pipe(combineLatest(e2, (x, y) => x + y));

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

    const result = e1.pipe(combineLatest(e2, (x, y) => x + y));

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

    const result = e1.pipe(combineLatest(e2, (x, y) => x + y));

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

    const result = e1.pipe(combineLatest(e2, (x, y) => x + y));

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

    const result = e1.pipe(combineLatest(e2, (x, y) => x + y));

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

    const result = e1.pipe(combineLatest(e2, (x, y) => x + y));

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

    const result = e1.pipe(combineLatest(e2, (x, y) => x + y));

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

    const result = e1.pipe(combineLatest(e2, (x, y) => x + y));

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

    const result = e1.pipe(combineLatest(e2, (x, y) => x + y));

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

    const result = e1.pipe(combineLatest(e2, (x, y) => x + y));

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

    const result = e1.pipe(combineLatest(e2, (x, y) => x + y));

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

    const result = left.pipe(combineLatest(right, (x, y) => x + y));

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

    const result = left.pipe(combineLatest(right, (x, y) => x + y));

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

    const result = e1.pipe(combineLatest(e2, (x, y) => x + y));

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

    const result = e1.pipe(combineLatest(e2, (x, y) => x + y));

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

    const result = left.pipe(combineLatest(right, (x, y) => x + y));

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

    const result = left.pipe(combineLatest(right, (x, y) => x + y));

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

    const result = e1.pipe(combineLatest(e2, (x, y) => { throw 'ha ha ' + x + ', ' + y; }));

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

    const result = e1.pipe(combineLatest(e2, (x, y) => x + y));

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

    const result = e1.pipe(
      mergeMap((x) => of(x)),
      combineLatest(e2, (x, y) => x + y),
      mergeMap((x) => of(x))
    );

    expectObservable(result, unsub).toBe(expected, values);
    expectSubscriptions(e1.subscriptions).toBe(e1subs);
    expectSubscriptions(e2.subscriptions).toBe(e2subs);
  });

  it('should emit unique array instances with the default projection', () => {
    const e1 =   hot('-a--b--|');
    const e2 =   hot('--1--2-|');
    const expected = '-------(c|)';

    const result = e1.pipe(
      combineLatest(e2),
      distinct(),
      count()
    );

    expectObservable(result).toBe(expected, { c: 3 });
  });
});
