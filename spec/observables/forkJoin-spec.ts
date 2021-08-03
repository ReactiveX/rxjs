/** @prettier */
import { expect } from 'chai';
import { finalize, forkJoin, map, of, timer } from 'rxjs';
import { lowerCaseO } from '../helpers/test-helper';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {forkJoin} */
describe('forkJoin', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should join the last values of the provided observables into an array', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable }) => {
      const s1 = hot('  -a--b-----c-d-e-|');
      const s2 = hot('  --------f--g-h-i--j-|');
      const s3 = cold(' --1--2-3-4---|');
      const e1 = forkJoin([s1, s2, s3]);
      const expected = '--------------------(x|)';

      expectObservable(e1).toBe(expected, { x: ['e', 'j', '4'] });
    });
  });

  it('should support a resultSelector with an Array of ObservableInputs', () => {
    const results: Array<number | string> = [];
    forkJoin([of(1, 2, 3), of(4, 5, 6), of(7, 8, 9)], (a: number, b: number, c: number) => a + b + c).subscribe({
      next(value) {
        results.push(value);
      },
      error(err) {
        throw err;
      },
      complete() {
        results.push('done');
      },
    });

    expect(results).to.deep.equal([18, 'done']);
  });

  it('should support a resultSelector with a spread of ObservableInputs', () => {
    const results: Array<number | string> = [];
    forkJoin(of(1, 2, 3), of(4, 5, 6), of(7, 8, 9), (a: number, b: number, c: number) => a + b + c).subscribe({
      next(value) {
        results.push(value);
      },
      error(err) {
        throw err;
      },
      complete() {
        results.push('done');
      },
    });

    expect(results).to.deep.equal([18, 'done']);
  });

  it('should accept single observable', () => {
    rxTestScheduler.run(({ hot, expectObservable }) => {
      const e1 = forkJoin(hot('--a--b--c--d--|'));
      const expected = '       --------------(x|)';

      expectObservable(e1).toBe(expected, { x: ['d'] });
    });
  });

  describe('forkJoin([input1, input2, input3])', () => {
    it('should join the last values of the provided observables into an array', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const s1 = hot('  --a--b--c--d--|');
        const s2 = hot('  (b|)');
        const s3 = hot('  --1--2--3--|');
        const e1 = forkJoin([s1, s2, s3]);
        const expected = '--------------(x|)';

        expectObservable(e1).toBe(expected, { x: ['d', 'b', '3'] });
      });
    });

    it('should allow emit null or undefined', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const e2 = forkJoin([
          hot('            --a--b--c--d--|', { d: null }),
          hot('            (b|)'),
          hot('            --1--2--3--|'),
          hot('            -----r--t--u--|', { u: undefined }),
        ]);
        const expected2 = '--------------(x|)';

        expectObservable(e2).toBe(expected2, { x: [null, 'b', '3', undefined] });
      });
    });

    it('should accept array of observable contains single', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const s1 = hot('  --a--b--c--d--|');
        const e1 = forkJoin([s1]);
        const expected = '--------------(x|)';

        expectObservable(e1).toBe(expected, { x: ['d'] });
      });
    });

    it('should accept lowercase-o observables', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const s1 = hot('  --a--b--c--d--|');
        const s2 = hot('  (b|)');
        const s3 = lowerCaseO('1', '2', '3');
        const e1 = forkJoin([s1, s2, s3]);
        const expected = '--------------(x|)';

        expectObservable(e1).toBe(expected, { x: ['d', 'b', '3'] });
      });
    });

    it('should accept empty lowercase-o observables', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const s1 = hot('  --a--b--c--d--|');
        const s2 = hot('  (b|)');
        const s3 = lowerCaseO();
        const e1 = forkJoin([s1, s2, s3]);
        const expected = '|';

        expectObservable(e1).toBe(expected);
      });
    });

    it('should accept promise', (done) => {
      rxTestScheduler.run(() => {
        const e1 = forkJoin([of(1), Promise.resolve(2)]);

        e1.subscribe({
          next: (x) => expect(x).to.deep.equal([1, 2]),
          complete: done,
        });
      });
    });

    it('should accept array of observables', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const s1 = hot('  --a--b--c--d--|');
        const s2 = hot('  (b|)');
        const s3 = hot('  --1--2--3--|');
        const e1 = forkJoin([s1, s2, s3]);
        const expected = '--------------(x|)';

        expectObservable(e1).toBe(expected, { x: ['d', 'b', '3'] });
      });
    });

    it('should not emit if any of source observable is empty', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const s1 = hot('  --a--b--c--d--|');
        const s2 = hot('  (b|)');
        const s3 = hot('  ------------------|');
        const e1 = forkJoin([s1, s2, s3]);
        const expected = '------------------|';

        expectObservable(e1).toBe(expected);
      });
    });

    it('should complete early if any of source is empty and completes before than others', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const s1 = hot('  --a--b--c--d--|');
        const s2 = hot('  (b|)');
        const s3 = hot('  ---------|');
        const e1 = forkJoin([s1, s2, s3]);
        const expected = '---------|';

        expectObservable(e1).toBe(expected);
      });
    });

    it('should complete when all sources are empty', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const s1 = hot('  --------------|');
        const s2 = hot('  ---------|');
        const e1 = forkJoin([s1, s2]);
        const expected = '---------|';

        expectObservable(e1).toBe(expected);
      });
    });

    it('should not complete when only source never completes', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const e1 = forkJoin([hot('--------------')]);
        const expected = '        --------------';

        expectObservable(e1).toBe(expected);
      });
    });

    it('should not complete when one of the sources never completes', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const s1 = hot('--------------');
        const s2 = hot('-a---b--c--|');
        const e1 = forkJoin([s1, s2]);
        const expected = '-';

        expectObservable(e1).toBe(expected);
      });
    });

    it('should complete when one of the sources never completes but other completes without values', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const s1 = hot('  --------------');
        const s2 = hot('  ------|');
        const e1 = forkJoin([s1, s2]);
        const expected = '------|';

        expectObservable(e1).toBe(expected);
      });
    });

    it('should complete if source is not provided', () => {
      rxTestScheduler.run(({ expectObservable }) => {
        const e1 = forkJoin();
        const expected = '|';

        expectObservable(e1).toBe(expected);
      });
    });

    it('should complete if sources list is empty', () => {
      rxTestScheduler.run(({ expectObservable }) => {
        const e1 = forkJoin([]);
        const expected = '|';

        expectObservable(e1).toBe(expected);
      });
    });

    it('should raise error when any of source raises error with empty observable', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const s1 = hot('  ------#');
        const s2 = hot('  ---------|');
        const e1 = forkJoin([s1, s2]);
        const expected = '------#';

        expectObservable(e1).toBe(expected);
      });
    });

    it('should raise error when any of source raises error with source that never completes', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const s1 = hot('  ------#');
        const s2 = hot('  ----------');
        const e1 = forkJoin([s1, s2]);
        const expected = '------#';

        expectObservable(e1).toBe(expected);
      });
    });

    it('should raise error when source raises error', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const s1 = hot('  ------#');
        const s2 = hot('  ---a-----|');
        const e1 = forkJoin([s1, s2]);
        const expected = '------#';

        expectObservable(e1).toBe(expected);
      });
    });

    it('should allow unsubscribing early and explicitly', () => {
      rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
        const e1 = hot('--a--^--b--c---d-| ');
        const e1subs = '     ^--------!    ';
        const e2 = hot('---e-^---f--g---h-|');
        const e2subs = '     ^--------!    ';
        const expected = '   ----------    ';
        const unsub = '      ---------!    ';

        const result = forkJoin([e1, e2]);

        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
      });
    });

    it('should unsubscribe other Observables, when one of them errors', () => {
      rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
        const e1 = hot('--a--^--b--c---d-| ');
        const e1subs = '     ^--------!    ';
        const e2 = hot('---e-^---f--g-#');
        const e2subs = '     ^--------!    ';
        const expected = '   ---------#    ';

        const result = forkJoin([e1, e2]);

        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
      });
    });
  });

  it('should finalize in the proper order', () => {
    const results: any[] = [];
    const source = forkJoin(
      [1, 2, 3, 4].map((n) =>
        timer(100, rxTestScheduler).pipe(
          map(() => n),
          finalize(() => results.push(`finalized ${n}`))
        )
      )
    );

    source.subscribe((value) => results.push(value));
    rxTestScheduler.flush();
    expect(results).to.deep.equal(['finalized 1', 'finalized 2', 'finalized 3', 'finalized 4', [1, 2, 3, 4]]);
  });

  describe('forkJoin({ foo, bar, baz })', () => {
    it('should join the last values of the provided observables into an array', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const e1 = forkJoin({
          foo: hot('      --a--b--c--d--|'),
          bar: hot('      (b|)'),
          baz: hot('      --1--2--3--|'),
        });
        const expected = '--------------(x|)';

        expectObservable(e1).toBe(expected, { x: { foo: 'd', bar: 'b', baz: '3' } });
      });
    });

    it('should allow emit null or undefined', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const e2 = forkJoin({
          foo: hot('       --a--b--c--d--|', { d: null }),
          bar: hot('       (b|)'),
          baz: hot('       --1--2--3--|'),
          qux: hot('       -----r--t--u--|', { u: undefined }),
        });
        const expected2 = '--------------(x|)';

        expectObservable(e2).toBe(expected2, { x: { foo: null, bar: 'b', baz: '3', qux: undefined } });
      });
    });

    it('should accept array of observable contains single', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const e1 = forkJoin({
          foo: hot('      --a--b--c--d--|'),
        });
        const expected = '--------------(x|)';

        expectObservable(e1).toBe(expected, { x: { foo: 'd' } });
      });
    });

    it('should accept lowercase-o observables', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const e1 = forkJoin({
          foo: hot('      --a--b--c--d--|'),
          bar: hot('      (b|)'),
          baz: lowerCaseO('1', '2', '3'),
        });
        const expected = '--------------(x|)';

        expectObservable(e1).toBe(expected, { x: { foo: 'd', bar: 'b', baz: '3' } });
      });
    });

    it('should accept empty lowercase-o observables', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const e1 = forkJoin({
          foo: hot('      --a--b--c--d--|'),
          bar: hot('      (b|)'),
          baz: lowerCaseO(),
        });
        const expected = '|';

        expectObservable(e1).toBe(expected);
      });
    });

    it('should accept promise', (done) => {
      const e1 = forkJoin({
        foo: of(1),
        bar: Promise.resolve(2),
      });

      e1.subscribe({
        next: (x) => expect(x).to.deep.equal({ foo: 1, bar: 2 }),
        complete: done,
      });
    });

    it('should accept an object of observables', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const e1 = forkJoin({
          foo: hot('      --a--b--c--d--|'),
          bar: hot('      (b|)'),
          baz: hot('      --1--2--3--|'),
        });
        const expected = '--------------(x|)';

        expectObservable(e1).toBe(expected, { x: { foo: 'd', bar: 'b', baz: '3' } });
      });
    });

    it('should not emit if any of source observable is empty', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const e1 = forkJoin({
          foo: hot('      --a--b--c--d--|'),
          bar: hot('      (b|)'),
          baz: hot('      ------------------|'),
        });
        const expected = '------------------|';

        expectObservable(e1).toBe(expected);
      });
    });

    // TODO: This seems odd. Filed an issue for discussion here: https://github.com/ReactiveX/rxjs/issues/5561
    it('should complete early if any of source is empty and completes before than others', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const e1 = forkJoin({
          foo: hot('      --a--b--c--d--|'),
          bar: hot('      (b|)'),
          baz: hot('      ---------|'),
        });
        const expected = '---------|';

        expectObservable(e1).toBe(expected);
      });
    });

    it('should complete when all sources are empty', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const e1 = forkJoin({
          foo: hot('      --------------|'),
          bar: hot('      ---------|'),
        });
        const expected = '---------|';

        expectObservable(e1).toBe(expected);
      });
    });

    it('should not complete when only source never completes', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const e1 = forkJoin({
          foo: hot('      --------------'),
        });
        const expected = '--------------';

        expectObservable(e1).toBe(expected);
      });
    });

    it('should not complete when one of the sources never completes', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const e1 = forkJoin({
          foo: hot('      --------------'),
          bar: hot('      -a---b--c--|'),
        });
        const expected = '--------------';

        expectObservable(e1).toBe(expected);
      });
    });

    it('should complete when one of the sources never completes but other completes without values', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const e1 = forkJoin({
          foo: hot('      --------------'),
          bar: hot('      ------|'),
        });
        const expected = '------|';

        expectObservable(e1).toBe(expected);
      });
    });

    // TODO(benlesh): this is the wrong behavior, it should probably throw right away.
    it('should have same v5/v6 throwing behavior full argument of null', (done) => {
      rxTestScheduler.run(() => {
        // It doesn't throw when you pass null
        expect(() => forkJoin(null as any)).not.to.throw();

        // It doesn't even throw if you subscribe to forkJoin(null).
        expect(() =>
          forkJoin(null as any).subscribe({
            // It sends the error to the subscription.
            error: () => done(),
          })
        ).not.to.throw();
      });
    });

    it('should complete if sources object is empty', () => {
      rxTestScheduler.run(({ expectObservable }) => {
        const e1 = forkJoin({});
        const expected = '|';

        expectObservable(e1).toBe(expected);
      });
    });

    it('should raise error when any of source raises error with empty observable', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const e1 = forkJoin({
          lol: hot('      ------#'),
          wut: hot('      ---------|'),
        });
        const expected = '------#';

        expectObservable(e1).toBe(expected);
      });
    });

    it('should raise error when any of source raises error with source that never completes', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const e1 = forkJoin({
          lol: hot('      ------#'),
          wut: hot('      ----------'),
        });
        const expected = '------#';

        expectObservable(e1).toBe(expected);
      });
    });

    it('should raise error when source raises error', () => {
      rxTestScheduler.run(({ hot, expectObservable }) => {
        const e1 = forkJoin({
          lol: hot('      ------#'),
          foo: hot('      ---a-----|'),
        });
        const expected = '------#';

        expectObservable(e1).toBe(expected);
      });
    });

    it('should allow unsubscribing early and explicitly', () => {
      rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
        const e1 = hot('--a--^--b--c---d-| ');
        const e1subs = '     ^--------!    ';
        const e2 = hot('---e-^---f--g---h-|');
        const e2subs = '     ^--------!    ';
        const expected = '   ----------    ';
        const unsub = '      ---------!    ';

        const result = forkJoin({
          e1,
          e2,
        });

        expectObservable(result, unsub).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
      });
    });

    it('should unsubscribe other Observables, when one of them errors', () => {
      rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
        const e1 = hot('  --a--^--b--c---d-| ');
        const e1subs = '       ^--------!    ';
        const e2 = hot('  ---e-^---f--g-#');
        const e2subs = '       ^--------!    ';
        const expected = '     ---------#    ';

        const result = forkJoin({
          e1,
          e2,
        });

        expectObservable(result).toBe(expected);
        expectSubscriptions(e1.subscriptions).toBe(e1subs);
        expectSubscriptions(e2.subscriptions).toBe(e2subs);
      });
    });

    it('should accept promise as the first arg', (done) => {
      const e1 = forkJoin(Promise.resolve(1));
      const values: number[][] = [];

      e1.subscribe({
        next: (x) => values.push(x),
        complete: () => {
          expect(values).to.deep.equal([[1]]);
          done();
        },
      });
    });
  });
});
