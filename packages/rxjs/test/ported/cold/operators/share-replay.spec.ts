// Migrated from https://github.com/ReactiveX/rxjs @ e5351d02e225e275ac0e497c7b66eaa5f0c88791
// Source: spec/operators/shareReplay-spec.ts
import { describe, it } from 'vitest';
import { rxTest } from '@rxjs/test';
import { ColdObservable } from 'rxjs/cold-observable';
import { mergeMap } from 'rxjs/merge-map';
import { retry } from 'rxjs/retry';
import { shareReplay } from 'rxjs/share-replay';
describe('shareReplay (cold)', () => {
  it('should mirror a simple source Observable', async () => {
    const FinalizationRegistry = global.FinalizationRegistry;
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('--1-2---3-4--5-|');
      const sourceSubs = ' ^--------------!';
      const expected = '   --1-2---3-4--5-|';
      const published = source[shareReplay]();
      expectObservable(published).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should multicast the same values to multiple observers, bufferSize=1', async () => {
    const FinalizationRegistry = global.FinalizationRegistry;
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold('    -1-2-3----4-|');
      const sourceSubs = '     ^-----------!';
      const subscriber1 = hot('a|           ');
      const expected1 = '      -1-2-3----4-|';
      const subscriber2 = hot('----b|       ');
      const expected2 = '      ----23----4-|';
      const subscriber3 = hot('--------c|   ');
      const expected3 = '      --------3-4-|';
      const shared = source[shareReplay](1);
      expectObservable(subscriber1[mergeMap](() => shared)).toBe(expected1);
      expectObservable(subscriber2[mergeMap](() => shared)).toBe(expected2);
      expectObservable(subscriber3[mergeMap](() => shared)).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should multicast the same values to multiple observers, bufferSize=2', async () => {
    const FinalizationRegistry = global.FinalizationRegistry;
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold('    -1-2-----3------4-|');
      const sourceSubs = '     ^-----------------!';
      const subscriber1 = hot('a|                 ');
      const expected1 = '      -1-2-----3------4-|';
      const subscriber2 = hot('----b|             ');
      const expected2 = '      ----(12)-3------4-|';
      const subscriber3 = hot('-----------c|      ');
      const expected3 = '      -----------(23)-4-|';
      const shared = source[shareReplay](2);
      expectObservable(subscriber1[mergeMap](() => shared)).toBe(expected1);
      expectObservable(subscriber2[mergeMap](() => shared)).toBe(expected2);
      expectObservable(subscriber3[mergeMap](() => shared)).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should multicast an error from the source to multiple observers', async () => {
    const FinalizationRegistry = global.FinalizationRegistry;
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold('    -1-2-3----4-#');
      const sourceSubs = '     ^-----------!';
      const subscriber1 = hot('a|           ');
      const expected1 = '      -1-2-3----4-#';
      const subscriber2 = hot('----b|       ');
      const expected2 = '      ----23----4-#';
      const subscriber3 = hot('--------c|   ');
      const expected3 = '      --------3-4-#';
      const shared = source[shareReplay](1);
      expectObservable(subscriber1[mergeMap](() => shared)).toBe(expected1);
      expectObservable(subscriber2[mergeMap](() => shared)).toBe(expected2);
      expectObservable(subscriber3[mergeMap](() => shared)).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should multicast an empty source', async () => {
    const FinalizationRegistry = global.FinalizationRegistry;
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('|   ');
      const sourceSubs = ' (^!)';
      const expected = '   |   ';
      const shared = source[shareReplay](1);
      expectObservable(shared).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should multicast a never source', async () => {
    const FinalizationRegistry = global.FinalizationRegistry;
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('-');
      const sourceSubs = ' ^';
      const expected = '   -';
      const shared = source[shareReplay](1);
      expectObservable(shared, '^!').toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should multicast a throw source', async () => {
    const FinalizationRegistry = global.FinalizationRegistry;
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('#   ');
      const sourceSubs = ' (^!)';
      const expected = '   #   ';
      const shared = source[shareReplay](1);
      expectObservable(shared).toBe(expected);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should replay results to subsequent subscriptions if source completes, bufferSize=2', async () => {
    const FinalizationRegistry = global.FinalizationRegistry;
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold('    -1-2-----3-|        ');
      const sourceSubs = '     ^----------!        ';
      const subscriber1 = hot('a|                  ');
      const expected1 = '      -1-2-----3-|        ';
      const subscriber2 = hot('----b|              ');
      const expected2 = '      ----(12)-3-|        ';
      const subscriber3 = hot('---------------(c|) ');
      const expected3 = '      ---------------(23|)';
      const shared = source[shareReplay](2);
      expectObservable(subscriber1[mergeMap](() => shared)).toBe(expected1);
      expectObservable(subscriber2[mergeMap](() => shared)).toBe(expected2);
      expectObservable(subscriber3[mergeMap](() => shared)).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should completely restart for subsequent subscriptions if source errors, bufferSize=2', async () => {
    const FinalizationRegistry = global.FinalizationRegistry;
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const source = cold('    -1-2-----3-#               ');
      const sourceSubs1 = '    ^----------!               ';
      const subscriber1 = hot('a|                         ');
      const expected1 = '      -1-2-----3-#               ';
      const subscriber2 = hot('----b|                     ');
      const expected2 = '      ----(12)-3-#               ';
      const subscriber3 = hot('---------------(c|)        ');
      const expected3 = '      ----------------1-2-----3-#';
      const sourceSubs2 = '    ---------------^----------!';
      const shared = source[shareReplay](2);
      expectObservable(subscriber1[mergeMap](() => shared)).toBe(expected1);
      expectObservable(subscriber2[mergeMap](() => shared)).toBe(expected2);
      expectObservable(subscriber3[mergeMap](() => shared)).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe([sourceSubs1, sourceSubs2]);
    });
  });
  it('should be retryable, bufferSize=2', async () => {
    const FinalizationRegistry = global.FinalizationRegistry;
    await rxTest(({ cold, hot, expectObservable, expectSubscriptions }) => {
      const subs = [];
      const source = cold('    -1-2-----3-#                      ');
      subs.push('              ^----------!                      ');
      subs.push('              -----------^----------!           ');
      subs.push('              ----------------------^----------!');
      const subscriber1 = hot('a|                                ');
      const expected1 = '      -1-2-----3--1-2-----3-#           ';
      const subscriber2 = hot('----b|                            ');
      const expected2 = '      ----(12)-3--1-2-----3-#           ';
      const subscriber3 = hot('---------------(c|)               ');
      const expected3 = '      ---------------(12)-3--1-2-----3-#';
      const shared = source[shareReplay](2)[retry]({ count: 1, resetOnSuccess: false });
      expectObservable(subscriber1[mergeMap](() => shared)).toBe(expected1);
      expectObservable(subscriber2[mergeMap](() => shared)).toBe(expected2);
      expectObservable(subscriber3[mergeMap](() => shared)).toBe(expected3);
      expectSubscriptions(source.subscriptions).toBe(subs);
    });
  });
  it('should not restart due to unsubscriptions if refCount is false', async () => {
    const FinalizationRegistry = global.FinalizationRegistry;
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('a-b-c-d-e-f-g-h-i-j');
      const sourceSubs = ' ^------------------';
      const sub1 = '       ^------!           ';
      const expected1 = '  a-b-c-d-           ';
      const sub2 = '-----------^-------!';
      const expected2 = '  -----------fg-h-i-j';
      const shared = source[shareReplay]({ bufferSize: 1, refCount: false });
      expectObservable(shared, sub1).toBe(expected1);
      expectObservable(shared, sub2).toBe(expected2);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should restart due to unsubscriptions if refCount is true', async () => {
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('a-b-c-d-e-f-g-h-i-j');
      const shared = source[shareReplay]({ bufferSize: 1, refCount: true });
      // Retain both original observer windows and close the second ref-counted
      // run at the source diagram's frame-30 evidence horizon.
      expectObservable(shared, '^------!').toBe('a-b-c-d-');
      expectObservable(shared, '-----------^------------------!').toBe('-----------a-b-c-d-e-f-g-h-i-j');
      expectSubscriptions(source.subscriptions).toBe(['^------!', '-----------^------------------!']);
    });
  });
  it('should not restart due to unsubscriptions if refCount is true when the source has completed', async () => {
    const FinalizationRegistry = global.FinalizationRegistry;
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('a-(b|)         ');
      const sourceSubs = ' ^-!            ';
      const sub1 = '       ^------!       ';
      const expected1 = '  a-(b|)         ';
      const sub2 = '       -----------^!  ';
      const expected2 = '  -----------(b|)';
      const shared = source[shareReplay]({ bufferSize: 1, refCount: true });
      expectObservable(shared, sub1).toBe(expected1);
      expectObservable(shared, sub2).toBe(expected2);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should default to refCount being false', async () => {
    const FinalizationRegistry = global.FinalizationRegistry;
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source = cold('a-b-c-d-e-f-g-h-i-j');
      const sourceSubs = ' ^------------------';
      const sub1 = '       ^------!           ';
      const expected1 = '  a-b-c-d-           ';
      const sub2 = '-----------^-------!';
      const expected2 = '  -----------fg-h-i-j';
      const shared = source[shareReplay](1);
      expectObservable(shared, sub1).toBe(expected1);
      expectObservable(shared, sub2).toBe(expected2);
      expectSubscriptions(source.subscriptions).toBe(sourceSubs);
    });
  });
  it('should not skip values on a sync source', async () => {
    const FinalizationRegistry = global.FinalizationRegistry;
    await rxTest(({ cold, expectObservable }) => {
      const a = ColdObservable.from(['a', 'b', 'c', 'd']);
      // We would like for the previous line to read like this:
      //
      // const a = cold('(abcd|)');
      //
      // However, that would synchronously emit multiple values at frame 0,
      // but it's not synchronous upon-subscription.
      // TODO: revisit once https://github.com/ReactiveX/rxjs/issues/5523 is fixed
      const x = cold('  x-------x');
      const expected = '(abcd)--d';
      const shared = a[shareReplay](1);
      const result = x[mergeMap](() => shared);
      expectObservable(result, '^--------!').toBe(expected);
    });
  });
  it('should be referentially-transparent', async () => {
    const FinalizationRegistry = global.FinalizationRegistry;
    await rxTest(({ cold, expectObservable, expectSubscriptions }) => {
      const source1 = cold('-1-2-3-4-5-|');
      const source1Subs = ' ^----------!';
      const expected1 = '   -1-2-3-4-5-|';
      const source2 = cold('-6-7-8-9-0-|');
      const source2Subs = ' ^----------!';
      const expected2 = '   -6-7-8-9-0-|';
      // Calls to the _operator_ must be referentially-transparent.
      const partialPipeLine = (source_1) => source_1[shareReplay]({ refCount: false });
      // The non-referentially-transparent sharing occurs within the _operator function_
      // returned by the _operator_ and that happens when the complete pipeline is composed.
      const shared1 = partialPipeLine(source1);
      const shared2 = partialPipeLine(source2);
      expectObservable(shared1).toBe(expected1);
      expectSubscriptions(source1.subscriptions).toBe(source1Subs);
      expectObservable(shared2).toBe(expected2);
      expectSubscriptions(source2.subscriptions).toBe(source2Subs);
    });
  });
});
