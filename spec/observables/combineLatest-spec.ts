import { expect } from 'chai';
import { queueScheduler as rxQueueScheduler, combineLatest, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

const queueScheduler = rxQueueScheduler;

/** @test {combineLatest} */
describe('static combineLatest', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should return EMPTY if passed an empty array as the only argument', () => {
    const results: string[] = [];
    combineLatest([]).subscribe({
      next: () => {
        throw new Error('should not emit')
      },
      complete: () => {
        results.push('done');
      }
    });

    expect(results).to.deep.equal(['done']);
  });

  it('should return EMPTY if passed an empty POJO as the only argument', () => {
    const results: string[] = [];
    combineLatest({}).subscribe({
      next: () => {
        throw new Error('should not emit')
      },
      complete: () => {
        results.push('done');
      }
    });

    expect(results).to.deep.equal(['done']);
  });
  
  it('should return EMPTY if passed an empty array and scheduler as the only argument', () => {
    const results: string[] = [];
    combineLatest([], rxTestScheduler).subscribe({
      next: () => {
        throw new Error('should not emit')
      },
      complete: () => {
        results.push('done');
      }
    });

    expect(results).to.deep.equal([]);
    rxTestScheduler.flush();
    expect(results).to.deep.equal(['done']);
  });

  it('should combineLatest the provided observables', () => {
    rxTestScheduler.run(({ hot, expectObservable }) => {
      const firstSource = hot(' ----a----b----c----|');
      const secondSource = hot('--d--e--f--g--|');
      const expected = '        ----uv--wx-y--z----|';

      const combined = combineLatest(firstSource, secondSource, (a, b) => '' + a + b);

      expectObservable(combined).toBe(expected, { u: 'ad', v: 'ae', w: 'af', x: 'bf', y: 'bg', z: 'cg' });
    });
  });

  it('should combine an immediately-scheduled source with an immediately-scheduled second', (done) => {
    const a = of(1, 2, 3, queueScheduler);
    const b = of(4, 5, 6, 7, 8, queueScheduler);
    const r = [
      [1, 4],
      [2, 4],
      [2, 5],
      [3, 5],
      [3, 6],
      [3, 7],
      [3, 8],
    ];

    const actual: [number, number][] = [];
    //type definition need to be updated
    combineLatest(a, b, queueScheduler).subscribe(
      (vals) => {
        actual.push(vals);
      },
      () => {
        done(new Error('should not be called'));
      },
      () => {
        expect(actual).to.deep.equal(r);
        done();
      }
    );
  });

  it('should accept array of observables', () => {
    rxTestScheduler.run(({ hot, expectObservable }) => {
      const firstSource = hot(' ----a----b----c----|');
      const secondSource = hot('--d--e--f--g--|');
      const expected = '        ----uv--wx-y--z----|';

      const combined = combineLatest([firstSource, secondSource], (a: string, b: string) => '' + a + b);

      expectObservable(combined).toBe(expected, { u: 'ad', v: 'ae', w: 'af', x: 'bf', y: 'bg', z: 'cg' });
    });
  });

  it('should accept a dictionary of observables', () => {
    rxTestScheduler.run(({ hot, expectObservable }) => {
      const firstSource =  hot('----a----b----c----|');
      const secondSource = hot('--d--e--f--g--|');
      const expected = '        ----uv--wx-y--z----|';

      const combined = combineLatest({a: firstSource, b: secondSource}).pipe(
        map(({a, b}) => '' + a + b)
      );  

      expectObservable(combined).toBe(expected, {u: 'ad', v: 'ae', w: 'af', x: 'bf', y: 'bg', z: 'cg'});
    });
  });

  it('should work with two nevers', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '  ^';
      const e2 = cold(' -');
      const e2subs = '  ^';
      const expected = '-';

      const result = combineLatest(e1, e2, (x, y) => x + y);

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with never and empty', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '  ^';
      const e2 = cold(' |');
      const e2subs = '  (^!)';
      const expected = '-';

      const result = combineLatest(e1, e2, (x, y) => x + y);

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with empty and never', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |');
      const e1subs = '  (^!)';
      const e2 = cold(' -');
      const e2subs = '  ^';
      const expected = '-';

      const result = combineLatest(e1, e2, (x, y) => x + y);

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with empty and empty', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |');
      const e1subs = '  (^!)';
      const e2 = cold(' |');
      const e2subs = '  (^!)';
      const expected = '|';

      const result = combineLatest(e1, e2, (x, y) => x + y);

      expectObservable(result).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with hot-empty and hot-single', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
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

      const result = combineLatest(e1, e2, (x, y) => x + y);

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with hot-single and hot-empty', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
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

      const result = combineLatest(e2, e1, (x, y) => x + y);

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with hot-single and never', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: 1,
      };
      const e1 = hot('-a-^-|', values);
      const e1subs = '   ^-!';
      const e2 = hot('------', values); //never
      const e2subs = '   ^  ';
      const expected = ' -'; //never

      const result = combineLatest(e1, e2, (x, y) => x + y);

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with never and hot-single', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const values = {
        a: 1,
        b: 2,
      };
      const e1 = hot('--------', values); //never
      const e1subs = '   ^----';
      const e2 = hot('-a-^-b-|', values);
      const e2subs = '   ^---!';
      const expected = ' -----'; //never

      const result = combineLatest(e1, e2, (x, y) => x + y);

      expectObservable(result).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with hot and hot', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--|', { a: 'a', b: 'b', c: 'c' });
      const e1subs = '     ^--------!';
      const e2 = hot('---e-^---f--g--|', { e: 'e', f: 'f', g: 'g' });
      const e2subs = '     ^---------!';
      const expected = '   ----x-yz--|';

      const result = combineLatest(e1, e2, (x, y) => x + y);

      expectObservable(result).toBe(expected, { x: 'bf', y: 'cf', z: 'cg' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with empty and error', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ----------|'); //empty
      const e1subs = '  ^-----!';
      const e2 = hot('  ------#', undefined, 'shazbot!'); //error
      const e2subs = '  ^-----!';
      const expected = '------#';

      const result = combineLatest(e1, e2, (x, y) => x + y);

      expectObservable(result).toBe(expected, null, 'shazbot!');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with error and empty', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--^---#', undefined, 'too bad, honk'); //error
      const e1subs = '  ^---!';
      const e2 = hot('--^--------|'); //empty
      const e2subs = '  ^---!';
      const expected = '----#';

      const result = combineLatest(e1, e2, (x, y) => x + y);

      expectObservable(result).toBe(expected, null, 'too bad, honk');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with hot and throw', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-a-^--b--c--|', { a: 1, b: 2, c: 3 });
      const e1subs = '   ^-!';
      const e2 = hot('---^-#', undefined, 'bazinga');
      const e2subs = '   ^-!';
      const expected = ' --#';

      const result = combineLatest(e1, e2, (x, y) => x + y);

      expectObservable(result).toBe(expected, null, 'bazinga');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with throw and hot', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^-#', undefined, 'bazinga');
      const e1subs = '   ^-!';
      const e2 = hot('-a-^--b--c--|', { a: 1, b: 2, c: 3 });
      const e2subs = '   ^-!';
      const expected = ' --#';

      const result = combineLatest(e1, e2, (x, y) => x + y);

      expectObservable(result).toBe(expected, null, 'bazinga');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with throw and throw', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^----#', undefined, 'jenga');
      const e1subs = '   ^-!';
      const e2 = hot('---^-#', undefined, 'bazinga');
      const e2subs = '   ^-!';
      const expected = ' --#';

      const result = combineLatest(e1, e2, (x, y) => x + y);

      expectObservable(result).toBe(expected, null, 'bazinga');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with error and throw', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-a-^--b--#', { a: 1, b: 2 }, 'wokka wokka');
      const e1subs = '   ^-!';
      const e2 = hot('---^-#', undefined, 'flurp');
      const e2subs = '   ^-!';
      const expected = ' --#';

      const result = combineLatest(e1, e2, (x, y) => x + y);

      expectObservable(result).toBe(expected, null, 'flurp');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with throw and error', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^-#', undefined, 'flurp');
      const e1subs = '   ^-!';
      const e2 = hot('-a-^--b--#', { a: 1, b: 2 }, 'wokka wokka');
      const e2subs = '   ^-!';
      const expected = ' --#';

      const result = combineLatest(e1, e2, (x, y) => x + y);

      expectObservable(result).toBe(expected, null, 'flurp');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with never and throw', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^-----------');
      const e1subs = '   ^-----!';
      const e2 = hot('---^-----#', undefined, 'wokka wokka');
      const e2subs = '   ^-----!';
      const expected = ' ------#';

      const result = combineLatest(e1, e2, (x, y) => x + y);

      expectObservable(result).toBe(expected, null, 'wokka wokka');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with throw and never', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^----#', undefined, 'wokka wokka');
      const e1subs = '   ^----!';
      const e2 = hot('---^-----------');
      const e2subs = '   ^----!';
      const expected = ' -----#';

      const result = combineLatest(e1, e2, (x, y) => x + y);

      expectObservable(result).toBe(expected, null, 'wokka wokka');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with some and throw', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^----a---b--|', { a: 1, b: 2 });
      const e1subs = '   ^--!';
      const e2 = hot('---^--#', undefined, 'wokka wokka');
      const e2subs = '   ^--!';
      const expected = ' ---#';

      const result = combineLatest(e1, e2, (x, y) => x + y);

      expectObservable(result).toBe(expected, { a: 1, b: 2 }, 'wokka wokka');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should work with throw and some', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('---^--#', undefined, 'wokka wokka');
      const e1subs = '   ^--!';
      const e2 = hot('---^----a---b--|', { a: 1, b: 2 });
      const e2subs = '   ^--!';
      const expected = ' ---#';

      const result = combineLatest(e1, e2, (x, y) => x + y);

      expectObservable(result).toBe(expected, { a: 1, b: 2 }, 'wokka wokka');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should handle throw after complete left', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const left = hot(' --a--^--b---|', { a: 1, b: 2 });
      const leftSubs = '      ^------!';
      const right = hot('-----^--------#', undefined, 'bad things');
      const rightSubs = '     ^--------!';
      const expected = '      ---------#';

      const result = combineLatest(left, right, (x, y) => x + y);

      expectObservable(result).toBe(expected, null, 'bad things');
      expectSubscriptions(left.subscriptions).toBe(leftSubs);
      expectSubscriptions(right.subscriptions).toBe(rightSubs);
    });
  });

  it('should handle throw after complete right', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const left = hot(' -----^--------#', undefined, 'bad things');
      const leftSubs = '      ^--------!';
      const right = hot('--a--^--b---|', { a: 1, b: 2 });
      const rightSubs = '     ^------!';
      const expected = '      ---------#';

      const result = combineLatest(left, right, (x, y) => x + y);

      expectObservable(result).toBe(expected, null, 'bad things');
      expectSubscriptions(left.subscriptions).toBe(leftSubs);
      expectSubscriptions(right.subscriptions).toBe(rightSubs);
    });
  });

  it('should handle interleaved with tail', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-a--^--b---c---|', { a: 'a', b: 'b', c: 'c' });
      const e1subs = '    ^----------!';
      const e2 = hot('--d-^----e---f--|', { d: 'd', e: 'e', f: 'f' });
      const e2subs = '    ^-----------!';
      const expected = '  -----x-y-z--|';

      const result = combineLatest(e1, e2, (x, y) => x + y);

      expectObservable(result).toBe(expected, { x: 'be', y: 'ce', z: 'cf' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should handle two consecutive hot observables', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c--|', { a: 'a', b: 'b', c: 'c' });
      const e1subs = '     ^--------!';
      const e2 = hot('-----^----------d--e--f--|', { d: 'd', e: 'e', f: 'f' });
      const e2subs = '     ^-------------------!';
      const expected = '   -----------x--y--z--|';

      const result = combineLatest(e1, e2, (x, y) => x + y);

      expectObservable(result).toBe(expected, { x: 'cd', y: 'ce', z: 'cf' });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should handle two consecutive hot observables with error left', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const left = hot(' --a--^--b--c--#', { a: 'a', b: 'b', c: 'c' }, 'jenga');
      const leftSubs = '      ^--------!';
      const right = hot('-----^----------d--e--f--|', { d: 'd', e: 'e', f: 'f' });
      const rightSubs = '     ^--------!';
      const expected = '      ---------#';

      const result = combineLatest(left, right, (x, y) => x + y);

      expectObservable(result).toBe(expected, null, 'jenga');
      expectSubscriptions(left.subscriptions).toBe(leftSubs);
      expectSubscriptions(right.subscriptions).toBe(rightSubs);
    });
  });

  it('should handle two consecutive hot observables with error right', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const left = hot(' --a--^--b--c--|', { a: 'a', b: 'b', c: 'c' });
      const leftSubs = '      ^--------!';
      const right = hot('-----^----------d--e--f--#', { d: 'd', e: 'e', f: 'f' }, 'dun dun dun');
      const rightSubs = '     ^-------------------!';
      const expected = '      -----------x--y--z--#';

      const result = combineLatest(left, right, (x, y) => x + y);

      expectObservable(result).toBe(expected, { x: 'cd', y: 'ce', z: 'cf' }, 'dun dun dun');
      expectSubscriptions(left.subscriptions).toBe(leftSubs);
      expectSubscriptions(right.subscriptions).toBe(rightSubs);
    });
  });

  it('should handle selector throwing', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--|', { a: 1, b: 2 });
      const e1subs = '     ^--!';
      const e2 = hot('--c--^--d--|', { c: 3, d: 4 });
      const e2subs = '     ^--!';
      const expected = '   ---#';

      const result = combineLatest(e1, e2, (x, y) => {
        throw 'ha ha ' + x + ', ' + y;
      });

      expectObservable(result).toBe(expected, null, 'ha ha 2, 4');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should allow unsubscribing early and explicitly', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c---d-| ');
      const e1subs = '     ^--------!    ';
      const e2 = hot('---e-^---f--g---h-|');
      const e2subs = '     ^--------!    ';
      const expected = '   ----x-yz--    ';
      const unsub = '      ---------!    ';
      const values = { x: 'bf', y: 'cf', z: 'cg' };

      const result = combineLatest(e1, e2, (x, y) => x + y);

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });

  it('should not break unsubscription chains when unsubscribed explicitly', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--a--^--b--c---d-| ');
      const e1subs = '     ^--------!    ';
      const e2 = hot('---e-^---f--g---h-|');
      const e2subs = '     ^--------!    ';
      const expected = '   ----x-yz--    ';
      const unsub = '      ---------!    ';
      const values = { x: 'bf', y: 'cf', z: 'cg' };

      const result = combineLatest(e1.pipe(mergeMap((x) => of(x))), e2.pipe(mergeMap((x) => of(x))), (x, y) => x + y).pipe(
        mergeMap((x) => of(x))
      );

      expectObservable(result, unsub).toBe(expected, values);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
      expectSubscriptions(e2.subscriptions).toBe(e2subs);
    });
  });
});
