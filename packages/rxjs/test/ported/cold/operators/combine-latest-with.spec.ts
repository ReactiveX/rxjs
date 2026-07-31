// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/combineLatestWith-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { combineLatest } from 'rxjs/combine-latest';
import { count } from 'rxjs/count';
import { distinct } from 'rxjs/distinct';
import { map } from 'rxjs/map';
import { mergeMap } from 'rxjs/merge-map';
describe('combineLatestWith (cold)', () => {
  it('should combine events from two cold observables', async () => {
    await rxTest(({ cold, expectObservable }) => {
      const e1 = cold(' -a--b-----c-d-e-|');
      const e2 = cold(' --1--2-3-4---|   ');
      const expected = '--A-BC-D-EF-G-H-|';
      const result = e1[combineLatest]([e2])[map](([a, b]) => a + b);
      expectObservable(result).toBe(expected, {
        A: 'a1',
        B: 'b1',
        C: 'b2',
        D: 'b3',
        E: 'b4',
        F: 'c4',
        G: 'd4',
        H: 'e4',
      });
    });
  });
  it('should work with two nevers', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '^!';
      const e2 = cold(' -');
      const e2subs = '^!';
      const expected = '-';
      const result = e1[combineLatest]([e2])[map](([x, y]) => x + y);
      expectObservable(result, '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should work with never and empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '^!';
      const e2 = cold(' |');
      const e2subs = '  (^!)';
      const expected = '-';
      const result = e1[combineLatest]([e2])[map](([x, y]) => x + y);
      expectObservable(result, '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should work with empty and never', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |');
      const e1subs = '  (^!)';
      const e2 = cold(' -');
      const e2subs = '^!';
      const expected = '-';
      const result = e1[combineLatest]([e2])[map](([x, y]) => x + y);
      expectObservable(result, '^!').toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should work with empty and empty', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |');
      const e1subs = '  (^!)';
      const e2 = cold(' |');
      const e2subs = '  (^!)';
      const expected = '|';
      const result = e1[combineLatest]([e2])[map](([x, y]) => x + y);
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
      const result = e1[combineLatest]([e2])[map](([x, y]) => x + y);
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
      const result = e2[combineLatest]([e1])[map](([x, y]) => x + y);
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
      const expected = ' ---'; //never
      const result = e1[combineLatest]([e2])[map](([x, y]) => x + y);
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
      const result = e1[combineLatest]([e2])[map](([x, y]) => x + y);
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
      const result = e1[combineLatest]([e2])[map](([x, y]) => x + y);
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
      const result = e1[combineLatest]([e2])[map](([x, y]) => x + y);
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
      const result = e1[combineLatest]([e2])[map](([x, y]) => x + y);
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
      const result = e1[combineLatest]([e2])[map](([x, y]) => x + y);
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
      const result = e1[combineLatest]([e2])[map](([x, y]) => x + y);
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
      const result = e1[combineLatest]([e2])[map](([x, y]) => x + y);
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
      const result = e1[combineLatest]([e2])[map](([x, y]) => x + y);
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
      const result = e1[combineLatest]([e2])[map](([x, y]) => x + y);
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
      const result = e1[combineLatest]([e2])[map](([x, y]) => x + y);
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
      const result = e1[combineLatest]([e2])[map](([x, y]) => x + y);
      expectObservable(result).toBe(expected, null, 'wokka wokka');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should work with some and throw', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('   ---^----a---b--|', { a: 1, b: 2 });
      const e1subs = '      ^--!';
      const e2 = hot('   ---^--#', undefined, 'wokka wokka');
      const e2subs = '      ^--!';
      const expected = '    ---#';
      const result = e1[combineLatest]([e2])[map](([x, y]) => x + y);
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
      const result = e1[combineLatest]([e2])[map](([x, y]) => x + y);
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
      const result = left[combineLatest]([right])[map](([x, y]) => x + y);
      expectObservable(result).toBe(expected, null, 'bad things');
      expectSubscriptions(left.subscriptions).toBe(leftSubs);
      expectSubscriptions(right.subscriptions).toBe(rightSubs);
    });
  });
  it('should handle throw after complete right', async () => {
    await rxTest(({ hot, expectObservable, expectSubscriptions }) => {
      const left = hot('  -----^--------#', undefined, 'bad things');
      const leftSubs = '       ^--------!';
      const right = hot(' --a--^--b---|', { a: 1, b: 2 });
      const rightSubs = '      ^------!';
      const expected = '       ---------#';
      const result = left[combineLatest]([right])[map](([x, y]) => x + y);
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
      const result = e1[combineLatest]([e2])[map](([x, y]) => x + y);
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
      const result = e1[combineLatest]([e2])[map](([x, y]) => x + y);
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
      const result = left[combineLatest]([right])[map](([x, y]) => x + y);
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
      const result = left[combineLatest]([right])[map](([x, y]) => x + y);
      expectObservable(result).toBe(expected, { x: 'cd', y: 'ce', z: 'cf' }, 'dun dun dun');
      expectSubscriptions(left.subscriptions).toBe(leftSubs);
      expectSubscriptions(right.subscriptions).toBe(rightSubs);
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
      const result = e1[combineLatest]([e2])[map](([x, y]) => x + y);
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
      const result = e1[mergeMap]((x) => ColdObservable.from([x]))
        [combineLatest]([e2])
        [map](([x, y]) => x + y)
        [mergeMap]((x) => ColdObservable.from([x]));
      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
  it('should emit unique array instances with the default projection', async () => {
    await rxTest(({ hot, expectObservable }) => {
      const e1 = hot('  -a--b--|');
      const e2 = hot('  --1--2-|');
      const expected = '-------(c|)';
      const result = e1[combineLatest]([e2])[distinct]()[count]();
      expectObservable(result).toBe(expected, { c: 3 });
    });
  });
});
