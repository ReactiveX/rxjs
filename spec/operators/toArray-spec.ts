/** @prettier */
import { toArray, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {toArray} */
describe('toArray', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should reduce the values of an observable into an array', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  ---a--b--|   ');
      const e1subs = '  ^--------!   ';
      const expected = '---------(w|)';

      expectObservable(e1.pipe(toArray())).toBe(expected, { w: ['a', 'b'] });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should be never when source is never', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' -');
      const e1subs = '  ^';
      const expected = '-';

      expectObservable(e1.pipe(toArray())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should be empty when source is empty', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' |   ');
      const e1subs = '  (^!)';
      const expected = '(w|)';

      expectObservable(e1.pipe(toArray())).toBe(expected, { w: [] });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it("should be never when source doesn't complete", () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('--x--^--y--');
      const e1subs = '     ^-----';
      const expected = '   ------';

      expectObservable(e1.pipe(toArray())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should reduce observable without values into an array of length zero', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^---|   ');
      const e1subs = '   ^---!   ';
      const expected = ' ----(w|)';

      expectObservable(e1.pipe(toArray())).toBe(expected, { w: [] });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should reduce the a single value of an observable into an array', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^--y--|  ');
      const e1subs = '   ^-----!  ';
      const expected = ' ------(w|)';

      expectObservable(e1.pipe(toArray())).toBe(expected, { w: ['y'] });
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should allow multiple subscriptions', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^--y--|   ');
      const e1subs = '   ^-----!   ';
      const expected = ' ------(w|)';

      const result = e1.pipe(toArray());
      expectObservable(result).toBe(expected, { w: ['y'] });
      expectObservable(result).toBe(expected, { w: ['y'] });
      expectSubscriptions(e1.subscriptions).toBe([e1subs, e1subs]);
    });
  });

  it('should allow unsubscribing explicitly and early', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b----c-----d----e---|');
      const e1subs = '  ^-------!                 ';
      const expected = '---------                 ';
      const unsub = '   --------!                 ';

      expectObservable(e1.pipe(toArray()), unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('  --a--b----c-----d----e---|');
      const e1subs = '  ^-------!                 ';
      const expected = '---------                 ';
      const unsub = '   --------!                 ';

      const result = e1.pipe(
        mergeMap((x: string) => of(x)),
        toArray(),
        mergeMap((x: Array<string>) => of(x))
      );

      expectObservable(result, unsub).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should work with error', () => {
    rxTestScheduler.run(({ hot, expectObservable, expectSubscriptions }) => {
      const e1 = hot('-x-^--y--z--#', { x: 1, y: 2, z: 3 }, 'too bad');
      const e1subs = '   ^--------!';
      const expected = ' ---------#';

      expectObservable(e1.pipe(toArray())).toBe(expected, null, 'too bad');
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });

  it('should work with throw', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const e1 = cold(' #   ');
      const e1subs = '  (^!)';
      const expected = '#   ';

      expectObservable(e1.pipe(toArray())).toBe(expected);
      expectSubscriptions(e1.subscriptions).toBe(e1subs);
    });
  });
});
