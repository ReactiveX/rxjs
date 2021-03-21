/** @prettier */
import { window, mergeMap } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { EMPTY, of, Observable } from 'rxjs';
import { observableMatcher } from '../helpers/observableMatcher';

/** @test {window} */
describe('window', () => {
  let rxTestScheduler: TestScheduler;

  beforeEach(() => {
    rxTestScheduler = new TestScheduler(observableMatcher);
  });

  it('should emit windows that close and reopen', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('  ---a---b---c---d---e---f---g---h---i---|    ');
      const sourceSubs = '  ^--------------------------------------!    ';
      const closings = hot('-------------w------------w----------------|');
      const closingSubs = ' ^--------------------------------------!    ';
      const expected = '    x------------y------------z------------|    ';
      const x = cold('      ---a---b---c-|                              ');
      const y = cold('                   --d---e---f--|                 ');
      const z = cold('                                -g---h---i---|    ');
      const expectedValues = { x: x, y: y, z: z };

      const result = source.pipe(window(closings));

      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(closings.subscriptions).toBe(closingSubs);
    });
  });

  it('should return a single empty window if source is empty and closings are basic', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('  |        ');
      const sourceSubs = '   (^!)     ';
      const closings = cold('--x--x--|');
      const closingSubs = '  (^!)     ';
      const expected = '     (w|)     ';
      const w = cold('       |        ');
      const expectedValues = { w: w };

      const result = source.pipe(window(closings));

      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(closings.subscriptions).toBe(closingSubs);
    });
  });

  it('should return a single empty window if source is empty and closing is empty', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('  |   ');
      const sourceSubs = '   (^!)';
      const closings = cold('|   ');
      const closingSubs = '  (^!)';
      const expected = '     (w|)';
      const w = cold('       |   ');
      const expectedValues = { w: w };

      const result = source.pipe(window(closings));

      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(closings.subscriptions).toBe(closingSubs);
    });
  });

  it('should return a single empty window if source is sync empty and closing is sync empty', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('  (|) ');
      const sourceSubs = '   (^!)';
      const expected = '     (w|)';
      const w = cold('       |   ');
      const expectedValues = { w: w };

      const result = source.pipe(window(EMPTY));

      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      // expectSubscriptions(closings.subscriptions).toBe(closingSubs);
    });
  });

  it('should split a Just source into a single window identical to source, using a Never closing', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('  (a|)');
      const sourceSubs = '   (^!)';
      const closings = cold('-   ');
      const closingSubs = '  (^!)';
      const expected = '     (w|)';
      const w = cold('       (a|)');
      const expectedValues = { w: w };

      const result = source.pipe(window(closings));

      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(closings.subscriptions).toBe(closingSubs);
    });
  });

  it('should return a single Never window if source is Never', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('  ------');
      const sourceSubs = '   ^-----';
      const closings = cold('------');
      const closingSubs = '  ^-----';
      const expected = '     w-----';
      const w = cold('       ------');
      const expectedValues = { w: w };

      const result = source.pipe(window(closings));

      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(closings.subscriptions).toBe(closingSubs);
    });
  });

  it('should be able to split a never Observable into timely empty windows', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('   ^--------');
      const sourceSubs = '   ^--------';
      const closings = cold('--x--x--|');
      const closingSubs = '  ^-------!';
      const expected = '     a-b--c---';
      const a = cold('       --|      ');
      const b = cold('         ---|   ');
      const c = cold('            ----');
      const expectedValues = { a: a, b: b, c: c };

      const result = source.pipe(window(closings));

      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(closings.subscriptions).toBe(closingSubs);
    });
  });

  it('should emit an error-only window if outer is a simple throw-Observable', () => {
    rxTestScheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('  #        ');
      const sourceSubs = '   (^!)     ';
      const closings = cold('--x--x--|');
      const closingSubs = '  (^!)     ';
      const expected = '     (w#)     ';
      const w = cold('       #        ');
      const expectedValues = { w: w };

      const result = source.pipe(window(closings));

      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
      expectSubscriptions(closings.subscriptions).toBe(closingSubs);
    });
  });

  it('should handle basic case with window closings', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('-1-2-^3-4-5-6-7-8-9-|         ');
      const subs = '           ^--------------!         ';
      const closings = hot('---^---x---x---x---x---x---|');
      const closingSubs = '    ^--------------!         ';
      const expected = '       a---b---c---d--|         ';
      const a = cold('         -3-4|                    ');
      const b = cold('             -5-6|                ');
      const c = cold('                 -7-8|            ');
      const d = cold('                     -9-|         ');
      const expectedValues = { a: a, b: b, c: c, d: d };

      const result = source.pipe(window(closings));

      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(subs);
      expectSubscriptions(closings.subscriptions).toBe(closingSubs);
    });
  });

  it('should handle basic case with window closings, but outer throws', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('-1-2-^3-4-5-6-7-8-9-#         ');
      const subs = '           ^--------------!         ';
      const closings = hot('---^---x---x---x---x---x---|');
      const closingSubs = '    ^--------------!         ';
      const expected = '       a---b---c---d--#         ';
      const a = cold('         -3-4|                    ');
      const b = cold('             -5-6|                ');
      const c = cold('                 -7-8|            ');
      const d = cold('                     -9-#         ');
      const expectedValues = { a: a, b: b, c: c, d: d };

      const result = source.pipe(window(closings));

      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(subs);
      expectSubscriptions(closings.subscriptions).toBe(closingSubs);
    });
  });

  it('should stop emitting windows when outer is unsubscribed early', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('-1-2-^3-4-5-6-7-8-9-|         ');
      const subs = '           ^-------!                ';
      const closings = hot('---^---x---x---x---x---x---|');
      const closingSubs = '    ^-------!                ';
      const expected = '       a---b----                ';
      const a = cold('         -3-4|                    ');
      const b = cold('             -5-6                 ');
      const unsub = '          --------!                ';
      const expectedValues = { a: a, b: b };

      const result = source.pipe(window(closings));

      expectObservable(result, unsub).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(subs);
      expectSubscriptions(closings.subscriptions).toBe(closingSubs);
    });
  });

  it('should not break unsubscription chains when result is unsubscribed explicitly', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('-1-2-^3-4-5-6-7-8-9-|         ');
      const subs = '           ^-------!                ';
      const closings = hot('---^---x---x---x---x---x---|');
      const closingSubs = '    ^-------!                ';
      const expected = '       a---b----                ';
      const a = cold('         -3-4|                    ');
      const b = cold('             -5-6-                ');
      const unsub = '          --------!                ';
      const expectedValues = { a: a, b: b };

      const result = source.pipe(
        mergeMap((x: string) => of(x)),
        window(closings),
        mergeMap((x: Observable<string>) => of(x))
      );

      expectObservable(result, unsub).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(subs);
      expectSubscriptions(closings.subscriptions).toBe(closingSubs);
    });
  });

  it('should make outer emit error when closing throws', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('-1-2-^3-4-5-6-7-8-9-#');
      const subs = '           ^---!           ';
      const closings = hot('---^---#           ');
      const closingSubs = '    ^---!           ';
      const expected = '       a---#           ';
      const a = cold('         -3-4#           ');
      const expectedValues = { a: a };

      const result = source.pipe(window(closings));

      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(subs);
      expectSubscriptions(closings.subscriptions).toBe(closingSubs);
    });
  });

  it('should complete the resulting Observable when window closings completes', () => {
    rxTestScheduler.run(({ hot, cold, expectObservable, expectSubscriptions }) => {
      const source = hot('-1-2-^3-4-5-6-7-8-9-|');
      const subs = '           ^--------------!';
      const closings = hot('---^---x---x---|   ');
      const closingSubs = '    ^-----------!   ';
      const expected = '       a---b---c------|';
      const a = cold('         -3-4|           ');
      const b = cold('             -5-6|       ');
      const c = cold('                 -7-8-9-|');
      const expectedValues = { a: a, b: b, c: c };

      const result = source.pipe(window(closings));

      expectObservable(result).toBe(expected, expectedValues);
      expectSubscriptions(source.subscriptions).toBe(subs);
      expectSubscriptions(closings.subscriptions).toBe(closingSubs);
    });
  });
});
