// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/observables/combineLatest-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { combineLatest } from 'rxjs/combine-latest';
import { map } from 'rxjs/map';
import { mergeMap } from 'rxjs/merge-map';
describe('combineLatest (platform)', () => {
  it('should combineLatest the provided observables', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const firstSource = hot(' ----a----b----c----|');
      const secondSource = hot('--d--e--f--g--|');
      const expected = '        ----uv--wx-y--z----|';
      const combined = Observable[combineLatest]([firstSource, secondSource], (a, b) => '' + a + b);
      expectObservable(combined).toBe(expected, { u: 'ad', v: 'ae', w: 'af', x: 'bf', y: 'bg', z: 'cg' });
    });
  });
  it('should accept array of observables', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const firstSource = hot(' ----a----b----c----|');
      const secondSource = hot('--d--e--f--g--|');
      const expected = '        ----uv--wx-y--z----|';
      const combined = Observable[combineLatest]([firstSource, secondSource], (a, b) => '' + a + b);
      expectObservable(combined).toBe(expected, { u: 'ad', v: 'ae', w: 'af', x: 'bf', y: 'bg', z: 'cg' });
    });
  });
  it('should accept a dictionary of observables', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const firstSource = hot('----a----b----c----|');
      const secondSource = hot('--d--e--f--g--|');
      const expected = '        ----uv--wx-y--z----|';
      const combined = Observable[combineLatest]({ a: firstSource, b: secondSource })[map](({ a, b }) => '' + a + b);
      expectObservable(combined).toBe(expected, { u: 'ad', v: 'ae', w: 'af', x: 'bf', y: 'bg', z: 'cg' });
    });
  });
  it('should work with two nevers', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -');
      const e1subs = '^!';
      const e2 = observable(' -');
      const e2subs = '^!';
      const expected = '-';
      const result = Observable[combineLatest]([e1, e2], (x, y) => x + y);
      expectObservable(result, '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should work with never and empty', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' -');
      const e1subs = '^!';
      const e2 = observable(' |');
      const e2subs = '  (^!)';
      const expected = '-';
      const result = Observable[combineLatest]([e1, e2], (x, y) => x + y);
      expectObservable(result, '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should work with empty and never', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' |');
      const e1subs = '  (^!)';
      const e2 = observable(' -');
      const e2subs = '^!';
      const expected = '-';
      const result = Observable[combineLatest]([e1, e2], (x, y) => x + y);
      expectObservable(result, '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should work with empty and empty', async () => {
    await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
      const e1 = observable(' |');
      const e1subs = '  (^!)';
      const e2 = observable(' |');
      const e2subs = '  (^!)';
      const expected = '|';
      const result = Observable[combineLatest]([e1, e2], (x, y) => x + y);
      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should work with hot-empty and hot-single', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: 1,
        b: 2,
        c: 3,
        r: 1 + 3, //a + c
      };
      const e1 = hot('-a-^-|', values);
      const e1subs = '   ^-!';
      const e2 = hot('-b-^-c-|', values);
      const e2subs = '   ^---!';
      const expected = ' ----|';
      const result = Observable[combineLatest]([e1, e2], (x, y) => x + y);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should work with hot-single and hot-empty', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: 1,
        b: 2,
        c: 3,
      };
      const e1 = hot('-a-^-|', values);
      const e1subs = '   ^-!';
      const e2 = hot('-b-^-c-|', values);
      const e2subs = '   ^---!';
      const expected = ' ----|';
      const result = Observable[combineLatest]([e2, e1], (x, y) => x + y);
      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should work with hot-single and never', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: 1,
      };
      const e1 = hot('-a-^-|', values);
      const e1subs = '   ^-!';
      const e2 = hot('------', values); //never
      const e2subs = '^--!';
      const expected = ' -'; //never
      const result = Observable[combineLatest]([e1, e2], (x, y) => x + y);
      expectObservable(result, '^--!').toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should work with never and hot-single', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: 1,
        b: 2,
      };
      const e1 = hot('--------', values); //never
      const e1subs = '^----!';
      const e2 = hot('-a-^-b-|', values);
      const e2subs = '   ^---!';
      const expected = ' -----'; //never
      const result = Observable[combineLatest]([e1, e2], (x, y) => x + y);
      expectObservable(result, '^----!').toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should work with hot and hot', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--|', { a: 'a', b: 'b', c: 'c' });
      const e1subs = '     ^--------!';
      const e2 = hot('---e-^---f--g--|', { e: 'e', f: 'f', g: 'g' });
      const e2subs = '     ^---------!';
      const expected = '   ----x-yz--|';
      const result = Observable[combineLatest]([e1, e2], (x, y) => x + y);
      expectObservable(result).toBe(expected, { x: 'bf', y: 'cf', z: 'cg' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should work with empty and error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----------|'); //empty
      const e1subs = '  ^-----!';
      const e2 = hot('  ------#', undefined, 'shazbot!'); //error
      const e2subs = '  ^-----!';
      const expected = '------#';
      const result = Observable[combineLatest]([e1, e2], (x, y) => x + y);
      expectObservable(result).toBe(expected, null, 'shazbot!');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should work with error and empty', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--^---#', undefined, 'too bad, honk'); //error
      const e1subs = '  ^---!';
      const e2 = hot('--^--------|'); //empty
      const e2subs = '  ^---!';
      const expected = '----#';
      const result = Observable[combineLatest]([e1, e2], (x, y) => x + y);
      expectObservable(result).toBe(expected, null, 'too bad, honk');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should work with hot and throw', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-a-^--b--c--|', { a: 1, b: 2, c: 3 });
      const e1subs = '   ^-!';
      const e2 = hot('---^-#', undefined, 'bazinga');
      const e2subs = '   ^-!';
      const expected = ' --#';
      const result = Observable[combineLatest]([e1, e2], (x, y) => x + y);
      expectObservable(result).toBe(expected, null, 'bazinga');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should work with throw and hot', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^-#', undefined, 'bazinga');
      const e1subs = '   ^-!';
      const e2 = hot('-a-^--b--c--|', { a: 1, b: 2, c: 3 });
      const e2subs = '   ^-!';
      const expected = ' --#';
      const result = Observable[combineLatest]([e1, e2], (x, y) => x + y);
      expectObservable(result).toBe(expected, null, 'bazinga');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should work with throw and throw', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^----#', undefined, 'jenga');
      const e1subs = '   ^-!';
      const e2 = hot('---^-#', undefined, 'bazinga');
      const e2subs = '   ^-!';
      const expected = ' --#';
      const result = Observable[combineLatest]([e1, e2], (x, y) => x + y);
      expectObservable(result).toBe(expected, null, 'bazinga');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should work with error and throw', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-a-^--b--#', { a: 1, b: 2 }, 'wokka wokka');
      const e1subs = '   ^-!';
      const e2 = hot('---^-#', undefined, 'flurp');
      const e2subs = '   ^-!';
      const expected = ' --#';
      const result = Observable[combineLatest]([e1, e2], (x, y) => x + y);
      expectObservable(result).toBe(expected, null, 'flurp');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should work with throw and error', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^-#', undefined, 'flurp');
      const e1subs = '   ^-!';
      const e2 = hot('-a-^--b--#', { a: 1, b: 2 }, 'wokka wokka');
      const e2subs = '   ^-!';
      const expected = ' --#';
      const result = Observable[combineLatest]([e1, e2], (x, y) => x + y);
      expectObservable(result).toBe(expected, null, 'flurp');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should work with never and throw', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^-----------');
      const e1subs = '   ^-----!';
      const e2 = hot('---^-----#', undefined, 'wokka wokka');
      const e2subs = '   ^-----!';
      const expected = ' ------#';
      const result = Observable[combineLatest]([e1, e2], (x, y) => x + y);
      expectObservable(result).toBe(expected, null, 'wokka wokka');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should work with throw and never', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^----#', undefined, 'wokka wokka');
      const e1subs = '   ^----!';
      const e2 = hot('---^-----------');
      const e2subs = '   ^----!';
      const expected = ' -----#';
      const result = Observable[combineLatest]([e1, e2], (x, y) => x + y);
      expectObservable(result).toBe(expected, null, 'wokka wokka');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should work with some and throw', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^----a---b--|', { a: 1, b: 2 });
      const e1subs = '   ^--!';
      const e2 = hot('---^--#', undefined, 'wokka wokka');
      const e2subs = '   ^--!';
      const expected = ' ---#';
      const result = Observable[combineLatest]([e1, e2], (x, y) => x + y);
      expectObservable(result).toBe(expected, { a: 1, b: 2 }, 'wokka wokka');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should work with throw and some', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^--#', undefined, 'wokka wokka');
      const e1subs = '   ^--!';
      const e2 = hot('---^----a---b--|', { a: 1, b: 2 });
      const e2subs = '   ^--!';
      const expected = ' ---#';
      const result = Observable[combineLatest]([e1, e2], (x, y) => x + y);
      expectObservable(result).toBe(expected, { a: 1, b: 2 }, 'wokka wokka');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should handle throw after complete left', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const left = hot(' --a--^--b---|', { a: 1, b: 2 });
      const leftSubs = '      ^------!';
      const right = hot('-----^--------#', undefined, 'bad things');
      const rightSubs = '     ^--------!';
      const expected = '      ---------#';
      const result = Observable[combineLatest]([left, right], (x, y) => x + y);
      expectObservable(result).toBe(expected, null, 'bad things');
      expectSubscriptions(left.subscriptions).toBe(leftSubs);
      expectSubscriptions(right.subscriptions).toBe(rightSubs);
    });
  });
  it('should handle throw after complete right', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const left = hot(' -----^--------#', undefined, 'bad things');
      const leftSubs = '      ^--------!';
      const right = hot('--a--^--b---|', { a: 1, b: 2 });
      const rightSubs = '     ^------!';
      const expected = '      ---------#';
      const result = Observable[combineLatest]([left, right], (x, y) => x + y);
      expectObservable(result).toBe(expected, null, 'bad things');
      expectSubscriptions(left.subscriptions).toBe(leftSubs);
      expectSubscriptions(right.subscriptions).toBe(rightSubs);
    });
  });
  it('should handle interleaved with tail', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-a--^--b---c---|', { a: 'a', b: 'b', c: 'c' });
      const e1subs = '    ^----------!';
      const e2 = hot('--d-^----e---f--|', { d: 'd', e: 'e', f: 'f' });
      const e2subs = '    ^-----------!';
      const expected = '  -----x-y-z--|';
      const result = Observable[combineLatest]([e1, e2], (x, y) => x + y);
      expectObservable(result).toBe(expected, { x: 'be', y: 'ce', z: 'cf' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should handle two consecutive hot observables', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--|', { a: 'a', b: 'b', c: 'c' });
      const e1subs = '     ^--------!';
      const e2 = hot('-----^----------d--e--f--|', { d: 'd', e: 'e', f: 'f' });
      const e2subs = '     ^-------------------!';
      const expected = '   -----------x--y--z--|';
      const result = Observable[combineLatest]([e1, e2], (x, y) => x + y);
      expectObservable(result).toBe(expected, { x: 'cd', y: 'ce', z: 'cf' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should handle two consecutive hot observables with error left', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const left = hot(' --a--^--b--c--#', { a: 'a', b: 'b', c: 'c' }, 'jenga');
      const leftSubs = '      ^--------!';
      const right = hot('-----^----------d--e--f--|', { d: 'd', e: 'e', f: 'f' });
      const rightSubs = '     ^--------!';
      const expected = '      ---------#';
      const result = Observable[combineLatest]([left, right], (x, y) => x + y);
      expectObservable(result).toBe(expected, null, 'jenga');
      expectSubscriptions(left.subscriptions).toBe(leftSubs);
      expectSubscriptions(right.subscriptions).toBe(rightSubs);
    });
  });
  it('should handle two consecutive hot observables with error right', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const left = hot(' --a--^--b--c--|', { a: 'a', b: 'b', c: 'c' });
      const leftSubs = '      ^--------!';
      const right = hot('-----^----------d--e--f--#', { d: 'd', e: 'e', f: 'f' }, 'dun dun dun');
      const rightSubs = '     ^-------------------!';
      const expected = '      -----------x--y--z--#';
      const result = Observable[combineLatest]([left, right], (x, y) => x + y);
      expectObservable(result).toBe(expected, { x: 'cd', y: 'ce', z: 'cf' }, 'dun dun dun');
      expectSubscriptions(left.subscriptions).toBe(leftSubs);
      expectSubscriptions(right.subscriptions).toBe(rightSubs);
    });
  });
  it('should handle selector throwing', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--|', { a: 1, b: 2 });
      const e1subs = '     ^--!';
      const e2 = hot('--c--^--d--|', { c: 3, d: 4 });
      const e2subs = '     ^--!';
      const expected = '   ---#';
      const result = Observable[combineLatest]([e1, e2], (x, y) => {
        throw 'ha ha ' + x + ', ' + y;
      });
      expectObservable(result).toBe(expected, null, 'ha ha 2, 4');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should allow unsubscribing early and explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c---d-| ');
      const e1subs = '     ^--------!    ';
      const e2 = hot('---e-^---f--g---h-|');
      const e2subs = '     ^--------!    ';
      const expected = '   ----x-yz--    ';
      const unsub = '      ---------!    ';
      const values = { x: 'bf', y: 'cf', z: 'cg' };
      const result = Observable[combineLatest]([e1, e2], (x, y) => x + y);
      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should not break unsubscription chains when unsubscribed explicitly', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c---d-| ');
      const e1subs = '     ^--------!    ';
      const e2 = hot('---e-^---f--g---h-|');
      const e2subs = '     ^--------!    ';
      const expected = '   ----x-yz--    ';
      const unsub = '      ---------!    ';
      const values = { x: 'bf', y: 'cf', z: 'cg' };
      const result = Observable[combineLatest](
        [e1[mergeMap]((x) => Observable.from([x])), e2[mergeMap]((x) => Observable.from([x]))],
        (x, y) => x + y
      )[mergeMap]((x) => Observable.from([x]));
      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
});
